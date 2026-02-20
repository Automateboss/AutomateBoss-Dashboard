import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface Column<T> {
    header: string
    accessor: keyof T | ((item: T) => React.ReactNode)
    className?: string
}

interface ManagementTableProps<T> {
    columns: Column<T>[]
    data: T[]
}

export function ManagementTable<T extends { id: string }>({ columns, data }: ManagementTableProps<T>) {
    return (
        <div className="rounded-2xl border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl">
            <Table>
                <TableHeader className="bg-primary/5">
                    <TableRow className="border-primary/10 hover:bg-transparent">
                        {columns.map((column, i) => (
                            <TableHead key={i} className={cn(
                                "text-[10px] font-black text-primary uppercase tracking-[0.2em] h-12",
                                column.className
                            )}>
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-48 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                                No records found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow
                                key={item.id}
                                className="border-primary/5 hover:bg-primary/5 transition-colors group"
                            >
                                {columns.map((column, i) => (
                                    <TableCell key={i} className={cn(
                                        "py-4 text-sm font-medium",
                                        column.className
                                    )}>
                                        {typeof column.accessor === 'function'
                                            ? column.accessor(item)
                                            : (item[column.accessor] as React.ReactNode)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
