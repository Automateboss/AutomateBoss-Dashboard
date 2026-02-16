'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function handleHighLevelWebhook(payload: any) {
    const { type, locationId, contact_id, first_name, last_name, email, name: orgName } = payload

    // Log the incoming webhook for audit
    await supabaseAdmin.from('activity_log').insert({
        action: 'WEBHOOK_RECEIVED',
        entity_type: 'highlevel_event',
        entity_id: locationId || contact_id || 'unknown',
        new_values: payload
    })

    if (!locationId) {
        return { success: false, error: 'Missing locationId' }
    }

    try {
        switch (type) {
            case 'ContactCreated':
            case 'LocationCreated':
                const org = await syncOrganization(locationId, orgName || `${first_name} ${last_name}'s Org`)
                if (!org) {
                    return { success: false, error: 'Failed to sync organization' }
                }
                await autoInitializeProjects(org.id)
                break

            case 'FormSubmitted':
                await processHighLevelForm(payload)
                break

            default:
                console.log(`Unhandled HighLevel event type: ${type}`)
        }

        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        console.error('Error handling HL webhook:', error)
        return { success: false, error: error.message || 'Unknown error' }
    }
}

async function syncOrganization(locationId: string, name: string) {
    // Upsert organization based on highlevel_location_id using admin client
    const { data, error } = await supabaseAdmin
        .from('organizations')
        .upsert(
            { highlevel_location_id: locationId, name, status: 'active' },
            { onConflict: 'highlevel_location_id' }
        )
        .select()
        .single()

    if (error) {
        console.error('Error syncing organization:', error)
        return null
    }

    return data
}

async function autoInitializeProjects(orgId: string) {
    const defaultProjects = [
        { organization_id: orgId, project_type: 'onboarding', status: 'pending' },
        { organization_id: orgId, project_type: 'a2p_verification', status: 'pending' },
        { organization_id: orgId, project_type: 'website_build', status: 'pending' }
    ]

    // Check if projects already exist for this org to avoid duplicates
    const { data: existing } = await supabaseAdmin
        .from('projects')
        .select('project_type')
        .eq('organization_id', orgId)

    const existingTypes = new Set(existing?.map(p => p.project_type) || [])
    const toCreate = defaultProjects.filter(p => !existingTypes.has(p.project_type))

    if (toCreate.length > 0) {
        const { data: newProjects, error } = await supabaseAdmin
            .from('projects')
            .insert(toCreate)
            .select()

        if (error) {
            console.error('Error auto-initializing projects:', error)
            return
        }

        // Initialize progress for each new project
        for (const project of newProjects) {
            const { data: steps } = await supabaseAdmin
                .from('project_steps')
                .select('id')
                .eq('project_type', project.project_type)
                .order('step_order', { ascending: true })

            if (steps && steps.length > 0) {
                const progressData = steps.map(step => ({
                    project_id: project.id,
                    step_id: step.id,
                    status: 'pending'
                }))
                await supabaseAdmin.from('project_step_progress').insert(progressData)

                // Set the current_step_id to the first step
                await supabaseAdmin
                    .from('projects')
                    .update({ current_step_id: steps[0].id })
                    .eq('id', project.id)
            }
        }
    }
}

async function processHighLevelForm(payload: any) {
    const { locationId, formId, message, subject } = payload

    const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('highlevel_location_id', locationId)
        .single()

    if (!org) {
        console.error('Form submission received for unknown organization:', locationId)
        return
    }

    // Example logic: if form name contains "Trailer", create trailer request
    if (payload.formName?.toLowerCase().includes('trailer')) {
        await supabaseAdmin.from('trailer_requests').insert({
            organization_id: org.id,
            status: 'pending',
            make: payload['Trailer Make'],
            model: payload['Trailer Model'],
            source: 'highlevel_form'
        })
    } else {
        // Create a support ticket
        const { data: ticket, error: ticketError } = await supabaseAdmin.from('tickets').insert({
            organization_id: org.id,
            subject: subject || 'New External Request',
            ticket_type: 'support',
            status: 'open',
            created_by: '00000000-0000-0000-0000-000000000000'
        }).select().single()

        if (ticket && payload.message) {
            await supabaseAdmin.from('messages').insert({
                messageable_type: 'ticket',
                messageable_id: ticket.id,
                content: payload.message,
                sender_id: '00000000-0000-0000-0000-000000000000'
            })
        }
    }
}
