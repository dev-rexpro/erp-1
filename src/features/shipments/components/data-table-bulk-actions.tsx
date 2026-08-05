import { type Table } from '@tanstack/react-table'
import { Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Shipment } from '../data/schema'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'inactive' | 'suspended') => {
    const selectedShipments = selectedRows.map((row) => row.original as Shipment)
    toast.promise(sleep(1500), {
      loading: `Updating ${selectedShipments.length} shipments...`,
      success: () => {
        table.resetRowSelection()
        const labelMap: Record<string, string> = {
          active: 'In Transit',
          inactive: 'Delivered',
          invited: 'Scheduled',
          suspended: 'Delayed',
        }
        const label = labelMap[status] || status
        return `Marked ${selectedShipments.length} shipment${selectedShipments.length > 1 ? 's' : ''} as ${label}`
      },
      error: `Error updating status`,
    })
  }

  const handleSimpleDelete = () => {
    const selectedShipments = selectedRows.map((row) => row.original as Shipment)
    toast.promise(sleep(1500), {
      loading: 'Deleting shipments...',
      success: () => {
        table.resetRowSelection()
        return `Deleted ${selectedShipments.length} shipment${selectedShipments.length > 1 ? 's' : ''}`
      },
      error: 'Error deleting',
    })
  }

  return (
    <BulkActionsToolbar table={table} entityName='shipment'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkStatusChange('inactive')}
            className='size-8 text-emerald-600 dark:text-emerald-400'
            aria-label='Mark as delivered'
          >
            <CheckCircle2 size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Mark as Delivered</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkStatusChange('suspended')}
            className='size-8 text-red-500'
            aria-label='Mark as delayed'
          >
            <XCircle size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Mark as Delayed</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleSimpleDelete}
            className='size-8'
            aria-label='Delete selected'
          >
            <Trash2 size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected shipments</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
