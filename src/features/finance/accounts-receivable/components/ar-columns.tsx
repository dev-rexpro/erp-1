import { type ColumnDef } from '@tanstack/react-table'
import { MoreVertical, Edit, CreditCard, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { useAR } from './ar-provider'
import { type AccountsReceivableItem } from '../../data/finance-data'

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

const InvoiceNumberCell = ({ row }: { row: { original: AccountsReceivableItem } }) => {
  const { setSelectedArId } = useAR()
  return (
    <span
      onClick={() => setSelectedArId(row.original.id)}
      className='cursor-pointer hover:underline font-semibold text-slate-900 dark:text-slate-100 block'
    >
      {row.original.invoiceNumber}
    </span>
  )
}

export const arColumns: ColumnDef<AccountsReceivableItem>[] = [
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
      <DataTableColumnHeader column={column} title='Invoice Number' />
    ),
    cell: ({ row }) => <InvoiceNumberCell row={row} />,
    meta: { title: 'Invoice Number' },
    enableHiding: false,
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer Name' />
    ),
    cell: ({ row }) => (
      <span className='font-medium text-slate-800 dark:text-slate-200 block max-w-44'>
        <LongText>{row.original.customerName}</LongText>
      </span>
    ),
    meta: { title: 'Customer Name' },
    enableHiding: true,
  },
  {
    accessorKey: 'customerCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer Code' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-slate-600 dark:text-slate-400 font-medium'>
        {row.original.customerCode}
      </span>
    ),
    meta: { title: 'Customer Code' },
    enableHiding: true,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Due Date' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-slate-600 dark:text-slate-400 tabular-nums'>
        {row.original.dueDate}
      </span>
    ),
    meta: { title: 'Due Date' },
    enableHiding: true,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Amount' />
    ),
    cell: ({ row }) => (
      <div className='text-right font-medium tabular-nums'>
        {formatCurrency(row.original.amount)}
      </div>
    ),
    meta: { title: 'Total Amount' },
    enableHiding: true,
  },
  {
    accessorKey: 'paidAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Paid' />
    ),
    cell: ({ row }) => (
      <div className='text-right text-slate-600 dark:text-slate-400 tabular-nums'>
        {formatCurrency(row.original.paidAmount)}
      </div>
    ),
    meta: { title: 'Paid' },
    enableHiding: true,
  },
  {
    accessorKey: 'balanceDue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Balance Due' />
    ),
    cell: ({ row }) => (
      <div className='text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums'>
        {formatCurrency(row.original.balanceDue)}
      </div>
    ),
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
    cell: ({ row }) => {
      const { setSelectedArId } = useAR()
      return (
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
      )
    },
  },
]
