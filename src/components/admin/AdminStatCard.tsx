import { Card, CardContent } from '@/components/ui/card'

interface AdminStatCardProps {
    title: string
    value: string | number
    description?: string
    status?: 'default' | 'alert'
}

export function AdminStatCard({ title, value, description, status = 'default' }: AdminStatCardProps) {
    return (
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-black ${status === 'alert' ? 'text-destructive' : 'text-primary'}`}>
                        {value}
                    </p>
                </div>
                {description && (
                    <p className="text-[10px] text-muted-foreground uppercase mt-1 font-semibold tracking-tight">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
