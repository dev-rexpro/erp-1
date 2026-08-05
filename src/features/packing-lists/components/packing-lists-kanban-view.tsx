import { DataKanban, type KanbanColumnDef } from '@/components/data-table/data-kanban'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { type PackingList, type PackingListStatus } from '../data/schema'
import { usePackingLists } from './packing-lists-provider'
import { useDbStore } from '@/stores/db-store'
import { toast } from 'sonner'
import { getInitials } from '@/lib/utils'

interface PackingListsKanbanViewProps {
  data: PackingList[]
  search: Record<string, unknown>
}

const columns: KanbanColumnDef[] = [
  { id: 'active', title: 'Active', color: 'bg-green-500' },
  { id: 'invited', title: 'Invited', color: 'bg-sky-500' },
  { id: 'inactive', title: 'Inactive', color: 'bg-amber-500' },
  { id: 'suspended', title: 'Suspended', color: 'bg-destructive' },
]

export function PackingListsKanbanView({ data, search }: PackingListsKanbanViewProps) {
  const { setViewMode, setSelectedPackingListId } = usePackingLists()
  const setPackingLists = useDbStore((state) => state.setPackingLists)
  const packingLists = useDbStore((state) => state.packingLists)
  const searchQuery = (search.username as string) || ''

  const handleMoveCard = (id: string, newStatus: PackingListStatus) => {
    const itemIndex = packingLists.findIndex((u) => u.id === id)
    if (itemIndex > -1) {
      const updatedPackingLists = [...packingLists]
      updatedPackingLists[itemIndex] = { ...updatedPackingLists[itemIndex], status: newStatus }
      setPackingLists(updatedPackingLists)
      setViewMode((prev) => prev)
      toast.success(`Moved ${updatedPackingLists[itemIndex].username} to ${newStatus}`)
    }
  }

  const renderCard = (packingList: PackingList) => {
    const formatLabelMap: Record<string, string> = {
      superadmin: 'Cartons',
      admin: 'Pallets',
      manager: 'Wooden Crates',
      cashier: 'Containers',
    }

    return (
      <div
        onClick={() => setSelectedPackingListId(packingList.id)}
        className='flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-xs cursor-pointer select-none'
      >
        <div className='min-w-0 space-y-1.5'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='min-w-0 truncate font-medium text-sm leading-none'>{packingList.firstName}</h3>
            <Badge className='shrink-0 rounded-md border-transparent px-2 font-medium' variant='outline'>
              {formatLabelMap[packingList.role] || packingList.role}
            </Badge>
          </div>
          <p className='line-clamp-2 text-muted-foreground text-sm leading-5'>{packingList.username}</p>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            <Avatar className='size-5 after:rounded-sm'>
              <AvatarFallback className='rounded-sm text-[10px]'>{getInitials(packingList.firstName)}</AvatarFallback>
            </Avatar>
            <span className='text-muted-foreground text-sm truncate max-w-[120px]'>{packingList.email}</span>
          </div>
          <div className='flex min-w-0 items-center gap-1.5 text-muted-foreground'>
            <span className='truncate text-sm'>{packingList.validUntil}</span>
          </div>
        </div>

        <div className='flex items-center justify-between pt-1'>
          <span className='text-xs font-semibold text-primary'>{packingList.amount}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 min-h-0'>
      <DataKanban<PackingList>
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
