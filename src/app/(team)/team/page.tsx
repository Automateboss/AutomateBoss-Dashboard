export default function TeamDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary">My Queue</h1>
                <p className="text-muted-foreground tracking-wide uppercase text-xs font-semibold"> Sofia & Team - Daily Workflow </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-card p-6 shadow-sm border-l-4 border-l-destructive">
                    <h2 className="text-lg font-bold mb-2 text-destructive">Flagged & Urgent</h2>
                    <p className="text-sm text-muted-foreground">No urgent items in your queue.</p>
                </div>
                <div className="rounded-xl border bg-card p-6 shadow-sm border-l-4 border-l-primary">
                    <h2 className="text-lg font-bold mb-2 text-primary">Active Tasks</h2>
                    <p className="text-sm text-muted-foreground">0 tasks assigned to you.</p>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm min-h-[500px]">
                <h2 className="text-xl font-bold mb-6 text-primary tracking-tight">Assigned Pipeline</h2>
                <div className="flex flex-col items-center justify-center mt-32 space-y-4">
                    <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/30 animate-pulse" />
                    <p className="text-muted-foreground text-sm font-medium">Scanning your specializations for new tasks...</p>
                </div>
            </div>
        </div>
    )
}
