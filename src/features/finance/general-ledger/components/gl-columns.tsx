import { type ColumnDef } from '@tanstack/react-table'
import { MoreVertical, Edit, FileText, RotateCcw } from 'lucide-react'
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
import { useGL } from './gl-provider'
import { type GeneralLedgerEntry } from '../../data/finance-data'

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

const VoucherNoCell = ({ row }: { row: { original: GeneralLedgerEntry } }) => {
  const { setSelectedVoucherId } = useGL()
  return (
    <span
      onClick={() => setSelectedVoucherId(row.original.id)}
      className='cursor-pointer hover:underline font-semibold text-slate-900 dark:text-slate-100 block'
    >
      {row.original.voucherNo}
    </span>
  )
}

export const glColumns: ColumnDef<GeneralLedgerEntry>[] = [
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
    cell: ({ row }) => <VoucherNoCell row={row} />,
    meta: { title: 'Voucher No' },
    enableHiding: false,
  },
  {
    accessorKey: 'postingDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Posting Date' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-slate-600 dark:text-slate-400 tabular-nums'>
        {row.original.postingDate}
      </span>
    ),
    meta: { title: 'Posting Date' },
    enableHiding: true,
  },
  {
    accessorKey: 'period',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Period' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-slate-500 font-medium'>
        {row.original.period}
      </span>
    ),
    meta: { title: 'Period' },
    enableHiding: true,
  },
  {
    accessorKey: 'accountCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Account Code' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-slate-600 dark:text-slate-400 font-medium'>
        {row.original.accountCode}
      </span>
    ),
    meta: { title: 'Account Code' },
    enableHiding: true,
  },
  {
    accessorKey: 'accountName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Account Name' />
    ),
    cell: ({ row }) => (
      <span className='font-medium text-slate-800 dark:text-slate-200 block max-w-44'>
        <LongText>{row.original.accountName}</LongText>
      </span>
    ),
    meta: { title: 'Account Name' },
    enableHiding: true,
  },
  {
    accessorKey: 'reference',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reference' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-slate-500'>
        {row.original.reference}
      </span>
    ),
    meta: { title: 'Reference' },
    enableHiding: true,
  },
  {
    accessorKey: 'debit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Debit (USD)' />
    ),
    cell: ({ row }) => (
      <div className='text-right font-medium text-slate-900 dark:text-slate-100 tabular-nums'>
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
      <div className='text-right font-medium text-slate-900 dark:text-slate-100 tabular-nums'>
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
    cell: ({ row }) => {
      const { setSelectedVoucherId } = useGL()
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
      )
    },
  },
]
