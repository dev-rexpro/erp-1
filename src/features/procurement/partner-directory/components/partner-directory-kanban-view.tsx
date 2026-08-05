import React from 'react'
import { usePartnerDirectory } from './partner-directory-provider'
import { type PartnerDirectoryItem } from '../../data/schema'
import { Badge } from '@/components/ui/badge'
import { Building2, Mail, Phone, MapPin, Star } from 'lucide-react'

interface PartnerDirectoryKanbanViewProps {
  data: PartnerDirectoryItem[]
}

const COLUMNS: { status: string; label: string }[] = [
  { status: 'Active', label: 'Active Partners' },
  { status: 'Under Review', label: 'Under Review / KYC' },
  { status: 'Inactive', label: 'Inactive / Suspended' },
]

export function PartnerDirectoryKanbanView({ data }: PartnerDirectoryKanbanViewProps) {
  const { setSelectedPartnerId } = usePartnerDirectory()

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 h-full p-1 overflow-x-auto'>
      {COLUMNS.map((col) => {
        const items = data.filter((item) => item.status === col.status)
        return (
          <div key={col.status} className='flex flex-col bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 p-3 min-w-[280px]'>
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
                  No partners in this state
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPartnerId(item.id)}
                    className='bg-white dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2.5 group'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <span className='text-[11px] font-semibold text-slate-900 dark:text-slate-100 group-hover:underline'>
                        {item.code}
                      </span>
                      <Badge variant='secondary' className='text-[10px] px-1.5 py-0'>
                        {item.category}
                      </Badge>
                    </div>

                    <div className='font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1'>
                      {item.name}
                    </div>

                    <div className='text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-900'>
                      <div className='flex items-center gap-1.5 truncate'>
                        <Building2 className='size-3 text-slate-400 shrink-0' />
                        <span className='truncate'>{item.contactPerson}</span>
                      </div>
                      <div className='flex items-center gap-1.5 truncate'>
                        <Mail className='size-3 text-slate-400 shrink-0' />
                        <span className='truncate'>{item.email}</span>
                      </div>
                      <div className='flex items-center gap-1.5 truncate'>
                        <MapPin className='size-3 text-slate-400 shrink-0' />
                        <span className='truncate'>{item.city}, {item.country}</span>
                      </div>
                    </div>

                    <div className='flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900 text-[11px] font-semibold'>
                      <span className='text-slate-700 dark:text-slate-300'>SLA: {item.slaScore}</span>
                      <span className='text-amber-500 flex items-center gap-1'>
                        <Star className='size-3 fill-amber-500' />
                        {item.rating.toFixed(1)}
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
