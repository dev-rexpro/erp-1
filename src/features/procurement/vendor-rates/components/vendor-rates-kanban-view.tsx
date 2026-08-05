import React from 'react'
import { useVendorRates } from './vendor-rates-provider'
import { type VendorRateItem } from '../../data/schema'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Calendar, DollarSign, ShieldCheck } from 'lucide-react'

interface VendorRatesKanbanViewProps {
  data: VendorRateItem[]
}

const COLUMNS: { status: string; label: string }[] = [
  { status: 'Active', label: 'Active Tariffs' },
  { status: 'Negotiating', label: 'In Negotiation' },
  { status: 'Expiring Soon', label: 'Expiring Soon' },
  { status: 'Expired', label: 'Expired / Archived' },
]

export function VendorRatesKanbanView({ data }: VendorRatesKanbanViewProps) {
  const { setSelectedRateId } = useVendorRates()

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
                  No rate cards in this stage
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRateId(item.id)}
                    className='bg-white dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2.5 group'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <span className='text-[11px] font-semibold text-slate-900 dark:text-slate-100 group-hover:underline'>
                        {item.rateCode}
                      </span>
                      <Badge variant='secondary' className='text-[10px] px-1.5 py-0 uppercase'>
                        {item.serviceMode}
                      </Badge>
                    </div>

                    <div className='font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1'>
                      {item.vendorName}
                    </div>

                    <div className='flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium pt-1 border-t border-slate-100 dark:border-slate-900'>
                      <span>{item.origin}</span>
                      <ArrowRight className='size-3 text-slate-400' />
                      <span>{item.destination}</span>
                    </div>

                    <div className='flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900 text-xs'>
                      <div className='font-bold text-slate-900 dark:text-slate-100 flex items-center gap-0.5'>
                        <DollarSign className='size-3.5 text-emerald-600' />
                        {item.baseRate.toLocaleString()}
                        <span className='text-[10px] text-muted-foreground font-normal ml-0.5'>/ {item.equipmentType}</span>
                      </div>
                      <span className='text-[10px] text-muted-foreground flex items-center gap-1'>
                        <Calendar className='size-3' />
                        {item.validUntil}
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
