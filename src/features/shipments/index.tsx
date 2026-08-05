import { useSearch, useNavigate } from '@tanstack/react-router'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { StandardPageLayout, StandardDataTable, type ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { ShipmentsDialogs } from './components/shipments-dialogs'
import { ShipmentPrimaryButtons } from './components/shipment-primary-buttons'
import { ShipmentsProvider, useShipments } from './components/shipments-provider'
import { ShipmentsReportView } from './components/shipments-report-view'
import { ShipmentsKanbanView } from './components/shipments-kanban-view'
import { ShipmentDetailView } from './components/shipment-detail-view'
import { shipmentsColumns } from './components/shipments-columns'
import { useDbStore } from '@/stores/db-store'

function ShipmentsContent() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn
  const { viewMode, selectedShipmentId } = useShipments()
  const shipments = useDbStore((state) => state.shipments)

  const layoutViewMode = (viewMode as string) === 'table' ? 'list' : (viewMode as ViewMode)

  return (
    <>
      <StandardPageLayout
        title="Shipments"
        description="Monitor active freight operations, container status, and port schedules."
        viewMode={layoutViewMode}
        selectedItemId={selectedShipmentId}
        primaryActions={<ShipmentPrimaryButtons />}
        renderTable={() => {
          const inTransit = shipments.filter((i) =>
            String(i.status || '').toLowerCase().includes('transit') ||
            String(i.status || '').toLowerCase().includes('customs') ||
            String(i.status || '').toLowerCase().includes('schedule')
          ).length
          const delivered = shipments.filter((i) =>
            String(i.status || '').toLowerCase().includes('deliver') ||
            String(i.status || '').toLowerCase().includes('complete')
          ).length
          const modes = new Set(shipments.map((i) => i.transportMode || i.mode || i.carrier).filter(Boolean)).size

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TOTAL SHIPMENTS</div>
                  <MetricValue value={`${shipments.length} Consignments`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Tracked freight consignments</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">IN TRANSIT</div>
                  <MetricValue value={`${inTransit} Active`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Vessels & air cargo en-route</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">DELIVERED</div>
                  <MetricValue value={`${delivered} Completed`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Consignments cleared & arrived</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TRANSPORT MODES</div>
                  <MetricValue value={`${modes} Modes`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Ocean FCL, LCL, Air & Land</p>
                </div>
              </div>

              <StandardDataTable
                data={shipments}
                columns={shipmentsColumns}
                search={search}
                navigate={navigate}
                searchKey="username"
                searchPlaceholder="Filter shipment code..."
                emptyMessage="No shipments found."
              />
            </div>
          )
        }}
        renderDetail={() => <ShipmentDetailView data={shipments} key={selectedShipmentId!} />}
        renderReport={() => <ShipmentsReportView data={shipments} search={search} navigate={navigate} />}
        renderKanban={() => <ShipmentsKanbanView data={shipments} search={search} />}
      />

      <ShipmentsDialogs />
    </>
  )
}

export function Shipments() {
  return (
    <ShipmentsProvider>
      <ShipmentsContent />
    </ShipmentsProvider>
  )
}

export default Shipments

