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
  BookOpen,
  CheckCircle2,
  FileCheck2,
  MoreVertical,
  Edit,
  FileText,
  RotateCcw,
  Scale,
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

import { useGL } from './general-ledger/components/gl-provider'
import { mockGeneralLedger, GeneralLedgerEntry } from './data/finance-data'

export function GeneralLedger() {
  const { setSelectedVoucherId } = useGL()
  const [data] = useState<GeneralLedgerEntry[]>(mockGeneralLedger)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<any[]>([])

  // KPI Calculations
  const totalDebit = data.reduce((acc, i) => acc + i.debit, 0)
  const totalCredit = data.reduce((acc, i) => acc + i.credit, 0)
  const isBalanced = totalDebit === totalCredit
  const postedCount = data.filter((i) => i.status === 'Posted').length

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Column Definitions
  const columns: ColumnDef<GeneralLedgerEntry>[] = [
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
      accessorKey: 'voucherNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Voucher No' />
      ),
      cell: ({ row }) => (
        <span
          onClick={() => setSelectedVoucherId(row.original.id)}
          className='cursor-pointer hover:underline font-semibold text-slate-900 dark:text-slate-100 block'
        >
          <div>{row.original.voucherNo}</div>
          <div className='text-xs text-slate-400 font-normal'>{row.original.id}</div>
        </span>
      ),
      meta: { title: 'Voucher No' },
      enableHiding: false,
    },
    {
      accessorKey: 'postingDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Posting Date' />
      ),
      cell: ({ row }) => (
        <div className='text-sm text-slate-600 dark:text-slate-400 tabular-nums'>
          <div>{row.original.postingDate}</div>
          <div className='text-xs text-slate-400'>Period: {row.original.period}</div>
        </div>
      ),
      meta: { title: 'Posting Date' },
      enableHiding: true,
    },
    {
      accessorKey: 'accountCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Account Code & Name' />
      ),
      cell: ({ row }) => (
        <div>
          <div className='font-medium text-slate-800 dark:text-slate-200'>{row.original.accountName}</div>
          <div className='text-xs text-slate-400'>{row.original.accountCode} • {row.original.reference}</div>
        </div>
      ),
      meta: { title: 'Account Code & Name' },
      enableHiding: true,
    },
    {
      accessorKey: 'debit',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Debit (USD)' />
      ),
      cell: ({ row }) => (
        <div className='text-right font-medium text-slate-900 dark:text-slate-100'>
          {row.original.debit > 0 ? formatCurrency(row.original.debit) : '—'}
        </div>
      ),
      meta: { title: 'Debit (USD)' },
      enableHiding: true,
    },
    {
      accessorKey: 'credit',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Credit (USD)' />
      ),
      cell: ({ row }) => (
        <div className='text-right font-medium text-slate-900 dark:text-slate-100'>
          {row.original.credit > 0 ? formatCurrency(row.original.credit) : '—'}
        </div>
      ),
      meta: { title: 'Credit (USD)' },
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
          s === 'Posted'
            ? 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            : s === 'Unposted'
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
            <DropdownMenuItem onClick={() => setSelectedVoucherId(row.original.id)} className='gap-2 text-xs cursor-pointer'>
              <Edit className='size-3.5' /> View Detail
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.print()} className='gap-2 text-xs cursor-pointer'>
              <FileText className='size-3.5' /> Print Ledger Entry
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}} className='gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300'>
              <RotateCcw className='size-3.5' /> Post Reversing Voucher
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
              Total Ledger Debit
            </CardTitle>
            <BookOpen className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {formatCurrency(totalDebit)}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Total posted debit entries</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Total Ledger Credit
            </CardTitle>
            <FileCheck2 className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {formatCurrency(totalCredit)}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Total posted credit entries</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Double-Entry Trial Balance
            </CardTitle>
            <Scale className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2'>
              {isBalanced ? (
                <>
                  <span>Zero Difference</span>
                  <Badge variant='outline' className='border-slate-300 bg-slate-100 text-slate-800 text-[10px]'>
                    Balanced
                  </Badge>
                </>
              ) : (
                'Unbalanced'
              )}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Debit equals Credit validation</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
              Posted Vouchers
            </CardTitle>
            <CheckCircle2 className='size-4 text-slate-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {postedCount} Vouchers
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Immutable period entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Standard DataTableToolbar with View button */}
      <DataTableToolbar
        table={table}
        searchKey='voucherNo'
        searchPlaceholder='Filter voucher, account code...'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Posted', value: 'Posted' },
              { label: 'Unposted', value: 'Unposted' },
              { label: 'Reversed', value: 'Reversed' },
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
                  No journal voucher records found.
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
