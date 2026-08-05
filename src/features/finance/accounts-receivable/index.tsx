import { useSearch, useNavigate } from '@tanstack/react-router'
import { DollarSign, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StandardPageLayout, StandardDataTable, type ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { ARProvider, useAR } from './components/ar-provider'
import { ARPrimaryButtons } from './components/ar-primary-buttons'
import { ARKanbanView } from './components/ar-kanban-view'
import { ARReportView } from './components/ar-report-view'
import { ARDetailView } from './components/ar-detail-view'
import { arColumns } from './components/ar-columns'
import { mockAccountsReceivable } from '../data/finance-data'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

function ARContent() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn
  const { viewMode, selectedArId } = useAR()
  const layoutViewMode = (viewMode as string) === 'table' ? 'list' : (viewMode as ViewMode)

  // KPI Calculations
  const totalOutstanding = mockAccountsReceivable.reduce((acc, i) => acc + i.balanceDue, 0)
  const totalOverdue = mockAccountsReceivable
    .filter((i) => i.status === 'Overdue' || i.status === 'Disputed')
    .reduce((acc, i) => acc + i.balanceDue, 0)
  const totalCurrent = mockAccountsReceivable
    .filter((i) => i.status === 'Current' || i.status === 'Paid')
    .reduce((acc, i) => acc + i.balanceDue, 0)
  const avgDso = 32

  return (
    <StandardPageLayout
      title='Accounts Receivable & Aging'
      description='Track customer balances, credit limits, aging buckets, and collection history.'
      viewMode={layoutViewMode}
      selectedItemId={selectedArId}
      primaryActions={<ARPrimaryButtons />}
      renderTable={() => (
        <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
          {/* KPI Cards */}
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Total AR Balance
              </div>
              <MetricValue value={formatCurrency(totalOutstanding)} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Across {mockAccountsReceivable.length} client invoices</p>
            </div>

            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Overdue Outstanding
              </div>
              <MetricValue value={formatCurrency(totalOverdue)} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Past credit due dates</p>
            </div>

            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Current / Not Due
              </div>
              <MetricValue value={formatCurrency(totalCurrent)} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Within payment term limits</p>
            </div>

            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Avg DSO (Days)
              </div>
              <MetricValue value={`${avgDso} Days`} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Benchmark target: 30 days</p>
            </div>
          </div>

          <StandardDataTable
            data={mockAccountsReceivable}
            columns={arColumns}
            search={search}
            navigate={navigate}
            searchKey='invoiceNumber'
            searchPlaceholder='Filter invoice number, customer...'
            filters={[
              {
                columnId: 'status',
                title: 'Status',
                options: [
                  { label: 'Current', value: 'Current' },
                  { label: 'Overdue', value: 'Overdue' },
                  { label: 'Partial', value: 'Partial' },
                  { label: 'Paid', value: 'Paid' },
                  { label: 'Disputed', value: 'Disputed' },
                ],
              },
              {
                columnId: 'agingCategory',
                title: 'Aging',
                options: [
                  { label: 'Current', value: 'Current' },
                  { label: '1-30 Days', value: '1-30 Days' },
                  { label: '31-60 Days', value: '31-60 Days' },
                  { label: '61-90 Days', value: '61-90 Days' },
                  { label: '90+ Days', value: '90+ Days' },
                ],
              },
            ]}
            emptyMessage='No accounts receivable records found.'
          />
        </div>
      )}
      renderKanban={() => <ARKanbanView data={mockAccountsReceivable} />}
      renderReport={() => <ARReportView data={mockAccountsReceivable} />}
      renderDetail={() => <ARDetailView data={mockAccountsReceivable} key={selectedArId!} />}
    />
  )
}

export function AccountsReceivableFeature() {
  return (
    <ARProvider>
      <ARContent />
    </ARProvider>
  )
}
