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
  CheckCircle2,
  FileCheck,
  DollarSign,
  Clock,
  MoreVertical,
  Edit,
  CreditCard,
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

import { useBills } from './vendor-bills/components/bills-provider'
import { mockVendorBills, VendorBillItem } from './data/finance-data'

export function VendorBills() {
  const { setSelectedBillId } = useBills()
  const [data] = useState<VendorBillItem[]>(mockVendorBills)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<any[]>([])

  // KPI calculations
  const totalApOutstanding = data
    .filter((i) => i.paymentStatus !== 'Paid')
    .reduce((acc, i) => acc + i.totalAmount, 0)
  const approvedForPayment = data
    .filter((i) => i.approvalStatus === 'Approved' && i.paymentStatus !== 'Paid')
    .reduce((acc, i) => acc + i.totalAmount, 0)
  const pendingApprovalCount = data.filter((i) => i.approvalStatus === 'Pending Approval').length
  const paidThisMonth = data
    .filter((i) => i.paymentStatus === 'Paid')
    .reduce((acc, i) => acc + i.totalAmount, 0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Column Definitions
  const columns: ColumnDef<VendorBillItem>[] = [
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
      accessorKey: 'billNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Bill Number' />
      ),
      cell: ({ row }) => (
        <span
          onClick={() => setSelectedBillId(row.original.id)}
          className='cursor-pointer hover:underline font-semibold text-slate-900 dark:text-slate-100 block'
        >
          <div>{row.original.billNumber}</div>
          <div className='text-xs text-slate-400 font-normal'>{row.original.id}</div>
        </span>
      ),
      meta: { title: 'Bill Number' },
      enableHiding: false,
    },
    {
      accessorKey: 'vendorName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Vendor & Code' />
      ),
      cell: ({ row }) => (
        <div>
          <div className='font-medium text-slate-800 dark:text-slate-200'>{row.original.vendorName}</div>
          <div className='text-xs text-slate-400'>{row.original.vendorCode}</div>
        </div>
      ),
      meta: { title: 'Vendor & Code' },
      enableHiding: true,
    },
    {
      accessorKey: 'poReference',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='PO / Shipment Ref' />
      ),
      cell: ({ row }) => (
        <div className='text-sm text-slate-600 dark:text-slate-400'>
          <div>{row.original.poReference}</div>
          <div className='text-xs text-slate-400'>{row.original.shipmentRef}</div>
        </div>
      ),
      meta: { title: 'PO / Shipment Ref' },
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
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Gross Amount' />
      ),
      cell: ({ row }) => <div className='text-right font-medium text-slate-900 dark:text-slate-100'>{formatCurrency(row.original.totalAmount)}</div>,
      meta: { title: 'Gross Amount' },
      enableHiding: true,
    },
    {
      accessorKey: 'approvalStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Approval' />
      ),
      cell: ({ row }) => {
        const a = row.original.approvalStatus
        const badgeStyle =
          a === 'Approved'
            ? 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            : a === 'Pending Approval'
            ? 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            : 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300'

        return (
          <Badge variant='outline' className={badgeStyle}>
            {a}
          </Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: { title: 'Approval' },
      enableHiding: true,
    },
    {
      accessorKey: 'paymentStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Payment' />
      ),
      cell: ({ row }) => {
        const p = row.original.paymentStatus
        const badgeStyle =
          p === 'Paid'
            ? 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            : p === 'Scheduled'
            ? 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            : 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300'

        return (
          <Badge variant='outline' className={badgeStyle}>
            {p}
          </Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      meta: { title: 'Payment' },
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
            <DropdownMenuItem onClick={() => setSelectedBillId(row.original.id)} className='gap-2 text-xs cursor-pointer'>
              <Edit className='size-3.5' /> View Detail
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className='gap-2 text-xs cursor-pointer'>
              <CreditCard className='size-3.5' /> Process Payment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className='gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300'>
              <RotateCcw className='size-3.5' /> Request Credit Memo
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
              AP Outstanding
            </CardTitle>
            <DollarSign className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {formatCurrency(totalApOutstanding)}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Unpaid carrier & vendor bills</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Approved for Payment
            </CardTitle>
            <CheckCircle2 className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {formatCurrency(approvedForPayment)}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Ready for bank disbursement</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Pending Approval
            </CardTitle>
            <Clock className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {pendingApprovalCount} Bills
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Awaiting 3-way PO verification</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Paid This Month
            </CardTitle>
            <FileCheck className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {formatCurrency(paidThisMonth)}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Settled disbursements</p>
          </CardContent>
        </Card>
      </div>

      {/* Standard DataTableToolbar with View button */}
      <DataTableToolbar
        table={table}
        searchKey='billNumber'
        searchPlaceholder='Filter bill no, vendor...'
        filters={[
          {
            columnId: 'approvalStatus',
            title: 'Approval',
            options: [
              { label: 'Approved', value: 'Approved' },
              { label: 'Pending Approval', value: 'Pending Approval' },
              { label: 'Draft', value: 'Draft' },
            ],
          },
          {
            columnId: 'paymentStatus',
            title: 'Payment',
            options: [
              { label: 'Unpaid', value: 'Unpaid' },
              { label: 'Scheduled', value: 'Scheduled' },
              { label: 'Partial', value: 'Partial' },
              { label: 'Paid', value: 'Paid' },
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
                  No vendor bill records found.
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
