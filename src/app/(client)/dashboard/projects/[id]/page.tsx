import { getProjectData } from '@/app/actions/client-portal'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, CheckCircle2, Circle, Clock, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const { project, steps, progress } = await getProjectData(id)

    const completedSteps = progress.filter((p: any) => p.status === 'completed').length
    const totalSteps = steps.length
    const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col gap-4">
                <Button variant="ghost" asChild className="-ml-2 w-fit font-bold">
                    <Link href="/dashboard/projects">
                        <ChevronLeft className="mr-1 h-4 w-4" /> BACK TO PROJECTS
                    </Link>
                </Button>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter text-primary uppercase">
                            {project.project_type.replace('_', ' ')}
                        </h1>
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Started {new Date(project.created_at).toLocaleDateString()}
                            </span>
                            <Badge variant="outline">{project.status.toUpperCase()}</Badge>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 space-y-4">
                    <div className="flex items-center justify-between font-bold text-sm uppercase tracking-tighter">
                        <span>Overall Build Progress</span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-black tracking-tight text-primary uppercase">Implementation Roadmap</h2>
                <div className="grid gap-3">
                    {steps.map((step: any, index: number) => {
                        const stepProgress = progress.find((p: any) => p.step_id === step.id)
                        const isCompleted = stepProgress?.status === 'completed'
                        const isCurrent = stepProgress?.status === 'in_progress'

                        return (
                            <Card key={step.id} className={`border-l-4 ${isCompleted ? 'border-l-primary bg-primary/5' : isCurrent ? 'border-l-accent bg-accent/5 animate-pulse' : 'border-l-muted'}`}>
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-xl font-black text-muted-foreground/30 w-6">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold tracking-tight ${isCompleted ? 'text-primary' : ''}`}>
                                                {step.step_name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground max-w-md">
                                                {step.description || 'Our team is working on this step.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-6 w-6 text-primary" />
                                        ) : isCurrent ? (
                                            <PlayCircle className="h-6 w-6 text-accent" />
                                        ) : (
                                            <Circle className="h-6 w-6 text-muted-foreground/20" />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
