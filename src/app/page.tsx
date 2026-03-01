'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { SupportQueue } from '@/components/dashboard/SupportQueue';
import { TeamPerformance } from '@/components/dashboard/TeamPerformance';
import { DashboardOverview, Alert, SupportConversation, TeamPerformance as TeamPerformanceType } from '@/types';
import { DollarSign, Users, TrendingDown, MessageSquare } from 'lucide-react';

export default function Dashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [supportQueue, setSupportQueue] = useState<SupportConversation[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformanceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    // Refresh every 5 minutes
    const interval = setInterval(loadDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboard() {
    try {
      // Load overview
      const overviewRes = await fetch('/api/dashboard/overview');
      const overviewData = await overviewRes.json();
      setOverview(overviewData);

      // Load alerts
      const alertsRes = await fetch('/api/dashboard/alerts');
      const alertsData = await alertsRes.json();
      setAlerts(alertsData.alerts || []);

      // Load support queue
      const supportRes = await fetch('/api/dashboard/support');
      const supportData = await supportRes.json();
      const allConversations = [
        ...(supportData.urgent || []),
        ...(supportData.high || []),
        ...(supportData.normal || [])
      ];
      setSupportQueue(allConversations);

      // Load team performance
      const teamRes = await fetch('/api/dashboard/team');
      const teamData = await teamRes.json();
      setTeamPerformance(teamData.performance || []);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
  }

  async function handleDismissAlert(alertId: string) {
    try {
      await fetch('/api/dashboard/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'dismiss' })
      });
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  }

  const lastSyncTime = overview?.lastSync 
    ? new Date(overview.lastSync).toLocaleTimeString()
    : 'Never';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              🎪 AutomateBoss Command Center
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Last sync: {lastSyncTime}
            </p>
          </div>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="MRR"
            value={`$${overview?.metrics.mrr?.toLocaleString() || '0'}`}
            icon={<DollarSign className="h-4 w-4" />}
            loading={loading}
          />
          <MetricCard
            title="ARR"
            value={`$${overview?.metrics.arr?.toLocaleString() || '0'}`}
            icon={<DollarSign className="h-4 w-4" />}
            loading={loading}
          />
          <MetricCard
            title="Active Subscribers"
            value={overview?.metrics.activeSubscribers || 0}
            icon={<Users className="h-4 w-4" />}
            loading={loading}
          />
          <MetricCard
            title="Churn Rate"
            value={`${overview?.metrics.churnRate?.toFixed(1) || '0'}%`}
            icon={<TrendingDown className="h-4 w-4" />}
            loading={loading}
          />
          <MetricCard
            title="Unread Messages"
            value={overview?.metrics.unreadConversations || 0}
            icon={<MessageSquare className="h-4 w-4" />}
            loading={loading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <AlertsList alerts={alerts} onDismiss={handleDismissAlert} />
            <SupportQueue conversations={supportQueue} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <TeamPerformance performance={teamPerformance} />
            
            {/* Churn Risks Placeholder */}
            <div className="bg-white rounded-xl border shadow p-6">
              <h3 className="text-lg font-semibold mb-4">⚠️ Churn Risks</h3>
              <p className="text-sm text-slate-600">
                Customer health monitoring coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
