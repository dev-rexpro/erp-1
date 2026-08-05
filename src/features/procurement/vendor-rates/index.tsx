import { useSearch, useNavigate } from '@tanstack/react-router'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { StandardPageLayout, StandardDataTable, type ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { VendorRatesProvider, useVendorRates } from './components/vendor-rates-provider'
import { VendorRatesDetailView } from './components/vendor-rates-detail-view'
import { VendorRatesReportView } from './components/vendor-rates-report-view'
import { VendorRatesKanbanView } from './components/vendor-rates-kanban-view'
import { VendorRatesPrimaryButtons } from './components/vendor-rates-primary-buttons'
import { vendorRatesColumns } from './components/vendor-rates-columns'
import { useDbStore } from '@/stores/db-store'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Expiring Soon', value: 'Expiring Soon' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Negotiating', value: 'Negotiating' },
]

function VendorRatesContent({
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
  const { viewMode, selectedRateId } = useVendorRates()
  const vendorRates = useDbStore((state) => state.vendorRates)
  const layoutViewMode = viewMode === 'table' ? 'list' : (viewMode as ViewMode)

  return (
    <>
      <StandardPageLayout
        title={title}
        description={description}
        viewMode={layoutViewMode}
        selectedItemId={selectedRateId}
        primaryActions={<VendorRatesPrimaryButtons />}
        renderTable={() => {
          const activeRates = vendorRates.filter((r) => r.status === 'Active').length
          const expiringRates = vendorRates.filter((r) => r.status === 'Expiring Soon').length
          const vendorsCount = new Set(vendorRates.map((r) => r.vendorName).filter(Boolean)).size

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TOTAL RATE CARDS</div>
                  <MetricValue value={`${vendorRates.length} Tariffs`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Carrier contract agreements</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">ACTIVE CONTRACTS</div>
                  <MetricValue value={`${activeRates} Active`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Currently valid freight rates</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">EXPIRING SOON</div>
                  <MetricValue value={`${expiringRates} Tariffs`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Renewal required &lt;30 days</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">CARRIER PARTNERS</div>
                  <MetricValue value={`${vendorsCount} Carriers`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Ocean & air freight vendors</p>
                </div>
              </div>

              {/* AI Contract Recommendation - Clean Standard System Card */}
              <div className='rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div className='flex items-start gap-3'>
                  <div className='p-1.5 rounded-md bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-2xs shrink-0 mt-0.5'>
                    <img src='/rexpro-ai_logo.svg' alt='masbro' className='size-5' />
                  </div>
                  <div className='space-y-0.5'>
                    <h4 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                      Masbro AI Tariff Optimization Insight
                    </h4>
                    <p className='text-xs text-muted-foreground'>
                      Ocean rates on <span className='font-semibold text-foreground'>IDJKT → CNSHA</span> dropped 4.2% globally this week. Renegotiating contracts with Maersk Line and ONE could yield ~8.5% annual savings.
                    </p>
                  </div>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 text-xs gap-1.5 shrink-0 font-medium'
                  onClick={() => toast.success('Generated automatic tariff negotiation strategy draft.')}
                >
                  <span>Review AI Proposal</span>
                  <ArrowUpRight className='size-3.5' />
                </Button>
              </div>

              <StandardDataTable
                data={vendorRates}
                columns={vendorRatesColumns}
                search={search}
                navigate={navigate}
                searchKey="vendorName"
                searchPlaceholder="Filter carrier vendors, routes, modes..."
                emptyMessage="No vendor rate card records matched your search."
                filters={[
                  {
                    columnId: 'status',
                    title: 'Status',
                    options: statusOptions,
                  },
                ]}
              />
            </div>
          )
        }}
        renderReport={() => <VendorRatesReportView data={vendorRates} />}
        renderKanban={() => <VendorRatesKanbanView data={vendorRates} />}
        renderDetail={() => <VendorRatesDetailView key={selectedRateId} />}
      />
    </>
  )
}

export default function VendorRatesPage() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn

  return (
    <VendorRatesProvider>
      <VendorRatesContent 
        title="Vendor Rates & Tariffs"
        description="Manage contracted ocean, air, and trucking transport rates with fuel BAF surcharges."
        search={search}
        navigate={navigate}
      />
    </VendorRatesProvider>
  )
}
