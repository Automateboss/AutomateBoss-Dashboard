'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function inviteUser(email: string, fullName: string, role: string) {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: {
                full_name: fullName,
                role: role
            },
            redirectTo: `${process.env.NEXTAUTH_URL}/login`
        })

        if (error) {
            console.error('Supabase Auth Error:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/users')
        return { success: true, data }
    } catch (err: any) {
        console.error('Unexpected Invitation Error:', err)
        return { success: false, error: err.message || 'An unexpected error occurred' }
    }
}

export async function getUsers() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('users')
        .select('*, organization:organizations(name)')
        .order('role', { ascending: true })

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    return data
}

export async function updateUserRole(id: string, role: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/users')
    return { success: true }
}
export async function updateUserSpecializations(id: string, specializations: string[]) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('users')
        .update({ team_specializations: specializations })
        .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/users')
    return { success: true }
}
