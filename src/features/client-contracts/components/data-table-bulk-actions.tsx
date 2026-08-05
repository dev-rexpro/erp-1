import { type Table } from '@tanstack/react-table'
import { Trash2, CheckCircle2, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Contract } from '../data/schema'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'active' | 'suspended') => {
    const selectedContracts = selectedRows.map((row) => row.original as Contract)
    toast.promise(sleep(1500), {
      loading: `${status === 'active' ? 'Signing' : 'Terminating'} contracts...`,
      success: () => {
        table.resetRowSelection()
        return `${status === 'active' ? 'Activated' : 'Terminated'} ${selectedContracts.length} contract${selectedContracts.length > 1 ? 's' : ''}`
      },
      error: `Error updating contracts`,
    })
  }

  const handleSimpleDelete = () => {
    const selectedContracts = selectedRows.map((row) => row.original as Contract)
    toast.promise(sleep(1500), {
      loading: 'Deleting contracts...',
      success: () => {
        table.resetRowSelection()
        return `Deleted ${selectedContracts.length} contract${selectedContracts.length > 1 ? 's' : ''}`
      },
      error: 'Error deleting',
    })
  }

  return (
    <BulkActionsToolbar table={table} entityName='contract'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkStatusChange('active')}
            className='size-8 text-teal-600 dark:text-teal-400'
            aria-label='Activate selected'
          >
            <CheckCircle2 size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Activate / Sign selected</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkStatusChange('suspended')}
            className='size-8 text-red-500'
            aria-label='Terminate selected'
          >
            <ShieldAlert size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Terminate selected</p>
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
          <p>Delete selected contracts</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
