import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Vercel Pro allows up to 60s

// API Configuration
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || ''
const HL_LOCATION_TOKEN = process.env.HL_LOCATION_TOKEN || process.env.HL_LOCATION_PRIVATE_TOKEN || ''
const HL_AGENCY_KEY = process.env.HL_AGENCY_KEY || ''
const HL_MAIN_LOC = process.env.HL_MAIN_LOCATION_ID || 'xEkZMCqlbJEyDFqM2g7z'

const CHURN_KEYWORDS = ['cancel', 'canceling', 'cancelled', 'cancellation',
  'big rentals', 'leaving', 'frustrated', 'not working',
  'broken', 'doesn\'t work', 'don\'t work', 'stop', 'quit',
  'competitor', 'another provider', 'switching', 'port',
  'ignore', 'ignoring', 'no response', 'refund']

// Helper: Stripe API call
async function stripeGet(endpoint: string) {
  const url = `https://api.stripe.com/v1/${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${STRIPE_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  if (!response.ok) {
    throw new Error(`Stripe API error: ${response.statusText}`)
  }
  return response.json()
}

// Helper: HighLevel v2 API call
async function hlV2(path: string) {
  const url = `https://services.leadconnectorhq.com${path}`
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${HL_LOCATION_TOKEN}`,
      'Version': '2021-07-28'
    }
  })
  if (!response.ok) {
    throw new Error(`HighLevel API error: ${response.statusText}`)
  }
  return response.json()
}

// ========================================
// SECTION 1: Revenue Metrics (Stripe)
// ========================================
async function getRevenueMetrics() {
  const now = Math.floor(Date.now() / 1000)
  const thirtyDaysAgo = now - 30 * 86400

  // Active subscriptions
  const activeSubs = []
  let hasMore = true
  let startingAfter = null

  while (hasMore) {
    let params = 'limit=100&status=active'
    if (startingAfter) params += `&starting_after=${startingAfter}`
    
    const data = await stripeGet(`subscriptions?${params}`)
    const subs = data.data || []
    activeSubs.push(...subs)
    hasMore = data.has_more || false
    if (subs.length > 0) {
      startingAfter = subs[subs.length - 1].id
    }
  }

  // Recent cancellations
  const canceled = []
  hasMore = true
  startingAfter = null

  while (hasMore) {
    let params = 'limit=100&status=canceled'
    if (startingAfter) params += `&starting_after=${startingAfter}`
    
    const data = await stripeGet(`subscriptions?${params}`)
    const subs = data.data || []
    const recent = subs.filter((s: any) => (s.canceled_at || 0) > thirtyDaysAgo)
    canceled.push(...recent)
    
    // Stop if we've gone past 30 days
    if (subs.length > 0 && subs.every((s: any) => (s.canceled_at || 0) < thirtyDaysAgo)) {
      break
    }
    
    hasMore = data.has_more || false
    if (subs.length > 0) {
      startingAfter = subs[subs.length - 1].id
    }
  }

  // Trialing
  const trialData = await stripeGet('subscriptions?limit=100&status=trialing')
  const trialing = trialData.data || []

  // Calculate MRR
  const mrr = activeSubs.reduce((sum, s) => {
    const items = s.items?.data || []
    if (items.length > 0) {
      const amount = items[0].price?.unit_amount || 0
      return sum + (amount / 100)
    }
    return sum
  }, 0)

  // New subs this month
  const monthStart = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000)
  const newThisMonth = activeSubs.filter((s: any) => s.created > monthStart)

  return {
    active_count: activeSubs.length,
    mrr: Math.round(mrr),
    arr: Math.round(mrr * 12),
    trialing: trialing.length,
    canceled_30d: canceled.length,
    churn_rate: (activeSubs.length + canceled.length) > 0 
      ? (canceled.length / (activeSubs.length + canceled.length)) * 100 
      : 0,
    new_this_month: newThisMonth.length,
    canceled_details: canceled
  }
}

// ========================================
// SECTION 2: Unread Conversations (HighLevel)
// ========================================
async function getUnreadConversations() {
  const data = await hlV2(`/conversations/search?locationId=${HL_MAIN_LOC}&limit=50&sortBy=last_message_date&sort=desc`)
  const convos = data.conversations || []

  const unread = []

  for (const c of convos) {
    if ((c.unreadCount || 0) === 0) continue

    const name = c.fullName || c.contactName || 'Unknown'
    const body = String(c.lastMessageBody || '')
    const msgType = String(c.lastMessageType || '')
    const convId = c.id || ''

    // Skip spam
    const spamKeywords = ['profile link', 'sign up to see', 'unsubscribe', 'dmarc']
    if (spamKeywords.some(spam => body.toLowerCase().includes(spam))) continue
    if (!name || !name.trim()) continue

    // Check for churn keywords
    const bodyLower = body.toLowerCase()
    const churnFlags = CHURN_KEYWORDS.filter(kw => bodyLower.includes(kw))

    // Check if team has responded after churn keywords
    let teamResponded = false
    if (churnFlags.length > 0 && convId) {
      try {
        const msgs = await hlV2(`/conversations/${convId}/messages?limit=20`)
        const messages = msgs.messages?.messages || []
        
        // Find last inbound message with churn keywords
        let lastChurnTime = 0
        for (const msg of messages) {
          const msgBody = String(msg.body || '')
          const msgDirection = msg.direction || ''
          const msgTime = msg.dateAdded || 0
          
          if (msgDirection === 'inbound') {
            if (CHURN_KEYWORDS.some(kw => msgBody.toLowerCase().includes(kw))) {
              lastChurnTime = msgTime
              break
            }
          }
        }
        
        // Check if any outbound message came AFTER the churn message
        if (lastChurnTime > 0) {
          for (const msg of messages) {
            const msgDirection = msg.direction || ''
            const msgTime = msg.dateAdded || 0
            if (msgDirection === 'outbound' && msgTime > lastChurnTime) {
              teamResponded = true
              break
            }
          }
        }
      } catch (err) {
        console.error(`Error checking conversation history for ${name}:`, err)
      }
    }

    // Only flag as churn risk if keywords present AND team hasn't responded
    let urgency = 'NORMAL'
    if (churnFlags.length > 0 && !teamResponded) {
      urgency = '🚨 CHURN RISK'
    } else if ((c.unreadCount || 0) > 5 && !teamResponded) {
      urgency = '⚠️ HIGH'
    }

    // Only add to list if it's actually urgent or has real issues
    if (urgency !== 'NORMAL' || (c.unreadCount || 0) > 3) {
      unread.push({
        name,
        body: body.substring(0, 200),
        type: msgType,
        unread_count: c.unreadCount || 0,
        urgency,
        churn_flags: churnFlags,
        contact_id: c.contactId || '',
        conversation_id: convId,
        team_responded: teamResponded
      })
    }
  }

  return unread
}

// ========================================
// MAIN API HANDLER
// ========================================
export async function GET() {
  try {
    console.log('[Dashboard API] Starting data fetch...')
    
    // Parallel fetch for speed
    const [revenue, unreads] = await Promise.all([
      getRevenueMetrics(),
      getUnreadConversations()
    ])

    console.log('[Dashboard API] Data fetched successfully')

    // Categorize conversations
    const churnRisk = unreads.filter(u => u.urgency === '🚨 CHURN RISK')
    const highPriority = unreads.filter(u => u.urgency === '⚠️ HIGH' || u.urgency === '📞 CALL')
    const normal = unreads.filter(u => u.urgency === 'NORMAL')

    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    return NextResponse.json({
      date,
      revenue,
      churn_risks: churnRisk,
      high_priority: highPriority,
      normal,
      total_unread: unreads.length
    })
  } catch (error: any) {
    console.error('[Dashboard API] Error:', error)
    return NextResponse.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 })
  }
}
