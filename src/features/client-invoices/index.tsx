import { useSearch, useNavigate } from '@tanstack/react-router'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { StandardPageLayout, StandardDataTable, type ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { InvoicesDialogs } from './components/invoices-dialogs'
import { InvoicePrimaryButtons } from './components/invoice-primary-buttons'
import { InvoicesProvider, useInvoices } from './components/invoices-provider'
import { InvoicesReportView } from './components/invoices-report-view'
import { InvoicesKanbanView } from './components/invoices-kanban-view'
import { InvoiceDetailView } from './components/invoice-detail-view'
import { invoicesColumns } from './components/invoices-columns'
import { useDbStore } from '@/stores/db-store'

function InvoicesContent() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn
  const { viewMode, selectedInvoiceId } = useInvoices()
  const invoices = useDbStore((state) => state.clientInvoices)

  const layoutViewMode = (viewMode as string) === 'table' ? 'list' : (viewMode as ViewMode)

  return (
    <>
      <StandardPageLayout
        title="Client Invoices"
        description="Issue, manage, and track client freight invoices and payment statuses."
        viewMode={layoutViewMode}
        selectedItemId={selectedInvoiceId}
        primaryActions={<InvoicePrimaryButtons />}
        renderTable={() => {
          const totalBilled = invoices.reduce((acc, i) => acc + (Number(i.totalAmount || i.amount) || 0), 0)
          const paid = invoices.filter((i) => String(i.status || '').toLowerCase().includes('paid')).length
          const unpaid = invoices.filter((i) => String(i.status || '').toLowerCase().includes('unpaid') || String(i.status || '').toLowerCase().includes('overdue') || String(i.status || '').toLowerCase().includes('pending')).length

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TOTAL INVOICES</div>
                  <MetricValue value={`${invoices.length} Invoices`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Generated client billings</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">PAID SETTLED</div>
                  <MetricValue value={`${paid} Settled`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Payments collected & matched</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">UNPAID / OVERDUE</div>
                  <MetricValue value={`${unpaid} Outstanding`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Pending receivables balance</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TOTAL BILLED</div>
                  <MetricValue value={`Rp ${(totalBilled / 1000000).toFixed(1)} M`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Gross commercial invoicing</p>
                </div>
              </div>

              <StandardDataTable
                data={invoices}
                columns={invoicesColumns}
                search={search}
                navigate={navigate}
                searchKey="username"
                searchPlaceholder="Filter invoice code..."
                emptyMessage="No client invoices found."
              />
            </div>
          )
        }}
        renderDetail={() => <InvoiceDetailView data={invoices} key={selectedInvoiceId!} />}
        renderReport={() => <InvoicesReportView data={invoices} search={search} />}
        renderKanban={() => <InvoicesKanbanView data={invoices} search={search} />}
      />

      <InvoicesDialogs />
    </>
  )
}

export function ClientInvoices() {
  return (
    <InvoicesProvider>
      <InvoicesContent />
    </InvoicesProvider>
  )
}

export default ClientInvoices


