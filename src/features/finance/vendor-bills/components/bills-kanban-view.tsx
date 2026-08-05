import { DataKanban, type KanbanColumnDef } from '@/components/data-table/data-kanban'
import { Badge } from '@/components/ui/badge'
import { type VendorBillItem } from '../../data/finance-data'
import { useBills } from './bills-provider'
import { toast } from 'sonner'

interface BillsKanbanViewProps {
  data: VendorBillItem[]
}

const columns: KanbanColumnDef[] = [
  { id: 'Draft', title: 'Draft', color: 'bg-slate-400' },
  { id: 'Pending Approval', title: 'Pending Approval', color: 'bg-slate-500' },
  { id: 'Approved', title: 'Approved', color: 'bg-slate-700' },
  { id: 'Paid', title: 'Paid & Settled', color: 'bg-slate-900' },
]

export function BillsKanbanView({ data }: BillsKanbanViewProps) {
  const { setSelectedBillId } = useBills()

  const handleMoveCard = (id: string, newStatus: string) => {
    const item = data.find((i) => i.id === id)
    if (item) {
      item.approvalStatus = newStatus as any
      toast.success(`Updated ${item.billNumber} approval status to ${newStatus}`)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const renderCard = (bill: VendorBillItem) => {
    return (
      <div
        onClick={() => setSelectedBillId(bill.id)}
        className='flex flex-col gap-3 rounded-xl border border-slate-200 bg-card p-4 text-card-foreground shadow-xs cursor-pointer hover:border-slate-400 dark:border-slate-800 transition-colors'
      >
        <div className='min-w-0 space-y-1.5'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='min-w-0 truncate font-semibold text-sm leading-none text-slate-900 dark:text-slate-100'>
              {bill.billNumber}
            </h3>
            <Badge variant='outline' className='shrink-0 border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 text-xs'>
              {bill.paymentStatus}
            </Badge>
          </div>
          <p className='line-clamp-1 font-medium text-xs text-slate-700 dark:text-slate-300'>{bill.vendorName}</p>
          <p className='text-xs text-slate-400'>{bill.poReference} • {bill.shipmentRef}</p>
        </div>

        <div className='flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800 text-xs text-slate-500'>
          <span>Due: {bill.dueDate}</span>
          <span className='font-bold text-slate-900 dark:text-slate-100'>{formatCurrency(bill.totalAmount)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 min-h-0'>
      <DataKanban<VendorBillItem>
        data={data}
        columns={columns}
        columnKey='approvalStatus'
        searchKey='vendorName'
        searchQuery=''
        onMoveCard={handleMoveCard}
        renderCard={renderCard}
        getKey={(i) => i.id}
      />
    </div>
  )
}
