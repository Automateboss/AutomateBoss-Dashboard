import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all open conversations grouped by priority
    const { data: conversations, error } = await supabaseAdmin
      .from('support_conversations')
      .select('*')
      .eq('status', 'open')
      .order('last_message_date', { ascending: false });
    
    if (error) throw error;
    
    // Group by priority
    const urgent = conversations?.filter(c => c.priority === 'urgent') || [];
    const high = conversations?.filter(c => c.priority === 'high') || [];
    const normal = conversations?.filter(c => c.priority === 'normal' || c.priority === 'low') || [];
    
    return NextResponse.json({
      urgent,
      high,
      normal,
      total: conversations?.length || 0
    });
  } catch (error: any) {
    console.error('Support queue error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
