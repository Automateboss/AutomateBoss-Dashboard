import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ProjectCard } from './ProjectCard'
import { cn } from '@/lib/utils'

interface PipelineColumnProps {
    id: string
    title: string
    projects: any[]
}

export function PipelineColumn({ id, title, projects }: PipelineColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col gap-4 min-w-[300px] max-w-[350px] w-full bg-muted/20 rounded-xl p-4 border transition-colors",
                isOver ? "border-primary/40 bg-primary/5" : "border-primary/5"
            )}
        >
            <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">{title}</h3>
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {projects.length}
                </span>
            </div>

            <div className="flex flex-col gap-3 h-full min-h-[500px]">
                <SortableContext
                    items={projects.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {projects.length === 0 ? (
                        <div className="h-full rounded-lg border-2 border-dashed border-primary/5 flex items-center justify-center p-8">
                            <p className="text-[10px] text-muted-foreground uppercase font-black text-center opacity-40">
                                No projects in {title}
                            </p>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    )
}
