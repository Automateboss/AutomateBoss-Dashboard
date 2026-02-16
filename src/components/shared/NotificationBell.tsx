'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        loadNotifications()

        const channel = supabase
            .channel('notifications_realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    setNotifications(prev => [payload.new, ...prev])
                    setUnreadCount(count => count + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function loadNotifications() {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (!error && data) {
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.read).length)
        }
    }

    async function markAsRead(id: string) {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)

        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className={cn(
                        "h-5 w-5 transition-transform group-hover:scale-110",
                        unreadCount > 0 ? "text-primary animate-pulse" : "text-muted-foreground"
                    )} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/10">
                <DialogHeader>
                    <DialogTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center justify-between">
                        Pulse Notifications
                        {unreadCount > 0 && <Badge variant="secondary" className="text-[10px] ml-2">{unreadCount} NEW</Badge>}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto pr-2">
                    {notifications.length === 0 ? (
                        <div className="text-center py-8 opacity-30 italic text-xs uppercase tracking-widest">
                            No transmissions received
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => markAsRead(n.id)}
                                className={cn(
                                    "p-4 rounded-xl border transition-all cursor-pointer group",
                                    n.read ? "bg-muted/30 border-primary/5 opacity-50" : "bg-primary/5 border-primary/10 hover:border-primary/20"
                                )}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-black text-primary uppercase tracking-tight">{n.title}</p>
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase">{new Date(n.created_at).toLocaleTimeString()}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {n.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
