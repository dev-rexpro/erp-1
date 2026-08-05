import { DataKanban, type KanbanColumnDef } from '@/components/data-table/data-kanban'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { type User, type UserStatus } from '../data/schema'
import { useUsers } from './users-provider'
import { useDbStore } from '@/stores/db-store'
import { toast } from 'sonner'
import { getInitials } from '@/lib/utils'

interface UsersKanbanViewProps {
  data: User[]
  search: Record<string, unknown>
}

const columns: KanbanColumnDef[] = [
  { id: 'active', title: 'Active', color: 'bg-green-500' },
  { id: 'invited', title: 'Invited', color: 'bg-sky-500' },
  { id: 'inactive', title: 'Inactive', color: 'bg-amber-500' },
  { id: 'suspended', title: 'Suspended', color: 'bg-destructive' },
]

export function UsersKanbanView({ data, search }: UsersKanbanViewProps) {
  const { setViewMode, setSelectedUserId } = useUsers()
  const setUsers = useDbStore((state) => state.setUsers)
  const users = useDbStore((state) => state.users)
  const searchQuery = (search.username as string) || ''

  const handleMoveCard = (id: string, newStatus: UserStatus) => {
    const itemIndex = users.findIndex((u) => u.id === id)
    if (itemIndex > -1) {
      const updatedUsers = [...users]
      updatedUsers[itemIndex] = { ...updatedUsers[itemIndex], status: newStatus }
      setUsers(updatedUsers)
      setViewMode((prev) => prev)
      toast.success(`Moved ${updatedUsers[itemIndex].firstName} to ${newStatus}`)
    }
  }

  const renderCard = (user: User) => {
    return (
      <div
        onClick={() => setSelectedUserId(user.id)}
        className='flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-xs cursor-pointer select-none'
      >
        <div className='min-w-0 space-y-1.5'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='min-w-0 truncate font-medium text-sm leading-none'>
              {user.firstName} {user.lastName}
            </h3>
            <Badge className='shrink-0 rounded-md border-transparent px-2 font-medium' variant='outline'>
              {user.role}
            </Badge>
          </div>
          <p className='line-clamp-2 text-muted-foreground text-sm leading-5'>@{user.username}</p>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            <Avatar className='size-5 after:rounded-sm'>
              <AvatarFallback className='rounded-sm text-[10px]'>{getInitials(user.firstName)}</AvatarFallback>
            </Avatar>
            <span className='text-muted-foreground text-sm'>{user.email}</span>
          </div>
          <div className='flex min-w-0 items-center gap-1.5 text-muted-foreground'>
            {user.phoneNumber && <span className='truncate text-sm'>{user.phoneNumber}</span>}
          </div>
        </div>

        <div className='flex items-center justify-between pt-1'>
          <span className='text-xs font-semibold text-primary'>{user.status}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 min-h-0'>
      <DataKanban<User>
        data={data}
        columns={columns}
        columnKey='status'
        searchKey='firstName'
        searchQuery={searchQuery}
        onMoveCard={handleMoveCard}
        renderCard={renderCard}
        getKey={(u) => u.id}
      />
    </div>
  )
}