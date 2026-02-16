'use client'

import Sidebar from '@/components/shared/sidebar'
import { LayoutDashboard, Truck, Ticket, FolderKanban, BookOpen } from 'lucide-react'

const clientNavItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Trailers', href: '/dashboard/trailers', icon: Truck },
    { title: 'Tickets', href: '/dashboard/tickets', icon: Ticket },
    { title: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { title: 'Resources', href: '/dashboard/resources', icon: BookOpen },
]

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-row min-h-screen bg-background">
            <Sidebar items={clientNavItems} role="client" />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
