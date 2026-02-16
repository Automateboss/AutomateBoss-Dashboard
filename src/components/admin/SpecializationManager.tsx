'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Check,
    Plus,
    X,
    Settings2
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { updateUserSpecializations } from '@/app/actions/admin-users'
import { cn } from '@/lib/utils'

const AVAILABLE_SPECIALIZATIONS = [
    'A2P',
    'WEB_DESIGN',
    'BASIC_TASKS',
    'ONBOARDING',
    'TECHNICAL_SUPPORT'
]

interface SpecializationManagerProps {
    userId: string
    currentSpecializations: string[] | null
}

export function SpecializationManager({ userId, currentSpecializations }: SpecializationManagerProps) {
    const [selected, setSelected] = useState<string[]>(currentSpecializations || [])
    const [isOpen, setIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const toggleSpecialization = (spec: string) => {
        setSelected(prev =>
            prev.includes(spec)
                ? prev.filter(s => s !== spec)
                : [...prev, spec]
        )
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateUserSpecializations(userId, selected)
            setIsOpen(false)
        } catch (error) {
            console.error('Failed to update specializations:', error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="flex flex-wrap gap-1 cursor-pointer group">
                    {(currentSpecializations || []).length === 0 ? (
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">
                            No Specializations
                        </Badge>
                    ) : (
                        currentSpecializations?.map(spec => (
                            <Badge key={spec} variant="secondary" className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0">
                                {spec.replace('_', ' ')}
                            </Badge>
                        ))
                    )}
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-primary/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-primary uppercase tracking-tight">Manage Specializations</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_SPECIALIZATIONS.map((spec) => {
                            const isSelected = selected.includes(spec)
                            return (
                                <Button
                                    key={spec}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleSpecialization(spec)}
                                    className={cn(
                                        "text-[10px] font-black uppercase tracking-widest h-8 px-3 transition-all",
                                        isSelected ? "bg-primary text-primary-foreground" : "border-primary/10 hover:bg-primary/5"
                                    )}
                                >
                                    {isSelected && <Check className="mr-1.5 h-3 w-3" />}
                                    {spec.replace('_', ' ')}
                                </Button>
                            )
                        })}
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        className="text-[10px] font-black uppercase tracking-widest"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
