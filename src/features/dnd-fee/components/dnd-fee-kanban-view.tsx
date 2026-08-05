import { DataKanban, type KanbanColumnDef } from '@/components/data-table/data-kanban'
import { Badge } from '@/components/ui/badge'
import { type DndFeeItem, type DndFeeStatus } from '../data/schema'
import { useDndFee } from './dnd-fee-provider'
import { useDbStore } from '@/stores/db-store'
import { toast } from 'sonner'
import { Container, Calendar, Clock, AlertTriangle } from 'lucide-react'

interface DndFeeKanbanViewProps {
  data: DndFeeItem[]
  search: Record<string, unknown>
}

const columns: KanbanColumnDef[] = [
  { id: 'Accruing', title: 'Accruing', color: 'bg-amber-500' },
  { id: 'Billed', title: 'Billed', color: 'bg-sky-500' },
  { id: 'Waived', title: 'Waived', color: 'bg-purple-500' },
  { id: 'Settled', title: 'Settled', color: 'bg-emerald-500' },
  { id: 'Disputed', title: 'Disputed', color: 'bg-rose-500' },
]

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

export function DndFeeKanbanView({ data, search }: DndFeeKanbanViewProps) {
  const { setSelectedDndId } = useDndFee()
  const setDndFees = useDbStore((state) => state.setDndFees)
  const dndFees = useDbStore((state) => state.dndFees)
  const searchQuery = (search.containerNo as string) || ''

  const handleMoveCard = (id: string, newStatus: DndFeeStatus) => {
    const itemIndex = dndFees.findIndex((u) => u.id === id)
    if (itemIndex > -1) {
      const updated = [...dndFees]
      updated[itemIndex] = { ...updated[itemIndex], status: newStatus }
      setDndFees(updated)
      toast.success(`Moved ${updated[itemIndex].containerNo} to ${newStatus}`)
    }
  }

  const renderCard = (item: DndFeeItem) => {
    return (
      <div
        onClick={() => setSelectedDndId(item.id)}
        className='flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-xs cursor-pointer select-none hover:border-primary/40 transition-colors'
      >
        <div className='min-w-0 space-y-1.5'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-1.5 min-w-0'>
              <Container size={14} className='text-muted-foreground shrink-0' />
              <h3 className='min-w-0 truncate font-semibold text-sm leading-none'>{item.containerNo}</h3>
            </div>
            <Badge className='shrink-0 rounded-md border-transparent px-2 font-medium text-[11px]' variant='secondary'>
              {item.feeType}
            </Badge>
          </div>
          <p className='text-xs text-muted-foreground truncate'>BL: {item.blNumber} • {item.carrierName}</p>
        </div>

        <div className='grid grid-cols-2 gap-2 py-1 px-2 rounded-lg bg-muted/40 text-xs text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <Clock size={12} className='text-muted-foreground' />
            <span>{item.dwellDays} Days Dwell</span>
          </div>
          <div className='flex items-center gap-1 justify-end font-medium text-foreground'>
            {item.overdueDays > 0 ? (
              <span className='text-amber-600 dark:text-amber-400 flex items-center gap-1'>
                <AlertTriangle size={11} /> +{item.overdueDays}d
              </span>
            ) : (
              <span className='text-emerald-600 dark:text-emerald-400'>Free Time</span>
            )}
          </div>
        </div>

        <div className='flex items-center justify-between text-xs pt-1 border-t'>
          <span className='text-muted-foreground flex items-center gap-1'>
            <Calendar size={12} /> Expiry: {item.freeTimeExpiry}
          </span>
          <span className='font-bold text-sm text-foreground'>{formatCurrency(item.totalFee)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 min-h-0'>
      <DataKanban<DndFeeItem>
        data={data}
        columns={columns}
        columnKey='status'
        searchKey='containerNo'
        searchQuery={searchQuery}
        onMoveCard={handleMoveCard}
        renderCard={renderCard}
        getKey={(q) => q.id}
      />
    </div>
  )
}
