'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Loader2, UserPlus } from 'lucide-react'

interface Organization {
    id: string
    name: string
}

export function InviteUserDialog({ onUserAdded }: { onUserAdded: () => void }) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState('client')
    const [orgId, setOrgId] = useState<string | null>(null)
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(false)
    const [fetchingOrgs, setFetchingOrgs] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (open) {
            fetchOrganizations()
        }
    }, [open])

    const fetchOrganizations = async () => {
        setFetchingOrgs(true)
        const { data, error } = await supabase
            .from('organizations')
            .select('id, name')
            .order('name')

        if (!error && data) {
            setOrganizations(data)
        }
        setFetchingOrgs(false)
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Note: In a real app, this would use a service role to create an auth user
        // For this demo/setup, we'll insert into public.users and simulate the invite
        const { error } = await supabase
            .from('users')
            .insert({
                email,
                full_name: fullName,
                role,
                organization_id: orgId || null,
                id: crypto.randomUUID() // Temporary ID until they sign up
            })

        if (error) {
            alert('Error inviting user: ' + error.message)
        } else {
            setOpen(false)
            onUserAdded()
            setEmail('')
            setFullName('')
            setRole('client')
            setOrgId(null)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="client">Client (Business User)</SelectItem>
                                <SelectItem value="team_member">Team Member (Admin Team)</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {role === 'client' && (
                        <div className="grid gap-2">
                            <Label>Business / Organization</Label>
                            <Select
                                value={orgId || undefined}
                                onValueChange={setOrgId}
                                disabled={fetchingOrgs || organizations.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={fetchingOrgs ? "Loading..." : "Select Business"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map(org => (
                                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Invitation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
