import { DataKanban, type KanbanColumnDef } from '@/components/data-table/data-kanban'
import { Badge } from '@/components/ui/badge'
import { type GeneralLedgerEntry } from '../../data/finance-data'
import { useGL } from './gl-provider'
import { toast } from 'sonner'

interface GLKanbanViewProps {
  data: GeneralLedgerEntry[]
}

const columns: KanbanColumnDef[] = [
  { id: 'Asset', title: 'Assets (1000)', color: 'bg-slate-400' },
  { id: 'Liability', title: 'Liabilities (2000)', color: 'bg-slate-500' },
  { id: 'Equity', title: 'Equity (3000)', color: 'bg-slate-600' },
  { id: 'Revenue', title: 'Revenue (4000)', color: 'bg-slate-700' },
  { id: 'Expense', title: 'Expenses (5000)', color: 'bg-slate-800' },
]

export function GLKanbanView({ data }: GLKanbanViewProps) {
  const { setSelectedVoucherId } = useGL()

  const handleMoveCard = (id: string, newType: string) => {
    const item = data.find((i) => i.id === id)
    if (item) {
      item.accountType = newType as any
      toast.success(`Updated voucher ${item.voucherNo} account type to ${newType}`)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const renderCard = (gl: GeneralLedgerEntry) => {
    return (
      <div
        onClick={() => setSelectedVoucherId(gl.id)}
        className='flex flex-col gap-3 rounded-xl border border-slate-200 bg-card p-4 text-card-foreground shadow-xs cursor-pointer hover:border-slate-400 dark:border-slate-800 transition-colors'
      >
        <div className='min-w-0 space-y-1.5'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='min-w-0 truncate font-semibold text-sm leading-none text-slate-900 dark:text-slate-100'>
              {gl.voucherNo}
            </h3>
            <Badge variant='outline' className='shrink-0 border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 text-xs'>
              {gl.status}
            </Badge>
          </div>
          <p className='line-clamp-1 font-medium text-xs text-slate-700 dark:text-slate-300'>{gl.accountName}</p>
          <p className='text-xs text-slate-400'>{gl.accountCode} • Ref: {gl.reference}</p>
        </div>

        <div className='flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800 text-xs text-slate-500'>
          <span>Posting: {gl.postingDate}</span>
          <span className='font-bold text-slate-900 dark:text-slate-100'>
            {gl.debit > 0 ? formatCurrency(gl.debit) : formatCurrency(gl.credit)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 min-h-0'>
      <DataKanban<GeneralLedgerEntry>
        data={data}
        columns={columns}
        columnKey='accountType'
        searchKey='accountName'
        searchQuery=''
        onMoveCard={handleMoveCard}
        renderCard={renderCard}
        getKey={(i) => i.id}
      />
    </div>
  )
}
