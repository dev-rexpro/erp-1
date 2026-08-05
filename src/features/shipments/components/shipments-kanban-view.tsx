import { DataKanban, type KanbanColumnDef } from '@/components/data-table/data-kanban'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { type Shipment, type ShipmentStatus } from '../data/schema'
import { useShipments } from './shipments-provider'
import { useDbStore } from '@/stores/db-store'
import { toast } from 'sonner'
import { getInitials } from '@/lib/utils'

interface ShipmentsKanbanViewProps {
  data: Shipment[]
  search: Record<string, unknown>
}

const columns: KanbanColumnDef[] = [
  { id: 'active', title: 'Active', color: 'bg-green-500' },
  { id: 'invited', title: 'Invited', color: 'bg-sky-500' },
  { id: 'inactive', title: 'Inactive', color: 'bg-amber-500' },
  { id: 'suspended', title: 'Suspended', color: 'bg-destructive' },
]

export function ShipmentsKanbanView({ data, search }: ShipmentsKanbanViewProps) {
  const { setViewMode, setSelectedShipmentId } = useShipments()
  const setShipments = useDbStore((state) => state.setShipments)
  const shipments = useDbStore((state) => state.shipments)
  const searchQuery = (search.username as string) || ''

  const handleMoveCard = (id: string, newStatus: ShipmentStatus) => {
    const itemIndex = shipments.findIndex((u) => u.id === id)
    if (itemIndex > -1) {
      const updatedShipments = [...shipments]
      updatedShipments[itemIndex] = { ...updatedShipments[itemIndex], status: newStatus }
      setShipments(updatedShipments)
      setViewMode((prev) => prev)
      toast.success(`Moved ${updatedShipments[itemIndex].username} to ${newStatus}`)
    }
  }

  const renderCard = (shipment: Shipment) => {
    const carrierLabelMap: Record<string, string> = {
      superadmin: 'Air Freight',
      admin: 'Ocean Freight',
      manager: 'Land Transport',
      cashier: 'Rail Freight',
    }

    return (
      <div
        onClick={() => setSelectedShipmentId(shipment.id)}
        className='flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-xs cursor-pointer select-none'
      >
        <div className='min-w-0 space-y-1.5'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='min-w-0 truncate font-medium text-sm leading-none'>{shipment.firstName}</h3>
            <Badge className='shrink-0 rounded-md border-transparent px-2 font-medium' variant='outline'>
              {carrierLabelMap[shipment.role] || shipment.role}
            </Badge>
          </div>
          <p className='line-clamp-2 text-muted-foreground text-sm leading-5'>{shipment.username}</p>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            <Avatar className='size-5 after:rounded-sm'>
              <AvatarFallback className='rounded-sm text-[10px]'>{getInitials(shipment.firstName)}</AvatarFallback>
            </Avatar>
            <span className='text-muted-foreground text-sm truncate max-w-[120px]'>{shipment.email}</span>
          </div>
          <div className='flex min-w-0 items-center gap-1.5 text-muted-foreground'>
            <span className='truncate text-sm'>{shipment.validUntil}</span>
          </div>
        </div>

        <div className='flex items-center justify-between pt-1'>
          <span className='text-xs font-semibold text-primary'>{shipment.amount}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 min-h-0'>
      <DataKanban<Shipment>
        data={data}
        columns={columns}
        columnKey='status'
        searchKey='firstName'
        searchQuery={searchQuery}
        onMoveCard={handleMoveCard}
        renderCard={renderCard}
        getKey={(q) => q.id}
      />
    </div>
  )
}
