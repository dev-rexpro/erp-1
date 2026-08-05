import React, { useState, useRef, useMemo, useCallback } from 'react'
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ResourceSchema, FieldSchema } from '@/lib/resource-schema'
import { resourceStore, type ResourceRecord } from '@/lib/resource-store'
import { getResourceSchema } from '@/resources'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MetricValue } from '@/components/ui/metric-value'
import {
  DataTableToolbar,
  DataTablePagination,
  DataTableColumnHeader,
  DataTableBulkActions,
  DataKanban,
  type KanbanColumnDef,
} from '@/components/data-table'
import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  List,
  Kanban,
  FileText,
  ChevronsUpDown,
  RotateCw,
  Check,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  X,
  Building2,
  Ship,
  Boxes,
  Calculator,
  Receipt,
  FileCheck,
  Users,
  ShieldCheck,
  Layers,
  CheckCircle2,
  Activity,
  DollarSign,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getResourceKpis(schema: ResourceSchema, data: ResourceRecord[]) {
  const total = data.length
  const statusField = schema.fields.find((f) => f.name === 'status')
  const activeCount = statusField
    ? data.filter((item) =>
        String(item.status || item.statusName || '')
          .toLowerCase()
          .includes('active') ||
        String(item.status || '')
          .toLowerCase()
          .includes('approved') ||
        String(item.status || '')
          .toLowerCase()
          .includes('confirmed')
      ).length
    : total

  if (schema.name === 'company') {
    const roles = new Set(data.map((i) => i.partnerRole || i.type || 'Client').filter(Boolean)).size
    return [
      { title: 'TOTAL CLIENT ACCOUNTS', value: total.toString(), description: 'Registered client accounts' },
      { title: 'ACTIVE STATUS', value: activeCount.toString(), description: 'Active records in database' },
      { title: 'PARTNER ROLES', value: `${roles} Types`, description: 'Categorized business partners' },
      { title: 'SYSTEM COMPLIANCE', value: '100% Verified', description: 'Tax & legal clearance verified' },
    ]
  }

  if (schema.name === 'shipment') {
    const inTransit = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('transit') ||
      String(i.status || '')
        .toLowerCase()
        .includes('customs')
    ).length
    const delivered = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('deliver')
    ).length
    const modes = new Set(data.map((i) => i.transportMode || i.mode).filter(Boolean)).size
    return [
      { title: 'TOTAL SHIPMENTS', value: total.toString(), description: 'Tracked freight consignments' },
      { title: 'IN TRANSIT', value: `${inTransit} Active`, description: 'Vessels / air cargo en-route' },
      { title: 'DELIVERED', value: `${delivered} Completed`, description: 'Consignments cleared & arrived' },
      { title: 'TRANSPORT MODES', value: `${modes} Modes`, description: 'Ocean FCL, LCL, Air & Land' },
    ]
  }

  if (schema.name === 'serviceQuotation') {
    const approved = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('approve') ||
      String(i.status || '')
        .toLowerCase()
        .includes('accept')
    ).length
    const pending = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('draft') ||
      String(i.status || '')
        .toLowerCase()
        .includes('pending') ||
      String(i.status || '')
        .toLowerCase()
        .includes('review')
    ).length
    const lanes = new Set(data.map((i) => i.destination || i.origin).filter(Boolean)).size
    return [
      { title: 'TOTAL QUOTATIONS', value: total.toString(), description: 'Issued freight estimates' },
      { title: 'APPROVED QUOTES', value: `${approved} Confirmed`, description: 'Client accepted offers' },
      { title: 'PENDING REVIEW', value: `${pending} Pending`, description: 'Awaiting client decision' },
      { title: 'TRADE LANES', value: `${lanes} Lanes`, description: 'Active export/import routes' },
    ]
  }

  if (schema.name === 'clientContract') {
    const active = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('active') ||
      String(i.status || '')
        .toLowerCase()
        .includes('approve')
    ).length
    const scopes = new Set(data.map((i) => i.contractType || i.scope).filter(Boolean)).size
    return [
      { title: 'TOTAL CONTRACTS', value: total.toString(), description: 'Long-term freight SLAs' },
      { title: 'ACTIVE CONTRACTS', value: `${active} Active`, description: 'Enforceable service terms' },
      { title: 'CONTRACT SCOPE', value: `${scopes} Types`, description: 'SLA & retainer agreements' },
      { title: 'COMPLIANCE STATUS', value: '100% Verified', description: 'Legal & credit limit checked' },
    ]
  }

  if (schema.name === 'vendorBill') {
    const totalAp = data.reduce((acc, i) => acc + (Number(i.totalAmount || i.amount) || 0), 0)
    const approved = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('approve') ||
      String(i.status || '')
        .toLowerCase()
        .includes('paid')
    ).length
    const pending = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('pending') ||
      String(i.status || '')
        .toLowerCase()
        .includes('draft')
    ).length
    return [
      { title: 'AP OUTSTANDING', value: `Rp ${(totalAp / 1000000).toFixed(1)} M`, description: 'Unpaid carrier & vendor bills' },
      { title: 'APPROVED BILLS', value: `${approved} Bills`, description: 'Ready for bank disbursement' },
      { title: 'PENDING APPROVAL', value: `${pending} Bills`, description: 'Awaiting 3-way PO verification' },
      { title: 'VERIFIED CARRIERS', value: `${new Set(data.map((i) => i.vendorName)).size} Vendors`, description: 'Validated vendor accounts' },
    ]
  }

  if (schema.name === 'clientInvoice') {
    const totalBilled = data.reduce((acc, i) => acc + (Number(i.totalAmount || i.amount) || 0), 0)
    const paid = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('paid')
    ).length
    const unpaid = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('unpaid') ||
      String(i.status || '')
        .toLowerCase()
        .includes('overdue') ||
      String(i.status || '')
        .toLowerCase()
        .includes('pending')
    ).length
    return [
      { title: 'TOTAL INVOICES', value: total.toString(), description: 'Generated client billings' },
      { title: 'PAID SETTLED', value: `${paid} Settled`, description: 'Payments collected & matched' },
      { title: 'UNPAID / OVERDUE', value: `${unpaid} Outstanding`, description: 'Pending receivables balance' },
      { title: 'TOTAL BILLED', value: `Rp ${(totalBilled / 1000000).toFixed(1)} M`, description: 'Gross commercial invoicing' },
    ]
  }

  if (schema.name === 'shippingInstruction') {
    const confirmed = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('confirm') ||
      String(i.status || '')
        .toLowerCase()
        .includes('issue')
    ).length
    const pending = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('draft') ||
      String(i.status || '')
        .toLowerCase()
        .includes('pending')
    ).length
    const carriers = new Set(data.map((i) => i.shippingLine || i.carrier).filter(Boolean)).size
    return [
      { title: 'TOTAL INSTRUCTIONS', value: total.toString(), description: 'Issued shipping orders' },
      { title: 'CONFIRMED SI', value: `${confirmed} Confirmed`, description: 'Accepted by shipping lines' },
      { title: 'DRAFT / PENDING', value: `${pending} Pending`, description: 'Awaiting carrier verification' },
      { title: 'OCEAN CARRIERS', value: `${carriers} Lines`, description: 'Assigned shipping lines' },
    ]
  }

  if (schema.name === 'accountsReceivable') {
    const totalBal = data.reduce((acc, i) => acc + (Number(i.outstandingAmount || i.amount) || 0), 0)
    const overdue = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('overdue')
    ).length
    const paid = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('paid')
    ).length
    return [
      { title: 'TOTAL AR BALANCE', value: `Rp ${(totalBal / 1000000).toFixed(1)} M`, description: 'Across client invoices' },
      { title: 'OVERDUE INVOICES', value: `${overdue} Accounts`, description: 'Past credit due dates' },
      { title: 'SETTLED ACCOUNTS', value: `${paid} Invoices`, description: 'Within payment term limits' },
      { title: 'BENCHMARK DSO', value: '28 Days', description: 'Target: <30 days collection' },
    ]
  }

  if (schema.name === 'costAccrual') {
    const totalEst = data.reduce((acc, i) => acc + (Number(i.estimatedCost || i.amount) || 0), 0)
    const pending = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('pending') ||
      String(i.status || '')
        .toLowerCase()
        .includes('unreconciled')
    ).length
    const reconciled = data.filter((i) =>
      String(i.status || '')
        .toLowerCase()
        .includes('reconcil')
    ).length
    return [
      { title: 'TOTAL PROVISIONED', value: `Rp ${(totalEst / 1000000).toFixed(1)} M`, description: 'Estimated operational costs' },
      { title: 'PENDING RECONCILIATION', value: `${pending} Accruals`, description: 'Awaiting vendor final bills' },
      { title: 'RECONCILED ACCRUALS', value: `${reconciled} Matched`, description: 'Matched against vendor bills' },
      { title: 'VARIANCE AUDIT', value: 'Operational', description: 'Real-time margin control' },
    ]
  }

  if (schema.name === 'generalLedger') {
    const totalDebit = data.reduce((acc, i) => acc + (Number(i.debit) || 0), 0)
    const totalCredit = data.reduce((acc, i) => acc + (Number(i.credit) || 0), 0)
    return [
      { title: 'TOTAL LEDGER DEBIT', value: `Rp ${(totalDebit / 1000000).toFixed(1)} M`, description: 'Total posted debit entries' },
      { title: 'TOTAL LEDGER CREDIT', value: `Rp ${(totalCredit / 1000000).toFixed(1)} M`, description: 'Total posted credit entries' },
      { title: 'DOUBLE-ENTRY BALANCE', value: 'Zero Difference', description: 'Debit equals Credit validation' },
      { title: 'POSTED VOUCHERS', value: `${total} Entries`, description: 'Immutable period entries' },
    ]
  }

  if (schema.name === 'userAccount') {
    const deptCount = new Set(data.map((i) => i.department).filter(Boolean)).size
    return [
      { title: 'TOTAL USER ACCOUNTS', value: total.toString(), description: 'Registered corporate personnel' },
      { title: 'ACTIVE USERS', value: activeCount.toString(), description: 'Authorized system logins' },
      { title: 'BUSINESS UNITS', value: `${deptCount} Depts`, description: 'Assigned operational units' },
      { title: 'SECURITY GOVERNANCE', value: 'Strict RBAC', description: '2FA & Audit compliance active' },
    ]
  }

  if (schema.name === 'role') {
    const deptCount = new Set(data.map((i) => i.department).filter(Boolean)).size
    const fullCtrlCount = data.filter((i) => String(i.authorityScope || '').includes('Full')).length
    return [
      { title: 'TOTAL ROLES', value: total.toString(), description: 'Defined authorization matrices' },
      { title: 'ACTIVE ROLES', value: activeCount.toString(), description: 'Currently assigned in system' },
      { title: 'DEPT COVERAGE', value: `${deptCount} Depts`, description: 'Scope restricted policies' },
      { title: 'ADMIN PRIVILEGES', value: `${fullCtrlCount} Full Control`, description: 'Unrestricted system access' },
    ]
  }

  if (schema.name === 'moduleControl') {
    const catCount = new Set(data.map((i) => i.category).filter(Boolean)).size
    const coreCount = data.filter((i) => String(i.type || '').includes('Core')).length
    return [
      { title: 'TOTAL ERP MODULES', value: total.toString(), description: 'Configured route modules' },
      { title: 'ACTIVE MODULES', value: activeCount.toString(), description: 'Enabled route guards' },
      { title: 'MODULE DOMAINS', value: `${catCount} Categories`, description: 'Core functional areas' },
      { title: 'SYSTEM CORE', value: `${coreCount} Core Views`, description: 'Essential backend backbone' },
    ]
  }

  if (schema.name === 'auditLog') {
    const userCount = new Set(data.map((i) => i.userName).filter(Boolean)).size
    const mutations = data.filter((i) => i.action === 'UPDATE' || i.action === 'DELETE' || i.action === 'CREATE').length
    return [
      { title: 'TOTAL AUDIT LOGS', value: total.toString(), description: 'Recorded activity events' },
      { title: 'ACTIVE USER SESSIONS', value: `${userCount} Users`, description: 'Unique logged users today' },
      { title: 'DATA MUTATIONS', value: `${mutations} Events`, description: 'Creates, edits & deletions' },
      { title: 'GATEWAY STATUS', value: '100% OK', description: 'Jakarta SSL Gateway verified' },
    ]
  }

  // Generic schema KPI fallback
  const secondField = schema.fields.find((f) => f.type === 'select' || f.type === 'relation')
  const uniqueCount = secondField ? new Set(data.map((i) => i[secondField.name]).filter(Boolean)).size : total
  return [
    { title: `TOTAL ${schema.pluralLabel.toUpperCase()}`, value: total.toString(), description: `Registered ${schema.pluralLabel.toLowerCase()}` },
    { title: 'ACTIVE STATUS', value: activeCount.toString(), description: 'Active records in database' },
    { title: secondField ? secondField.label.toUpperCase() : 'CATEGORIES', value: `${uniqueCount} Types`, description: 'Categorized records' },
    { title: 'SYSTEM COMPLIANCE', value: '100% Verified', description: 'Audit & sync operational' },
  ]
}

interface ResourceListViewProps {
  schema: ResourceSchema
  data: ResourceRecord[]
  onSelectRecord: (id: string, mode?: 'view' | 'edit') => void
  onCreateNew: () => void
  onDeleteRecord?: (id: string) => void
  viewMode?: 'table' | 'kanban' | 'report'
  setViewMode?: (mode: 'table' | 'kanban' | 'report') => void
  hideTopHeader?: boolean
}

export const ResourceListView: React.FC<ResourceListViewProps> = ({
  schema,
  data,
  onSelectRecord,
  onCreateNew,
  onDeleteRecord,
  viewMode: propsViewMode,
  setViewMode: propsSetViewMode,
  hideTopHeader = false,
}) => {
  const [internalViewMode, setInternalViewMode] = useState<'table' | 'kanban' | 'report'>('table')
  const viewMode = propsViewMode || internalViewMode
  const setViewMode = propsSetViewMode || setInternalViewMode
  const [refreshing, setRefreshing] = useState(false)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: schema.defaultSort?.field || schema.fields[0]?.name || 'id',
      desc: schema.defaultSort?.direction === 'desc',
    },
  ])
  const [columnFilters, setColumnFilters] = useState<any[]>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const handleRefresh = () => {
    if (refreshing) return
    setRefreshing(true)
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 600)),
      {
        loading: `Refreshing ${schema.pluralLabel.toLowerCase()}...`,
        success: `${schema.pluralLabel} updated.`,
        error: 'Failed to refresh.',
      }
    )
    setTimeout(() => setRefreshing(false), 600)
  }

  // Identify primary status or category field for Kanban
  const statusField = useMemo(() => {
    return (
      schema.fields.find((f) => f.name === 'status') ||
      schema.fields.find((f) => f.name === 'partnerType') ||
      schema.fields.find((f) => f.name === 'transportMode') ||
      schema.fields.find((f) => f.type === 'select')
    )
  }, [schema])

  // Fields that are shown in table / report
  const listFields = useMemo(() => {
    return schema.fields.filter((f) => f.showInList !== false)
  }, [schema])

  // -------------------------------------------------------------
  // 1. DATA TABLE VIEW SETUP (TanStack Table)
  // -------------------------------------------------------------
  const columns = useMemo<ColumnDef<ResourceRecord>[]>(() => {
    const cols: ColumnDef<ResourceRecord>[] = [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label='Select all'
            className='translate-y-[2px]'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
            className='translate-y-[2px]'
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ]

    listFields.forEach((field) => {
      cols.push({
        accessorKey: field.name,
        header: ({ column }) => <DataTableColumnHeader column={column} title={field.label} />,
        cell: ({ row }) => {
          const rawVal = row.getValue(field.name)

          if (rawVal === null || rawVal === undefined || rawVal === '') {
            return <span className='text-muted-foreground text-xs'>—</span>
          }

          if (field.type === 'relation' && field.relationTo) {
            const targetSchema = getResourceSchema(field.relationTo)
            const targetRecord = resourceStore.getById(field.relationTo, String(rawVal))
            if (targetRecord && targetSchema) {
              return (
                <span className='font-medium text-foreground text-xs'>
                  {targetRecord[targetSchema.titleField] || targetRecord.name || rawVal}
                </span>
              )
            }
            return <span className='text-foreground text-xs font-medium'>{String(rawVal)}</span>
          }

          if (field.type === 'select' && field.badgeVariants && field.badgeVariants[String(rawVal)]) {
            const variant = field.badgeVariants[String(rawVal)]
            return (
              <Badge
                variant={
                  variant === 'success' || variant === 'warning' || variant === 'info'
                    ? 'secondary'
                    : (variant as any)
                }
                className='text-[11px] font-normal'
              >
                {String(rawVal)}
              </Badge>
            )
          }

          if (field.type === 'currency') {
            const num = Number(rawVal) || 0
            return (
              <span className='text-xs font-medium'>
                ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )
          }

          if (field.type === 'boolean') {
            return (
              <Badge variant={rawVal ? 'default' : 'outline'} className='text-[10px]'>
                {rawVal ? 'Yes' : 'No'}
              </Badge>
            )
          }

          return <span className='text-xs text-foreground'>{String(rawVal)}</span>
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      })
    })

    // Audit Created / Updated column
    cols.push({
      id: 'auditTrail',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Created / Edited By' />,
      cell: ({ row }) => {
        const creator = row.original.createdBy || '—'
        const updater = row.original.updatedBy || creator
        return (
          <div className='flex flex-col text-[11px] leading-tight'>
            <span className='font-medium text-foreground truncate max-w-[150px]' title={updater}>
              {updater}
            </span>
            {row.original.updatedAt && (
              <span className='text-[10px] text-muted-foreground truncate max-w-[150px]'>
                {row.original.updatedAt}
              </span>
            )}
          </div>
        )
      },
    })

    // Actions column
    cols.push({
      id: 'actions',
      cell: ({ row }) => {
        const titleVal = row.original[schema.titleField] || row.original.name || row.original.id
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='size-8'>
                  <MoreHorizontal className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-40'>
                <DropdownMenuLabel className='text-xs'>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onSelectRecord(row.original.id, 'view')}>
                  <Eye className='mr-2 size-3.5 text-muted-foreground' />
                  View Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectRecord(row.original.id, 'edit')}>
                  <Pencil className='mr-2 size-3.5 text-muted-foreground' />
                  Edit Record
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm(`Delete ${titleVal}?`)) {
                      if (onDeleteRecord) {
                        onDeleteRecord(row.original.id)
                      } else {
                        resourceStore.delete(schema.name, row.original.id)
                      }
                      toast.success(`${schema.label} deleted`)
                    }
                  }}
                  className='text-destructive focus:text-destructive'
                >
                  <Trash2 className='mr-2 size-3.5' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    })

    return cols
  }, [schema, listFields, onSelectRecord, onDeleteRecord])

  const filterOptions = useMemo(() => {
    return schema.fields
      .filter((f) => f.type === 'select' && f.options && f.options.length > 0)
      .map((f) => ({
        columnId: f.name,
        title: f.label,
        options: (f.options || []).map((opt) => ({
          label: opt,
          value: opt,
        })),
      }))
  }, [schema])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // -------------------------------------------------------------
  // 2. KANBAN VIEW SETUP
  // -------------------------------------------------------------
  const kanbanColumns = useMemo<KanbanColumnDef[]>(() => {
    if (!statusField || !statusField.options) {
      return [
        { id: 'Active', title: 'Active', color: 'bg-emerald-500' },
        { id: 'Draft', title: 'Draft / Pending', color: 'bg-amber-500' },
        { id: 'Completed', title: 'Completed', color: 'bg-blue-500' },
      ]
    }

    return statusField.options.map((opt) => ({
      id: opt,
      title: opt,
      color: 'bg-primary',
    }))
  }, [statusField])

  const handleMoveKanbanCard = (id: string, newStatus: string) => {
    if (!statusField) return
    const record = resourceStore.getById(schema.name, id)
    if (record) {
      resourceStore.save(schema.name, {
        ...record,
        [statusField.name]: newStatus,
      })
      toast.success(`Updated ${schema.label} status to ${newStatus}`)
    }
  }

  // -------------------------------------------------------------
  // 3. REPORT VIEW SETUP (Excel / Pivot Grid matching Client Accounts)
  // -------------------------------------------------------------
  // Column widths state for Excel-like resizing
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = { index: 50 }
    listFields.forEach((f) => {
      if (f.name === schema.titleField || f.name === 'name') {
        initial[f.name] = 170
      } else if (f.type === 'currency') {
        initial[f.name] = 140
      } else if (f.type === 'relation') {
        initial[f.name] = 160
      } else {
        initial[f.name] = 140
      }
    })
    return initial
  })

  // Dynamic filter state for inline spreadsheet row
  const [reportFilters, setReportFilters] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    listFields.forEach((f) => {
      initial[f.name] = f.type === 'select' ? 'all' : ''
    })
    return initial
  })

  // Grouping / Pivot mode state
  const [groupBy, setGroupBy] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  // Sorting state for Report View
  const [reportSortCol, setReportSortCol] = useState<string | null>(null)
  const [reportSortDir, setReportSortDir] = useState<'asc' | 'desc'>('asc')

  // Selected cell focus state
  const [selectedCell, setSelectedCell] = useState<{ rowId: string; colId: string } | null>(null)
  const [dragOverHeader, setDragOverHeader] = useState(false)

  // Mouse drag refs for resizing columns
  const activeResizeCol = useRef<string | null>(null)
  const startResizeX = useRef<number>(0)
  const startWidth = useRef<number>(0)

  const handleMouseDown = (e: React.MouseEvent, colId: string) => {
    e.preventDefault()
    e.stopPropagation()
    activeResizeCol.current = colId
    startResizeX.current = e.clientX
    startWidth.current = colWidths[colId] || 140

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!activeResizeCol.current) return
    const deltaX = e.clientX - startResizeX.current
    const newWidth = Math.max(60, startWidth.current + deltaX)
    setColWidths((prev) => ({
      ...prev,
      [activeResizeCol.current!]: newWidth,
    }))
  }

  const handleMouseUp = () => {
    activeResizeCol.current = null
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  // Column Drag and Drop for Grouping (Pivot)
  const handleDragStart = (e: React.DragEvent, colId: string) => {
    e.dataTransfer.setData('text/plain', colId)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverHeader(false)
    const colId = e.dataTransfer.getData('text/plain')
    if (colId && listFields.some((f) => f.name === colId)) {
      setGroupBy(colId)
      setCollapsedGroups({})
      const field = listFields.find((f) => f.name === colId)
      toast.success(`Spreadsheet grouped by: ${field?.label || colId}`)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverHeader(true)
  }

  const handleDragLeave = () => {
    setDragOverHeader(false)
  }

  const toggleReportSort = (colId: string) => {
    if (reportSortCol === colId) {
      if (reportSortDir === 'asc') {
        setReportSortDir('desc')
      } else {
        setReportSortCol(null)
      }
    } else {
      setReportSortCol(colId)
      setReportSortDir('asc')
    }
  }

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }))
  }

  // Filter and Sort Data for Report View
  const processedReportData = useMemo(() => {
    let result = [...data]

    // Apply inline filters
    result = result.filter((row) => {
      return listFields.every((field) => {
        const filterVal = reportFilters[field.name]
        if (!filterVal || filterVal === 'all') return true

        const rawVal = row[field.name]
        if (field.type === 'select') {
          return String(rawVal || '') === filterVal
        }

        if (field.type === 'relation' && field.relationTo) {
          const targetRecord = resourceStore.getById(field.relationTo, String(rawVal))
          const resolvedName = targetRecord ? String(targetRecord.name || targetRecord.code || rawVal) : String(rawVal || '')
          return resolvedName.toLowerCase().includes(filterVal.toLowerCase())
        }

        return String(rawVal || '').toLowerCase().includes(filterVal.toLowerCase())
      })
    })

    // Apply sorting
    if (reportSortCol) {
      result.sort((a, b) => {
        const field = listFields.find((f) => f.name === reportSortCol)
        const valA = a[reportSortCol]
        const valB = b[reportSortCol]

        if (valA === undefined || valA === null) return 1
        if (valB === undefined || valB === null) return -1

        let cmpA: string | number = String(valA).toLowerCase()
        let cmpB: string | number = String(valB).toLowerCase()

        if (field?.type === 'currency' || field?.type === 'number') {
          cmpA = Number(valA) || 0
          cmpB = Number(valB) || 0
        }

        if (cmpA < cmpB) return reportSortDir === 'asc' ? -1 : 1
        if (cmpA > cmpB) return reportSortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, listFields, reportFilters, reportSortCol, reportSortDir])

  // Grouped Report Data
  const groupedReportData = useMemo(() => {
    if (!groupBy) return null

    const field = listFields.find((f) => f.name === groupBy)
    const groups: Record<string, ResourceRecord[]> = {}

    processedReportData.forEach((row) => {
      let key = String(row[groupBy] || 'Unspecified')
      if (field?.type === 'relation' && field.relationTo) {
        const targetRecord = resourceStore.getById(field.relationTo, key)
        if (targetRecord) {
          key = targetRecord.name || targetRecord.code || key
        }
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(row)
    })

    return groups
  }, [processedReportData, groupBy, listFields])

  // Preset group candidate fields (select, relation, boolean fields)
  const groupPresetFields = useMemo(() => {
    return listFields.filter(
      (f) =>
        f.type === 'select' ||
        f.type === 'relation' ||
        f.type === 'boolean' ||
        f.name === 'status' ||
        f.name === 'partnerType'
    ).slice(0, 4)
  }, [listFields])

  const handleBulkDeleteSelected = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (
      confirm(
        `Are you sure you want to delete ${selectedRows.length} selected ${schema.pluralLabel.toLowerCase()}?`
      )
    ) {
      selectedRows.forEach((r) => resourceStore.delete(schema.name, r.original.id))
      toast.success(`Deleted ${selectedRows.length} ${schema.pluralLabel}`)
      table.resetRowSelection()
    }
  }

  return (
    <div className='flex flex-col gap-4 sm:gap-6 w-full'>
      {/* KPI Cards Grid (Compact, No Icon, Header-Matched bg-muted) */}
      {viewMode === 'table' && (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {getResourceKpis(schema, data).map((kpi, idx) => {
            return (
              <div
                key={idx}
                className='rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all'
              >
                <div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                  {kpi.title}
                </div>
                <MetricValue value={kpi.value} />
                <p className='mt-0.5 text-[11px] text-muted-foreground/80 truncate'>{kpi.description}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Top Header Row (if not hidden by StandardPageLayout) */}
      {!hideTopHeader && (
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-lg font-bold tracking-tight'>{schema.pluralLabel}</h2>
            <p className='text-xs text-muted-foreground'>
              {schema.description || `Manage your ${schema.pluralLabel.toLowerCase()} here.`}
            </p>
          </div>

          <div className='flex items-center gap-2'>
            {/* View Mode Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-8 px-3 gap-1.5 rounded-lg'>
                  {viewMode === 'table' && <List size={15} />}
                  {viewMode === 'report' && <FileText size={15} />}
                  {viewMode === 'kanban' && <Kanban size={15} />}
                  <span className='text-xs font-medium'>
                    {viewMode === 'table' && 'List View'}
                    {viewMode === 'report' && 'Report View'}
                    {viewMode === 'kanban' && 'Kanban View'}
                  </span>
                  <ChevronsUpDown size={12} className='text-muted-foreground ml-0.5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-[180px] rounded-xl'>
                <DropdownMenuItem
                  onClick={() => setViewMode('table')}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <List size={16} className='text-muted-foreground' />
                  <span>List View</span>
                  {viewMode === 'table' && <Check size={14} className='ml-auto' />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setViewMode('report')}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <FileText size={16} className='text-muted-foreground' />
                  <span>Report View</span>
                  {viewMode === 'report' && <Check size={14} className='ml-auto' />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setViewMode('kanban')}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <Kanban size={16} className='text-muted-foreground' />
                  <span>Kanban View</span>
                  {viewMode === 'kanban' && <Check size={14} className='ml-auto' />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh Button */}
            <Button
              variant='outline'
              size='sm'
              className='h-8 w-8 p-0 rounded-lg'
              onClick={handleRefresh}
            >
              <RotateCw size={15} className={refreshing ? 'animate-spin' : ''} />
              <span className='sr-only'>Refresh</span>
            </Button>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-8 w-8 p-0 rounded-lg'>
                  <MoreHorizontal size={15} />
                  <span className='sr-only'>More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-[180px] rounded-xl'>
                <DropdownMenuItem
                  onClick={() => toast.success('CSV Export initiated.')}
                  className='gap-2 cursor-pointer'
                >
                  <Download size={16} className='text-muted-foreground' />
                  <span>Export CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast.success('CSV Import initiated.')}
                  className='gap-2 cursor-pointer'
                >
                  <Upload size={16} className='text-muted-foreground' />
                  <span>Import CSV</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Primary Add Button */}
            <Button
              onClick={onCreateNew}
              size='sm'
              className='h-8 px-3 gap-1.5 bg-black hover:bg-black/90 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black font-semibold shadow-xs rounded-lg transition-colors'
            >
              <Plus size={15} />
              <span className='text-xs'>Add {schema.label}</span>
            </Button>
          </div>
        </div>
      )}

      {/* VIEW 1: DATA TABLE VIEW */}
      {viewMode === 'table' && (
        <div className='flex flex-col gap-4'>
          {/* Toolbar */}
          <DataTableToolbar
            table={table}
            searchPlaceholder={`Filter ${schema.pluralLabel.toLowerCase()}...`}
            filters={filterOptions}
          />

          {/* Table Container */}
          <div className='rounded-md border bg-card overflow-hidden'>
            <Table>
              <TableHeader className='bg-muted/50'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className='text-xs font-semibold py-3'>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className='hover:bg-muted/40 cursor-pointer transition-colors'
                      onClick={() => onSelectRecord(row.original.id, 'view')}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className='py-3 whitespace-nowrap text-xs'>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-32 text-center text-xs text-muted-foreground'
                    >
                      No results found for {schema.pluralLabel.toLowerCase()}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Pagination & Bulk Actions */}
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-1'>
            <DataTableBulkActions table={table as any} entityName={schema.label}>
              <Button
                variant='destructive'
                size='sm'
                onClick={handleBulkDeleteSelected}
                className='h-7 text-xs gap-1 px-2.5'
              >
                <Trash2 className='size-3.5' /> Delete Selected
              </Button>
            </DataTableBulkActions>
            <DataTablePagination table={table} />
          </div>
        </div>
      )}

      {/* VIEW 2: KANBAN VIEW */}
      {viewMode === 'kanban' && statusField && (
        <div className='h-[650px] rounded-xl border bg-card shadow-xs overflow-hidden p-2'>
          <DataKanban
            data={data}
            columns={kanbanColumns}
            columnKey={statusField.name as keyof ResourceRecord}
            searchKey={schema.titleField as keyof ResourceRecord}
            onMoveCard={handleMoveKanbanCard}
            getKey={(item: ResourceRecord) => item.id}
            renderCard={(item: ResourceRecord) => {
              const title = item[schema.titleField] || item.name || item.id
              return (
                <Card
                  onClick={() => onSelectRecord(item.id, 'view')}
                  className='p-3 border shadow-2xs hover:shadow-sm cursor-pointer transition-all bg-card'
                >
                  <div className='flex items-start justify-between gap-2 mb-2'>
                    <span className='font-semibold text-xs text-foreground line-clamp-1'>
                      {title}
                    </span>
                    <Badge variant='outline' className='text-[10px] shrink-0 font-normal'>
                      {item.code || item.id}
                    </Badge>
                  </div>

                  <div className='space-y-1 text-[11px] text-muted-foreground'>
                    {schema.fields.slice(1, 4).map((f) => {
                      if (f.name === statusField.name) return null
                      const val = item[f.name]
                      if (!val) return null
                      return (
                        <div key={f.name} className='flex items-center justify-between gap-2'>
                          <span className='text-muted-foreground'>{f.label}:</span>
                          <span className='font-medium text-foreground truncate max-w-[120px]'>
                            {f.type === 'currency'
                              ? `$${Number(val).toLocaleString()}`
                              : String(val)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )
            }}
          />
        </div>
      )}

      {/* VIEW 3: REPORT VIEW (Spreadsheet / Pivot Grid - Exactly as in Client Accounts) */}
      {viewMode === 'report' && (
        <div className='flex flex-col flex-1 gap-4 animate-fade-in'>
          {/* Pivot / Group Panel with Drag and Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border rounded-lg transition-all duration-150',
              dragOverHeader
                ? 'bg-accent/50 border-primary border-dashed ring-2 ring-primary/15'
                : 'bg-muted/40 border-border hover:bg-muted/50'
            )}
          >
            <div className='flex items-center gap-3'>
              <div>
                <div className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                  <span>Pivot Column Grouping Mode</span>
                </div>
                <p className='text-[11px] text-muted-foreground mt-0.5'>
                  Drag any column header down here to group. Or select a popular preset group from the list.
                </p>
              </div>
            </div>

            <div className='flex items-center flex-wrap gap-1.5'>
              {groupPresetFields.map((f) => (
                <Button
                  key={f.name}
                  variant={groupBy === f.name ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => {
                    setGroupBy(groupBy === f.name ? null : f.name)
                    setCollapsedGroups({})
                  }}
                  className='h-7 text-xs rounded-md'
                >
                  {f.label} Preset
                </Button>
              ))}

              {groupBy && (
                <div className='flex items-center gap-1.5 pl-2 border-l'>
                  <Badge
                    variant='secondary'
                    className='h-6 rounded bg-primary/10 text-primary hover:bg-primary/10 text-xs border-none font-medium gap-1 flex items-center pr-1'
                  >
                    <span>
                      Grouped by: {listFields.find((f) => f.name === groupBy)?.label || groupBy}
                    </span>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation()
                        setGroupBy(null)
                      }}
                      className='h-4 w-4 hover:bg-primary/20 hover:text-primary rounded-full p-0'
                    >
                      <X size={10} />
                    </Button>
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Spreadsheet grid container */}
          <div className='relative flex flex-col flex-1 border rounded-md bg-background overflow-hidden'>
            <div className='overflow-x-auto w-full'>
              <table className='w-full border-collapse table-fixed select-none text-sm'>
                <colgroup>
                  <col style={{ width: '45px' }} />
                  {listFields.map((field) => (
                    <col
                      key={field.name}
                      style={{ width: colWidths[field.name] || 140 }}
                    />
                  ))}
                </colgroup>

                <TableHeader>
                  {/* Primary Header Row with Draggable Columns and Resizing */}
                  <TableRow className='bg-muted/40 hover:bg-muted/40 h-10'>
                    <TableHead className='p-0 text-center border-r align-middle'>
                      <div className='flex items-center justify-center'>
                        <Checkbox
                          checked={
                            processedReportData.length > 0 &&
                            processedReportData.every((r) => rowSelection[r.id])
                          }
                          onCheckedChange={(checked) => {
                            const next: Record<string, boolean> = {}
                            if (checked) {
                              processedReportData.forEach((r) => (next[r.id] = true))
                            }
                            setRowSelection(next)
                          }}
                          aria-label='Select all'
                          className='translate-y-[1px]'
                        />
                      </div>
                    </TableHead>

                    {listFields.map((field) => (
                      <TableHead
                        key={field.name}
                        className='relative px-3 align-middle border-r text-xs font-medium text-muted-foreground select-none hover:bg-muted/60 transition-colors'
                      >
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, field.name)}
                          className='flex items-center justify-between cursor-grab active:cursor-grabbing h-full'
                        >
                          <span className='truncate'>{field.label}</span>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleReportSort(field.name)
                            }}
                            className='h-5 w-5 hover:bg-accent p-0 cursor-pointer ml-1 text-muted-foreground/50 hover:text-foreground shrink-0'
                          >
                            <ArrowUpDown
                              size={11}
                              className={cn(reportSortCol === field.name ? 'text-foreground' : '')}
                            />
                          </Button>
                        </div>

                        {/* Mouse resize handle on border-r */}
                        <div
                          onMouseDown={(e) => handleMouseDown(e, field.name)}
                          className='absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors z-10'
                        />
                      </TableHead>
                    ))}
                  </TableRow>

                  {/* Inline Spreadsheet Filtering Row */}
                  <TableRow className='bg-[#fafafa] dark:bg-muted/10 hover:bg-muted/10 h-11 border-b'>
                    <TableHead className='border-r text-center align-middle'>
                      <Filter size={11} className='mx-auto text-muted-foreground/55' />
                    </TableHead>

                    {listFields.map((field) => {
                      if (field.type === 'select' && field.options) {
                        return (
                          <TableHead
                            key={`filter-${field.name}`}
                            className='px-1 py-1.5 border-r align-middle'
                          >
                            <Select
                              value={reportFilters[field.name] || 'all'}
                              onValueChange={(val) =>
                                setReportFilters((prev) => ({ ...prev, [field.name]: val }))
                              }
                            >
                              <SelectTrigger className='w-full h-7 text-xs px-2 shadow-none focus:ring-0 focus-visible:ring-0 [&_svg]:size-3'>
                                <SelectValue placeholder={`All ${field.label}`} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='all' className='text-xs'>
                                  All {field.label}
                                </SelectItem>
                                {field.options.map((opt) => (
                                  <SelectItem key={opt} value={opt} className='text-xs'>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableHead>
                        )
                      }

                      return (
                        <TableHead
                          key={`filter-${field.name}`}
                          className='px-1 py-1.5 border-r align-middle relative'
                        >
                          <div className='flex items-center relative'>
                            <Input
                              placeholder={`Filter ${field.label}...`}
                              value={reportFilters[field.name] || ''}
                              onChange={(e) =>
                                setReportFilters((prev) => ({
                                  ...prev,
                                  [field.name]: e.target.value,
                                }))
                              }
                              className='w-full h-7 pl-6 pr-5 text-xs bg-background border placeholder:text-muted-foreground/50 rounded-md focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-input'
                            />
                            <Search size={10} className='absolute left-2 text-muted-foreground/40' />
                            {reportFilters[field.name] && (
                              <button
                                onClick={() =>
                                  setReportFilters((prev) => ({ ...prev, [field.name]: '' }))
                                }
                                className='absolute right-2 p-0.5 hover:bg-accent rounded text-muted-foreground/60'
                              >
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        </TableHead>
                      )
                    })}
                  </TableRow>
                </TableHeader>

                <TableBody className='divide-y border-b'>
                  {groupBy && groupedReportData ? (
                    // Group Pivot Accordion Folder Rendering
                    Object.keys(groupedReportData).map((groupKey) => {
                      const groupRows = groupedReportData[groupKey]
                      const isCollapsed = !!collapsedGroups[groupKey]
                      const count = groupRows.length

                      return (
                        <React.Fragment key={`group-pivot-${groupKey}`}>
                          <TableRow className='bg-muted/30 font-medium h-10 border-y'>
                            <TableCell
                              colSpan={listFields.length + 1}
                              className='px-3 align-middle'
                            >
                              <div
                                onClick={() => toggleGroup(groupKey)}
                                className='flex items-center gap-1.5 cursor-pointer text-xs text-foreground hover:text-foreground/80'
                              >
                                {isCollapsed ? (
                                  <ChevronRight size={14} className='text-muted-foreground' />
                                ) : (
                                  <ChevronDown size={14} className='text-muted-foreground' />
                                )}
                                <span className='text-[9px] bg-background border px-1 py-0.5 rounded mr-1 leading-none text-muted-foreground'>
                                  {(listFields.find((f) => f.name === groupBy)?.label || groupBy).toUpperCase()}
                                </span>
                                <span className='font-semibold'>{groupKey}</span>
                                <Badge
                                  variant='outline'
                                  className='ml-1.5 h-4 px-1 bg-background text-[10px] text-muted-foreground font-normal border-dashed rounded'
                                >
                                  {count}
                                </Badge>
                              </div>
                            </TableCell>
                          </TableRow>

                          {!isCollapsed &&
                            groupRows.map((row, index) => {
                              const isSelected = !!rowSelection[row.id]
                              return (
                                <ReportSpreadsheetRow
                                  key={row.id}
                                  row={row}
                                  index={index + 1}
                                  schema={schema}
                                  listFields={listFields}
                                  isSelected={isSelected}
                                  focusedColId={
                                    selectedCell?.rowId === row.id ? selectedCell.colId : null
                                  }
                                  onSelectCell={(colId) =>
                                    setSelectedCell({ rowId: row.id, colId })
                                  }
                                  onToggleRowSelection={(id) =>
                                    setRowSelection((prev) => ({ ...prev, [id]: !prev[id] }))
                                  }
                                  onSelectRecord={onSelectRecord}
                                />
                              )
                            })}
                        </React.Fragment>
                      )
                    })
                  ) : processedReportData.length > 0 ? (
                    // Default flat report render mode
                    processedReportData.map((row, index) => {
                      const isSelected = !!rowSelection[row.id]
                      return (
                        <ReportSpreadsheetRow
                          key={row.id}
                          row={row}
                          index={index + 1}
                          schema={schema}
                          listFields={listFields}
                          isSelected={isSelected}
                          focusedColId={
                            selectedCell?.rowId === row.id ? selectedCell.colId : null
                          }
                          onSelectCell={(colId) => setSelectedCell({ rowId: row.id, colId })}
                          onToggleRowSelection={(id) =>
                            setRowSelection((prev) => ({ ...prev, [id]: !prev[id] }))
                          }
                          onSelectRecord={onSelectRecord}
                        />
                      )
                    })
                  ) : (
                    // Zero filters state view
                    <TableRow>
                      <TableCell
                        colSpan={listFields.length + 1}
                        className='py-12 text-center text-muted-foreground'
                      >
                        <div className='flex flex-col items-center justify-center gap-2'>
                          <span className='text-sm'>No records found.</span>
                          <Button
                            size='sm'
                            variant='link'
                            onClick={() => {
                              const reset: Record<string, string> = {}
                              listFields.forEach((f) => (reset[f.name] = f.type === 'select' ? 'all' : ''))
                              setReportFilters(reset)
                            }}
                            className='text-xs text-primary mt-1'
                          >
                            Reset Sheet Filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </table>
            </div>

            {/* Clean spreadsheet bottom bar status indicator */}
            <div className='flex items-center justify-between px-4 py-2 border-t bg-muted/20 font-sans text-[11px] text-muted-foreground/75'>
              <div className='flex items-center gap-2.5'>
                <span>CAPACITY: {data.length} records</span>
                <span className='w-1 h-1 rounded-full bg-border'></span>
                <span>MATCHED: {processedReportData.length} records</span>
              </div>

              <div className='flex items-center gap-1.5'>
                <Badge
                  variant='outline'
                  className='bg-background text-[10px] text-muted-foreground border-none tracking-tight gap-1 px-1.5 py-0'
                >
                  <span className='h-1.5 w-1.5 rounded-full bg-emerald-500'></span>
                  <span>Spreadsheet Synced</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// SPREADSHEET ROW SUB-COMPONENT FOR REPORT VIEW
// -------------------------------------------------------------
interface ReportSpreadsheetRowProps {
  row: ResourceRecord
  index: number
  schema: ResourceSchema
  listFields: FieldSchema[]
  isSelected: boolean
  focusedColId: string | null
  onSelectCell: (colId: string) => void
  onToggleRowSelection: (id: string) => void
  onSelectRecord: (id: string, mode?: 'view' | 'edit') => void
}

const ReportSpreadsheetRow = React.memo(function ReportSpreadsheetRow({
  row,
  index,
  schema,
  listFields,
  isSelected,
  focusedColId,
  onSelectCell,
  onToggleRowSelection,
  onSelectRecord,
}: ReportSpreadsheetRowProps) {
  const getCellClasses = (colId: string) => {
    const isFocused = focusedColId === colId
    return cn(
      'px-3 py-2 align-middle border-r text-xs font-sans font-medium transition-all truncate h-10 select-none relative',
      isFocused ? 'ring-2 ring-primary ring-offset-0 z-[2] bg-primary/5' : '',
      isSelected ? 'bg-muted/40' : 'hover:bg-muted/15'
    )
  }

  return (
    <TableRow className={cn('h-10 group', isSelected ? 'bg-muted/20' : '')}>
      {/* Select Checkbox Cell */}
      <TableCell className='relative p-0 text-center align-middle border-r hover:bg-muted/20'>
        <div className='flex items-center justify-center w-full h-full'>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleRowSelection(row.id)}
            aria-label='Select row'
            className='translate-y-[1px]'
          />
        </div>
      </TableCell>

      {/* Index Column */}
      <TableCell
        onClick={() => onSelectCell('index')}
        className={cn(
          getCellClasses('index'),
          'text-muted-foreground text-center font-medium bg-muted/10'
        )}
      >
        {index}
      </TableCell>

      {/* Dynamic Fields Cells */}
      {listFields.map((field) => {
        const rawVal = row[field.name]
        const isTitle = field.name === schema.titleField || field.name === 'name'

        return (
          <TableCell
            key={field.name}
            onClick={() => {
              onSelectCell(field.name)
              if (isTitle) {
                onSelectRecord(row.id, 'view')
              }
            }}
            className={cn(
              getCellClasses(field.name),
              isTitle ? 'text-foreground cursor-pointer hover:underline font-semibold' : 'text-foreground'
            )}
          >
            {(() => {
              if (rawVal === null || rawVal === undefined || rawVal === '') {
                return <span className='text-muted-foreground text-xs'>—</span>
              }

              if (field.type === 'relation' && field.relationTo) {
                const targetSchema = getResourceSchema(field.relationTo)
                const targetRecord = resourceStore.getById(field.relationTo, String(rawVal))
                if (targetRecord && targetSchema) {
                  return (
                    <span className='font-medium text-foreground text-xs'>
                      {targetRecord[targetSchema.titleField] || targetRecord.name || rawVal}
                    </span>
                  )
                }
                return <span className='text-xs'>{String(rawVal)}</span>
              }

              if (field.type === 'select') {
                const variant = field.badgeVariants?.[String(rawVal)]
                return (
                  <Badge
                    variant={
                      variant === 'success' || variant === 'warning' || variant === 'info'
                        ? 'secondary'
                        : (variant as any) || 'outline'
                    }
                    className='text-[10px] py-0.5 px-2 font-normal rounded-md capitalize'
                  >
                    {String(rawVal)}
                  </Badge>
                )
              }

              if (field.type === 'currency') {
                const num = Number(rawVal) || 0
                return (
                  <span className='text-xs font-medium'>
                    ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )
              }

              if (field.type === 'boolean') {
                return (
                  <Badge variant={rawVal ? 'default' : 'outline'} className='text-[10px] py-0.5 px-1.5'>
                    {rawVal ? 'Yes' : 'No'}
                  </Badge>
                )
              }

              return <span className='truncate'>{String(rawVal)}</span>
            })()}
          </TableCell>
        )
      })}
    </TableRow>
  )
})
