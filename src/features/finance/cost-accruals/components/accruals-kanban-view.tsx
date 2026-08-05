import { DataKanban, type KanbanColumnDef } from '@/components/data-table/data-kanban'
import { Badge } from '@/components/ui/badge'
import { type CostAccrualItem } from '../../data/finance-data'
import { useAccruals } from './accruals-provider'
import { toast } from 'sonner'

interface AccrualsKanbanViewProps {
  data: CostAccrualItem[]
}

const columns: KanbanColumnDef[] = [
  { id: 'Provisioned', title: 'Provisioned', color: 'bg-slate-400' },
  { id: 'Partially Reconciled', title: 'Partially Reconciled', color: 'bg-slate-500' },
  { id: 'Fully Reconciled', title: 'Fully Reconciled', color: 'bg-slate-700' },
  { id: 'Reversed', title: 'Reversed', color: 'bg-slate-900' },
]

export function AccrualsKanbanView({ data }: AccrualsKanbanViewProps) {
  const { setSelectedAccrualId } = useAccruals()

  const handleMoveCard = (id: string, newStatus: string) => {
    const item = data.find((i) => i.id === id)
    if (item) {
      item.status = newStatus as any
      toast.success(`Moved accrual ${item.id} to ${newStatus}`)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const renderCard = (accrual: CostAccrualItem) => {
    return (
      <div
        onClick={() => setSelectedAccrualId(accrual.id)}
        className='flex flex-col gap-3 rounded-xl border border-slate-200 bg-card p-4 text-card-foreground shadow-xs cursor-pointer hover:border-slate-400 dark:border-slate-800 transition-colors'
      >
        <div className='min-w-0 space-y-1.5'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='min-w-0 truncate font-semibold text-sm leading-none text-slate-900 dark:text-slate-100'>
              {accrual.id}
            </h3>
            <Badge variant='outline' className='shrink-0 border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 text-xs'>
              {accrual.category}
            </Badge>
          </div>
          <p className='line-clamp-1 font-medium text-xs text-slate-700 dark:text-slate-300'>{accrual.vendorName}</p>
          <p className='text-xs text-slate-400'>{accrual.shipmentRef} • {accrual.blNumber}</p>
        </div>

        <div className='flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800 text-xs text-slate-500'>
          <span>Date: {accrual.accrualDate}</span>
          <span className='font-bold text-slate-900 dark:text-slate-100'>{formatCurrency(accrual.estimatedAmount)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 min-h-0'>
      <DataKanban<CostAccrualItem>
        data={data}
        columns={columns}
        columnKey='status'
        searchKey='vendorName'
        searchQuery=''
        onMoveCard={handleMoveCard}
        renderCard={renderCard}
        getKey={(i) => i.id}
      />
    </div>
  )
}
