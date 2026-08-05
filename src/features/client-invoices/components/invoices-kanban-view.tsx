import { DataKanban, type KanbanColumnDef } from '@/components/data-table/data-kanban'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { type Invoice, type InvoiceStatus } from '../data/schema'
import { useInvoices } from './invoices-provider'
import { useDbStore } from '@/stores/db-store'
import { toast } from 'sonner'
import { roles } from '../data/data'
import { getInitials } from '@/lib/utils'

interface InvoicesKanbanViewProps {
  data: Invoice[]
  search: Record<string, unknown>
}

const columns: KanbanColumnDef[] = [
  { id: 'invited', title: 'Draft', color: 'bg-sky-500' },
  { id: 'active', title: 'Paid', color: 'bg-green-500' },
  { id: 'inactive', title: 'Overdue', color: 'bg-amber-500' },
  { id: 'suspended', title: 'Canceled', color: 'bg-neutral-500' },
]

export function InvoicesKanbanView({ data, search }: InvoicesKanbanViewProps) {
  const { setViewMode, setSelectedInvoiceId } = useInvoices()
  const setInvoices = useDbStore((state) => state.setClientInvoices)
  const invoices = useDbStore((state) => state.clientInvoices)
  const searchQuery = (search.username as string) || ''

  const handleMoveCard = (id: string, newStatus: InvoiceStatus) => {
    const itemIndex = invoices.findIndex((u) => u.id === id)
    if (itemIndex > -1) {
      const updatedInvoices = [...invoices]
      updatedInvoices[itemIndex] = { ...updatedInvoices[itemIndex], status: newStatus }
      setInvoices(updatedInvoices)
      setViewMode((prev) => prev)
      toast.success(`Moved ${updatedInvoices[itemIndex].username} to ${newStatus}`)
    }
  }

  const renderCard = (invoice: Invoice) => {
    const invType = roles.find((r) => r.value === invoice.role)

    return (
      <div
        onClick={() => setSelectedInvoiceId(invoice.id)}
        className='flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-xs cursor-pointer select-none'
      >
        <div className='min-w-0 space-y-1.5'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='min-w-0 truncate font-medium text-sm leading-none'>{invoice.firstName}</h3>
            <Badge className='shrink-0 rounded-md border-transparent px-2 font-medium' variant='outline'>
              {invType?.label || invoice.role}
            </Badge>
          </div>
          <p className='line-clamp-2 text-muted-foreground text-sm leading-5'>{invoice.username}</p>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            <Avatar className='size-5 after:rounded-sm'>
              <AvatarFallback className='rounded-sm text-[10px]'>{getInitials(invoice.firstName)}</AvatarFallback>
            </Avatar>
            <span className='text-muted-foreground text-sm'>{invoice.email}</span>
          </div>
          <div className='flex min-w-0 items-center gap-1.5 text-muted-foreground'>
            <span className='truncate text-sm'>{invoice.dueDate}</span>
          </div>
        </div>

        <div className='flex items-center justify-between pt-1'>
          <span className='text-xs font-semibold text-primary'>{invoice.amount}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 min-h-0'>
      <DataKanban<Invoice>
        data={data}
        columns={columns}
        columnKey='status'
        searchKey='firstName'
        searchQuery={searchQuery}
        onMoveCard={handleMoveCard}
        renderCard={renderCard}
        getKey={(i) => i.id}
      />
    </div>
  )
}