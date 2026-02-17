import { getUsers } from '@/app/actions/admin-users'
export const dynamic = 'force-dynamic'
import { ManagementTable } from '@/components/admin/ManagementTable'
import { SpecializationManager } from '@/components/admin/SpecializationManager'
import { InviteUserModal } from '@/components/admin/InviteUserModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Shield, Briefcase, UserCircle, Mail, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function UsersPage() {
    const users = await getUsers()

    const roleConfigs: Record<string, { label: string; icon: any; color: string }> = {
        super_admin: { label: 'Super Admin', icon: Shield, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
        team_member: { label: 'Team Member', icon: Briefcase, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
        client: { label: 'Client User', icon: UserCircle, color: 'text-green-500 bg-green-500/10 border-green-500/20' },
    }

    const columns = [
        {
            header: 'Identity',
            accessor: (user: any) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/5 text-primary border border-primary/10">
                        <User className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="font-black text-primary uppercase tracking-tight">{user.full_name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                            <Mail className="h-3 w-3" />
                            {user.email}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Access Level',
            accessor: (user: any) => {
                const config = roleConfigs[user.role] || { label: user.role, icon: UserCircle, color: 'bg-muted text-muted-foreground' }
                const Icon = config.icon
                return (
                    <Badge variant="outline" className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 gap-1.5",
                        config.color
                    )}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                    </Badge>
                )
            }
        },
        {
            header: 'Team Specialization',
            accessor: (user: any) => (
                <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-secondary animate-pulse" />
                    <SpecializationManager
                        userId={user.id}
                        currentSpecializations={user.team_specializations}
                    />
                </div>
            )
        },
        {
            header: 'Organization',
            accessor: (user: any) => (
                <div className="text-xs font-bold text-muted-foreground uppercase">
                    {user.organization?.name || 'AutomateBoss Internal'}
                </div>
            )
        },
        {
            header: 'Last Login',
            accessor: (user: any) => (
                <div className="text-xs font-bold text-muted-foreground uppercase">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'NEVER'}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: (user: any) => (
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5">
                    Modify Permissions
                </Button>
            ),
            className: 'text-right'
        }
    ]

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-primary uppercase leading-none">IDENTITY OVERWATCH</h1>
                    <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
                        User Access Control & Identity Management
                    </p>
                </div>
                <InviteUserModal />
            </div>

            <ManagementTable columns={columns} data={users} />
        </div>
    )
}
