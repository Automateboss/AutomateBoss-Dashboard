'use client'

import { useState } from 'react'
import { sendTicketMessage } from '@/app/actions/client-portal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Send, User, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
    id: string
    content: string
    created_at: string
    sender_id: string
    sender: {
        full_name: string
        role: string
    }
}

export default function TicketThread({ ticketId, initialMessages, currentUserId }: {
    ticketId: string
    initialMessages: any[]
    currentUserId: string
}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        if (!content.trim()) return
        setLoading(true)
        try {
            const newMessage = await sendTicketMessage(ticketId, content)
            // Optimistically add just placeholder until revalidation or just rely on revalidation
            // But for better UX, we'll wait for the response and then refresh
            setContent('')
            // In a real app, use Supabase Realtime here. For now, manual refresh or optimistic update.
            window.location.reload()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4 max-h-[600px] overflow-y-auto p-4 border rounded-xl bg-muted/20">
                {messages.map((msg) => {
                    const isSystem = msg.sender.role !== 'client'
                    const isMe = msg.sender_id === currentUserId

                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col max-w-[80%] space-y-1",
                                isMe ? "ml-auto items-end" : "mr-auto items-start"
                            )}
                        >
                            <div className="flex items-center gap-2 px-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    {isSystem ? <ShieldCheck className="h-3 w-3 text-primary" /> : <User className="h-3 w-3" />}
                                    {msg.sender.full_name} {isSystem && '(Support Team)'}
                                </p>
                                <span className="text-[10px] text-muted-foreground/50">•</span>
                                <p className="text-[10px] text-muted-foreground/50">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div className={cn(
                                "px-4 py-3 rounded-2xl text-sm shadow-sm",
                                isMe
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-card border border-border/50 text-foreground rounded-tl-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="relative">
                <Textarea
                    placeholder="Type your response..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[100px] pr-20 bg-card/50 backdrop-blur-sm border-primary/20 focus-visible:ring-primary"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                        }
                    }}
                />
                <Button
                    onClick={handleSend}
                    disabled={loading || !content.trim()}
                    size="sm"
                    className="absolute bottom-3 right-3 font-bold uppercase tracking-widest text-[10px] h-8"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3 w-3 mr-2" />}
                    Send
                </Button>
            </div>
        </div>
    )
}
