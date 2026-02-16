'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getAdminStats() {
    const supabase = await createClient()

    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [
        newClients,
        wipProjects,
        openTickets,
        flaggedRequests,
        flaggedTickets
    ] = await Promise.all([
        // New Clients (last 7 days)
        supabase
            .from('organizations')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', weekAgo),

        // Work In Progress Projects
        supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'in_progress'),

        // Open Tickets
        supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'open'),

        // Flagged Trailer Requests (Flagged OR > 24h old and not completed)
        supabase
            .from('trailer_requests')
            .select('*', { count: 'exact', head: true })
            .or(`flagged.eq.true,and(status.neq.completed,created_at.lt.${dayAgo})`),

        // Flagged Tickets (Flagged OR > 24h old and not closed)
        supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .or(`flagged.eq.true,and(status.neq.closed,updated_at.lt.${dayAgo})`),
    ])

    return {
        newClients: newClients.count || 0,
        a2pPending: 0, // Placeholder for future logic
        workInProgress: wipProjects.count || 0,
        openTickets: openTickets.count || 0,
        flaggedItems: (flaggedRequests.count || 0) + (flaggedTickets.count || 0)
    }
}

export async function getGlobalActivity() {
    const supabase = await createClient()

    const { data: activity, error } = await supabase
        .from('activity_log')
        .select(`
            *,
            user:users(full_name),
            organization:organizations(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error('Error fetching activity log:', error)
        return []
    }

    return activity
}

export async function getPipelineProjects(projectType?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('projects')
        .select(`
            *,
            organization:organizations(name),
            assigned_user:users!projects_assigned_to_fkey(full_name)
        `)
        .order('created_at', { ascending: false })

    if (projectType) {
        query = query.eq('project_type', projectType)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching pipeline projects:', error)
        return []
    }

    return data
}

import { fireProjectMoveWebhook } from '@/lib/webhooks'

export async function updateProjectStatus(projectId: string, status: string) {
    const supabase = await createClient()

    // Get current project state for webhook payload
    const { data: project } = await supabase
        .from('projects')
        .select('status, organization_id')
        .eq('id', projectId)
        .single()

    const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId)

    if (error) throw error

    // Fire webhook asynchronously
    if (project && project.status !== status) {
        fireProjectMoveWebhook({
            event: 'project.status_changed',
            projectId,
            organizationId: project.organization_id,
            fromStatus: project.status,
            toStatus: status,
            timestamp: new Date().toISOString()
        }).catch(err => console.error('Failed to fire webhook:', err))
    }

    revalidatePath('/admin/pipelines')
    return { success: true }
}
