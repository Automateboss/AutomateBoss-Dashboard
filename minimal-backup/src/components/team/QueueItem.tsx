import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Building2, AlertCircle, MessageSquare, FolderKanban, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QueueItemData } from '@/app/actions/team'

interface QueueItemProps {
    item: QueueItemData
    onClick?: () => void
}

const typeIcons = {
    project: FolderKanban,
    ticket: MessageSquare,
    trailer_request: Truck,
}

const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-500',
    in_progress: 'bg-blue-500/10 text-blue-500',
    waiting_on_client: 'bg-orange-500/10 text-orange-500',
    open: 'bg-green-500/10 text-green-500',
}

export function QueueItem({ item, onClick }: QueueItemProps) {
    const Icon = typeIcons[item.type]

    return (
        <Card
            className={cn(
                "group border-primary/10 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all cursor-pointer",
                item.flagged && "border-destructive/20 bg-destructive/5"
            )}
            onClick={onClick}
        >
            <CardContent className="p-4 flex items-center gap-4">
                <div className={cn(
                    "p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors",
                    item.flagged && "bg-destructive/10 text-destructive"
                )}>
                    <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-primary uppercase tracking-tight truncate">
                            {item.title}
                        </h4>
                        {item.flagged && (
                            <Badge variant="destructive" className="animate-pulse text-[8px] font-black tracking-widest px-1.5 py-0">
                                FLAGGED
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {item.organization_name}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(item.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        statusColors[item.status as keyof typeof statusColors] || "bg-muted text-muted-foreground"
                    )}>
                        {item.status.replace('_', ' ')}
                    </Badge>
                    {item.priority && (
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-tighter opacity-60",
                            item.priority === 'urgent' && "text-destructive opacity-100"
                        )}>
                            {item.priority} priority
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
