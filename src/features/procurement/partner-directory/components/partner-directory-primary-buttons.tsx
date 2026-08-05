import { useState } from 'react'
import { Plus, RotateCw, LayoutList, FileSpreadsheet, Kanban, ChevronsUpDown, Check, MoreHorizontal, Download, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePartnerDirectory } from './partner-directory-provider'
import { toast } from 'sonner'

export function PartnerDirectoryPrimaryButtons() {
  const { viewMode, setViewMode } = usePartnerDirectory()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast.success('Partner directory refreshed!')
    }, 800)
  }

  return (
    <div className='flex items-center gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='h-8 px-3 gap-1.5'>
            {viewMode === 'table' ? (
              <LayoutList className='size-3.5' />
            ) : viewMode === 'report' ? (
              <FileSpreadsheet className='size-3.5' />
            ) : (
              <Kanban className='size-3.5' />
            )}
            <span className='text-xs font-medium capitalize'>
              {viewMode === 'table' ? 'List View' : viewMode === 'report' ? 'Report View' : 'Kanban View'}
            </span>
            <ChevronsUpDown className='size-3 text-muted-foreground ml-0.5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='w-[180px] rounded-xl'>
          <DropdownMenuItem onClick={() => setViewMode('table')} className='flex items-center gap-2 cursor-pointer'>
            <LayoutList className='size-4 text-muted-foreground' /> List View
            {viewMode === 'table' && <Check className='size-3.5 ml-auto' />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewMode('report')} className='flex items-center gap-2 cursor-pointer'>
            <FileSpreadsheet className='size-4 text-muted-foreground' /> Report View
            {viewMode === 'report' && <Check className='size-3.5 ml-auto' />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewMode('kanban')} className='flex items-center gap-2 cursor-pointer'>
            <Kanban className='size-4 text-muted-foreground' /> Kanban View
            {viewMode === 'kanban' && <Check className='size-3.5 ml-auto' />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant='outline'
        size='sm'
        className='h-8 w-8 p-0'
        onClick={handleRefresh}
        title='Refresh Data'
      >
        <RotateCw className={cn('size-3.5', refreshing && 'animate-spin')} />
        <span className='sr-only'>Refresh</span>
      </Button>

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

      <Button
        size='sm'
        className='h-8 px-3 gap-1.5 bg-black hover:bg-black/90 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black font-semibold shadow-sm transition-colors'
        onClick={() => toast.success('New Partner onboarding workflow initiated.')}
      >
        <Plus className='size-3.5' />
        <span className='text-xs'>Register Partner</span>
      </Button>
    </div>
  )
}
