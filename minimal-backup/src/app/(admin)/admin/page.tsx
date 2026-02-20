import { getAdminStats, getGlobalActivity } from '@/app/actions/admin'
export const dynamic = 'force-dynamic'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { Badge } from '@/components/ui/badge'
import { Clock, User, Building2 } from 'lucide-react'

export default async function AdminDashboard() {
    const [stats, activity] = await Promise.all([
        getAdminStats(),
        getGlobalActivity()
    ])

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tighter text-primary uppercase">COMMAND CENTER</h1>
                    <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
                        Global Operational Overview
                    </p>
                </div>

                {stats.flaggedItems > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg font-black text-xs uppercase tracking-widest border border-destructive/20 shadow-sm animate-pulse">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                        </span>
                        {stats.flaggedItems} Flagged Items
                    </div>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <AdminStatCard
                    title="New Clients"
                    value={stats.newClients}
                    description="Last 7 days"
                />
                <AdminStatCard
                    title="A2P Pending"
                    value={stats.a2pPending}
                    description="Brand registrations"
                />
                <AdminStatCard
                    title="Work In Progress"
                    value={stats.workInProgress}
                    description="Active builds"
                />
                <AdminStatCard
                    title="Open Tickets"
                    value={stats.openTickets}
                    description="Response required"
                    status={stats.openTickets > 5 ? 'alert' : 'default'}
                />
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Global Activity Feed */}
                <div className="rounded-xl border border-primary/10 bg-card/30 backdrop-blur-sm p-6 col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-primary uppercase tracking-tight">Global Activity Feed</h2>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">Real-time</Badge>
                    </div>

                    <div className="space-y-4">
                        {activity.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-20 italic font-medium">
                                Monitoring global operations... No recent activity found.
                            </p>
                        ) : (
                            activity.map((item: any) => (
                                <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-bold tracking-tight">
                                            {item.action.replace('_', ' ').toUpperCase()}
                                        </p>
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" /> {item.user?.full_name || 'System'}
                                            </span>
                                            {item.organization?.name && (
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" /> {item.organization.name}
                                                </span>
                                            )}
                                            <span>
                                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Team Workload */}
                <div className="rounded-xl border border-primary/10 bg-card/30 backdrop-blur-sm p-6 space-y-6">
                    <h2 className="text-xl font-black text-primary uppercase tracking-tight">Team Workload</h2>
                    <div className="space-y-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase leading-relaxed italic">
                            Awaiting task assignments and workload distribution logic...
                        </p>
                        <div className="h-32 rounded-lg border-2 border-dashed border-primary/5 bg-primary/[0.02]" />
                    </div>
                </div>
            </div>
        </div>
    )
}
