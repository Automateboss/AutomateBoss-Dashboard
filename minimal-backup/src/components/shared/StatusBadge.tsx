import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
    status: string
    className?: string
}

const statusMap: Record<string, { label: string; color: string }> = {
    // Project Statuses
    pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    in_progress: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    waiting_on_client: { label: 'Waiting on Client', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    completed: { label: 'Completed', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    archived: { label: 'Archived', color: 'bg-muted text-muted-foreground border-muted-foreground/20' },

    // Ticket Statuses
    open: { label: 'Open', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    resolved: { label: 'Resolved', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    closed: { label: 'Closed', color: 'bg-muted text-muted-foreground border-muted-foreground/20' },

    // Organization Statuses
    active: { label: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    churned: { label: 'Churned', color: 'bg-destructive/10 text-destructive border-destructive/20' },
    paused: { label: 'Paused', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusMap[status.toLowerCase()] || { label: status, color: 'bg-muted text-muted-foreground' }

    return (
        <Badge variant="outline" className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5",
            config.color,
            className
        )}>
            {config.label}
        </Badge>
    )
}
