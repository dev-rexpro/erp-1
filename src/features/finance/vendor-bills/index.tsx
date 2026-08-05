import { useSearch, useNavigate } from '@tanstack/react-router'
import { DollarSign, CheckCircle2, Clock, FileCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StandardPageLayout, StandardDataTable, type ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { BillsProvider, useBills } from './components/bills-provider'
import { BillsPrimaryButtons } from './components/bills-primary-buttons'
import { BillsKanbanView } from './components/bills-kanban-view'
import { BillsReportView } from './components/bills-report-view'
import { BillsDetailView } from './components/bills-detail-view'
import { billsColumns } from './components/bills-columns'
import { mockVendorBills } from '../data/finance-data'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

function BillsContent() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn
  const { viewMode, selectedBillId } = useBills()
  const layoutViewMode = (viewMode as string) === 'table' ? 'list' : (viewMode as ViewMode)

  // KPI calculations
  const totalApOutstanding = mockVendorBills
    .filter((i) => i.paymentStatus !== 'Paid')
    .reduce((acc, i) => acc + i.totalAmount, 0)
  const approvedForPayment = mockVendorBills
    .filter((i) => i.approvalStatus === 'Approved' && i.paymentStatus !== 'Paid')
    .reduce((acc, i) => acc + i.totalAmount, 0)
  const pendingApprovalCount = mockVendorBills.filter((i) => i.approvalStatus === 'Pending Approval').length
  const paidThisMonth = mockVendorBills
    .filter((i) => i.paymentStatus === 'Paid')
    .reduce((acc, i) => acc + i.totalAmount, 0)

  return (
    <StandardPageLayout
      title='Vendor Bills & AP'
      description='Manage carrier invoices, vendor payables, 3-way matching, and disbursements.'
      viewMode={layoutViewMode}
      selectedItemId={selectedBillId}
      primaryActions={<BillsPrimaryButtons />}
      renderTable={() => (
        <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
          {/* KPI Cards */}
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                AP Outstanding
              </div>
              <MetricValue value={formatCurrency(totalApOutstanding)} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Unpaid carrier & vendor bills</p>
            </div>

            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Approved for Payment
              </div>
              <MetricValue value={formatCurrency(approvedForPayment)} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Ready for bank disbursement</p>
            </div>

            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Pending Approval
              </div>
              <MetricValue value={`${pendingApprovalCount} Bills`} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Awaiting 3-way PO verification</p>
            </div>

            <div className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'>
              <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Paid This Month
              </div>
              <MetricValue value={formatCurrency(paidThisMonth)} />
              <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>Settled disbursements</p>
            </div>
          </div>

          <StandardDataTable
            data={mockVendorBills}
            columns={billsColumns}
            search={search}
            navigate={navigate}
            searchKey='billNumber'
            searchPlaceholder='Filter bill number, vendor...'
            filters={[
              {
                columnId: 'approvalStatus',
                title: 'Approval',
                options: [
                  { label: 'Approved', value: 'Approved' },
                  { label: 'Pending Approval', value: 'Pending Approval' },
                  { label: 'Draft', value: 'Draft' },
                ],
              },
              {
                columnId: 'paymentStatus',
                title: 'Payment',
                options: [
                  { label: 'Unpaid', value: 'Unpaid' },
                  { label: 'Scheduled', value: 'Scheduled' },
                  { label: 'Partial', value: 'Partial' },
                  { label: 'Paid', value: 'Paid' },
                ],
              },
            ]}
            emptyMessage='No vendor bill records found.'
          />
        </div>
      )}
      renderKanban={() => <BillsKanbanView data={mockVendorBills} />}
      renderReport={() => <BillsReportView data={mockVendorBills} />}
      renderDetail={() => <BillsDetailView data={mockVendorBills} key={selectedBillId!} />}
    />
  )
}

export function VendorBillsFeature() {
  return (
    <BillsProvider>
      <BillsContent />
    </BillsProvider>
  )
}

export default VendorBillsFeature
