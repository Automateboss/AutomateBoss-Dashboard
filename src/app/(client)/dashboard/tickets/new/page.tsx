import TicketForm from '@/components/client/ticket-form'
import { Ticket as TicketIcon, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewTicketPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
                <Button variant="ghost" asChild className="-ml-2 w-fit font-bold">
                    <Link href="/dashboard/tickets">
                        <ChevronLeft className="mr-1 h-4 w-4" /> BACK TO CENTER
                    </Link>
                </Button>
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tighter text-primary flex items-center gap-3">
                        <TicketIcon className="h-10 w-10 text-primary" />
                        SUBMIT TICKET
                    </h1>
                    <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
                        Describe your issue and our team will jump in
                    </p>
                </div>
            </div>

            <TicketForm />
        </div>
    )
}
