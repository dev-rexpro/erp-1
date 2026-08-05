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
import { type Invoice } from '../data/schema'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'active' | 'suspended') => {
    const selectedInvoices = selectedRows.map((row) => row.original as Invoice)
    toast.promise(sleep(1500), {
      loading: `${status === 'active' ? 'Marking paid' : 'Canceling'} invoices...`,
      success: () => {
        table.resetRowSelection()
        return `${status === 'active' ? 'Marked paid' : 'Canceled'} ${selectedInvoices.length} invoice${selectedInvoices.length > 1 ? 's' : ''}`
      },
      error: `Error updating invoices`,
    })
  }

  const handleSimpleDelete = () => {
    const selectedInvoices = selectedRows.map((row) => row.original as Invoice)
    toast.promise(sleep(1500), {
      loading: 'Deleting invoices...',
      success: () => {
        table.resetRowSelection()
        return `Deleted ${selectedInvoices.length} invoice${selectedInvoices.length > 1 ? 's' : ''}`
      },
      error: 'Error deleting',
    })
  }

  return (
    <BulkActionsToolbar table={table} entityName='invoice'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkStatusChange('active')}
            className='size-8 text-teal-600 dark:text-teal-400'
            aria-label='Mark paid'
          >
            <CheckCircle2 size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Mark paid selected</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkStatusChange('suspended')}
            className='size-8 text-red-500'
            aria-label='Cancel selected'
          >
            <ShieldAlert size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cancel selected</p>
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
          <p>Delete selected invoices</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
