import { useSearch, useNavigate } from '@tanstack/react-router'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { StandardPageLayout, StandardDataTable, type ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { PartnerDirectoryPrimaryButtons } from './components/partner-directory-primary-buttons'
import { PartnerDirectoryProvider, usePartnerDirectory } from './components/partner-directory-provider'
import { PartnerDirectoryDetailView } from './components/partner-directory-detail-view'
import { PartnerDirectoryReportView } from './components/partner-directory-report-view'
import { PartnerDirectoryKanbanView } from './components/partner-directory-kanban-view'
import { partnerDirectoryColumns } from './components/partner-directory-columns'
import { useDbStore } from '@/stores/db-store'

function PartnerDirectoryContent() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn
  const { viewMode, selectedPartnerId } = usePartnerDirectory()
  const { vendors: partnerDirectory } = useDbStore()

  const layoutViewMode = (viewMode as string) === 'table' ? 'list' : (viewMode as ViewMode)

  return (
    <StandardPageLayout
      title="Partner Directory"
      description="Manage shipping line partners, container yards, truckers, and customs brokerages."
      viewMode={layoutViewMode}
      selectedItemId={selectedPartnerId}
      primaryActions={<PartnerDirectoryPrimaryButtons />}
      renderTable={() => {
        const activeCount = partnerDirectory.filter((p) => p.status === 'Active' || p.status === 'Verified').length || partnerDirectory.length
        const categoryCount = new Set(partnerDirectory.map((p) => p.category || p.type || 'Vendor').filter(Boolean)).size

        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TOTAL PARTNERS</div>
                <MetricValue value={`${partnerDirectory.length} Partners`} />
                <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Registered vendor entities</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">ACTIVE VENDORS</div>
                <MetricValue value={`${activeCount} Active`} />
                <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Operational vendor accounts</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">PARTNER CATEGORIES</div>
                <MetricValue value={`${categoryCount} Categories`} />
                <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Shipping lines, truckers & brokers</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">COMPLIANCE CERTIFIED</div>
                <MetricValue value="100% Certified" />
                <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Customs & tax verified</p>
              </div>
            </div>

            <StandardDataTable
              data={partnerDirectory}
              columns={partnerDirectoryColumns}
              search={search}
              navigate={navigate}
              searchKey="name"
              searchPlaceholder="Filter partners..."
              emptyMessage="No partner directory records found."
            />
          </div>
        )
      }}
      renderReport={() => <PartnerDirectoryReportView data={partnerDirectory} />}
      renderKanban={() => <PartnerDirectoryKanbanView data={partnerDirectory} />}
      renderDetail={() => <PartnerDirectoryDetailView key={selectedPartnerId!} />}
    />
  )
}

export default function PartnerDirectoryPage() {
  return (
    <PartnerDirectoryProvider>
      <PartnerDirectoryContent />
    </PartnerDirectoryProvider>
  )
}

