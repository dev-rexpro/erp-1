import { useSearch, useNavigate } from '@tanstack/react-router'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { StandardPageLayout, StandardDataTable, ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { PurchaseOrdersProvider, usePurchaseOrders } from './components/purchase-orders-provider'
import { PurchaseOrderDetailView } from './components/purchase-order-detail-view'
import { PurchaseOrdersReportView } from './components/purchase-orders-report-view'
import { PurchaseOrdersKanbanView } from './components/purchase-orders-kanban-view'
import { PurchaseOrdersPrimaryButtons } from './components/purchase-orders-primary-buttons'
import { purchaseOrdersColumns } from './components/purchase-orders-columns'
import { useDbStore } from '@/stores/db-store'

const statusOptions = [
  { label: 'Approved', value: 'Approved' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Pending Approval', value: 'Pending Approval' },
  { label: 'Issued', value: 'Issued' },
]

function PurchaseOrdersContent({
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
  const { viewMode, selectedPoId } = usePurchaseOrders()
  const purchaseOrders = useDbStore((state) => state.purchaseOrders)
  const layoutViewMode = viewMode === 'table' ? 'list' : (viewMode as ViewMode)

  return (
    <>
      <StandardPageLayout
        title={title}
        description={description}
        viewMode={layoutViewMode}
        selectedItemId={selectedPoId}
        primaryActions={<PurchaseOrdersPrimaryButtons />}
        renderTable={() => {
          const approved = purchaseOrders.filter((po) => po.status === 'Approved' || po.status === 'Completed').length
          const pending = purchaseOrders.filter((po) => po.status === 'Pending Approval' || po.status === 'Issued').length
          const totalVal = purchaseOrders.reduce((acc, po) => acc + (Number(po.amount || po.totalAmount) || 0), 0)

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TOTAL PURCHASE ORDERS</div>
                  <MetricValue value={`${purchaseOrders.length} Orders`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Vendor service orders</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">APPROVED ORDERS</div>
                  <MetricValue value={`${approved} Approved`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Verified procurement commitments</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">PENDING APPROVAL</div>
                  <MetricValue value={`${pending} Pending`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Awaiting management authorization</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TOTAL COMMITMENT</div>
                  <MetricValue value={`Rp ${(totalVal / 1000000).toFixed(1)} M`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Contractual procurement value</p>
                </div>
              </div>

              <StandardDataTable
                data={purchaseOrders}
                columns={purchaseOrdersColumns}
                search={search}
                navigate={navigate}
                searchKey="poNumber"
                searchPlaceholder="Filter PO numbers, vendors, linked shipments..."
                emptyMessage="No purchase order records found matching criteria."
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
        renderReport={() => <PurchaseOrdersReportView data={purchaseOrders} />}
        renderKanban={() => <PurchaseOrdersKanbanView data={purchaseOrders} />}
        renderDetail={() => <PurchaseOrderDetailView key={selectedPoId} />}
      />
    </>
  )
}

export default function PurchaseOrdersPage() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn

  return (
    <PurchaseOrdersProvider>
      <PurchaseOrdersContent 
        title="Purchase Orders"
        description="Contracted operational procurement, shipping line allocations, and vendor billing approvals."
        search={search}
        navigate={navigate}
      />
    </PurchaseOrdersProvider>
  )
}
