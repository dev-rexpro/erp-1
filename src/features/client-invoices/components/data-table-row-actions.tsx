import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Invoice } from '../data/schema'
import { useInvoices } from './invoices-provider'
import { useRbacStore } from '@/stores/rbac-store'
import { toast } from 'sonner'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { setOpen, setCurrentRow, setSelectedInvoiceId } = useInvoices()
  const { canAccessModule, getActiveRole } = useRbacStore()
  const invoice = row.original as Invoice

  const canWrite = canAccessModule('finance', 'write')
  const activeRole = getActiveRole()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            if (!canWrite) {
              toast.error(`Akses Ditolak: Peran ${activeRole?.name || 'User'} hanya memiliki akses Baca (Read-Only) pada Finance.`)
              return
            }
            setSelectedInvoiceId(invoice.id)
          }}
        >
          {canWrite ? 'Edit Details' : 'View Details'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success('PDF download started!')}>Download PDF</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info('Reminder sent to client.')}>Send Reminders</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!canWrite}
          onClick={() => {
            if (!canWrite) {
              toast.error(`Akses Ditolak: Peran ${activeRole?.name || 'User'} tidak memiliki izin untuk menghapus Invoice.`)
              return
            }
            setCurrentRow(invoice)
            setOpen('delete')
          }}
          className='text-red-600 focus:text-red-600 disabled:opacity-50'
        >
          Delete Invoice
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
