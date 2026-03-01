import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch latest daily metrics
    const { data: metrics, error: metricsError } = await supabaseAdmin
      .from('daily_metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (metricsError && metricsError.code !== 'PGRST116') {
      throw metricsError;
    }
    
    // Count unread conversations
    const { count: unreadCount } = await supabaseAdmin
      .from('support_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')
      .gt('unread_count', 0);
    
    // Get sync status
    const { data: syncData } = await supabaseAdmin
      .from('sync_status')
      .select('*')
      .order('last_sync_at', { ascending: false })
      .limit(1)
      .single();
    
    // Default metrics if none exist yet
    const defaultMetrics = {
      mrr: 0,
      arr: 0,
      active_subscribers: 0,
      churn_rate: 0,
      avg_response_time_minutes: 0
    };
    
    return NextResponse.json({
      metrics: {
        mrr: metrics?.mrr || defaultMetrics.mrr,
        arr: metrics?.arr || defaultMetrics.arr,
        activeSubscribers: metrics?.active_subscribers || defaultMetrics.active_subscribers,
        churnRate: metrics?.churn_rate || defaultMetrics.churn_rate,
        unreadConversations: unreadCount || 0
      },
      recentActivity: {
        newCustomers: metrics?.new_subscribers || 0,
        supportTickets: metrics?.total_conversations || 0,
        avgResponseTime: metrics?.avg_response_time_minutes || 0
      },
      lastSync: syncData?.last_sync_at || null
    });
  } catch (error: any) {
    console.error('Dashboard overview error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
