"use client"

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { GripVertical, MoreVertical, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface KanbanColumnDef {
  id: string
  title: string
  color: string
}

interface DataKanbanProps<T> {
  data: T[]
  columns: KanbanColumnDef[]
  columnKey: keyof T
  searchKey?: keyof T
  searchQuery?: string
  onMoveCard?: (id: string, newStatus: any) => void
  renderCard: (item: T) => React.ReactNode
  getKey: (item: T) => string
  children?: React.ReactNode
}

export function DataKanban<T>({
  data,
  columns,
  columnKey,
  searchKey,
  searchQuery = '',
  onMoveCard,
  renderCard,
  getKey,
  children,
}: DataKanbanProps<T>) {
  const baseGrouped = React.useMemo(() => {
    const groups: Record<string, T[]> = {}
    columns.forEach((col) => {
      groups[col.id] = []
    })

    const filtered = data.filter((item) => {
      if (!searchQuery || !searchKey) return true
      const val = String(item[searchKey] || '').toLowerCase()
      return val.includes(searchQuery.toLowerCase())
    })

    filtered.forEach((item) => {
      const colId = String(item[columnKey])
      if (groups[colId]) {
        groups[colId].push(item)
      }
    })

    return groups
  }, [data, columns, columnKey, searchKey, searchQuery])

  const [draftGrouped, setDraftGrouped] = React.useState<Record<string, T[]> | null>(null)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [activeColumnId, setActiveColumnId] = React.useState<string | null>(null)
  const boardBeforeDrag = React.useRef<Record<string, T[]> | null>(null)

  const groupedData = draftGrouped ?? baseGrouped

  React.useEffect(() => {
    setDraftGrouped(null)
  }, [data])
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() => columns.map((c) => c.id))

  React.useEffect(() => {
    setColumnOrder(columns.map((c) => c.id))
  }, [columns])

  const orderedColumns = React.useMemo(() => {
    return columnOrder
      .map((id) => columns.find((c) => c.id === id))
      .filter((c): c is KanbanColumnDef => c !== undefined)
  }, [columnOrder, columns])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function findColumnId(grouped: Record<string, T[]>, id: string): string | undefined {
    if (id in grouped) return id
    for (const colId of Object.keys(grouped)) {
      if (grouped[colId].some((item) => getKey(item) === id)) {
        return colId
      }
    }
    return undefined
  }

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'column') return

    setActiveId(String(event.active.id))
    setActiveColumnId(findColumnId(groupedData, String(event.active.id)) ?? null)
    boardBeforeDrag.current = { ...groupedData }
    setDraftGrouped({ ...groupedData })
  }

  function handleDragCancel() {
    if (boardBeforeDrag.current) {
      setDraftGrouped(boardBeforeDrag.current)
    }
    boardBeforeDrag.current = null
    setActiveId(null)
    setActiveColumnId(null)
    setTimeout(() => setDraftGrouped(null), 0)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    if (active.data.current?.type === 'column') return

    const activeId = String(active.id)
    const overId = String(over.id)

    setDraftGrouped((current) => {
      const source = current ?? baseGrouped
      const activeColId = findColumnId(source, activeId)
      const overColId = findColumnId(source, overId)

      if (!activeColId || !overColId || activeColId === overColId) return current

      const activeItems = [...source[activeColId]]
      const overItems = [...source[overColId]]

      const activeIndex = activeItems.findIndex((item) => getKey(item) === activeId)
      if (activeIndex === -1) return current

      const activeItem = activeItems[activeIndex]
      activeItems.splice(activeIndex, 1)

      const overIndex = overItems.findIndex((item) => getKey(item) === overId)
      const nextIndex = overIndex >= 0 ? overIndex : overItems.length

      overItems.splice(nextIndex, 0, activeItem)

      queueMicrotask(() => {
        setActiveColumnId(overColId)
      })

      return {
        ...source,
        [activeColId]: activeItems,
        [overColId]: overItems,
      }
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    boardBeforeDrag.current = null
    setActiveId(null)
    setActiveColumnId(null)

    const activeType = active.data.current?.type

    if (activeType === 'column') {
      if (!over) return

      const activeColumnId = String(active.id)
      const overColumnId = findColumnId(draftGrouped ?? baseGrouped, String(over.id))
      if (!overColumnId || activeColumnId === overColumnId) return

      setColumnOrder((currentOrder) => {
        const activeIndex = currentOrder.indexOf(activeColumnId)
        const overIndex = currentOrder.indexOf(overColumnId)
        if (activeIndex === -1 || overIndex === -1) return currentOrder
        return arrayMove(currentOrder, activeIndex, overIndex)
      })
      return
    }

    if (!over) {
      setDraftGrouped(null)
      return
    }

    const activeId = String(active.id)
    const overId = String(over.id)

    setDraftGrouped((current) => {
      const source = current ?? baseGrouped
      const activeColId = findColumnId(source, activeId)
      const overColId = findColumnId(source, overId)

      if (!activeColId || !overColId) return current

      if (activeColId !== overColId) {
        if (onMoveCard) {
          onMoveCard(activeId, overColId)
        }
        return current
      }

      const columnItems = [...source[overColId]]
      const activeIndex = columnItems.findIndex((item) => getKey(item) === activeId)
      const overIndex = columnItems.findIndex((item) => getKey(item) === overId)

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
        return current
      }

      const newItems = arrayMove(columnItems, activeIndex, overIndex)

      if (onMoveCard) {
        onMoveCard(activeId, overColId)
      }

      return {
        ...source,
        [overColId]: newItems,
      }
    })
  }

  const activeItem = activeId && activeColumnId ? groupedData[activeColumnId]?.find((item) => getKey(item) === activeId) : undefined

  return (
    <div className='flex h-full min-h-0 min-w-0 flex-col overflow-hidden'>
      {children}
      <DndContext
        id='kanban-board'
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className='scrollbar-thin min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden bg-muted/25 [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1'>
          <div className='flex h-full gap-4 px-4 pt-4 pb-4 lg:px-5 lg:pt-5 lg:pb-5'>
            <SortableContext items={orderedColumns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
              {orderedColumns.map((column) => (
                <SortableKanbanColumn
                  key={column.id}
                  column={column}
                  tasks={groupedData[column.id] || []}
                  getKey={getKey}
                  renderCard={renderCard}
                />
              ))}
            </SortableContext>
          </div>
        </div>
        <DragOverlay dropAnimation={null}>
          {activeItem ? renderCard(activeItem) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function SortableKanbanColumn<T>({
  column,
  tasks,
  getKey,
  renderCard,
}: {
  column: KanbanColumnDef
  tasks: T[]
  getKey: (item: T) => string
  renderCard: (item: T) => React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  })

  return (
    <section
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={cn(
        'flex w-[20rem] shrink-0 min-h-0 flex-col rounded-t-xl border bg-muted/50 transition-colors',
        isOver && 'bg-muted/70',
        isDragging && 'opacity-60',
      )}
    >
      <div className='flex items-start justify-between gap-3 px-4 pt-4 pb-3'>
        <div className='min-w-0 space-y-1'>
          <div className='flex items-center gap-0.5'>
            <Button
              variant='ghost'
              size='icon-xs'
              className='-ml-2 cursor-grab text-foreground/70 active:cursor-grabbing'
              aria-label={`Drag ${column.title} column`}
              {...attributes}
              {...listeners}
            >
              <GripVertical />
            </Button>
            <h2 className='truncate font-medium text-base leading-none'>{column.title}</h2>
          </div>
          <p className='text-muted-foreground text-sm tabular-nums leading-none'>
            {tasks.length} {tasks.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div className='-mr-2 flex items-center gap-0.5 text-muted-foreground'>
          <Button variant='ghost' size='icon-sm' aria-label={`Add task to ${column.title}`}>
            <Plus />
          </Button>
          <Button variant='ghost' size='icon-sm' aria-label={`${column.title} column actions`}>
            <MoreVertical />
          </Button>
        </div>
      </div>

      <SortableContext items={tasks.map((task) => getKey(task))} strategy={verticalListSortingStrategy}>
        <div className='scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1'>
          {tasks.length === 0 ? (
            <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground'>
              No items
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard key={getKey(task)} task={task} getKey={getKey} renderCard={renderCard} />
            ))
          )}
        </div>
      </SortableContext>
    </section>
  )
}

function SortableTaskCard<T>({
  task,
  getKey,
  renderCard,
}: {
  task: T
  getKey: (item: T) => string
  renderCard: (item: T) => React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getKey(task),
    data: { type: 'task', task },
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={cn('touch-none', isDragging && 'opacity-30')}
      {...attributes}
      {...listeners}
    >
      {renderCard(task)}
    </div>
  )
}
