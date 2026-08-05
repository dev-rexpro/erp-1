import { DataKanban, type KanbanColumnDef } from '@/components/data-table/data-kanban'
import { Badge } from '@/components/ui/badge'
import { type AccountsReceivableItem } from '../../data/finance-data'
import { useAR } from './ar-provider'
import { toast } from 'sonner'

interface ARKanbanViewProps {
  data: AccountsReceivableItem[]
  search?: Record<string, unknown>
}

const columns: KanbanColumnDef[] = [
  { id: 'Current', title: 'Current / Active', color: 'bg-slate-400' },
  { id: '1-30 Days', title: '1 - 30 Days Overdue', color: 'bg-slate-500' },
  { id: '31-60 Days', title: '31 - 60 Days Overdue', color: 'bg-slate-600' },
  { id: '61-90 Days', title: '61 - 90 Days Overdue', color: 'bg-slate-700' },
  { id: '90+ Days', title: '90+ Days Critical', color: 'bg-slate-800' },
]

export function ARKanbanView({ data }: ARKanbanViewProps) {
  const { setSelectedArId } = useAR()

  const handleMoveCard = (id: string, newAging: string) => {
    const item = data.find((i) => i.id === id)
    if (item) {
      item.agingCategory = newAging as any
      toast.success(`Updated ${item.invoiceNumber} aging to ${newAging}`)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const renderCard = (ar: AccountsReceivableItem) => {
    return (
      <div
        onClick={() => setSelectedArId(ar.id)}
        className='flex flex-col gap-3 rounded-xl border border-slate-200 bg-card p-4 text-card-foreground shadow-xs cursor-pointer hover:border-slate-400 dark:border-slate-800 transition-colors'
      >
        <div className='min-w-0 space-y-1.5'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='min-w-0 truncate font-semibold text-sm leading-none text-slate-900 dark:text-slate-100'>
              {ar.invoiceNumber}
            </h3>
            <Badge variant='outline' className='shrink-0 border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs'>
              {ar.status}
            </Badge>
          </div>
          <p className='line-clamp-1 font-medium text-xs text-slate-700 dark:text-slate-300'>{ar.customerName}</p>
          <p className='text-xs text-slate-400'>{ar.customerCode} • {ar.paymentTerms}</p>
        </div>

        <div className='flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800 text-xs text-slate-500'>
          <span>Due: {ar.dueDate}</span>
          <span className='font-bold text-slate-900 dark:text-slate-100'>{formatCurrency(ar.balanceDue)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 min-h-0'>
      <DataKanban<AccountsReceivableItem>
        data={data}
        columns={columns}
        columnKey='agingCategory'
        searchKey='customerName'
        searchQuery=''
        onMoveCard={handleMoveCard}
        renderCard={renderCard}
        getKey={(i) => i.id}
      />
    </div>
  )
}
