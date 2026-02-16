'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Truck,
    Ticket,
    FolderKanban,
    Users,
    ListTodo,
    BookOpen,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

import { NotificationBell } from './NotificationBell'

interface SidebarItem {
    title: string
    href: string
    icon: any
}

interface SidebarProps {
    items: SidebarItem[]
    role: string
}

export default function Sidebar({ items, role }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card/50 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-6 border-b">
                <h1 className="text-xl font-black tracking-tighter text-primary">
                    AUTOMATE<span className="text-accent">BOSS</span>
                </h1>
                <NotificationBell />
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                    {role.replace('_', ' ')} Menu
                </p>

                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            pathname === item.href
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {pathname === item.href && <ChevronRight className="h-4 w-4" />}
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    )
}
