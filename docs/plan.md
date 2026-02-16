# AutomateBoss Support Dashboard Plan

## 🗺️ Master Roadmap

- **Milestone 1: Foundations & Architecture**
    - [x] PRD Review & Schema Design
    - [x] Project Initialization (Next.js, Supabase, Vercel)
    - [x] Auth & Role Definition (Admin, Team, Client)
- **Milestone 2: Core Data Layer**
    - [x] Supabase Table Setup & RLS Polices
    - [x] API Route Implementation
- **Milestone 3: Client Experience**
    - [x] Client Portal Dashboard
    - [x] Trailer Addition Workflow
    - [x] Support Ticket System
- **Milestone 4: Admin & Team Operations**
    - [x] Admin Dashboard (Global Activity, Flags)
    - [x] Pipeline Views
    - [x] Team Member Queue Management
- **Milestone 5: Logic & Polish**
    - [x] Flagging Logic (24h+ stale items)
    - [/] UI/UX Refinement
    - [x] QA & E2E Testing
- **Milestone 6: Integrations & Webhooks**
    - [x] HighLevel Webhook Integration
    - [x] Auto-initialization Logic

## 📝 Current Trajectory

**Step: Integrations & Webhooks Development**
- Status: Admin and Team interfaces live. Implementing external integrations.
- Goal: Set up secure webhook endpoints for HighLevel to automate client onboarding and request intake.

## 🚥 Squad Status

| Agent | Task | Status |
| :--- | :--- | :--- |
| 📚 The Researcher | Mapping HighLevel webhook payloads to database schema | 🟢 Active |
| 🏗️ The Builder | Implementing `/api/webhooks/highlevel` endpoint | 🟡 Waiting |
| 🐎 The Design Lead | Reviewing notification UI components | 🟢 Active |
| 🤓 The Nerd | Designing security verification for webhook signatures | 🟡 Waiting |

---

## Product Requirements Document (PRD)

### Executive Summary

**Project Name:** AutomateBoss Operations Portal  
**Purpose:** Replace ClickUp with a custom-built internal operations and client portal system  
**Tech Stack:** Next.js + Supabase + Vercel  
**Primary Users:** AutomateBoss team (2-3 people) + ~128 trailer rental business clients

---

### Database Schema (Supabase/PostgreSQL)

```sql
-- Organizations (Client Companies)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  highlevel_location_id TEXT, -- HL sub-account ID
  calendar_version TEXT CHECK (calendar_version IN ('v1', 'v2', 'v3')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'churned', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed_at TIMESTAMPTZ,
  google_drive_folder_url TEXT
);

-- Users (Team + Clients)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'team_member', 'client')),
  organization_id UUID REFERENCES organizations(id), -- NULL for team members
  team_specializations TEXT[], -- ['a2p', 'website', 'onboarding', 'trailer_additions']
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Projects (Website Builds, A2P, Onboarding)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_type TEXT NOT NULL CHECK (project_type IN ('website_build', 'a2p_verification', 'onboarding')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'waiting_on_client', 'completed', 'archived')),
  assigned_to UUID REFERENCES users(id),
  current_step_id UUID, -- References project_steps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  flagged BOOLEAN DEFAULT FALSE,
  flagged_at TIMESTAMPTZ,
  visible_to_client BOOLEAN DEFAULT TRUE -- Hide archived from client view
);

-- Project Steps (SOP Steps)
CREATE TABLE project_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_type TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  description TEXT,
  loom_video_url TEXT,
  google_doc_url TEXT,
  estimated_minutes INTEGER,
  is_client_visible BOOLEAN DEFAULT TRUE, -- Some internal steps hidden from clients
  UNIQUE(project_type, step_order)
);

-- Project Step Progress (Tracking completion per project)
CREATE TABLE project_step_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  step_id UUID NOT NULL REFERENCES project_steps(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_by UUID REFERENCES users(id),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(project_id, step_id)
);

-- Trailer Addition Requests
CREATE TABLE trailer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_to UUID REFERENCES users(id),
  
  -- Trailer Info
  make TEXT,
  trailer_type TEXT,
  model TEXT,
  last_6_vin TEXT,
  mba_insured BOOLEAN,
  mba_policy_number TEXT,
  
  -- Specifications
  hook_up_type TEXT, -- 'gooseneck', 'ball_hitch', 'bumper_pull'
  gvwr TEXT,
  load_capacity TEXT,
  interior_length TEXT,
  interior_width TEXT,
  interior_height TEXT,
  cubic_yards TEXT,
  rear_door_width TEXT,
  rear_door_height TEXT,
  coupler_size TEXT,
  axle_tandem TEXT,
  suspension TEXT,
  brakes TEXT,
  floor_spec TEXT,
  walls_spec TEXT,
  jack TEXT,
  breakaway_system BOOLEAN,
  custom_modifications TEXT,
  trailer_spec_url TEXT,
  
  -- Rental Rates
  rate_24hr DECIMAL(10,2),
  rate_3day DECIMAL(10,2),
  rate_weekly DECIMAL(10,2),
  rate_monthly DECIMAL(10,2),
  deposit DECIMAL(10,2),
  
  -- Fees
  cleaning_fee DECIMAL(10,2),
  late_fee_per_hour DECIMAL(10,2),
  delivery_fee TEXT, -- Can be per hour or per mile
  
  -- Replacement Costs (JSONB for flexibility)
  replacement_costs JSONB,
  
  -- Photos
  photo_urls TEXT[], -- Google Drive links
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  flagged BOOLEAN DEFAULT FALSE,
  flagged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Source tracking
  source TEXT DEFAULT 'portal' CHECK (source IN ('portal', 'highlevel_form', 'manual'))
);

-- Support Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  
  subject TEXT NOT NULL,
  ticket_type TEXT CHECK (ticket_type IN ('support', 'feature_request', 'question', 'bug', 'other')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_on_client', 'resolved', 'closed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  flagged BOOLEAN DEFAULT FALSE,
  flagged_at TIMESTAMPTZ
);

-- Messages (For tickets, projects, and general communication)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polymorphic association
  messageable_type TEXT NOT NULL CHECK (messageable_type IN ('ticket', 'project', 'trailer_request', 'organization')),
  messageable_id UUID NOT NULL,
  
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  
  -- Visibility
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes not visible to clients
  
  -- Attachments
  attachment_urls TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log (Audit trail)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  
  action TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'assigned', etc.
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  
  old_values JSONB,
  new_values JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOPs (Standard Operating Procedures)
CREATE TABLE sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT, -- 'website_build', 'a2p', 'onboarding', 'trailer_addition', 'general'
  content TEXT, -- Markdown content
  loom_video_url TEXT,
  google_doc_url TEXT,
  step_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Feature Specifications (Summary)

1.  **Client Portal:** Dashboard, Trailer Additions form, Support Tickets, Project details.
2.  **Super Admin:** Command Center, Pipeline (Kanban) views, Client/Team management, SOP management.
3.  **Team Interface:** "My Queue" sorted by flagged/oldest, Task details with SOP/Loom integration.
4.  **Workflows:** 24h flagging cron, New client auto-init, HL integration via webhooks.

---

### Implementation Priority

1.  **Phase 1: Foundation:** Next.js + Supabase, Auth, Schema, RLS.
2.  **Phase 2: Client Portal:** Core client workflows.
3.  **Phase 3: Admin Dashboard:** Command center, pipelines, flagging.
4.  **Phase 4: Team Interface:** Task queues, SOP integration.
5.  **Phase 5: Integrations:** Webhooks, Real-time notifications.
6.  **Phase 6: Polish:** UI/UX refinement, performance, E2E testing.
