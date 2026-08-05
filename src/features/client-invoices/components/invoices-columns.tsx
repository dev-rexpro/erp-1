import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { callTypes, roles } from '../data/data'
import { type Invoice } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useInvoices } from './invoices-provider'

const InvoiceNumberCell = ({ row }: { row: { original: Invoice } }) => {
  const { setSelectedInvoiceId } = useInvoices()
  return (
    <span
      onClick={() => setSelectedInvoiceId(row.original.id)}
      className='cursor-pointer hover:underline font-medium block max-w-36 ps-3'
    >
      {row.original.username}
    </span>
  )
}

export const invoicesColumns: ColumnDef<Invoice>[] = [
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
      <DataTableColumnHeader column={column} title='Invoice Number' />
    ),
    cell: ({ row }) => <InvoiceNumberCell row={row} />,
    meta: {
      title: 'Invoice Number',
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
      <DataTableColumnHeader column={column} title='Client Name' />
    ),
    cell: ({ row }) => (
      <span className='font-medium block max-w-36 ps-3'>
        <LongText>{row.original.firstName}</LongText>
      </span>
    ),
    meta: { title: 'Client Name', className: 'w-36' },
    enableHiding: true,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Invoice Type' />
    ),
    cell: ({ row }) => {
      const { role } = row.original
      const invType = roles.find(({ value }) => value === role)

      if (!invType) {
        return null
      }

      return (
        <div className='flex items-center gap-x-2'>
          <span className='text-sm capitalize'>{invType.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: { title: 'Invoice Type' },
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
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Due Date' />
    ),
    cell: ({ row }) => (
      <div className='text-sm tabular-nums text-muted-foreground'>{row.getValue('dueDate')}</div>
    ),
    meta: { title: 'Due Date' },
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
        active: 'Paid',
        inactive: 'Overdue',
        invited: 'Draft',
        suspended: 'Canceled',
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
