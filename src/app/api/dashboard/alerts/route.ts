import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch unread, undismissed alerts
    const { data: alerts, error } = await supabaseAdmin
      .from('alerts')
      .select('*')
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    return NextResponse.json({
      alerts: alerts || []
    });
  } catch (error: any) {
    console.error('Alerts error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { alertId, action } = await request.json();
    
    if (action === 'dismiss') {
      const { error } = await supabaseAdmin
        .from('alerts')
        .update({ is_dismissed: true })
        .eq('id', alertId);
      
      if (error) throw error;
      
      return NextResponse.json({ success: true });
    }
    
    if (action === 'read') {
      const { error } = await supabaseAdmin
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      
      if (error) throw error;
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Alert action error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
