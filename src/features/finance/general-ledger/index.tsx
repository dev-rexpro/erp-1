import { useSearch, useNavigate } from '@tanstack/react-router'
import { BookOpen, CheckCircle2, FileCheck2, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StandardPageLayout, StandardDataTable, type ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { GLProvider, useGL } from './components/gl-provider'
import { GLPrimaryButtons } from './components/gl-primary-buttons'
import { GLKanbanView } from './components/gl-kanban-view'
import { GLReportView } from './components/gl-report-view'
import { GLDetailView } from './components/gl-detail-view'
import { glColumns } from './components/gl-columns'
import { mockGeneralLedger } from '../data/finance-data'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

function GLContent() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn
  const { viewMode, selectedVoucherId } = useGL()
  const layoutViewMode = (viewMode as string) === 'table' ? 'list' : (viewMode as ViewMode)

  // KPI Calculations
  const totalDebit = mockGeneralLedger.reduce((acc, i) => acc + i.debit, 0)
  const totalCredit = mockGeneralLedger.reduce((acc, i) => acc + i.credit, 0)
  const isBalanced = totalDebit === totalCredit
  const postedCount = mockGeneralLedger.filter((i) => i.status === 'Posted').length

  return (
    <StandardPageLayout
      title='General Ledger & Chart of Accounts'
      description='Audit double-entry journal vouchers, chart of accounts hierarchy, and trial balance records.'
      viewMode={layoutViewMode}
      selectedItemId={selectedVoucherId}
      primaryActions={<GLPrimaryButtons />}
      renderTable={() => (
        <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
          {/* KPI Cards */}
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Total Ledger Debit
              </div>
              <MetricValue value={formatCurrency(totalDebit)} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Total posted debit entries</p>
            </div>

            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Total Ledger Credit
              </div>
              <MetricValue value={formatCurrency(totalCredit)} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Total posted credit entries</p>
            </div>

            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Double-Entry Trial Balance
              </div>
              <div className='flex items-center gap-2'>
                {isBalanced ? (
                  <>
                    <MetricValue value="0 Difference" />
                    <Badge variant='outline' className='border-border/80 bg-background text-foreground text-[10px] px-1.5 py-0 font-medium'>
                      Balanced
                    </Badge>
                  </>
                ) : (
                  <MetricValue value="Unbalanced" />
                )}
              </div>
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Debit equals Credit validation</p>
            </div>

            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Posted Vouchers
              </div>
              <MetricValue value={`${postedCount} Vouchers`} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Immutable period entries</p>
            </div>
          </div>

          <StandardDataTable
            data={mockGeneralLedger}
            columns={glColumns}
            search={search}
            navigate={navigate}
            searchKey='voucherNo'
            searchPlaceholder='Filter voucher, account code...'
            filters={[
              {
                columnId: 'status',
                title: 'Status',
                options: [
                  { label: 'Posted', value: 'Posted' },
                  { label: 'Unposted', value: 'Unposted' },
                  { label: 'Reversed', value: 'Reversed' },
                ],
              },
            ]}
            emptyMessage='No journal voucher records found.'
          />
        </div>
      )}
      renderKanban={() => <GLKanbanView data={mockGeneralLedger} />}
      renderReport={() => <GLReportView data={mockGeneralLedger} />}
      renderDetail={() => <GLDetailView data={mockGeneralLedger} key={selectedVoucherId!} />}
    />
  )
}

export function GeneralLedgerFeature() {
  return (
    <GLProvider>
      <GLContent />
    </GLProvider>
  )
}
