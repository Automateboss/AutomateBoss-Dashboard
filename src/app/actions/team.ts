'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export type QueueItemType = 'project' | 'ticket' | 'trailer_request'

export interface QueueItemData {
    id: string
    type: QueueItemType
    title: string
    subtitle: string
    status: string
    priority?: string
    flagged: boolean
    created_at: string
    updated_at: string
    organization_name: string
}

export async function getMyQueue() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const userId = session.user.id

    // Fetch projects, tickets, and trailer requests in parallel
    const [projectsRes, ticketsRes, trailersRes] = await Promise.all([
        supabase
            .from('projects')
            .select('*, organization:organizations(name)')
            .eq('assigned_to', userId)
            .neq('status', 'completed')
            .order('created_at', { ascending: false }),
        supabase
            .from('tickets')
            .select('*, organization:organizations(name)')
            .eq('assigned_to', userId)
            .neq('status', 'closed')
            .order('created_at', { ascending: false }),
        supabase
            .from('trailer_requests')
            .select('*, organization:organizations(name)')
            .eq('assigned_to', userId)
            .neq('status', 'completed')
            .order('created_at', { ascending: false })
    ])

    const queue: QueueItemData[] = [
        ...(projectsRes.data || []).map(p => ({
            id: p.id,
            type: 'project' as const,
            title: p.project_type.replace('_', ' ').toUpperCase(),
            subtitle: `Project #${p.id.slice(0, 8)}`,
            status: p.status,
            flagged: p.flagged || (new Date(p.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)),
            created_at: p.created_at,
            updated_at: p.created_at,
            organization_name: p.organization?.name || 'Unknown'
        })),
        ...(ticketsRes.data || []).map(t => ({
            id: t.id,
            type: 'ticket' as const,
            title: t.subject,
            subtitle: `Ticket #${t.id.slice(0, 8)}`,
            status: t.status,
            priority: t.priority,
            flagged: t.flagged || (new Date(t.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)),
            created_at: t.created_at,
            updated_at: t.updated_at,
            organization_name: t.organization?.name || 'Unknown'
        })),
        ...(trailersRes.data || []).map(tr => ({
            id: tr.id,
            type: 'trailer_request' as const,
            title: `${tr.make} ${tr.model}`.trim() || 'New Trailer Addition',
            subtitle: `Trailer #${tr.id.slice(0, 8)}`,
            status: tr.status,
            flagged: tr.flagged || (new Date(tr.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)),
            created_at: tr.created_at,
            updated_at: tr.created_at,
            organization_name: tr.organization?.name || 'Unknown'
        }))
    ]

    // Sort by flagged first, then created_at
    return queue.sort((a, b) => {
        if (a.flagged && !b.flagged) return -1
        if (!a.flagged && b.flagged) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
}

export async function updateProjectStepStatus(projectId: string, stepId: string, status: string, notes?: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('project_step_progress')
        .upsert({
            project_id: projectId,
            step_id: stepId,
            status,
            notes,
            completed_by: session.user.id,
            completed_at: status === 'completed' ? new Date().toISOString() : null
        }, {
            onConflict: 'project_id,step_id'
        })

    if (error) throw error
    revalidatePath('/admin/team')
    return { success: true }
}

export async function getProjectSteps(projectId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('project_step_progress')
        .select('*, step:project_steps(*)')
        .eq('project_id', projectId)
        .order('id') // We rely on step_order in the joined table usually but for progress we can use the order they were inserted.
    // Actually it's better to sort by step.step_order if we can.

    if (error) {
        console.error('Error fetching project steps:', error)
        return []
    }

    // Manual sort because Supabase nested sort can be tricky with simple RPCs
    return data.sort((a: any, b: any) => a.step.step_order - b.step.step_order)
}
