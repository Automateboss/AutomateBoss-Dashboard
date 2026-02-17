import { getSOPs } from '@/app/actions/admin-sops'
import { ManagementTable } from '@/components/admin/ManagementTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Video, FileText, Settings, PlusCircle } from 'lucide-react'

export default async function SOPsPage() {
    const sops = await getSOPs()

    const columns = [
        {
            header: 'Process Title',
            accessor: (sop: any) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/5 text-primary border border-primary/10">
                        <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="font-black text-primary uppercase tracking-tight">{sop.title}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">ORDER: {sop.step_order || 'N/A'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Category',
            accessor: (sop: any) => (
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                    {sop.category?.replace('_', ' ') || 'GENERAL'}
                </Badge>
            )
        },
        {
            header: 'Media',
            accessor: (sop: any) => (
                <div className="flex gap-2">
                    {sop.loom_video_url && (
                        <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20" title="Video SOP">
                            <Video className="h-3.5 w-3.5" />
                        </div>
                    )}
                    {sop.google_doc_url && (
                        <div className="p-1.5 rounded-md bg-green-500/10 text-green-500 border border-green-500/20" title="Document SOP">
                            <FileText className="h-3.5 w-3.5" />
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Last Updated',
            accessor: (sop: any) => (
                <div className="text-xs font-bold text-muted-foreground uppercase">
                    {new Date(sop.updated_at).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: (sop: any) => (
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5">
                    Edit Procedure
                </Button>
            ),
            className: 'text-right'
        }
    ]

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-primary uppercase leading-none">OPERATIONAL KNOWLEDGE</h1>
                    <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
                        SOP Library & Training Documentation Management
                    </p>
                </div>
                <Button className="font-black uppercase tracking-widest text-xs h-10 px-6 gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Create New Procedure
                </Button>
            </div>

            <ManagementTable columns={columns} data={sops} />
        </div>
    )
}
