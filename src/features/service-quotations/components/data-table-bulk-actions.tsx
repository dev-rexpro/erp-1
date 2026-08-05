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
import { type Quotation } from '../data/schema'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    const selectedQuotes = selectedRows.map((row) => row.original as Quotation)
    toast.promise(sleep(1500), {
      loading: `${status === 'active' ? 'Accepting' : 'Expiring'} quotations...`,
      success: () => {
        table.resetRowSelection()
        return `${status === 'active' ? 'Accepted' : 'Expired'} ${selectedQuotes.length} quotation${selectedQuotes.length > 1 ? 's' : ''}`
      },
      error: `Error updating quotations`,
    })
  }

  const handleSimpleDelete = () => {
    const selectedQuotes = selectedRows.map((row) => row.original as Quotation)
    toast.promise(sleep(1500), {
      loading: 'Deleting quotations...',
      success: () => {
        table.resetRowSelection()
        return `Deleted ${selectedQuotes.length} quotation${selectedQuotes.length > 1 ? 's' : ''}`
      },
      error: 'Error deleting',
    })
  }

  return (
    <BulkActionsToolbar table={table} entityName='quotation'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkStatusChange('active')}
            className='size-8 text-teal-600 dark:text-teal-400'
            aria-label='Accept selected'
          >
            <CheckCircle2 size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Accept selected quotes</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkStatusChange('inactive')}
            className='size-8 text-neutral-500'
            aria-label='Expire selected'
          >
            <XCircle size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Mark selected as expired</p>
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
          <p>Delete selected quotes</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
