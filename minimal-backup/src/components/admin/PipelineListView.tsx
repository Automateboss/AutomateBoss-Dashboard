'use client'

import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Clock,
    User,
    Building2,
    AlertCircle,
    ChevronRight,
    ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface PipelineListViewProps {
    projects: any[]
}

export function PipelineListView({ projects }: PipelineListViewProps) {
    if (projects.length === 0) {
        return (
            <div className="py-20 text-center space-y-4 rounded-3xl border-2 border-dashed border-primary/5">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                    No projects found in this pipeline.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl">
            <Table>
                <TableHeader className="bg-primary/5">
                    <TableRow className="border-primary/10 hover:bg-transparent">
                        <TableHead className="text-[10px] font-black text-primary uppercase tracking-[0.2em] h-12 w-[300px]">Client / Organization</TableHead>
                        <TableHead className="text-[10px] font-black text-primary uppercase tracking-[0.2em] h-12">Type</TableHead>
                        <TableHead className="text-[10px] font-black text-primary uppercase tracking-[0.2em] h-12">Status</TableHead>
                        <TableHead className="text-[10px] font-black text-primary uppercase tracking-[0.2em] h-12">Assigned To</TableHead>
                        <TableHead className="text-[10px] font-black text-primary uppercase tracking-[0.2em] h-12">Created</TableHead>
                        <TableHead className="text-[10px] font-black text-primary uppercase tracking-[0.2em] h-12 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => {
                        const isFlagged = project.flagged || (
                            project.status !== 'completed' &&
                            new Date(project.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)
                        )

                        return (
                            <TableRow
                                key={project.id}
                                className="border-primary/5 hover:bg-primary/5 transition-colors group"
                            >
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "flex-shrink-0 w-1.5 h-1.5 rounded-full",
                                            isFlagged ? "bg-destructive animate-pulse" : "bg-primary/40"
                                        )} />
                                        <div>
                                            <p className="text-sm font-black text-primary uppercase tracking-tight leading-none group-hover:text-accent transition-colors">
                                                {project.organization?.name || 'Unknown Client'}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0">
                                        {project.project_type.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn(
                                        "text-[9px] uppercase font-black tracking-tighter px-2 py-0.5",
                                        project.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                            project.status === 'in_progress' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    )}>
                                        {project.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase">
                                        <User className="h-3 w-3" />
                                        {project.assigned_user?.full_name || 'Unassigned'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase">
                                        <Clock className="h-3 w-3" />
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link
                                        href={`/admin/projects/${project.id}`}
                                        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                                    >
                                        View Details
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
