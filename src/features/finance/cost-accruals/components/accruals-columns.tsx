import { type ColumnDef } from '@tanstack/react-table'
import { MoreVertical, Edit, RefreshCw, RotateCcw } from 'lucide-react'
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
import { useAccruals } from './accruals-provider'
import { type CostAccrualItem } from '../../data/finance-data'

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

const AccrualIdCell = ({ row }: { row: { original: CostAccrualItem } }) => {
  const { setSelectedAccrualId } = useAccruals()
  return (
    <span
      onClick={() => setSelectedAccrualId(row.original.id)}
      className='cursor-pointer hover:underline font-semibold text-slate-900 dark:text-slate-100 block'
    >
      {row.original.id}
    </span>
  )
}

export const accrualsColumns: ColumnDef<CostAccrualItem>[] = [
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
    cell: ({ row }) => <AccrualIdCell row={row} />,
    meta: { title: 'Accrual ID' },
    enableHiding: false,
  },
  {
    accessorKey: 'accrualDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Accrual Date' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-slate-600 dark:text-slate-400 tabular-nums'>
        {row.original.accrualDate}
      </span>
    ),
    meta: { title: 'Accrual Date' },
    enableHiding: true,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cost Category' />
    ),
    cell: ({ row }) => (
      <span className='font-medium text-slate-800 dark:text-slate-200 block max-w-44'>
        <LongText>{row.original.category}</LongText>
      </span>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    meta: { title: 'Cost Category' },
    enableHiding: true,
  },
  {
    accessorKey: 'vendorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendor Name' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-slate-600 dark:text-slate-400 block max-w-36'>
        <LongText>{row.original.vendorName}</LongText>
      </span>
    ),
    meta: { title: 'Vendor Name' },
    enableHiding: true,
  },
  {
    accessorKey: 'shipmentRef',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shipment Ref' />
    ),
    cell: ({ row }) => (
      <span className='text-sm font-medium text-slate-800 dark:text-slate-200'>
        {row.original.shipmentRef}
      </span>
    ),
    meta: { title: 'Shipment Ref' },
    enableHiding: true,
  },
  {
    accessorKey: 'blNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='B/L Number' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-slate-500 font-medium'>
        {row.original.blNumber}
      </span>
    ),
    meta: { title: 'B/L Number' },
    enableHiding: true,
  },
  {
    accessorKey: 'estimatedAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Est. Provision' />
    ),
    cell: ({ row }) => (
      <div className='text-right font-medium text-slate-900 dark:text-slate-100 tabular-nums'>
        {formatCurrency(row.original.estimatedAmount)}
      </div>
    ),
    meta: { title: 'Est. Provision' },
    enableHiding: true,
  },
  {
    accessorKey: 'actualAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actual Bill' />
    ),
    cell: ({ row }) => (
      <div className='text-right text-slate-600 dark:text-slate-400 tabular-nums'>
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
        <div className={`text-right font-semibold tabular-nums ${isFavorable ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
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
    cell: ({ row }) => {
      const { setSelectedAccrualId } = useAccruals()
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
      )
    },
  },
]
