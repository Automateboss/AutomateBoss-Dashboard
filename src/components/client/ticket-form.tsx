'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupportTicket } from '@/app/actions/client-portal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Ticket as TicketIcon } from 'lucide-react'

export default function TicketForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const subject = formData.get('subject') as string
        const type = formData.get('type') as string
        const priority = formData.get('priority') as string
        const content = formData.get('content') as string

        try {
            await createSupportTicket(subject, type, priority, content)
            router.push('/dashboard/tickets')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Error creating ticket')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <TicketIcon className="h-6 w-6 text-primary" />
                    OPEN SUPPORT REQUEST
                </CardTitle>
                <CardDescription>
                    Need help with your account or system? Submit a ticket and our team will respond within 24 hours.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" name="subject" placeholder="Summarize your issue" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Request Type</Label>
                            <Select name="type" defaultValue="support">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="support">Support</SelectItem>
                                    <SelectItem value="question">Question</SelectItem>
                                    <SelectItem value="bug">Report a Bug</SelectItem>
                                    <SelectItem value="feature_request">Feature Request</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select name="priority" defaultValue="normal">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Description</Label>
                        <Textarea
                            id="content"
                            name="content"
                            placeholder="Describe your issue in detail..."
                            className="min-h-[150px]"
                            required
                        />
                    </div>
                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={loading} className="w-full font-bold uppercase tracking-widest">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Ticket
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
