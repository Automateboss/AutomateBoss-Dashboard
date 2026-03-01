import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch today's team performance
    const { data: performance, error } = await supabaseAdmin
      .from('team_performance')
      .select('*')
      .eq('date', today)
      .order('messages_sent', { ascending: false });
    
    if (error) throw error;
    
    // If no data for today, try yesterday
    if (!performance || performance.length === 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const { data: yesterdayPerformance } = await supabaseAdmin
        .from('team_performance')
        .select('*')
        .eq('date', yesterdayStr)
        .order('messages_sent', { ascending: false });
      
      return NextResponse.json({
        performance: yesterdayPerformance || [],
        date: yesterdayStr
      });
    }
    
    return NextResponse.json({
      performance: performance || [],
      date: today
    });
  } catch (error: any) {
    console.error('Team performance error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
