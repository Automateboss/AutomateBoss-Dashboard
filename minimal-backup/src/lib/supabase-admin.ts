import { createClient } from '@supabase/supabase-js'

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

function getSupabaseAdmin() {
    if (!supabaseAdminInstance) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY
        
        if (!url || !key) {
            throw new Error('Missing Supabase environment variables')
        }
        
        supabaseAdminInstance = createClient(url, key)
    }
    return supabaseAdminInstance
}

// Export as property getter so it's lazy but transparent
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
    get: (_, prop) => {
        const client = getSupabaseAdmin()
        return (client as any)[prop]
    }
})
