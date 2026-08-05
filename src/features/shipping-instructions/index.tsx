import { useSearch, useNavigate } from '@tanstack/react-router'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { StandardPageLayout, StandardDataTable, type ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { ShippingInstructionsDialogs } from './components/shipping-instructions-dialogs'
import { ShippingInstructionPrimaryButtons } from './components/shipping-instruction-primary-buttons'
import { ShippingInstructionsProvider, useShippingInstructions } from './components/shipping-instructions-provider'
import { ShippingInstructionDetailView } from './components/shipping-instruction-detail-view'
import { SiReportView } from './components/si-report-view'
import { shippingInstructionsColumns } from './components/shipping-instructions-columns'
import { useDbStore } from '@/stores/db-store'
import { siStatuses } from './data/data'

function ShippingInstructionsContent({
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
  const { viewMode, selectedSiId } = useShippingInstructions()
  const shippingInstructions = useDbStore((state) => state.shippingInstructions)

  const layoutViewMode = (viewMode as string) === 'table' ? 'list' : (viewMode as ViewMode)

  return (
    <>
      <StandardPageLayout
        title={title}
        description={description}
        viewMode={layoutViewMode}
        selectedItemId={selectedSiId}
        primaryActions={<ShippingInstructionPrimaryButtons />}
        renderTable={() => {
          const confirmed = shippingInstructions.filter((i) => String(i.status || '').toLowerCase().includes('confirm') || String(i.status || '').toLowerCase().includes('issue')).length
          const pending = shippingInstructions.filter((i) => String(i.status || '').toLowerCase().includes('draft') || String(i.status || '').toLowerCase().includes('pending')).length
          const carriers = new Set(shippingInstructions.map((i) => i.shippingLine || i.carrier).filter(Boolean)).size

          return (
            <div className="flex flex-col gap-4 relative">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TOTAL INSTRUCTIONS</div>
                  <MetricValue value={`${shippingInstructions.length} SI Documents`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Issued shipping orders</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">CONFIRMED SI</div>
                  <MetricValue value={`${confirmed} Confirmed`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Accepted by shipping lines</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">DRAFT / PENDING</div>
                  <MetricValue value={`${pending} Pending`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Awaiting carrier verification</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">OCEAN CARRIERS</div>
                  <MetricValue value={`${carriers} Lines`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Assigned shipping lines</p>
                </div>
              </div>

              <StandardDataTable
                data={shippingInstructions}
                columns={shippingInstructionsColumns}
                search={search}
                navigate={navigate}
                searchKey="siNo"
                searchPlaceholder="Filter SI No, shipper, vessel..."
                emptyMessage="No shipping instruction records found."
                filters={[
                  {
                    columnId: 'status',
                    title: 'Status',
                    options: siStatuses,
                  },
                ]}
              />
            </div>
          )
        }}
        renderDetail={() => <ShippingInstructionDetailView data={shippingInstructions} key={selectedSiId!} />}
        renderReport={() => <SiReportView data={shippingInstructions} search={search} navigate={navigate} />}
      />

      <ShippingInstructionsDialogs />
    </>
  )
}

export function ShippingInstructions() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()

  return (
    <ShippingInstructionsProvider>
      <ShippingInstructionsContent
        title='Shipping Instructions'
        description='Manage freight booking instructions, container manifests, and carrier details.'
        search={search}
        navigate={navigate as any}
      />
    </ShippingInstructionsProvider>
  )
}
