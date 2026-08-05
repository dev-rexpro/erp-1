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
import { type PackingList } from '../data/schema'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    const selectedPackingLists = selectedRows.map((row) => row.original as PackingList)
    toast.promise(sleep(1500), {
      loading: `Updating status for ${selectedPackingLists.length} packing lists...`,
      success: () => {
        table.resetRowSelection()
        const labelMap: Record<string, string> = {
          active: 'Approved',
          inactive: 'Received',
          invited: 'Draft',
          suspended: 'Shipped',
        }
        const label = labelMap[status] || status
        return `Marked ${selectedPackingLists.length} list${selectedPackingLists.length > 1 ? 's' : ''} as ${label}`
      },
      error: `Error updating packing lists`,
    })
  }

  const handleSimpleDelete = () => {
    const selectedPackingLists = selectedRows.map((row) => row.original as PackingList)
    toast.promise(sleep(1500), {
      loading: 'Deleting packing lists...',
      success: () => {
        table.resetRowSelection()
        return `Deleted ${selectedPackingLists.length} list${selectedPackingLists.length > 1 ? 's' : ''}`
      },
      error: 'Error deleting',
    })
  }

  return (
    <BulkActionsToolbar table={table} entityName='packing-list'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkStatusChange('active')}
            className='size-8 text-emerald-600 dark:text-emerald-400'
            aria-label='Approve selected'
          >
            <CheckCircle2 size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Approve Selected</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkStatusChange('inactive')}
            className='size-8 text-neutral-500'
            aria-label='Mark as received'
          >
            <XCircle size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Mark as Received</p>
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
          <p>Delete selected packing lists</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
