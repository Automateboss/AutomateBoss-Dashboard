import { getClients } from '@/app/actions/admin-clients'
import { ManagementTable } from '@/components/admin/ManagementTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { PlusCircle, Building2, Globe, Calendar } from 'lucide-react'

export default async function ClientsPage() {
    const clients = await getClients()

    const columns = [
        {
            header: 'Organization',
            accessor: (client: any) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/5 text-primary border border-primary/10">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="font-black text-primary uppercase tracking-tight">{client.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">ID: {client.id.slice(0, 8)}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Location ID',
            accessor: (client: any) => (
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                    <Globe className="h-3 w-3" />
                    {client.highlevel_location_id || 'NOT LINKED'}
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (client: any) => <StatusBadge status={client.status} />
        },
        {
            header: 'Created At',
            accessor: (client: any) => (
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                    <Calendar className="h-3 w-3" />
                    {new Date(client.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: (client: any) => (
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5">
                    View CRM
                </Button>
            ),
            className: 'text-right'
        }
    ]

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-primary uppercase leading-none">CLIENT PORTFOLIO</h1>
                    <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
                        Organization Management & CRM Oversight
                    </p>
                </div>
                <Button className="font-black uppercase tracking-widest text-xs h-10 px-6 gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Onboard New Client
                </Button>
            </div>

            <ManagementTable columns={columns} data={clients} />
        </div>
    )
}
