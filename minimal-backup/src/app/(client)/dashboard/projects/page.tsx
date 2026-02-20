import { getProjects } from '@/app/actions/client-portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderKanban, ChevronRight, LayoutList } from 'lucide-react'
import Link from 'next/link'

export default async function ProjectsPage() {
    const projects = await getProjects()

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tighter text-primary flex items-center gap-3">
                    <FolderKanban className="h-10 w-10 text-primary" />
                    ACTIVE PROJECTS
                </h1>
                <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
                    Track the development of your website and systems
                </p>
            </div>

            <div className="grid gap-4">
                {projects.length === 0 ? (
                    <Card className="border-dashed border-2 p-12 flex flex-col items-center text-center space-y-4">
                        <LayoutList className="h-12 w-12 text-muted-foreground/30" />
                        <div>
                            <CardTitle className="text-xl">No active projects</CardTitle>
                            <p className="text-muted-foreground">Once we start your build, it will appear here.</p>
                        </div>
                    </Card>
                ) : (
                    projects.map((project: any) => (
                        <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                            <Card className="hover:border-primary/40 transition-all bg-card/50 backdrop-blur-sm group cursor-pointer shadow-sm">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors uppercase">
                                            {project.project_type.replace('_', ' ')}
                                        </h3>
                                        <p className="text-xs text-muted-foreground flex items-center gap-2 font-semibold uppercase tracking-wider">
                                            Started: {new Date(project.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={project.status === 'in_progress' ? 'default' : 'secondary'} className="uppercase font-bold">
                                            {project.status.replace('_', ' ')}
                                        </Badge>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
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
