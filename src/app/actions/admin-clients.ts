'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getClients() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching clients:', error)
        return []
    }

    return data
}

export async function updateClientStatus(id: string, status: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('organizations')
        .update({ status })
        .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/clients')
    return { success: true }
}

export async function createClientAction(data: { name: string; highlevel_location_id?: string }) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('organizations')
        .insert([data])

    if (error) throw error
    revalidatePath('/admin/clients')
    return { success: true }
}
