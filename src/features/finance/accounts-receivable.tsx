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
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  CreditCard,
  Edit,
  RotateCcw,
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

import { useAR } from './accounts-receivable/components/ar-provider'
import { mockAccountsReceivable, AccountsReceivableItem } from './data/finance-data'

export function AccountsReceivable() {
  const { setSelectedArId } = useAR()
  const [data] = useState<AccountsReceivableItem[]>(mockAccountsReceivable)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<any[]>([])

  // KPI Calculations
  const totalOutstanding = data.reduce((acc, i) => acc + i.balanceDue, 0)
  const totalOverdue = data
    .filter((i) => i.status === 'Overdue' || i.status === 'Disputed')
    .reduce((acc, i) => acc + i.balanceDue, 0)
  const totalCurrent = data
    .filter((i) => i.status === 'Current' || i.status === 'Paid')
    .reduce((acc, i) => acc + i.balanceDue, 0)
  const avgDso = 32

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Column Definitions
  const columns: ColumnDef<AccountsReceivableItem>[] = [
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
      accessorKey: 'invoiceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='AR ID / Invoice' />
      ),
      cell: ({ row }) => (
        <span
          onClick={() => setSelectedArId(row.original.id)}
          className='cursor-pointer hover:underline font-semibold text-slate-900 dark:text-slate-100 block'
        >
          <div>{row.original.invoiceNumber}</div>
          <div className='text-xs text-slate-400 font-normal'>{row.original.id}</div>
        </span>
      ),
      meta: { title: 'AR ID / Invoice' },
      enableHiding: false,
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Customer' />
      ),
      cell: ({ row }) => (
        <div>
          <div className='font-medium text-slate-800 dark:text-slate-200'>{row.original.customerName}</div>
          <div className='text-xs text-slate-400'>{row.original.customerCode} • {row.original.paymentTerms}</div>
        </div>
      ),
      meta: { title: 'Customer' },
      enableHiding: true,
    },
    {
      accessorKey: 'dueDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Due Date' />
      ),
      cell: ({ row }) => <span className='text-slate-600 dark:text-slate-400 tabular-nums'>{row.original.dueDate}</span>,
      meta: { title: 'Due Date' },
      enableHiding: true,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Total Amount' />
      ),
      cell: ({ row }) => <div className='text-right font-medium'>{formatCurrency(row.original.amount)}</div>,
      meta: { title: 'Total Amount' },
      enableHiding: true,
    },
    {
      accessorKey: 'paidAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Paid' />
      ),
      cell: ({ row }) => <div className='text-right text-slate-600 dark:text-slate-400'>{formatCurrency(row.original.paidAmount)}</div>,
      meta: { title: 'Paid' },
      enableHiding: true,
    },
    {
      accessorKey: 'balanceDue',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Balance Due' />
      ),
      cell: ({ row }) => <div className='text-right font-bold text-slate-900 dark:text-slate-100'>{formatCurrency(row.original.balanceDue)}</div>,
      meta: { title: 'Balance Due' },
      enableHiding: true,
    },
    {
      accessorKey: 'agingCategory',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Aging' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline' className='border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 font-normal'>
          {row.original.agingCategory}
        </Badge>
      ),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: { title: 'Aging' },
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
          s === 'Paid'
            ? 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            : s === 'Overdue'
            ? 'border-slate-400 bg-slate-200 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100'
            : s === 'Partial'
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
            <DropdownMenuItem onClick={() => setSelectedArId(row.original.id)} className='gap-2 text-xs cursor-pointer'>
              <Edit className='size-3.5' /> View Detail
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className='gap-2 text-xs cursor-pointer'>
              <CreditCard className='size-3.5' /> Record Payment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className='gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300'>
              <RotateCcw className='size-3.5' /> Request Cancellation
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
              Total AR Balance
            </CardTitle>
            <DollarSign className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {formatCurrency(totalOutstanding)}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Across {data.length} client invoices</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Overdue Outstanding
            </CardTitle>
            <AlertCircle className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {formatCurrency(totalOverdue)}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Past credit due dates</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Current / Not Due
            </CardTitle>
            <CheckCircle2 className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {formatCurrency(totalCurrent)}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Within payment term limits</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Avg DSO (Days)
            </CardTitle>
            <Clock className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {avgDso} Days
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Benchmark target: 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Standard DataTableToolbar with View button */}
      <DataTableToolbar
        table={table}
        searchKey='invoiceNumber'
        searchPlaceholder='Filter customer, invoice...'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Current', value: 'Current' },
              { label: 'Overdue', value: 'Overdue' },
              { label: 'Partial', value: 'Partial' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Disputed', value: 'Disputed' },
            ],
          },
          {
            columnId: 'agingCategory',
            title: 'Aging',
            options: [
              { label: 'Current', value: 'Current' },
              { label: '1-30 Days', value: '1-30 Days' },
              { label: '31-60 Days', value: '31-60 Days' },
              { label: '61-90 Days', value: '61-90 Days' },
              { label: '90+ Days', value: '90+ Days' },
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
                  No accounts receivable records found.
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
