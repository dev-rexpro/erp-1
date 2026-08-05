import React from 'react'
import { usePurchaseOrders } from './purchase-orders-provider'
import { type PurchaseOrderItem } from '../../data/schema'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, FileText } from 'lucide-react'

interface PurchaseOrdersKanbanViewProps {
  data: PurchaseOrderItem[]
}

const COLUMNS: { status: string; label: string }[] = [
  { status: 'Pending Approval', label: 'Pending Approval' },
  { status: 'Approved', label: 'Approved POs' },
  { status: 'Issued', label: 'Issued to Vendor' },
  { status: 'Completed', label: 'Fulfilled / Completed' },
]

export function PurchaseOrdersKanbanView({ data }: PurchaseOrdersKanbanViewProps) {
  const { setSelectedPoId } = usePurchaseOrders()

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 h-full p-1 overflow-x-auto'>
      {COLUMNS.map((col) => {
        const items = data.filter((item) => item.status === col.status)
        return (
          <div key={col.status} className='flex flex-col bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 p-3 min-w-[260px]'>
            <div className='flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800'>
              <span className='font-semibold text-xs text-slate-800 dark:text-slate-200'>
                {col.label}
              </span>
              <Badge variant='outline' className='text-[10px] bg-white dark:bg-slate-800'>
                {items.length}
              </Badge>
            </div>

            <div className='flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-1'>
              {items.length === 0 ? (
                <div className='p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg'>
                  No orders in this stage
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPoId(item.id)}
                    className='bg-white dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2.5 group'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <span className='text-[11px] font-semibold text-slate-900 dark:text-slate-100 group-hover:underline'>
                        {item.poNumber}
                      </span>
                      <Badge variant='secondary' className='text-[10px] px-1.5 py-0'>
                        {item.orderDate}
                      </Badge>
                    </div>

                    <div className='font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1'>
                      {item.vendorName}
                    </div>

                    <div className='text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-900'>
                      <FileText className='size-3 text-slate-400 shrink-0' />
                      <span className='truncate'>{item.linkedShipment || item.linkedQuotation || 'Direct Order'}</span>
                    </div>

                    <div className='flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900 text-xs'>
                      <div className='font-bold text-slate-900 dark:text-slate-100 flex items-center gap-0.5'>
                        <DollarSign className='size-3.5 text-emerald-600' />
                        {item.totalAmount.toLocaleString()}
                      </div>
                      <span className='text-[10px] text-muted-foreground flex items-center gap-1'>
                        <Calendar className='size-3' />
                        {item.deliveryDate}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
