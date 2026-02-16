import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User, AlertCircle, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
    project: any
    isDragging?: boolean
}

export function ProjectCard({ project, isDragging }: ProjectCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isSorting,
    } = useSortable({ id: project.id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    const isFlagged = project.flagged || (
        project.status !== 'completed' &&
        new Date(project.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)
    )

    if (isSorting) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="h-[120px] rounded-xl border-2 border-dashed border-primary/10 bg-primary/5"
            />
        )
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                "border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all group shrink-0",
                isDragging && "opacity-50 cursor-grabbing shadow-2xl border-primary/50"
            )}
        >
            <CardContent className="p-4 space-y-3 relative">
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute right-2 top-11 p-1 opacity-0 group-hover:opacity-40 hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity transition-all"
                >
                    <GripVertical className="h-4 w-4 text-primary" />
                </div>

                <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 h-5">
                        {project.project_type.replace('_', ' ')}
                    </Badge>
                    {isFlagged && (
                        <AlertCircle className="h-4 w-4 text-destructive animate-pulse" />
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-black text-primary leading-tight uppercase group-hover:text-accent transition-colors">
                        {project.organization?.name || 'Unknown Client'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                        <User className="h-3 w-3" />
                        {project.assigned_user?.full_name || 'Unassigned'}
                    </div>
                </div>

                <div className="pt-2 border-t border-primary/5 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(project.created_at).toLocaleDateString()}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
