'use client'

import Sidebar from '@/components/shared/sidebar'
import { LayoutDashboard, Users, FolderKanban, ListTodo, BookOpen, Settings } from 'lucide-react'

const adminNavItems = [
    { title: 'Overview', href: '/admin', icon: LayoutDashboard },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Clients', href: '/admin/clients', icon: Users },
    { title: 'Pipelines', href: '/admin/pipelines', icon: FolderKanban },
    { title: 'Team', href: '/admin/team', icon: Users },
    { title: 'SOPs', href: '/admin/sops', icon: BookOpen },
    { title: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-row min-h-screen bg-background">
            <Sidebar items={adminNavItems} role="super_admin" />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
