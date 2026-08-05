import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { callTypes, roles } from '../data/data'
import { type PackingList } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { usePackingLists } from './packing-lists-provider'

const PackingListNoCell = ({ row }: { row: { original: PackingList } }) => {
  const { setSelectedPackingListId } = usePackingLists()
  return (
    <span
      onClick={() => setSelectedPackingListId(row.original.id)}
      className='cursor-pointer hover:underline font-medium block max-w-36 ps-3'
    >
      <LongText>{row.original.username}</LongText>
    </span>
  )
}

export const packingListsColumns: ColumnDef<PackingList>[] = [
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
      <DataTableColumnHeader column={column} title='Packing List No' />
    ),
    cell: ({ row }) => <PackingListNoCell row={row} />,
    meta: {
      title: 'Packing List No',
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
      <DataTableColumnHeader column={column} title='Packaging Format' />
    ),
    cell: ({ row }) => {
      const { role } = row.original
      const carrier = roles.find(({ value }) => value === role)

      if (!carrier) {
        return null
      }

      const Icon = carrier.icon

      return (
        <div className='flex items-center gap-x-2'>
          <Icon className='size-4 text-muted-foreground' />
          <span className='text-sm capitalize'>{carrier.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: { title: 'Packaging Format' },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Packages' />
    ),
    cell: ({ row }) => (
      <div className='text-sm font-medium text-foreground'>{row.getValue('amount')}</div>
    ),
    meta: { title: 'Packages' },
    enableHiding: true,
  },
  {
    accessorKey: 'validUntil',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Packing Date' />
    ),
    cell: ({ row }) => (
      <div className='text-sm tabular-nums text-muted-foreground'>{row.getValue('validUntil')}</div>
    ),
    meta: { title: 'Packing Date' },
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
        active: 'Approved',
        inactive: 'Received',
        invited: 'Draft',
        suspended: 'Shipped',
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
