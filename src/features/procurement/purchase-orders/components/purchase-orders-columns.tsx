import { type ColumnDef } from '@tanstack/react-table'
import { MoreVertical, Edit, FileText, Trash2, ExternalLink } from 'lucide-react'
import { type PurchaseOrderItem } from '../../data/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { usePurchaseOrders } from './purchase-orders-provider'
import { toast } from 'sonner'

const poStatusBadgeStyles: Record<string, string> = {
  Approved: 'border-slate-400 bg-slate-200 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100',
  Completed: 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'Pending Approval': 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  Issued: 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
  Revision: 'border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400 line-through',
}

const PoNumberCell = ({ row }: { row: { original: PurchaseOrderItem } }) => {
  const { setSelectedPoId } = usePurchaseOrders()
  return (
    <span
      onClick={() => setSelectedPoId(row.original.id)}
      className='cursor-pointer hover:underline text-xs font-semibold text-slate-900 dark:text-slate-100 truncate block'
    >
      {row.original.poNumber}
    </span>
  )
}

const RowActions = ({ row }: { row: { original: PurchaseOrderItem } }) => {
  const { setSelectedPoId } = usePurchaseOrders()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <MoreVertical className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel className='text-xs'>PO Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSelectedPoId(row.original.id)} className='gap-2 text-xs cursor-pointer'>
          <Edit className='size-3.5' /> Edit & Preview Document
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.print()} className='gap-2 text-xs cursor-pointer'>
          <FileText className='size-3.5' /> Print PO Document
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info(`Sent PDF copy to vendor ${row.original.vendorCode}`)} className='gap-2 text-xs cursor-pointer'>
          <ExternalLink className='size-3.5' /> Share Digital Copy
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.error('PO cancellation requires Level 3 management override.')} className='gap-2 text-xs cursor-pointer text-destructive focus:text-destructive'>
          <Trash2 className='size-3.5' /> Cancel Purchase Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const purchaseOrdersColumns: ColumnDef<PurchaseOrderItem>[] = [
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
    accessorKey: 'poNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PO Number & Date' />
    ),
    cell: ({ row }) => <PoNumberCell row={row} />,
  },
  {
    accessorKey: 'vendorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendor Partner' />
    ),
    cell: ({ row }) => (
      <span className='font-semibold text-slate-900 dark:text-slate-100 text-xs truncate block max-w-[180px]'>
        {row.original.vendorName}
      </span>
    ),
  },
  {
    accessorKey: 'linkedShipment',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Linked ERP Chain' />
    ),
    cell: ({ row }) => {
      const shp = row.original.linkedShipment
      const qt = row.original.linkedQuotation
      return (
        <span className='text-xs font-medium text-slate-800 dark:text-slate-200 truncate block'>
          {shp || qt || 'Direct PO'}
        </span>
      )
    },
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Value (USD)' />
    ),
    cell: ({ row }) => (
      <span className='font-semibold text-slate-900 dark:text-slate-100 text-xs truncate block'>
        ${row.original.totalAmount.toLocaleString('en-US')}.00
      </span>
    ),
  },
  {
    accessorKey: 'deliveryDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Required Delivery' />
    ),
    cell: ({ row }) => (
      <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
        {row.original.deliveryDate}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      const style = poStatusBadgeStyles[status] || poStatusBadgeStyles.Approved
      return (
        <Badge variant='outline' className={`px-2 py-0.5 text-[11px] font-medium ${style}`}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActions row={row} />,
  },
]
