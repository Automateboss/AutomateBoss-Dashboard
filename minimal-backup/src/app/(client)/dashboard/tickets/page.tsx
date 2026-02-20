import { getClientDashboardData } from '@/app/actions/client-portal'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ticket as TicketIcon, Plus, Clock, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default async function TicketsPage() {
    const data = await getClientDashboardData().catch(() => null)
    const tickets = data?.tickets || []

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tighter text-primary flex items-center gap-3">
                        <TicketIcon className="h-10 w-10 text-primary" />
                        SUPPORT CENTER
                    </h1>
                    <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
                        Manage your support requests and feedback
                    </p>
                </div>
                <Button asChild className="font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                    <Link href="/dashboard/tickets/new">
                        <Plus className="mr-2 h-4 w-4" /> New Ticket
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {tickets.length === 0 ? (
                    <Card className="border-dashed border-2 p-12 flex flex-col items-center text-center space-y-4">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
                        <div>
                            <CardTitle className="text-xl">No active tickets</CardTitle>
                            <CardDescription>When you open a support ticket, it will appear here.</CardDescription>
                        </div>
                    </Card>
                ) : (
                    tickets.map((ticket: any) => (
                        <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                            <Card className="hover:border-primary/40 transition-all bg-card/50 backdrop-blur-sm group cursor-pointer shadow-sm">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                                                {ticket.subject}
                                            </h3>
                                            <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'outline'} className="text-[10px] font-bold uppercase">
                                                {ticket.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 uppercase font-semibold">
                                            <Clock className="h-3 w-3" /> Last activity: {new Date(ticket.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge className={
                                            ticket.status === 'open' ? 'bg-primary' :
                                                ticket.status === 'in_progress' ? 'bg-accent' :
                                                    'bg-muted text-muted-foreground'
                                        }>
                                            {ticket.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                        <Plus className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
