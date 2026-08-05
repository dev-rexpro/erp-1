import { useSearch, useNavigate } from '@tanstack/react-router'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { StandardPageLayout, StandardDataTable, type ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'

import { DndFeeDialogs } from './components/dnd-fee-dialogs'
import { DndFeePrimaryButtons } from './components/dnd-fee-primary-buttons'
import { DndFeeProvider, useDndFee } from './components/dnd-fee-provider'
import { DndFeeDetailView } from './components/dnd-fee-detail-view'
import { DndFeeReportView } from './components/dnd-fee-report-view'
import { DndFeeKanbanView } from './components/dnd-fee-kanban-view'
import { mockDndFees } from './data/dnd-fees'
import { dndStatuses, dndTypes } from './data/data'
import { dndFeeColumns } from './components/dnd-fee-columns'
import { DollarSign, Clock, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDbStore } from '@/stores/db-store'

function DndFeeKPIs({ data }: { data: typeof mockDndFees }) {
  const totalAccruedFees = data.reduce((acc, i) => acc + (i.totalFee - i.waivedAmount), 0)
  const totalOverdueContainers = data.filter((i) => i.overdueDays > 0).length
  const totalOverdueDays = data.reduce((acc, i) => acc + i.overdueDays, 0)
  const totalWaivedFees = data.reduce((acc, i) => acc + i.waivedAmount, 0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4'>
      <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
        <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
          Accrued D&D Fees
        </div>
        <MetricValue value={formatCurrency(totalAccruedFees)} />
        <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Across {data.length} tracked containers</p>
      </div>

      <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
        <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
          Overdue Containers
        </div>
        <MetricValue value={`${totalOverdueContainers} Containers`} />
        <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Past carrier free-time limits</p>
      </div>

      <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
        <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
          Total Dwell Overdue Days
        </div>
        <MetricValue value={`${totalOverdueDays} Days`} />
        <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Cumulative overdue dwell days</p>
      </div>

      <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
        <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
          Waived / Negotiated
        </div>
        <MetricValue value={formatCurrency(totalWaivedFees)} />
        <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Carrier approved concessions</p>
      </div>
    </div>
  )
}

function DndFeeContent({
  title,
  description,
  search,
  navigate,
}: {
  title: string
  description: string
  search: Record<string, unknown>
  navigate: NavigateFn
}) {
  const { viewMode, selectedDndId } = useDndFee()
  const dndFees = useDbStore((state) => state.dndFees)
  
  const layoutViewMode = viewMode === 'table' ? 'list' : viewMode as ViewMode

  return (
    <>
      <StandardPageLayout
        title={title}
        description={description}
        viewMode={layoutViewMode}
        selectedItemId={selectedDndId}
        primaryActions={<DndFeePrimaryButtons />}
        renderTable={() => (
          <>
            <DndFeeKPIs data={dndFees} />
            <StandardDataTable
              data={dndFees}
              columns={dndFeeColumns}
              search={search}
              navigate={navigate}
              searchKey="containerNo"
              searchPlaceholder="Filter container, BL, carrier..."
              emptyMessage="No Demurrage & Detention fee records found."
              filters={[
                {
                  columnId: 'status',
                  title: 'Status',
                  options: dndStatuses,
                },
                {
                  columnId: 'feeType',
                  title: 'Fee Type',
                  options: dndTypes,
                },
              ]}
            />
          </>
        )}
        renderReport={() => (
          <>
            <DndFeeKPIs data={dndFees} />
            <DndFeeReportView data={dndFees} search={search} navigate={navigate} />
          </>
        )}
        renderKanban={() => (
          <>
            <DndFeeKPIs data={dndFees} />
            <DndFeeKanbanView data={dndFees} search={search} />
          </>
        )}
        renderDetail={() => <DndFeeDetailView data={dndFees} key={selectedDndId!} />}
      />

      <DndFeeDialogs />
    </>
  )
}

export function DndFeeFeature() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()

  return (
    <DndFeeProvider>
      <DndFeeContent
        title='Demurrage & Detention (D&D) Fee Management'
        description='Track container dwell times, free-time allowances, and D&D fees.'
        search={search}
        navigate={navigate as any}
      />
    </DndFeeProvider>
  )
}
