// Stripe API Client
// Note: Install stripe package: npm install stripe

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;

if (!STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Lazy load Stripe to avoid initialization errors
let stripeInstance: any = null;

async function getStripe() {
  if (!stripeInstance) {
    const Stripe = (await import('stripe')).default;
    stripeInstance = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as any
    });
  }
  return stripeInstance;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      price: {
        unit_amount: number;
        recurring: {
          interval: string;
        };
      };
    }>;
  };
}

export async function getActiveSubscriptions(): Promise<StripeSubscription[]> {
  const stripe = await getStripe();
  const subscriptions = await stripe.subscriptions.list({
    status: 'active',
    expand: ['data.customer'],
    limit: 100
  });
  return subscriptions.data;
}

export async function getAllSubscriptions(): Promise<StripeSubscription[]> {
  const stripe = await getStripe();
  const subscriptions = await stripe.subscriptions.list({
    expand: ['data.customer'],
    limit: 100
  });
  return subscriptions.data;
}

export async function getCustomer(customerId: string) {
  const stripe = await getStripe();
  return await stripe.customers.retrieve(customerId);
}

export async function getFailedPayments() {
  const stripe = await getStripe();
  const charges = await stripe.charges.list({
    limit: 100
  });
  return charges.data.filter((charge: any) => charge.status === 'failed');
}

export function calculateMRR(subscriptions: StripeSubscription[]): number {
  return subscriptions.reduce((total, sub) => {
    if (sub.status !== 'active') return total;
    
    const item = sub.items.data[0];
    if (!item) return total;
    
    const amount = item.price.unit_amount / 100; // Convert cents to dollars
    const interval = item.price.recurring?.interval;
    
    // Normalize to monthly
    if (interval === 'year') {
      return total + (amount / 12);
    } else if (interval === 'month') {
      return total + amount;
    }
    
    return total;
  }, 0);
}

export function calculateARR(mrr: number): number {
  return mrr * 12;
}
