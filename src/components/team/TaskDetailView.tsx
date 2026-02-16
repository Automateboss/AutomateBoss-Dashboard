'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Play, ExternalLink, Video, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QueueItemData, updateProjectStepStatus, getProjectSteps } from '@/app/actions/team'

interface TaskDetailViewProps {
    item: QueueItemData | null
    onClose: () => void
}

export function TaskDetailView({ item, onClose }: TaskDetailViewProps) {
    const [steps, setSteps] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [updatingStep, setUpdatingStep] = useState<string | null>(null)

    useEffect(() => {
        if (item?.type === 'project') {
            loadSteps()
        }
    }, [item])

    async function loadSteps() {
        if (!item) return
        setLoading(true)
        try {
            const data = await getProjectSteps(item.id)
            setSteps(data)
        } catch (error) {
            console.error('Failed to load steps:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleToggleStep(stepId: string, currentStatus: string) {
        if (!item) return
        setUpdatingStep(stepId)
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
        try {
            await updateProjectStepStatus(item.id, stepId, newStatus)
            await loadSteps()
        } catch (error) {
            console.error('Failed to update step:', error)
        } finally {
            setUpdatingStep(null)
        }
    }

    if (!item) return null

    return (
        <div className="fixed inset-y-0 right-0 w-[500px] bg-background/95 backdrop-blur-xl border-l border-primary/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-primary/5 flex items-center justify-between">
                <div>
                    <Badge variant="outline" className="text-[10px] font-black tracking-widest mb-2 uppercase">
                        {item.type.replace('_', ' ')} Detail
                    </Badge>
                    <h2 className="text-xl font-black text-primary uppercase tracking-tighter leading-none">
                        {item.title}
                    </h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 w-8 p-0">
                    ✕
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Organization Info */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Client Organization</p>
                    <p className="text-sm font-bold text-primary uppercase">{item.organization_name}</p>
                </div>

                {/* SOP / Steps Section (Conditional for Projects) */}
                {item.type === 'project' && (
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Execution Roadmap</h3>
                        <div className="space-y-3">
                            {loading ? (
                                <div className="py-12 flex justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
                                </div>
                            ) : steps.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic text-center py-8 border border-dashed border-primary/10 rounded-xl">
                                    No steps defined for this project type.
                                </p>
                            ) : (
                                steps.map((progress) => (
                                    <div
                                        key={progress.id}
                                        className={cn(
                                            "group p-4 rounded-xl border transition-all",
                                            progress.status === 'completed'
                                                ? "bg-primary/5 border-primary/20 opacity-60"
                                                : "bg-card/50 border-primary/5 hover:border-primary/20"
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <button
                                                disabled={!!updatingStep}
                                                onClick={() => handleToggleStep(progress.step_id, progress.status)}
                                                className="mt-1 disabled:opacity-50"
                                            >
                                                {updatingStep === progress.step_id ? (
                                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                ) : progress.status === 'completed' ? (
                                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                )}
                                            </button>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className={cn(
                                                        "text-sm font-bold uppercase tracking-tight",
                                                        progress.status === 'completed' ? "text-primary/60" : "text-primary"
                                                    )}>
                                                        {progress.step.step_name}
                                                    </p>
                                                    {progress.step.estimated_minutes && (
                                                        <Badge className="text-[9px] font-black">{progress.step.estimated_minutes} MIN</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {progress.step.description}
                                                </p>
                                                <div className="flex items-center gap-2 pt-1">
                                                    {progress.step.loom_video_url && (
                                                        <Button size="xs" variant="secondary" className="h-7 text-[9px] font-black uppercase" onClick={() => window.open(progress.step.loom_video_url, '_blank')}>
                                                            <Play className="h-3 w-3 mr-1" /> Watch Loom
                                                        </Button>
                                                    )}
                                                    {progress.step.google_doc_url && (
                                                        <Button size="xs" variant="outline" className="h-7 text-[9px] font-black uppercase" onClick={() => window.open(progress.step.google_doc_url, '_blank')}>
                                                            <ExternalLink className="h-3 w-3 mr-1" /> View SOP
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Content for Tickets / Trailer Requests */}
                {item.type !== 'project' && (
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Request Details</h3>
                        <div className="p-4 rounded-xl border border-primary/5 bg-card/50">
                            <p className="text-sm text-foreground leading-relaxed italic opacity-80">
                                {item.subtitle}
                            </p>
                            <p className="mt-4 text-xs text-muted-foreground">
                                Full request details and communication thread available in the support hub.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-primary/5 bg-primary/5">
                <Button className="w-full h-12 font-black uppercase tracking-widest text-xs" onClick={onClose}>
                    Close Detail View
                </Button>
            </div>
        </div>
    )
}
