'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getSOPs() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('sops')
        .select('*')
        .order('category', { ascending: true })
        .order('step_order', { ascending: true })

    if (error) {
        console.error('Error fetching SOPs:', error)
        return []
    }

    return data
}

export async function createSOP(data: { title: string; category: string; content?: string; loom_video_url?: string; step_order?: number }) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('sops')
        .insert([data])

    if (error) throw error
    revalidatePath('/admin/sops')
    return { success: true }
}

export async function updateSOP(id: string, data: any) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('sops')
        .update(data)
        .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/sops')
    return { success: true }
}
