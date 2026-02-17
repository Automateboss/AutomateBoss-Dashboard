import { getPipelineProjects } from '@/app/actions/admin'
export const dynamic = 'force-dynamic'
import { PipelineKanban } from '@/components/admin/PipelineKanban'
import { PipelineListView } from '@/components/admin/PipelineListView'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function PipelinePage(props: {
    searchParams: Promise<{ view?: string }>
}) {
    const searchParams = await props.searchParams
    const projects = await getPipelineProjects()
    const currentView = searchParams.view || 'grid'

    const statuses = [
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Waiting on Client', value: 'waiting_on_client' },
        { label: 'Completed', value: 'completed' }
    ]

    const projectTypes = [
        { label: 'All Projects', value: 'all' },
        { label: 'Website Builds', value: 'website_build' },
        { label: 'A2P Verification', value: 'a2p_verification' },
        { label: 'Onboarding', value: 'onboarding' }
    ]

    const filterProjects = (type: string) => {
        if (type === 'all') return projects
        return projects.filter((p: any) => p.project_type === type)
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            <div className="flex items-end justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tighter text-primary uppercase">OPERATIONAL PIPELINES</h1>
                    <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
                        Visual Project Workflow Management
                    </p>
                </div>

                <div className="flex items-center gap-1 bg-card/50 backdrop-blur-sm border border-primary/10 p-1 rounded-xl">
                    <Link href="/admin/pipelines?view=grid">
                        <Button
                            variant={currentView === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            className={cn(
                                "h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                currentView === 'grid' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            <LayoutGrid className="h-3.5 w-3.5 mr-2" />
                            Grid
                        </Button>
                    </Link>
                    <Link href="/admin/pipelines?view=list">
                        <Button
                            variant={currentView === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            className={cn(
                                "h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                currentView === 'list' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            <List className="h-3.5 w-3.5 mr-2" />
                            List
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="all" className="space-y-8">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-card/50 backdrop-blur-sm border border-primary/10">
                        {projectTypes.map((type) => (
                            <TabsTrigger
                                key={type.value}
                                value={type.value}
                                className="text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                                {type.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {projectTypes.map((type) => (
                    <TabsContent key={type.value} value={type.value} className="mt-0">
                        {currentView === 'list' ? (
                            <PipelineListView projects={filterProjects(type.value)} />
                        ) : (
                            <PipelineKanban
                                initialProjects={filterProjects(type.value)}
                                statuses={statuses}
                            />
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
