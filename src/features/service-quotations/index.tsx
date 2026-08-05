import { useSearch, useNavigate } from '@tanstack/react-router'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { StandardPageLayout, StandardDataTable, type ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { QuotationsDialogs } from './components/quotations-dialogs'
import { QuotationPrimaryButtons } from './components/quotation-primary-buttons'
import { QuotationsProvider, useQuotations } from './components/quotations-provider'
import { QuotationsReportView } from './components/quotations-report-view'
import { QuotationsKanbanView } from './components/quotations-kanban-view'
import { QuotationDetailView } from './components/quotation-detail-view'
import { quotationsColumns } from './components/quotations-columns'
import { useDbStore } from '@/stores/db-store'

function QuotationsContent() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn
  const { viewMode, selectedQuotationId } = useQuotations()
  const serviceQuotations = useDbStore((state) => state.quotations)

  const layoutViewMode = (viewMode as string) === 'table' ? 'list' : (viewMode as ViewMode)

  return (
    <>
      <StandardPageLayout
        title="Service Quotations"
        description="Create, offer, and manage rate quotes for prospective shippers."
        viewMode={layoutViewMode}
        selectedItemId={selectedQuotationId}
        primaryActions={<QuotationPrimaryButtons />}
        renderTable={() => {
          const approved = serviceQuotations.filter((i) =>
            String(i.status || '').toLowerCase().includes('approve') ||
            String(i.status || '').toLowerCase().includes('accept')
          ).length
          const pending = serviceQuotations.filter((i) =>
            String(i.status || '').toLowerCase().includes('draft') ||
            String(i.status || '').toLowerCase().includes('pending') ||
            String(i.status || '').toLowerCase().includes('review')
          ).length
          const lanes = new Set(serviceQuotations.map((i) => i.destination || i.origin || i.serviceType).filter(Boolean)).size

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TOTAL QUOTATIONS</div>
                  <MetricValue value={`${serviceQuotations.length} Quotations`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Issued freight estimates</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">ACCEPTED / APPROVED</div>
                  <MetricValue value={`${approved} Accepted`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Client accepted offers</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">PENDING REVIEW</div>
                  <MetricValue value={`${pending} Pending`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Awaiting client decision</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">SERVICE TYPES</div>
                  <MetricValue value={`${lanes} Types`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Active export/import offerings</p>
                </div>
              </div>

              <StandardDataTable
                data={serviceQuotations}
                columns={quotationsColumns}
                search={search}
                navigate={navigate}
                searchKey="username"
                searchPlaceholder="Filter quotation code..."
                emptyMessage="No service quotations found."
              />
            </div>
          )
        }}
        renderDetail={() => <QuotationDetailView data={serviceQuotations} key={selectedQuotationId!} />}
        renderReport={() => <QuotationsReportView data={serviceQuotations} search={search} navigate={navigate} />}
        renderKanban={() => <QuotationsKanbanView data={serviceQuotations} search={search} />}
      />

      <QuotationsDialogs />
    </>
  )
}

export function ServiceQuotations() {
  return (
    <QuotationsProvider>
      <QuotationsContent />
    </QuotationsProvider>
  )
}

export function Quotations() {
  return <ServiceQuotations />
}

