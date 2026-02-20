import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role === 'super_admin') {
    redirect('/admin')
  } else if (profile?.role === 'team_member') {
    redirect('/team')
  } else {
    redirect('/dashboard')
  }

  return null
}
