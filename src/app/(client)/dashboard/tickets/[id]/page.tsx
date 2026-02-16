import { getTicketData } from '@/app/actions/client-portal'
import TicketThread from '@/components/client/ticket-thread'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Ticket as TicketIcon, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const { ticket, messages } = await getTicketData(id)
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col gap-4">
                <Button variant="ghost" asChild className="-ml-2 w-fit font-bold">
                    <Link href="/dashboard/tickets">
                        <ChevronLeft className="mr-1 h-4 w-4" /> BACK TO CENTER
                    </Link>
                </Button>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tighter text-primary">
                                {ticket.subject.toUpperCase()}
                            </h1>
                            <Badge className={
                                ticket.status === 'open' ? 'bg-primary' :
                                    ticket.status === 'in_progress' ? 'bg-accent' :
                                        'bg-muted text-muted-foreground'
                            }>
                                {ticket.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                                <TicketIcon className="h-3 w-3" /> {ticket.ticket_type}
                            </span>
                            <span className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Priority: {ticket.priority}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Opened {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <TicketThread
                ticketId={id}
                initialMessages={messages}
                currentUserId={session?.user.id || ''}
            />
        </div>
    )
}
