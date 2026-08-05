import { ArrowDownRight, ArrowUpRight, Ellipsis } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AnalyticsKpiStrip() {
  return (
    <div className='overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10'>
      <div className='grid divide-y *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-5'>
        
        {/* KPI 1: Active Shipments */}
        <Card>
          <CardHeader>
            <CardTitle className='font-normal text-sm'>Active Shipments</CardTitle>
            <CardAction>
              <Ellipsis className='size-4' />
            </CardAction>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='text-2xl font-semibold leading-none tracking-tight'>1,482</div>
              <Badge className='bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300 font-medium'>
                <ArrowUpRight />
                4.8%
              </Badge>
            </div>
            <div className='flex items-center gap-2 text-muted-foreground text-xs'>
              <span>
                from <span className='text-foreground'>1,414</span>
              </span>
              <span>•</span>
              <span>last 4 weeks</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: TEUs Handled */}
        <Card>
          <CardHeader>
            <CardTitle className='font-normal text-sm'>TEUs Handled</CardTitle>
            <CardAction>
              <Ellipsis className='size-4' />
            </CardAction>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='text-2xl font-semibold leading-none tracking-tight'>24.6k TEUs</div>
              <Badge className='bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300 font-medium'>
                <ArrowUpRight />
                2.1%
              </Badge>
            </div>
            <div className='flex items-center gap-2 text-muted-foreground text-xs'>
              <span>
                from <span className='text-foreground'>24.1k</span>
              </span>
              <span>•</span>
              <span>last 4 weeks</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Freight Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className='font-normal text-sm'>Freight Revenue</CardTitle>
            <CardAction>
              <Ellipsis className='size-4' />
            </CardAction>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='text-2xl font-semibold leading-none tracking-tight'>$547.9k</div>
              <Badge className='bg-destructive/10 text-destructive font-medium'>
                <ArrowDownRight />
                3.3%
              </Badge>
            </div>
            <div className='flex items-center gap-2 text-muted-foreground text-xs'>
              <span>
                from <span className='text-foreground'>$566.8k</span>
              </span>
              <span>•</span>
              <span>last 4 weeks</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Customs Clearance Rate */}
        <Card>
          <CardHeader>
            <CardTitle className='font-normal text-sm'>Customs Clear Rate</CardTitle>
            <CardAction>
              <Ellipsis className='size-4' />
            </CardAction>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='text-2xl font-semibold leading-none tracking-tight'>98.4%</div>
              <Badge className='bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300 font-medium'>
                <ArrowUpRight />
                4.2%
              </Badge>
            </div>
            <div className='flex items-center gap-2 text-muted-foreground text-xs'>
              <span>
                from <span className='text-foreground'>94.2%</span>
              </span>
              <span>•</span>
              <span>last 4 weeks</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 5: Avg Transit Time */}
        <Card>
          <CardHeader>
            <CardTitle className='font-normal text-sm'>Avg Transit Time</CardTitle>
            <CardAction>
              <Ellipsis className='size-4' />
            </CardAction>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='text-2xl font-semibold leading-none tracking-tight'>14.2 Days</div>
              <Badge className='bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300 font-medium'>
                <ArrowUpRight />
                5.6%
              </Badge>
            </div>
            <div className='flex items-center gap-2 text-muted-foreground text-xs'>
              <span>
                from <span className='text-foreground'>15.1 Days</span>
              </span>
              <span>•</span>
              <span>last 4 weeks</span>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
