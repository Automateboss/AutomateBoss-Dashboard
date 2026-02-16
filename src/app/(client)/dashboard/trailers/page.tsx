import TrailerForm from '@/components/client/trailer-form'
import { Truck } from 'lucide-react'

export default function AddTrailerPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tighter text-primary flex items-center gap-3">
                    <Truck className="h-10 w-10 text-secondary" />
                    UNIT EXPANSION
                </h1>
                <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
                    Submit new inventory for system integration
                </p>
            </div>

            <TrailerForm />
        </div>
    )
}
