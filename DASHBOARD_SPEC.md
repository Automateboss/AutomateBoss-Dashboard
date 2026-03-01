# AutomateBoss Command Center - Full Specification

## Project Overview

Build a comprehensive business dashboard for AutomateBoss that gives Amanda real-time visibility into all business operations: revenue, support queue, team performance, customer health, and AI agent status.

**Tech Stack:**
- **Frontend:** Next.js 14+ (App Router), React, TailwindCSS, shadcn/ui
- **Backend:** Next.js API Routes (TypeScript)
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Auth:** Supabase Auth (Amanda-only access initially)

---

## 1. Data Sources & API Connections

### 1.1 HighLevel API
```
Agency API Key: [STORED IN .env.local - HL_AGENCY_KEY]
Sub-Account API Key: [STORED IN .env.local - HL_LOCATION_TOKEN]
Location ID: [STORED IN .env.local - HL_MAIN_LOCATION_ID]
Company ID: bUnrR3qyq5dibuKkx2cE
Base URL: https://services.leadconnectorhq.com
Version Header: 2021-07-28
```

**Endpoints to use:**
- `GET /conversations/search?locationId=xxx` — Support conversations
- `GET /conversations/{id}/messages` — Message threads
- `GET /contacts/?locationId=xxx` — Customer contacts
- `GET /locations/search?companyId=xxx` — All customer locations (128+)

**Team User IDs:**
- Amanda Gilmer: `Crte5xZvcrQ6ORk41ozV`
- Sofia Quilo: `Ebqs5zYLzm2oGIU15qSK`
- Saul Vinez: `Olt1fHbfj0nbQzbqmiIz`
- Mohsin Haider: `JK7tcTRWvnXXAs5glrAH`
- Arnel Morgado: `XVluS6vkXVbJh3YqTu0J`
- Ashley Travis (Amanda): `ef3LRE61NEs3XupiT62U`

### 1.2 Stripe API
```
Secret Key: [STORED IN .env.local - STRIPE_SECRET_KEY]
```

**Endpoints to use:**
- `GET /v1/subscriptions` — Active subscriptions, MRR calculation
- `GET /v1/customers` — Customer data
- `GET /v1/invoices` — Payment history
- `GET /v1/charges` — Recent charges, failed payments

### 1.3 Supabase
```
URL: [STORED IN .env.local - NEXT_PUBLIC_SUPABASE_URL]
Anon Key: [STORED IN .env.local - NEXT_PUBLIC_SUPABASE_ANON_KEY]
Service Role Key: [STORED IN .env.local - SUPABASE_SERVICE_ROLE_KEY]
```

### 1.4 Notion API
```
API Key: [STORED IN .env.local - NOTION_API_KEY]
Operations Database ID: [STORED IN .env.local - NOTION_DATABASE_ID]
```

### 1.5 Gmail (via IMAP - for display only)
- Email: support@automateboss.com
- Use Himalaya CLI or direct IMAP for fetching recent emails
- Store email summaries in Supabase for dashboard display

---

## 2. Supabase Database Schema

### 2.1 Core Tables

```sql
-- Daily metrics snapshot (populated by cron/scheduled job)
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  mrr DECIMAL(10,2),
  arr DECIMAL(10,2),
  active_subscribers INTEGER,
  churned_subscribers INTEGER,
  churn_rate DECIMAL(5,2),
  new_subscribers INTEGER,
  total_conversations INTEGER,
  unread_conversations INTEGER,
  avg_response_time_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team performance tracking
CREATE TABLE team_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  team_member TEXT NOT NULL,
  team_member_id TEXT NOT NULL,
  messages_sent INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER,
  conversations_handled INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, team_member_id)
);

-- Customer health scores
CREATE TABLE customer_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL UNIQUE,
  company_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  health_score INTEGER DEFAULT 100, -- 0-100
  last_contact_date TIMESTAMPTZ,
  days_since_contact INTEGER,
  has_open_issues BOOLEAN DEFAULT FALSE,
  churn_risk_level TEXT DEFAULT 'low', -- low, medium, high, critical
  churn_signals JSONB DEFAULT '[]',
  subscription_status TEXT,
  mrr DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support conversations cache
CREATE TABLE support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hl_conversation_id TEXT NOT NULL UNIQUE,
  contact_id TEXT,
  contact_name TEXT,
  company_name TEXT,
  last_message_date TIMESTAMPTZ,
  last_message_body TEXT,
  last_message_direction TEXT, -- inbound/outbound
  unread_count INTEGER DEFAULT 0,
  assigned_to TEXT,
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  status TEXT DEFAULT 'open', -- open, pending, resolved
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support tickets/issues
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT,
  customer_name TEXT,
  company_name TEXT,
  issue_type TEXT, -- bug, question, feature_request, billing, urgent
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Email inbox cache
CREATE TABLE email_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id TEXT NOT NULL UNIQUE,
  folder TEXT DEFAULT 'INBOX',
  from_address TEXT,
  from_name TEXT,
  subject TEXT,
  body_preview TEXT,
  received_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts and notifications
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- churn_risk, payment_failed, urgent_support, system
  severity TEXT DEFAULT 'info', -- info, warning, error, critical
  title TEXT NOT NULL,
  message TEXT,
  customer_id TEXT,
  customer_name TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync status tracking
CREATE TABLE sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL UNIQUE, -- highlevel, stripe, gmail, notion
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT, -- success, error
  last_error TEXT,
  records_synced INTEGER DEFAULT 0
);
```

### 2.2 Indexes
```sql
CREATE INDEX idx_daily_metrics_date ON daily_metrics(date DESC);
CREATE INDEX idx_team_performance_date ON team_performance(date DESC);
CREATE INDEX idx_customer_health_risk ON customer_health(churn_risk_level);
CREATE INDEX idx_support_conversations_priority ON support_conversations(priority, status);
CREATE INDEX idx_alerts_unread ON alerts(is_read, created_at DESC);
```

---

## 3. API Routes (Next.js)

### 3.1 Data Sync Routes
```
POST /api/sync/highlevel    — Sync HL conversations & contacts
POST /api/sync/stripe       — Sync Stripe subscriptions & revenue
POST /api/sync/gmail        — Sync recent emails
POST /api/sync/notion       — Sync Notion tasks
POST /api/sync/all          — Run all syncs
```

### 3.2 Dashboard Data Routes
```
GET /api/dashboard/overview     — Main metrics (MRR, ARR, churn, etc.)
GET /api/dashboard/support      — Support queue, unread, priorities
GET /api/dashboard/team         — Team performance metrics
GET /api/dashboard/customers    — Customer health list
GET /api/dashboard/alerts       — Active alerts
GET /api/dashboard/emails       — Recent emails
```

### 3.3 Action Routes
```
POST /api/alerts/dismiss        — Dismiss an alert
POST /api/tickets/create        — Create support ticket
POST /api/tickets/update        — Update ticket status
```

---

## 4. UI Pages & Components

### 4.1 Page Structure
```
/                           — Main dashboard (overview)
/support                    — Support queue view
/team                       — Team performance view
/customers                  — Customer health list
/settings                   — Settings & sync controls
```

### 4.2 Main Dashboard Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  🎪 AutomateBoss Command Center              [Last sync: 5m ago]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │   MRR   │ │   ARR   │ │ Active  │ │  Churn  │ │ Unread  │   │
│  │ $3,847  │ │ $46,164 │ │   128   │ │  2.1%   │ │   23    │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                                 │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│  │ 🚨 ALERTS                   │ │ 📊 TEAM PERFORMANCE (24h)   ││
│  │                             │ │                             ││
│  │ • Kaleb D - Invoice issue   │ │ Amanda ████████████ 12 msgs ││
│  │ • Andrew B - Test mode      │ │ Arnel  █████████░░░  8 msgs ││
│  │ • Failed payment - XYZ Co   │ │ Sofia  ██░░░░░░░░░  2 msgs ││
│  └─────────────────────────────┘ └─────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│  │ 📬 SUPPORT QUEUE            │ │ ⚠️ CHURN RISKS              ││
│  │                             │ │                             ││
│  │ 🔴 3 Urgent                 │ │ • WPB Rentals (Critical)    ││
│  │ 🟠 7 High Priority          │ │ • Central PA (High)         ││
│  │ 🟡 13 Normal                │ │ • Lucky Lukes (Medium)      ││
│  └─────────────────────────────┘ └─────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Component Library (shadcn/ui)
- Card, CardHeader, CardContent
- Table, TableHeader, TableRow, TableCell
- Badge (for status/priority)
- Button, Input, Select
- Tabs, TabsList, TabsTrigger, TabsContent
- Alert, AlertTitle, AlertDescription
- Avatar (for team members)
- Progress (for health scores)
- Skeleton (for loading states)

### 4.4 Branding Requirements
- **Primary Color:** AutomateBoss blue (#1e40af or similar)
- **Accent Color:** Orange/amber for alerts
- **Logo:** Include AutomateBoss logo in header
- **Font:** Clean sans-serif (Inter or similar)
- **Dark mode:** Optional but nice to have

---

## 5. Data Sync Logic

### 5.1 HighLevel Sync (every 5 minutes)
```typescript
async function syncHighLevel() {
  // 1. Fetch conversations with unread
  const conversations = await fetch(
    `${HL_BASE}/conversations/search?locationId=${LOCATION_ID}&limit=100`,
    { headers: { Authorization: `Bearer ${HL_KEY}`, 'Version': '2021-07-28' } }
  ).then(r => r.json());
  
  // 2. Upsert to support_conversations table
  // 3. Calculate team performance from assignedTo
  // 4. Identify churn signals (keywords: cancel, refund, not working, frustrated)
  // 5. Create alerts for urgent items
}
```

### 5.2 Stripe Sync (every 15 minutes)
```typescript
async function syncStripe() {
  // 1. Fetch active subscriptions
  const subscriptions = await stripe.subscriptions.list({ status: 'active' });
  
  // 2. Calculate MRR, ARR
  // 3. Identify at-risk (past_due, canceled)
  // 4. Update customer_health with subscription data
  // 5. Create alerts for failed payments
}
```

### 5.3 Daily Metrics Snapshot (daily at midnight)
```typescript
async function createDailySnapshot() {
  // 1. Aggregate all metrics
  // 2. Insert into daily_metrics
  // 3. Calculate 30-day trends
}
```

---

## 6. Authentication

### 6.1 Simple Auth (Phase 1)
- Environment variable with allowed emails: `ALLOWED_EMAILS=amanda@automateboss.com`
- Supabase Auth with magic link or Google OAuth
- Middleware to check authenticated user against allowed list

### 6.2 Future Auth (Phase 2)
- Role-based access (admin, viewer)
- Team member accounts with limited views

---

## 7. Deployment Checklist

### 7.1 Environment Variables for Vercel
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=[your-supabase-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# HighLevel
HL_AGENCY_KEY=[your-agency-jwt]
HL_LOCATION_TOKEN=[your-location-token]
HL_MAIN_LOCATION_ID=[your-location-id]

# Stripe
STRIPE_SECRET_KEY=[your-stripe-secret-key]

# Notion
NOTION_API_KEY=[your-notion-api-key]
NOTION_DATABASE_ID=[your-database-id]

# Auth
ALLOWED_EMAILS=amanda@automateboss.com,support@automateboss.com

# See .env.local for actual values
```

### 7.2 Vercel Cron Jobs
```json
// vercel.json
{
  "crons": [
    { "path": "/api/sync/all", "schedule": "*/5 * * * *" }
  ]
}
```

---

## 8. File Structure

```
/src
  /app
    /layout.tsx              — Root layout with nav
    /page.tsx                — Main dashboard
    /support/page.tsx        — Support queue
    /team/page.tsx           — Team performance
    /customers/page.tsx      — Customer health
    /settings/page.tsx       — Settings
    /api
      /sync
        /highlevel/route.ts
        /stripe/route.ts
        /gmail/route.ts
        /all/route.ts
      /dashboard
        /overview/route.ts
        /support/route.ts
        /team/route.ts
        /customers/route.ts
        /alerts/route.ts
  /components
    /ui                      — shadcn components
    /dashboard
      /MetricCard.tsx
      /AlertsList.tsx
      /SupportQueue.tsx
      /TeamPerformance.tsx
      /ChurnRisks.tsx
      /CustomerTable.tsx
  /lib
    /supabase.ts             — Supabase client
    /highlevel.ts            — HL API wrapper
    /stripe.ts               — Stripe client
    /notion.ts               — Notion client
    /utils.ts                — Helpers
  /types
    /index.ts                — TypeScript types
```

---

## 9. Priority Order for Building

**Phase 1: Core Infrastructure (Day 1)**
1. Set up Supabase tables
2. Create Supabase client
3. Build basic layout with navigation
4. Create API routes for HighLevel sync
5. Create API routes for Stripe sync

**Phase 2: Dashboard Views (Day 1-2)**
6. Main overview page with metric cards
7. Support queue component
8. Team performance component
9. Alerts component

**Phase 3: Full Features (Day 2-3)**
10. Customer health page
11. Team performance page
12. Support detail page
13. Settings/sync status page

**Phase 4: Polish (Day 3)**
14. AutomateBoss branding
15. Loading states
16. Error handling
17. Mobile responsiveness
18. Deploy to Vercel

---

## 10. Success Criteria

- [ ] Dashboard loads in < 2 seconds
- [ ] Real-time data (< 5 min old)
- [ ] All metrics visible on main page
- [ ] Support queue shows priority correctly
- [ ] Team performance shows response times
- [ ] Churn risks highlighted
- [ ] Works on mobile
- [ ] Deployed to Vercel successfully
- [ ] AutomateBoss branding applied
