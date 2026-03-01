import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAllSubscriptions, calculateMRR, calculateARR, getFailedPayments } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('🔄 Syncing Stripe data...');
    
    // Fetch all subscriptions
    const subscriptions = await getAllSubscriptions();
    console.log(`💳 Found ${subscriptions.length} subscriptions`);
    
    // Calculate metrics
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const mrr = calculateMRR(activeSubscriptions);
    const arr = calculateARR(mrr);
    
    console.log(`💰 MRR: $${mrr.toFixed(2)}, ARR: $${arr.toFixed(2)}`);
    
    // Get failed payments
    const failedPayments = await getFailedPayments();
    console.log(`⚠️  Failed payments: ${failedPayments.length}`);
    
    // Create alerts for failed payments
    for (const charge of failedPayments) {
      const customer = typeof charge.customer === 'string' 
        ? charge.customer 
        : (charge.customer as any)?.id;
      
      await supabaseAdmin
        .from('alerts')
        .insert({
          type: 'payment_failed',
          severity: 'error',
          title: 'Payment Failed',
          message: `Failed payment of $${(charge.amount / 100).toFixed(2)}`,
          customer_id: customer,
          is_read: false,
          is_dismissed: false
        });
    }
    
    // Store today's metrics
    const today = new Date().toISOString().split('T')[0];
    
    const { error: metricsError } = await supabaseAdmin
      .from('daily_metrics')
      .upsert({
        date: today,
        mrr,
        arr,
        active_subscribers: activeSubscriptions.length,
        churned_subscribers: subscriptions.filter(s => s.status === 'canceled').length,
        churn_rate: subscriptions.length > 0 
          ? (subscriptions.filter(s => s.status === 'canceled').length / subscriptions.length) * 100 
          : 0,
        new_subscribers: subscriptions.filter(s => {
          const startDate = new Date(s.current_period_start * 1000);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return startDate > thirtyDaysAgo;
        }).length
      }, {
        onConflict: 'date'
      });
    
    if (metricsError) {
      console.error('Error updating metrics:', metricsError);
    }
    
    // Update sync status
    await supabaseAdmin
      .from('sync_status')
      .upsert({
        source: 'stripe',
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        records_synced: subscriptions.length
      }, {
        onConflict: 'source'
      });
    
    console.log('✅ Stripe sync complete');
    
    return NextResponse.json({
      success: true,
      metrics: {
        mrr,
        arr,
        activeSubscriptions: activeSubscriptions.length,
        totalSubscriptions: subscriptions.length,
        failedPayments: failedPayments.length
      }
    });
  } catch (error: any) {
    console.error('❌ Stripe sync error:', error);
    
    // Log error to sync_status
    await supabaseAdmin
      .from('sync_status')
      .upsert({
        source: 'stripe',
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'error',
        last_error: error.message
      }, {
        onConflict: 'source'
      });
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
