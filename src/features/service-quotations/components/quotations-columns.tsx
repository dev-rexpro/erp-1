/* eslint-disable react-refresh/only-export-components */
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { callTypes, roles } from '../data/data'
import { type Quotation } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useQuotations } from './quotations-provider'

const QuotationNoCell = ({ row }: { row: { original: Quotation } }) => {
  const { setSelectedQuotationId } = useQuotations()
  return (
    <span
      onClick={() => setSelectedQuotationId(row.original.id)}
      className='cursor-pointer hover:underline font-medium block max-w-36 ps-3'
    >
      <LongText>{row.original.username}</LongText>
    </span>
  )
}

export const quotationsColumns: ColumnDef<Quotation>[] = [
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
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
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
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Quotation No' />
    ),
    cell: ({ row }) => <QuotationNoCell row={row} />,
    meta: {
      title: 'Quotation No',
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    id: 'fullName',
    accessorFn: (row) => row.firstName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Client Account' />
    ),
    cell: ({ row }) => (
      <span className='font-medium'>{row.original.firstName}</span>
    ),
    meta: { title: 'Client Account', className: 'w-36' },
    enableHiding: true,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Service Type' />
    ),
    cell: ({ row }) => {
      const { role } = row.original
      const serviceType = roles.find(({ value }) => value === role)

      if (!serviceType) {
        return null
      }

      return (
        <div className='flex items-center gap-x-2'>
          <span className='text-sm capitalize'>{serviceType.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: { title: 'Service Type' },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Value' />
    ),
    cell: ({ row }) => (
      <div className='text-sm font-medium text-foreground'>{row.getValue('amount')}</div>
    ),
    meta: { title: 'Total Value' },
    enableHiding: true,
  },
  {
    accessorKey: 'validUntil',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valid Until' />
    ),
    cell: ({ row }) => (
      <div className='text-sm tabular-nums text-muted-foreground'>{row.getValue('validUntil')}</div>
    ),
    meta: { title: 'Valid Until' },
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      const badgeColor = callTypes.get(status)
      const labelMap: Record<string, string> = {
        active: 'Accepted',
        inactive: 'Expired',
        invited: 'Draft',
        suspended: 'Rejected',
      }
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {labelMap[status] || status}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: { title: 'Status' },
    enableHiding: true,
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
