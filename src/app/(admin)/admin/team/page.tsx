'use client'

import { useState, useEffect } from 'react'
import { getMyQueue, QueueItemData } from '@/app/actions/team'
import { QueueItem } from '@/components/team/QueueItem'
import { TaskDetailView } from '@/components/team/TaskDetailView'
import { LayoutList, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function TeamPage() {
    const [queue, setQueue] = useState<QueueItemData[]>([])
    const [selectedItem, setSelectedItem] = useState<QueueItemData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadQueue() {
            try {
                const data = await getMyQueue()
                setQueue(data)
            } catch (error) {
                console.error('Failed to load queue:', error)
            } finally {
                setLoading(false)
            }
        }
        loadQueue()
    }, [])

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-primary uppercase">My Operational Queue</h1>
                    <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
                        Prioritized Task Feed & Team Engine Room
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-black text-xs uppercase tracking-widest border border-primary/10">
                    <LayoutList className="h-4 w-4" />
                    {queue.length} Tasks Remaining
                </div>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="SEARCH TASKS BY CLIENT OR SUBJECT..."
                        className="pl-10 h-10 text-[10px] font-black uppercase tracking-widest bg-card/30 border-primary/10 focus-visible:ring-primary/20"
                    />
                </div>
                <Button variant="outline" className="h-10 text-[10px] font-black uppercase tracking-widest border-primary/10 bg-card/30">
                    <Filter className="h-4 w-4 mr-2" />
                    Sort & Filter
                </Button>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 rounded-xl bg-primary/5 animate-pulse" />
                        ))}
                    </div>
                ) : queue.length === 0 ? (
                    <div className="py-20 text-center space-y-4 rounded-3xl border-2 border-dashed border-primary/5">
                        <div className="inline-flex p-4 rounded-full bg-primary/5 text-primary/40">
                            <LayoutList className="h-8 w-8" />
                        </div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                            Your queue is empty. Great work!
                        </p>
                    </div>
                ) : (
                    queue.map((item) => (
                        <QueueItem
                            key={`${item.type}-${item.id}`}
                            item={item}
                            onClick={() => setSelectedItem(item)}
                        />
                    ))
                )}
            </div>

            <TaskDetailView
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
            />
        </div>
    )
}
