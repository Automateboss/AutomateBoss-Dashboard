import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('🔄 Running full sync...');
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                   'http://localhost:3000';
    
    const results = {
      highlevel: null as any,
      stripe: null as any
    };
    
    // Sync HighLevel
    try {
      const hlResponse = await fetch(`${baseUrl}/api/sync/highlevel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      results.highlevel = await hlResponse.json();
      console.log('✅ HighLevel sync complete');
    } catch (error: any) {
      console.error('❌ HighLevel sync failed:', error.message);
      results.highlevel = { success: false, error: error.message };
    }
    
    // Sync Stripe
    try {
      const stripeResponse = await fetch(`${baseUrl}/api/sync/stripe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      results.stripe = await stripeResponse.json();
      console.log('✅ Stripe sync complete');
    } catch (error: any) {
      console.error('❌ Stripe sync failed:', error.message);
      results.stripe = { success: false, error: error.message };
    }
    
    const allSuccessful = results.highlevel?.success && results.stripe?.success;
    
    return NextResponse.json({
      success: allSuccessful,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Full sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Allow GET for Vercel cron
export async function GET() {
  return POST(new Request('http://localhost'));
}
