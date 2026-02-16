'use client'

import Sidebar from '@/components/shared/sidebar'
import { LayoutDashboard, ListTodo, FolderKanban } from 'lucide-react'

const teamNavItems = [
    { title: 'My Queue', href: '/team', icon: ListTodo },
    { title: 'Projects', href: '/team/projects', icon: FolderKanban },
    { title: 'Shared Dashboard', href: '/admin', icon: LayoutDashboard },
]

export default function TeamLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-row min-h-screen bg-background">
            <Sidebar items={teamNavItems} role="team_member" />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
