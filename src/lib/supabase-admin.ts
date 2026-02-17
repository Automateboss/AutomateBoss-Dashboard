import { createClient } from '@supabase/supabase-js'

// Only initialize if env vars are present (runtime only, not build time)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabaseAdmin = url && key 
    ? createClient(url, key)
    : createClient('https://placeholder.supabase.co', 'placeholder-key')
