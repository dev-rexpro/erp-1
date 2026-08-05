import { useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import {
  List,
  FileText,
  Kanban,
  ChevronsUpDown,
  RotateCw,
  MoreHorizontal,
  Plus,
  MailPlus,
  Download,
  Upload,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUsers } from './users-provider'

export function UsersPrimaryButtons() {
  const { setOpen, viewMode, setViewMode } = useUsers()
  const { pathname } = useLocation()
  const isClientAccounts = pathname.includes('client-accounts')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    if (refreshing) return
    setRefreshing(true)
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: isClientAccounts ? 'Refreshing customer list...' : 'Refreshing user list...',
        success: isClientAccounts ? 'Customer list updated successfully.' : 'User list updated successfully.',
        error: 'Failed to refresh.',
      }
    )
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleViewChange = (mode: 'list' | 'report' | 'kanban') => {
    setViewMode(mode)
    if (mode === 'report') {
      toast.info('Report view is coming soon!')
    } else if (mode === 'kanban') {
      toast.success('Switched to Kanban View.')
    } else {
      toast.success('Switched to List View.')
    }
  }

  const addLabel = isClientAccounts ? 'Add Customer' : 'Add User'
  const inviteLabel = isClientAccounts ? 'Invite Customer' : 'Invite User'

  return (
    <div className='flex items-center gap-2'>
      {/* View Mode Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='h-8 px-3 gap-1.5'
          >
            {viewMode === 'list' && <List size={15} />}
            {viewMode === 'report' && <FileText size={15} />}
            {viewMode === 'kanban' && <Kanban size={15} />}
            <span className='text-xs font-medium'>
              {viewMode === 'list' && 'List View'}
              {viewMode === 'report' && 'Report View'}
              {viewMode === 'kanban' && 'Kanban View'}
            </span>
            <ChevronsUpDown size={12} className='text-muted-foreground ml-0.5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='w-[180px] rounded-xl'>
          <DropdownMenuItem onClick={() => handleViewChange('list')} className='flex items-center gap-2 cursor-pointer'>
            <List size={16} className='text-muted-foreground' />
            <span>List View</span>
            {viewMode === 'list' && <Check size={14} className='ml-auto' />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleViewChange('report')} className='flex items-center gap-2 cursor-pointer'>
            <FileText size={16} className='text-muted-foreground' />
            <span>Report View</span>
            {viewMode === 'report' && <Check size={14} className='ml-auto' />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleViewChange('kanban')} className='flex items-center gap-2 cursor-pointer'>
            <Kanban size={16} className='text-muted-foreground' />
            <span>Kanban View</span>
            {viewMode === 'kanban' && <Check size={14} className='ml-auto' />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Refresh Button */}
      <Button
        variant='outline'
        size='sm'
        className='h-8 w-8 p-0'
        onClick={handleRefresh}
      >
        <RotateCw size={15} className={refreshing ? 'animate-spin' : ''} />
        <span className='sr-only'>Refresh</span>
      </Button>

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='h-8 w-8 p-0'
          >
            <MoreHorizontal size={15} />
            <span className='sr-only'>More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px] rounded-xl'>
          <DropdownMenuItem onClick={() => setOpen('invite')} className='gap-2 cursor-pointer'>
            <MailPlus size={16} className='text-muted-foreground' />
            <span>{inviteLabel}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => toast.success('CSV Export initiated.')} className='gap-2 cursor-pointer'>
            <Download size={16} className='text-muted-foreground' />
            <span>Export CSV</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.success('CSV Import initiated.')} className='gap-2 cursor-pointer'>
            <Upload size={16} className='text-muted-foreground' />
            <span>Import CSV</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Customer/User Button */}
      <Button
        onClick={() => setOpen('add')}
        size='sm'
        className='h-8 px-3 gap-1.5 bg-black hover:bg-black/90 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black font-semibold shadow-sm transition-colors'
      >
        <Plus size={15} />
        <span className='text-xs'>{addLabel}</span>
      </Button>
    </div>
  )
}

