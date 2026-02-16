'use client'

import { useState, useTransition } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DefaultAnnouncements,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { PipelineColumn } from './PipelineColumn'
import { ProjectCard } from './ProjectCard'
import { updateProjectStatus } from '@/app/actions/admin'
import { createSnapModifier } from '@dnd-kit/modifiers'

interface PipelineKanbanProps {
    initialProjects: any[]
    statuses: { label: string; value: string }[]
}

export function PipelineKanban({ initialProjects, statuses }: PipelineKanbanProps) {
    const [projects, setProjects] = useState(initialProjects)
    const [activeProject, setActiveProject] = useState<any | null>(null)
    const [isPending, startTransition] = useTransition()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const project = projects.find((p) => p.id === active.id)
        setActiveProject(project)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        const activeProject = projects.find((p) => p.id === activeId)
        if (!activeProject) return

        // Find the container (status) of the 'over' element
        const isOverAColumn = statuses.some(s => s.value === overId)
        const overStatus = isOverAColumn
            ? overId as string
            : projects.find(p => p.id === overId)?.status

        if (overStatus && activeProject.status !== overStatus) {
            setProjects((prev) => {
                const updated = prev.map(p =>
                    p.id === activeId ? { ...p, status: overStatus } : p
                )
                return updated
            })
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveProject(null)

        if (!over) return

        const activeId = active.id
        const activeProject = projects.find(p => p.id === activeId)

        if (activeProject) {
            startTransition(async () => {
                try {
                    await updateProjectStatus(activeId as string, activeProject.status)
                    // Webhook will be triggered here in Phase 4
                } catch (error) {
                    console.error('Failed to update project status:', error)
                    // Consider rolling back state if save fails
                }
            })
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                {statuses.map((status) => (
                    <PipelineColumn
                        key={status.value}
                        id={status.value}
                        title={status.label}
                        projects={projects.filter((p) => p.status === status.value)}
                    />
                ))}
            </div>

            <DragOverlay adjustScale={false}>
                {activeProject ? (
                    <div className="w-[300px] cursor-grabbing rotate-3 transition-transform">
                        <ProjectCard project={activeProject} isDragging />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
