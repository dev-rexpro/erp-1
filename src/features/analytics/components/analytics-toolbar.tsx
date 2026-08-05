import { Ellipsis, FileDown, FileUp, RefreshCw, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AnalyticsToolbar() {
  return (
    <div className='flex items-center gap-2'>
      <Select defaultValue='last-4-weeks'>
        <SelectTrigger className='w-34 text-xs h-8'>
          <SelectValue placeholder='Select range' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup className='text-xs'>
            <SelectItem value='last-7-days' className='text-xs'>Last 7 days</SelectItem>
            <SelectItem value='last-4-weeks' className='text-xs'>Last 4 weeks</SelectItem>
            <SelectItem value='last-3-months' className='text-xs'>Last 3 months</SelectItem>
            <SelectItem value='year-to-date' className='text-xs'>Year to date</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size='icon' variant='outline' className='h-8 w-8' aria-label='More analytics actions'>
            <Ellipsis className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48 text-xs'>
          <DropdownMenuGroup>
            <DropdownMenuLabel className='text-xs'>Analytics actions</DropdownMenuLabel>
            <DropdownMenuItem className='text-xs'>
              <FileDown className='size-3.5' />
              Export report
            </DropdownMenuItem>
            <DropdownMenuItem className='text-xs'>
              <FileUp className='size-3.5' />
              Import data
            </DropdownMenuItem>
            <DropdownMenuItem className='text-xs'>
              <Share2 className='size-3.5' />
              Share dashboard
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className='text-xs'>
              <RefreshCw className='size-3.5' />
              Refresh metrics
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
