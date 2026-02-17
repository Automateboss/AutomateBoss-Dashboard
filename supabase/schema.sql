-- AutomateBoss Dashboard - Database Schema
-- Created: Feb 16, 2026
-- Purpose: $1M Business Operations Platform

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'team_member', 'customer')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- CUSTOMERS (Trailer Rental Businesses)
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  stripe_customer_id TEXT UNIQUE,
  hl_location_id TEXT UNIQUE, -- HighLevel sub-account ID
  subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled')),
  mrr DECIMAL(10,2) DEFAULT 0,
  customer_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  health_score INTEGER DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
  churn_risk TEXT CHECK (churn_risk IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUPPORT TICKETS
-- ============================================

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number SERIAL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  category TEXT CHECK (category IN ('technical', 'billing', 'training', 'feature_request', 'other')),
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROJECTS (Website Builds, Trailer Additions)
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id),
  project_type TEXT CHECK (project_type IN ('website_build', 'trailer_addition', 'a2p_setup', 'workflow_fix', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'canceled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRAILERS (Customer Inventory)
-- ============================================

CREATE TABLE IF NOT EXISTS trailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  trailer_name TEXT NOT NULL,
  trailer_type TEXT,
  dimensions TEXT,
  daily_rate DECIMAL(10,2),
  weekly_rate DECIMAL(10,2),
  photos JSONB, -- Array of photo URLs
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  hl_calendar_id TEXT, -- HighLevel calendar ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TEAM TASKS & KPIs
-- ============================================

CREATE TABLE IF NOT EXISTS team_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('onboarding', 'support', 'technical', 'website', 'admin')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'completed', 'canceled')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_estimate_hours DECIMAL(5,2),
  time_spent_hours DECIMAL(5,2),
  related_ticket_id UUID REFERENCES tickets(id),
  related_project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  onboarding_calls INTEGER DEFAULT 0,
  support_tickets_handled INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER,
  customer_satisfaction_score DECIMAL(3,2),
  tasks_completed INTEGER DEFAULT 0,
  websites_built INTEGER DEFAULT 0,
  churn_saves INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- REVENUE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS revenue_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL UNIQUE,
  active_customers INTEGER NOT NULL,
  mrr DECIMAL(10,2) NOT NULL,
  arr DECIMAL(10,2) NOT NULL,
  new_customers_month INTEGER DEFAULT 0,
  churned_customers_month INTEGER DEFAULT 0,
  churn_rate_percent DECIMAL(5,2),
  avg_customer_age_days INTEGER,
  ltv DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOG (Audit Trail)
-- ============================================

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT, -- ticket, project, customer, etc
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customers_stripe ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_hl ON customers(hl_location_id);
CREATE INDEX IF NOT EXISTS idx_customers_health ON customers(health_score);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_team_tasks_assigned ON team_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_team_tasks_status ON team_tasks(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Super admins can see everything
CREATE POLICY "Super admins have full access" ON users FOR ALL USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'super_admin')
);

CREATE POLICY "Super admins see all customers" ON customers FOR ALL USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'super_admin')
);

-- Customers can only see their own data
CREATE POLICY "Customers see own data" ON customers FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY "Customers see own tickets" ON tickets FOR ALL USING (
  customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
);

CREATE POLICY "Customers see own trailers" ON trailers FOR ALL USING (
  customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
);

-- Team members can see assigned tasks
CREATE POLICY "Team sees assigned tasks" ON team_tasks FOR SELECT USING (
  assigned_to = auth.uid() OR 
  auth.uid() IN (SELECT id FROM users WHERE role = 'super_admin')
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trailers_updated_at BEFORE UPDATE ON trailers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_tasks_updated_at BEFORE UPDATE ON team_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
