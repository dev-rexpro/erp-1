import { useState } from 'react'
import {
  Check,
  ChevronsUpDown,
  FileText,
  List,
  Kanban,
  MoreHorizontal,
  Plus,
  RotateCw,
  Download,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQuotations } from './quotations-provider'

export function QuotationPrimaryButtons() {
  const { viewMode, setViewMode, setSelectedQuotationId } = useQuotations()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast.success('Service quotations list refreshed!')
    }, 1000)
  }

  const handleSelectView = (mode: 'list' | 'report' | 'kanban') => {
    setViewMode(mode)
  }

  return (
    <div className='flex items-center gap-2'>
      {/* View Selection Dropdown */}
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
          <DropdownMenuItem onClick={() => handleSelectView('list')}>
            <List size={16} className='mr-2' />
            List View
            {viewMode === 'list' && <Check size={14} className='ml-auto' />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelectView('report')}>
            <FileText size={16} className='mr-2' />
            Report View
            {viewMode === 'report' && <Check size={14} className='ml-auto' />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelectView('kanban')}>
            <Kanban size={16} className='mr-2' />
            Kanban View
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

      {/* Primary Action Button */}
      <Button
        onClick={() => setSelectedQuotationId('new')}
        size='sm'
        className='h-8 px-3 gap-1.5 bg-black hover:bg-black/90 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black font-semibold shadow-sm transition-colors'
      >
        <Plus size={15} />
        <span className='text-xs'>Create Quotation</span>
      </Button>
    </div>
  )
}
