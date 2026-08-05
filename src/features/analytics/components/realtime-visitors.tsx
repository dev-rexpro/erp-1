import { Ellipsis } from 'lucide-react'
import { Bar, BarChart, type BarShapeProps, XAxis, YAxis } from 'recharts'

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const realtimeData = [
  { minute: 1, containers: 0 },
  { minute: 2, containers: 6 },
  { minute: 3, containers: 12 },
  { minute: 4, containers: 20 },
  { minute: 5, containers: 12 },
  { minute: 6, containers: 0 },
  { minute: 7, containers: 6 },
  { minute: 8, containers: 6 },
  { minute: 9, containers: 0 },
  { minute: 10, containers: 4 },
  { minute: 11, containers: 0 },
  { minute: 12, containers: 20 },
  { minute: 13, containers: 15 },
  { minute: 14, containers: 4 },
  { minute: 15, containers: 6 },
  { minute: 16, containers: 0 },
  { minute: 17, containers: 4 },
  { minute: 18, containers: 12 },
  { minute: 19, containers: 20 },
  { minute: 20, containers: 0 },
  { minute: 21, containers: 4 },
  { minute: 22, containers: 20 },
  { minute: 23, containers: 12 },
  { minute: 24, containers: 0 },
  { minute: 25, containers: 6 },
  { minute: 26, containers: 6 },
  { minute: 27, containers: 0 },
  { minute: 28, containers: 20 },
  { minute: 29, containers: 0 },
  { minute: 30, containers: 4 },
]

const chartConfig = {
  containers: {
    color: 'var(--chart-3)',
    label: 'Containers Tracking',
  },
} satisfies ChartConfig

// Custom bar shape to render live ticks
function RealtimeBarShape(props: BarShapeProps) {
  const { height, payload, width, x, y } = props
  const barPayload = payload as (typeof realtimeData)[number] | undefined
  const barHeightValue = Number(height)
  const barWidthValue = Number(width)
  const xValue = Number(x)
  const yValue = Number(y)
  const containers = barPayload?.containers ?? 0
  const fill = 'var(--color-containers)'
  const fillOpacity = containers >= 18 ? 0.95 : 0.4
  const baselineFill = containers === 0 ? 'var(--destructive)' : fill
  const baselineOpacity = containers === 0 ? 1 : fillOpacity
  const baselineY = yValue + barHeightValue - 2
  const barGap = 4
  const barHeight = Math.max(0, barHeightValue - barGap)

  return (
    <g>
      <rect
        x={xValue}
        y={baselineY}
        width={barWidthValue}
        height={2}
        rx={1}
        fill={baselineFill}
        fillOpacity={baselineOpacity}
      />
      {containers > 0 && barHeight > 0 ? (
        <rect
          x={xValue}
          y={yValue}
          width={barWidthValue}
          height={barHeight}
          rx={2}
          fill={fill}
          fillOpacity={fillOpacity}
        />
      ) : null}
    </g>
  )
}

export function RealtimeVisitors() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='font-normal text-sm'>Live Container Tracking</CardTitle>
        <CardAction>
          <Ellipsis className='size-4' />
        </CardAction>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        <div className='flex items-end justify-between'>
          <div className='flex items-baseline gap-1'>
            <span className='text-2xl font-semibold tabular-nums leading-none tracking-tight'>142</span>
            <span className='text-muted-foreground text-xs font-medium'>containers in transit</span>
          </div>
          <div className='flex items-center gap-2 text-muted-foreground text-xs font-medium'>
            <span className='relative flex size-2'>
              <span className='absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75' />
              <span className='relative inline-flex size-2 rounded-full bg-green-500' />
            </span>
            <span>Live Syncing</span>
          </div>
        </div>

        <ChartContainer config={chartConfig} className='h-36 w-full'>
          <BarChart data={realtimeData} margin={{ bottom: 0, left: 0, right: 0, top: 0 }} barCategoryGap={3}>
            <XAxis dataKey='minute' hide />
            <YAxis hide domain={[0, 22]} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey='containers' fill='var(--color-containers)' shape={RealtimeBarShape} />
          </BarChart>
        </ChartContainer>

        <div className='grid grid-cols-2 text-xs font-medium'>
          <div className='flex items-center gap-3 border-border/50 border-r border-b pt-1 pr-5 pb-4'>
            <span aria-hidden='true' className='flag:US shrink-0 rounded-xs text-lg ring-1 ring-foreground/10' />
            <span className='min-w-0 flex-1 truncate'>United States (USLAX)</span>
            <span className='tabular-nums'>48</span>
          </div>
          <div className='flex items-center gap-3 border-border/50 border-b pt-1 pb-4 pl-5'>
            <span aria-hidden='true' className='flag:NL shrink-0 rounded-xs text-lg ring-1 ring-foreground/10' />
            <span className='min-w-0 flex-1 truncate'>Rotterdam (NLRTM)</span>
            <span className='tabular-nums'>31</span>
          </div>
          <div className='flex items-center gap-3 border-border/50 border-r pt-4 pr-5 pb-1'>
            <span aria-hidden='true' className='flag:SG shrink-0 rounded-xs text-lg ring-1 ring-foreground/10' />
            <span className='min-w-0 flex-1 truncate'>Singapore (SGSIN)</span>
            <span className='tabular-nums'>26</span>
          </div>
          <div className='flex items-center gap-3 pt-4 pb-1 pl-5'>
            <span aria-hidden='true' className='flag:CN shrink-0 rounded-xs text-lg ring-1 ring-foreground/10' />
            <span className='min-w-0 flex-1 truncate'>Shanghai (CNSHA)</span>
            <span className='tabular-nums'>19</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
