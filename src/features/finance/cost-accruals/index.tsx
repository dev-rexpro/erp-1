import { useSearch, useNavigate } from '@tanstack/react-router'
import { Anchor, AlertCircle, FileCheck2, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StandardPageLayout, StandardDataTable, type ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { AccrualsProvider, useAccruals } from './components/accruals-provider'
import { AccrualsPrimaryButtons } from './components/accruals-primary-buttons'
import { AccrualsKanbanView } from './components/accruals-kanban-view'
import { AccrualsReportView } from './components/accruals-report-view'
import { AccrualsDetailView } from './components/accruals-detail-view'
import { accrualsColumns } from './components/accruals-columns'
import { mockCostAccruals } from '../data/finance-data'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

function AccrualsContent() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn
  const { viewMode, selectedAccrualId } = useAccruals()
  const layoutViewMode = (viewMode as string) === 'table' ? 'list' : (viewMode as ViewMode)

  // KPI Calculations
  const totalProvisioned = mockCostAccruals.reduce((acc, i) => acc + i.estimatedAmount, 0)
  const pendingCount = mockCostAccruals.filter((i) => i.status === 'Provisioned' || i.status === 'Partially Reconciled').length
  const totalReconciled = mockCostAccruals
    .filter((i) => i.actualAmount !== null)
    .reduce((acc, i) => acc + (i.actualAmount || 0), 0)
  const totalVariance = mockCostAccruals
    .filter((i) => i.variance !== null)
    .reduce((acc, i) => acc + (i.variance || 0), 0)

  return (
    <StandardPageLayout
      title='Cost Accruals & Provisions'
      description='Track estimated voyage expenses, port tariffs, freight provisions, and variance reconciliations.'
      viewMode={layoutViewMode}
      selectedItemId={selectedAccrualId}
      primaryActions={<AccrualsPrimaryButtons />}
      renderTable={() => (
        <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
          {/* KPI Cards */}
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Total Provisioned
              </div>
              <MetricValue value={formatCurrency(totalProvisioned)} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Estimated operational costs</p>
            </div>

            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Pending Reconciliations
              </div>
              <MetricValue value={`${pendingCount} Accruals`} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Awaiting vendor final bills</p>
            </div>

            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Reconciled Amount
              </div>
              <MetricValue value={formatCurrency(totalReconciled)} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Matched against vendor bills</p>
            </div>

            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Net Cost Variance
              </div>
              <MetricValue value={totalVariance > 0 ? `+${formatCurrency(totalVariance)}` : formatCurrency(totalVariance)} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Difference vs original estimate</p>
            </div>
          </div>

          <StandardDataTable
            data={mockCostAccruals}
            columns={accrualsColumns}
            search={search}
            navigate={navigate}
            searchKey='id'
            searchPlaceholder='Filter accrual ID, vendor...'
            filters={[
              {
                columnId: 'status',
                title: 'Status',
                options: [
                  { label: 'Provisioned', value: 'Provisioned' },
                  { label: 'Partially Reconciled', value: 'Partially Reconciled' },
                  { label: 'Fully Reconciled', value: 'Fully Reconciled' },
                ],
              },
              {
                columnId: 'category',
                title: 'Category',
                options: [
                  { label: 'Ocean Freight Provision', value: 'Ocean Freight Provision' },
                  { label: 'Port Terminal Handling', value: 'Port Terminal Handling' },
                  { label: 'Customs Duties & Clearing', value: 'Customs Duties & Clearing' },
                  { label: 'Feeder Barge Freight', value: 'Feeder Barge Freight' },
                  { label: 'Trucking & Drayage', value: 'Trucking & Drayage' },
                ],
              },
            ]}
            emptyMessage='No cost accrual records found.'
          />
        </div>
      )}
      renderKanban={() => <AccrualsKanbanView data={mockCostAccruals} />}
      renderReport={() => <AccrualsReportView data={mockCostAccruals} />}
      renderDetail={() => <AccrualsDetailView data={mockCostAccruals} key={selectedAccrualId!} />}
    />
  )
}

export function CostAccrualsFeature() {
  return (
    <AccrualsProvider>
      <AccrualsContent />
    </AccrualsProvider>
  )
}
