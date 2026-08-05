import { useSearch, useNavigate } from '@tanstack/react-router'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { StandardPageLayout, StandardDataTable, type ViewMode } from '@/components/templates'
import { MetricValue } from '@/components/ui/metric-value'
import { ContractsDialogs } from './components/contracts-dialogs'
import { ContractPrimaryButtons } from './components/contract-primary-buttons'
import { ContractsProvider, useContracts } from './components/contracts-provider'
import { ContractsReportView } from './components/contracts-report-view'
import { ContractsKanbanView } from './components/contracts-kanban-view'
import { ContractDetailView } from './components/contract-detail-view'
import { contractsColumns } from './components/contracts-columns'
import { useDbStore } from '@/stores/db-store'

function ContractsContent() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn
  const { viewMode, selectedContractId } = useContracts()
  const clientContracts = useDbStore((state) => state.contracts)

  const layoutViewMode = (viewMode as string) === 'table' ? 'list' : (viewMode as ViewMode)

  return (
    <>
      <StandardPageLayout
        title="Client Contracts"
        description="Draft, negotiate, and archive long-term customer service agreements and SLAs."
        viewMode={layoutViewMode}
        selectedItemId={selectedContractId}
        primaryActions={<ContractPrimaryButtons />}
        renderTable={() => {
          const active = clientContracts.filter((i) =>
            String(i.status || '').toLowerCase().includes('active') ||
            String(i.status || '').toLowerCase().includes('approve')
          ).length
          const pending = clientContracts.filter((i) =>
            String(i.status || '').toLowerCase().includes('sign') ||
            String(i.status || '').toLowerCase().includes('pending') ||
            String(i.status || '').toLowerCase().includes('draft')
          ).length
          const types = new Set(clientContracts.map((i) => i.contractType || i.agreementType || i.type).filter(Boolean)).size

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">TOTAL CONTRACTS</div>
                  <MetricValue value={`${clientContracts.length} Agreements`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Long-term freight SLAs</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">ACTIVE ENFORCEABLE</div>
                  <MetricValue value={`${active} Active`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Active customer contracts</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">PENDING SIGNATURE</div>
                  <MetricValue value={`${pending} Pending`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">In negotiation / signature</p>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AGREEMENT TYPES</div>
                  <MetricValue value={`${types} Types`} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">SLA, retainers & volume terms</p>
                </div>
              </div>

              <StandardDataTable
                data={clientContracts}
                columns={contractsColumns}
                search={search}
                navigate={navigate}
                searchKey="username"
                searchPlaceholder="Filter contract code..."
                emptyMessage="No client contracts found."
              />
            </div>
          )
        }}
        renderDetail={() => <ContractDetailView data={clientContracts} key={selectedContractId!} />}
        renderReport={() => <ContractsReportView data={clientContracts} search={search} navigate={navigate} />}
        renderKanban={() => <ContractsKanbanView data={clientContracts} search={search} />}
      />

      <ContractsDialogs />
    </>
  )
}

export function Contracts() {
  return (
    <ContractsProvider>
      <ContractsContent />
    </ContractsProvider>
  )
}

export function ClientContracts() {
  return <Contracts />
}

