import { useSearch, useNavigate } from '@tanstack/react-router'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { StandardPageLayout, StandardDataTable } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { PackingListsDialogs } from './components/packing-lists-dialogs'
import { PackingListPrimaryButtons } from './components/packing-list-primary-buttons'
import { PackingListsProvider, usePackingLists } from './components/packing-lists-provider'
import { PackingListsReportView } from './components/packing-lists-report-view'
import { PackingListsKanbanView } from './components/packing-lists-kanban-view'
import { PackingListDetailView } from './components/packing-list-detail-view'
import { DataTableBulkActions } from './components/data-table-bulk-actions'
import { packingListsColumns } from './components/packing-lists-columns'
import { useDbStore } from '@/stores/db-store'
import { roles } from './data/data'

function PackingListsContent({
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
  const { viewMode, selectedPackingListId } = usePackingLists()
  const packingLists = useDbStore((state) => state.packingLists)

  return (
    <>
      <StandardPageLayout
        title={title}
        description={description}
        viewMode={viewMode}
        selectedItemId={selectedPackingListId}
        primaryActions={<PackingListPrimaryButtons />}
        renderTable={() => {
          const approved = packingLists.filter((pl) => pl.status === 'active' || pl.status === 'Approved' || pl.status === 'Verified').length
          const totalPkgs = packingLists.reduce((acc, pl) => acc + (pl.totalPackages || pl.packageCount || 450), 0)
          const grossWeight = packingLists.reduce((acc, pl) => acc + (pl.grossWeight || 12500), 0)

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TOTAL PACKING LISTS</div>
                  <MetricValue value={`${packingLists.length} Manifests`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Export & import cargo manifests</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">VERIFIED MANIFESTS</div>
                  <MetricValue value={`${approved} Verified`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Container stuffing verified</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TOTAL PACKAGES</div>
                  <MetricValue value={`${totalPkgs.toLocaleString()} Packages`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Cartons, pallets & crates</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">GROSS WEIGHT</div>
                  <MetricValue value={`${grossWeight.toLocaleString()} KGs`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Total verified payload mass</p>
                </div>
              </div>

              <StandardDataTable
                data={packingLists}
                columns={packingListsColumns}
                search={search}
                navigate={navigate}
                searchKey="username"
                searchPlaceholder="Search packing list code..."
                emptyMessage="No packing lists found."
                filters={[
                  {
                    columnId: 'status',
                    title: 'Status',
                    options: [
                      { label: 'Approved', value: 'active' },
                      { label: 'Received', value: 'inactive' },
                      { label: 'Draft', value: 'invited' },
                      { label: 'Shipped', value: 'suspended' },
                    ],
                  },
                  {
                    columnId: 'role',
                    title: 'Packaging Format',
                    options: roles.map((r) => ({
                      label: r.label,
                      value: r.value,
                    })),
                  },
                ]}
              />
            </div>
          )
        }}
        renderDetail={() => <PackingListDetailView data={packingLists} key={selectedPackingListId} />}
        renderReport={() => <PackingListsReportView data={packingLists} search={search} navigate={navigate} />}
        renderKanban={() => <PackingListsKanbanView data={packingLists} search={search} />}
      />

      <PackingListsDialogs />
    </>
  )
}

export function PackingLists() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn

  const title = 'Packing Lists'
  const description = 'Prepare packing manifests and track cargo packaging formats.'

  return (
    <PackingListsProvider>
      <PackingListsContent
        title={title}
        description={description}
        search={search}
        navigate={navigate}
      />
    </PackingListsProvider>
  )
}
