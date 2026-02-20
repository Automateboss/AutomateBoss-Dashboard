'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { inviteUser } from '@/app/actions/admin-users'
import { Plus, Mail, User, Shield, AlertCircle } from 'lucide-react'

export function InviteUserModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isInviting, setIsInviting] = useState(false)
    const [email, setEmail] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState('team_member')

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsInviting(true)
        setError(null)
        try {
            const result = await inviteUser(email, fullName, role)
            if (result.success) {
                setIsOpen(false)
                setEmail('')
                setFullName('')
                setRole('team_member')
            } else {
                setError(result.error || 'Failed to send invitation')
            }
        } catch (err: any) {
            setError('An unexpected error occurred')
            console.error('Failed to invite user:', err)
        } finally {
            setIsInviting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="font-black uppercase tracking-widest text-xs h-10 px-6 border-primary/10 bg-card/30">
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Internal User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-primary/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-primary uppercase tracking-tight">Invite Team Member</DialogTitle>
                </DialogHeader>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest p-4 rounded-xl flex items-start gap-3 mt-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-black">Invitation Failed</p>
                            <p className="opacity-80 normal-case font-medium">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleInvite} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@automateboss.com"
                                className="pl-10 h-11 bg-primary/5 border-primary/10 focus-visible:ring-primary/20 text-sm font-bold"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="pl-10 h-11 bg-primary/5 border-primary/10 focus-visible:ring-primary/20 text-sm font-bold"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">System Access Level</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="h-11 bg-primary/5 border-primary/10 focus:ring-primary/20 text-sm font-bold uppercase tracking-wide">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-primary/10">
                                <SelectItem value="super_admin" className="text-xs font-bold uppercase tracking-widest">Super Admin</SelectItem>
                                <SelectItem value="team_member" className="text-xs font-bold uppercase tracking-widest">Team Member</SelectItem>
                                <SelectItem value="client" className="text-xs font-bold uppercase tracking-widest">Client</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="text-[10px] font-black uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isInviting}
                            className="text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 min-w-[120px]"
                        >
                            {isInviting ? "Sending..." : "Send Invitation"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
