-- AutomateBoss Command Center - Database Schema
-- Purpose: Real-time business operations dashboard
-- Created: Feb 28, 2026

-- ============================================
-- DAILY METRICS SNAPSHOT
-- ============================================

CREATE TABLE IF NOT EXISTS daily_metrics (
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

-- ============================================
-- TEAM PERFORMANCE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS team_performance (
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

-- ============================================
-- CUSTOMER HEALTH SCORES
-- ============================================

CREATE TABLE IF NOT EXISTS customer_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL UNIQUE,
  company_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  health_score INTEGER DEFAULT 100,
  last_contact_date TIMESTAMPTZ,
  days_since_contact INTEGER,
  has_open_issues BOOLEAN DEFAULT FALSE,
  churn_risk_level TEXT DEFAULT 'low',
  churn_signals JSONB DEFAULT '[]'::jsonb,
  subscription_status TEXT,
  mrr DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPPORT CONVERSATIONS CACHE
-- ============================================

CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hl_conversation_id TEXT NOT NULL UNIQUE,
  contact_id TEXT,
  contact_name TEXT,
  company_name TEXT,
  last_message_date TIMESTAMPTZ,
  last_message_body TEXT,
  last_message_direction TEXT,
  unread_count INTEGER DEFAULT 0,
  assigned_to TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUPPORT TICKETS/ISSUES
-- ============================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT,
  customer_name TEXT,
  company_name TEXT,
  issue_type TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================
-- EMAIL INBOX CACHE
-- ============================================

CREATE TABLE IF NOT EXISTS email_inbox (
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

-- ============================================
-- ALERTS AND NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  customer_id TEXT,
  customer_name TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SYNC STATUS TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL UNIQUE,
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  last_error TEXT,
  records_synced INTEGER DEFAULT 0
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_team_performance_date ON team_performance(date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_health_risk ON customer_health(churn_risk_level);
CREATE INDEX IF NOT EXISTS idx_support_conversations_priority ON support_conversations(priority, status);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON alerts(is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_conversations_updated ON support_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_health_score ON customer_health(health_score);
