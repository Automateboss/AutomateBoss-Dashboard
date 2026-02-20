import { getClientDashboardData } from '@/app/actions/client-portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Truck, Ticket, FolderKanban, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function ClientDashboard() {
    const data = await getClientDashboardData().catch(() => null)

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground animate-pulse" />
                <h2 className="text-xl font-semibold">Dashboard Unavailable</h2>
                <p className="text-muted-foreground text-center max-w-sm">
                    We couldn&#39;t load your dashboard. If you just signed up, your account might still be under review.
                </p>
            </div>
        )
    }

    const { stats, projects, tickets } = data

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tighter text-primary">PORTAL OVERVIEW</h1>
                <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
                    AutomateBoss Operations Hub
                </p>
            </div>

            {/* Real-time Stat Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Active Projects</CardTitle>
                        <FolderKanban className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-primary">{stats.activeProjects}</div>
                        <p className="text-xs text-muted-foreground mt-1">Website builds and onboarding</p>
                    </CardContent>
                </Card>
                <Card className="border-accent/10 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Pending Trailers</CardTitle>
                        <Truck className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-secondary">{stats.pendingTrailers}</div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting implementation into GHL</p>
                    </CardContent>
                </Card>
                <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Open Tickets</CardTitle>
                        <Ticket className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-primary">{stats.openTickets}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active requests and support</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Active Projects List */}
                <Card className="border-primary/5 bg-card/30 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            <FolderKanban className="h-5 w-5 text-primary" />
                            Active Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {projects.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-12 italic">No active projects at this time.</p>
                        ) : (
                            projects.map((project: any) => (
                                <div key={project.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold uppercase tracking-tight">{project.project_type.replace('_', ' ')}</p>
                                        <Badge variant={project.status === 'in_progress' ? 'default' : 'secondary'}>
                                            {project.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <Progress value={project.status === 'completed' ? 100 : 45} className="h-2" />
                                </div>
                            ))
                        )}
                        <Link href="/dashboard/projects" className="text-xs font-bold text-primary hover:underline block text-center mt-4">
                            VIEW ALL PROJECTS →
                        </Link>
                    </CardContent>
                </Card>

                {/* Support Ticket Quick View */}
                <Card className="border-primary/5 bg-card/30 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-primary" />
                            Recent Support
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {tickets.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-12 italic">All caught up! No active tickets.</p>
                        ) : (
                            tickets.map((ticket: any) => (
                                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold tracking-tight">{ticket.subject}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-semibold">
                                            <Clock className="h-3 w-3" /> Updated {new Date(ticket.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold">
                                        {ticket.status.toUpperCase()}
                                    </Badge>
                                </div>
                            ))
                        )}
                        <Link href="/dashboard/tickets" className="text-xs font-bold text-primary hover:underline block text-center mt-4">
                            OPEN NEW TICKET →
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
