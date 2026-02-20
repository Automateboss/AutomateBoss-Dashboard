'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getClientDashboardData() {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    // Fetch user profile to get organization_id
    const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', session.user.id)
        .single()

    if (!profile?.organization_id) {
        return {
            projects: [],
            trailers: [],
            tickets: [],
            stats: { activeProjects: 0, pendingTrailers: 0, openTickets: 0 }
        }
    }

    const orgId = profile.organization_id

    // Parallel fetch for dashboard overview
    const [projectsRes, trailersRes, ticketsRes] = await Promise.all([
        supabase
            .from('projects')
            .select('*')
            .eq('organization_id', orgId)
            .eq('visible_to_client', true)
            .order('created_at', { ascending: false })
            .limit(5),
        supabase
            .from('trailer_requests')
            .select('*')
            .eq('organization_id', orgId)
            .eq('status', 'pending'),
        supabase
            .from('tickets')
            .select('*')
            .eq('organization_id', orgId)
            .neq('status', 'closed')
            .order('updated_at', { ascending: false })
            .limit(5),
    ])

    // Get total counts for stats
    const [activeProjectsCount, pendingTrailersCount, openTicketsCount] = await Promise.all([
        supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .neq('status', 'completed'),
        supabase
            .from('trailer_requests')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('status', 'pending'),
        supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('status', 'open'),
    ])

    return {
        projects: projectsRes.data || [],
        trailers: trailersRes.data || [],
        tickets: ticketsRes.data || [],
        stats: {
            activeProjects: activeProjectsCount.count || 0,
            pendingTrailers: pendingTrailersCount.count || 0,
            openTickets: openTicketsCount.count || 0
        }
    }
}

export async function createTrailerRequest(formData: any) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', session.user.id)
        .single()

    if (!profile?.organization_id) throw new Error('No organization found')

    const { data, error } = await supabase
        .from('trailer_requests')
        .insert({
            ...formData,
            organization_id: profile.organization_id
        })
        .select()
        .single()

    if (error) throw error
    revalidatePath('/dashboard')
    return data
}

export async function createSupportTicket(subject: string, type: string, priority: string, content: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', session.user.id)
        .single()

    if (!profile?.organization_id) throw new Error('No organization found')

    // 1. Create ticket
    const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
            organization_id: profile.organization_id,
            created_by: session.user.id,
            subject,
            ticket_type: type,
            priority
        })
        .select()
        .single()

    if (ticketError) throw ticketError

    // 2. Create initial message
    await supabase
        .from('messages')
        .insert({
            messageable_type: 'ticket',
            messageable_id: ticket.id,
            sender_id: session.user.id,
            content
        })

    revalidatePath('/dashboard/tickets')
    return ticket
}

export async function getTicketData(ticketId: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('*, organization:organizations(name)')
        .eq('id', ticketId)
        .single()

    if (ticketError) throw ticketError

    const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*, sender:users(full_name, role)')
        .eq('messageable_type', 'ticket')
        .eq('messageable_id', ticketId)
        .order('created_at', { ascending: true })

    if (messagesError) throw messagesError

    return { ticket, messages }
}

export async function sendTicketMessage(ticketId: string, content: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('messages')
        .insert({
            messageable_type: 'ticket',
            messageable_id: ticketId,
            sender_id: session.user.id,
            content
        })
        .select()
        .single()

    if (error) throw error

    // Update ticket timestamp
    await supabase
        .from('tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId)

    revalidatePath(`/dashboard/tickets/${ticketId}`)
    return data
}

export async function getProjects() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', session.user.id)
        .single()

    if (!profile?.organization_id) return []

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('visible_to_client', true)
        .order('created_at', { ascending: false })

    if (error) throw error
    return projects
}

export async function getProjectData(projectId: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*, organization:organizations(name)')
        .eq('id', projectId)
        .single()

    if (projectError) throw projectError

    // Fetch steps for this project type
    const { data: steps, error: stepsError } = await supabase
        .from('project_steps')
        .select('*')
        .eq('project_type', project.project_type)
        .order('step_order', { ascending: true })

    if (stepsError) throw stepsError

    // Fetch progress for these steps
    const { data: progress, error: progressError } = await supabase
        .from('project_step_progress')
        .select('*')
        .eq('project_id', projectId)

    if (progressError) throw progressError

    return { project, steps, progress }
}
