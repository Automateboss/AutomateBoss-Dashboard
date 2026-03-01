// TypeScript Types for AutomateBoss Dashboard

export interface DailyMetric {
  id: string;
  date: string;
  mrr: number;
  arr: number;
  active_subscribers: number;
  churned_subscribers: number;
  churn_rate: number;
  new_subscribers: number;
  total_conversations: number;
  unread_conversations: number;
  avg_response_time_minutes: number;
  created_at: string;
}

export interface TeamPerformance {
  id: string;
  date: string;
  team_member: string;
  team_member_id: string;
  messages_sent: number;
  avg_response_time_minutes: number;
  conversations_handled: number;
  created_at: string;
}

export interface CustomerHealth {
  id: string;
  location_id: string;
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  health_score: number;
  last_contact_date: string | null;
  days_since_contact: number | null;
  has_open_issues: boolean;
  churn_risk_level: 'low' | 'medium' | 'high' | 'critical';
  churn_signals: string[];
  subscription_status: string | null;
  mrr: number | null;
  created_at: string;
  updated_at: string;
}

export interface SupportConversation {
  id: string;
  hl_conversation_id: string;
  contact_id: string | null;
  contact_name: string | null;
  company_name: string | null;
  last_message_date: string | null;
  last_message_body: string | null;
  last_message_direction: 'inbound' | 'outbound' | null;
  unread_count: number;
  assigned_to: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved';
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  conversation_id: string | null;
  customer_name: string | null;
  company_name: string | null;
  issue_type: 'bug' | 'question' | 'feature_request' | 'billing' | 'urgent' | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface EmailMessage {
  id: string;
  email_id: string;
  folder: string;
  from_address: string | null;
  from_name: string | null;
  subject: string | null;
  body_preview: string | null;
  received_at: string | null;
  is_read: boolean;
  is_flagged: boolean;
  priority: 'low' | 'normal' | 'high';
  created_at: string;
}

export interface Alert {
  id: string;
  type: 'churn_risk' | 'payment_failed' | 'urgent_support' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string | null;
  customer_id: string | null;
  customer_name: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  action_url: string | null;
  created_at: string;
}

export interface SyncStatus {
  id: string;
  source: 'highlevel' | 'stripe' | 'gmail' | 'notion';
  last_sync_at: string | null;
  last_sync_status: 'success' | 'error' | null;
  last_error: string | null;
  records_synced: number;
}

// Dashboard Overview Response
export interface DashboardOverview {
  metrics: {
    mrr: number;
    arr: number;
    activeSubscribers: number;
    churnRate: number;
    unreadConversations: number;
  };
  recentActivity: {
    newCustomers: number;
    supportTickets: number;
    avgResponseTime: number;
  };
  lastSync: string | null;
}

// Support Queue Response
export interface SupportQueue {
  urgent: SupportConversation[];
  high: SupportConversation[];
  normal: SupportConversation[];
  total: number;
}

// Team Performance Summary
export interface TeamPerformanceSummary {
  teamMember: string;
  teamMemberId: string;
  messagesSent: number;
  conversationsHandled: number;
  avgResponseTime: number;
}
