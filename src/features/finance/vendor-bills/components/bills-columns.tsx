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
import { useBills } from './bills-provider'
import { type VendorBillItem } from '../../data/finance-data'

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

const BillNumberCell = ({ row }: { row: { original: VendorBillItem } }) => {
  const { setSelectedBillId } = useBills()
  return (
    <span
      onClick={() => setSelectedBillId(row.original.id)}
      className='cursor-pointer hover:underline font-semibold text-slate-900 dark:text-slate-100 block'
    >
      {row.original.billNumber}
    </span>
  )
}

export const billsColumns: ColumnDef<VendorBillItem>[] = [
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
    cell: ({ row }) => <BillNumberCell row={row} />,
    meta: { title: 'Bill Number' },
    enableHiding: false,
  },
  {
    accessorKey: 'vendorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendor Name' />
    ),
    cell: ({ row }) => (
      <span className='font-medium text-slate-800 dark:text-slate-200 block max-w-44'>
        <LongText>{row.original.vendorName}</LongText>
      </span>
    ),
    meta: { title: 'Vendor Name' },
    enableHiding: true,
  },
  {
    accessorKey: 'vendorCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendor Code' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-slate-500 font-medium'>
        {row.original.vendorCode}
      </span>
    ),
    meta: { title: 'Vendor Code' },
    enableHiding: true,
  },
  {
    accessorKey: 'poReference',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PO Ref' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-slate-600 dark:text-slate-400 font-medium'>
        {row.original.poReference}
      </span>
    ),
    meta: { title: 'PO Ref' },
    enableHiding: true,
  },
  {
    accessorKey: 'shipmentRef',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shipment Ref' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-slate-600 dark:text-slate-400'>
        {row.original.shipmentRef}
      </span>
    ),
    meta: { title: 'Shipment Ref' },
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
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Gross Amount' />
    ),
    cell: ({ row }) => (
      <div className='text-right font-medium text-slate-900 dark:text-slate-100 tabular-nums'>
        {formatCurrency(row.original.totalAmount)}
      </div>
    ),
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
    cell: ({ row }) => {
      const { setSelectedBillId } = useBills()
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
      )
    },
  },
]
