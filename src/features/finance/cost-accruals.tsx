import { useState } from 'react'
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
import {
  Anchor,
  AlertCircle,
  FileCheck2,
  TrendingUp,
  MoreVertical,
  Edit,
  RotateCcw,
  RefreshCw,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { DataTableColumnHeader, DataTablePagination, DataTableToolbar } from '@/components/data-table'

import { useAccruals } from './cost-accruals/components/accruals-provider'
import { mockCostAccruals, CostAccrualItem } from './data/finance-data'

export function CostAccruals() {
  const { setSelectedAccrualId } = useAccruals()
  const [data] = useState<CostAccrualItem[]>(mockCostAccruals)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<any[]>([])

  // KPI Calculations
  const totalProvisioned = data.reduce((acc, i) => acc + i.estimatedAmount, 0)
  const pendingCount = data.filter((i) => i.status === 'Provisioned' || i.status === 'Partially Reconciled').length
  const totalReconciled = data
    .filter((i) => i.actualAmount !== null)
    .reduce((acc, i) => acc + (i.actualAmount || 0), 0)
  const totalVariance = data
    .filter((i) => i.variance !== null)
    .reduce((acc, i) => acc + (i.variance || 0), 0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Column Definitions
  const columns: ColumnDef<CostAccrualItem>[] = [
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
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Accrual ID' />
      ),
      cell: ({ row }) => (
        <span
          onClick={() => setSelectedAccrualId(row.original.id)}
          className='cursor-pointer hover:underline font-semibold text-slate-900 dark:text-slate-100 block'
        >
          <div>{row.original.id}</div>
          <div className='text-xs text-slate-400 font-normal'>{row.original.accrualDate}</div>
        </span>
      ),
      meta: { title: 'Accrual ID' },
      enableHiding: false,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Cost Head & Vendor' />
      ),
      cell: ({ row }) => (
        <div>
          <div className='font-medium text-slate-800 dark:text-slate-200'>{row.original.category}</div>
          <div className='text-xs text-slate-400'>{row.original.vendorName}</div>
        </div>
      ),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: { title: 'Cost Head & Vendor' },
      enableHiding: true,
    },
    {
      accessorKey: 'shipmentRef',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Shipment / BL Ref' />
      ),
      cell: ({ row }) => (
        <div className='text-sm text-slate-600 dark:text-slate-400'>
          <div>{row.original.shipmentRef}</div>
          <div className='text-xs text-slate-400'>{row.original.blNumber}</div>
        </div>
      ),
      meta: { title: 'Shipment / BL Ref' },
      enableHiding: true,
    },
    {
      accessorKey: 'estimatedAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Est. Provision' />
      ),
      cell: ({ row }) => <div className='text-right font-medium text-slate-900 dark:text-slate-100'>{formatCurrency(row.original.estimatedAmount)}</div>,
      meta: { title: 'Est. Provision' },
      enableHiding: true,
    },
    {
      accessorKey: 'actualAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Actual Bill' />
      ),
      cell: ({ row }) => (
        <div className='text-right text-slate-600 dark:text-slate-400'>
          {row.original.actualAmount !== null ? formatCurrency(row.original.actualAmount) : '—'}
        </div>
      ),
      meta: { title: 'Actual Bill' },
      enableHiding: true,
    },
    {
      accessorKey: 'variance',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Variance' />
      ),
      cell: ({ row }) => {
        const v = row.original.variance
        if (v === null) return <div className='text-right text-slate-400'>—</div>
        const isFavorable = v <= 0
        return (
          <div className={`text-right font-semibold ${isFavorable ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
            {v > 0 ? `+${formatCurrency(v)}` : formatCurrency(v)}
          </div>
        )
      },
      meta: { title: 'Variance' },
      enableHiding: true,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const s = row.original.status
        const badgeStyle =
          s === 'Fully Reconciled'
            ? 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            : s === 'Partially Reconciled'
            ? 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            : 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300'

        return (
          <Badge variant='outline' className={badgeStyle}>
            {s}
          </Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: { title: 'Status' },
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
              <MoreVertical className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-44'>
            <DropdownMenuLabel className='text-xs'>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSelectedAccrualId(row.original.id)} className='gap-2 text-xs cursor-pointer'>
              <Edit className='size-3.5' /> View Detail
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className='gap-2 text-xs cursor-pointer'>
              <RefreshCw className='size-3.5' /> Reconcile Bill
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className='gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300'>
              <RotateCcw className='size-3.5' /> Request Reversal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className='flex flex-1 flex-col gap-4 sm:gap-6'>
      {/* Slate/Grey KPI Summary Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Total Provisioned
            </CardTitle>
            <Anchor className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {formatCurrency(totalProvisioned)}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Estimated operational costs</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Pending Reconciliations
            </CardTitle>
            <AlertCircle className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {pendingCount} Accruals
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Awaiting vendor final bills</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Reconciled Amount
            </CardTitle>
            <FileCheck2 className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {formatCurrency(totalReconciled)}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Matched against vendor bills</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Net Cost Variance
            </CardTitle>
            <TrendingUp className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {totalVariance > 0 ? `+${formatCurrency(totalVariance)}` : formatCurrency(totalVariance)}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Difference vs original estimate</p>
          </CardContent>
        </Card>
      </div>

      {/* Standard DataTableToolbar with View button */}
      <DataTableToolbar
        table={table}
        searchKey='id'
        searchPlaceholder='Filter accrual ID, vendor...'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Provisioned', value: 'Provisioned' },
              { label: 'Partially Reconciled', value: 'Partially Reconciled' },
              { label: 'Fully Reconciled', value: 'Fully Reconciled' },
            ],
          },
          {
            columnId: 'category',
            title: 'Category',
            options: [
              { label: 'Ocean Freight Provision', value: 'Ocean Freight Provision' },
              { label: 'Port Terminal Handling', value: 'Port Terminal Handling' },
              { label: 'Customs Duties & Clearing', value: 'Customs Duties & Clearing' },
              { label: 'Feeder Barge Freight', value: 'Feeder Barge Freight' },
              { label: 'Trucking & Drayage', value: 'Trucking & Drayage' },
            ],
          },
        ]}
      />

      {/* Standard TanStack Table Container */}
      <div className='overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-background shadow-sm'>
        <Table>
          <TableHeader className='bg-slate-100/70 dark:bg-slate-800/70'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='border-slate-200 dark:border-slate-800'>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
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
                  className='border-slate-200 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-900/70'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center text-slate-500'>
                  No cost accrual records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Standard DataTablePagination */}
      <DataTablePagination table={table} />
    </div>
  )
}
