import { Ellipsis } from 'lucide-react'
import { CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const qualitySeries = [
  { date: '2026-04-01T00:00:00.000Z', actualTransit: 14.5, targetTransit: 15.0 },
  { date: '2026-04-01T08:00:00.000Z', actualTransit: 14.2, targetTransit: 15.0 },
  { date: '2026-04-01T16:00:00.000Z', actualTransit: 14.8, targetTransit: 15.0 },
  { date: '2026-04-02T00:00:00.000Z', actualTransit: 15.2, targetTransit: 15.0 },
  { date: '2026-04-02T08:00:00.000Z', actualTransit: 15.8, targetTransit: 15.0 },
  { date: '2026-04-02T16:00:00.000Z', actualTransit: 16.0, targetTransit: 15.0 },
  { date: '2026-04-03T00:00:00.000Z', actualTransit: 15.5, targetTransit: 15.0 },
  { date: '2026-04-03T08:00:00.000Z', actualTransit: 15.1, targetTransit: 15.0 },
  { date: '2026-04-03T16:00:00.000Z', actualTransit: 14.9, targetTransit: 15.0 },
  { date: '2026-04-04T00:00:00.000Z', actualTransit: 14.2, targetTransit: 15.0 },
  { date: '2026-04-04T08:00:00.000Z', actualTransit: 13.8, targetTransit: 15.0 },
  { date: '2026-04-04T16:00:00.000Z', actualTransit: 13.9, targetTransit: 15.0 },
  { date: '2026-04-05T00:00:00.000Z', actualTransit: 13.1, targetTransit: 15.0 },
  { date: '2026-04-05T08:00:00.000Z', actualTransit: 13.5, targetTransit: 15.0 },
  { date: '2026-04-05T16:00:00.000Z', actualTransit: 13.2, targetTransit: 15.0 },
  { date: '2026-04-06T00:00:00.000Z', actualTransit: 14.0, targetTransit: 15.0 },
  { date: '2026-04-06T08:00:00.000Z', actualTransit: 14.2, targetTransit: 15.0 },
  { date: '2026-04-06T16:00:00.000Z', actualTransit: 14.8, targetTransit: 15.0 },
  { date: '2026-04-07T00:00:00.000Z', actualTransit: 14.9, targetTransit: 15.0 },
  { date: '2026-04-07T08:00:00.000Z', actualTransit: 14.4, targetTransit: 15.0 },
  { date: '2026-04-07T16:00:00.000Z', actualTransit: 14.1, targetTransit: 15.0 },
  { date: '2026-04-08T00:00:00.000Z', actualTransit: 13.9, targetTransit: 15.0 },
  { date: '2026-04-08T08:00:00.000Z', actualTransit: 13.8, targetTransit: 15.0 },
  { date: '2026-04-08T16:00:00.000Z', actualTransit: 14.1, targetTransit: 15.0 },
  { date: '2026-04-09T00:00:00.000Z', actualTransit: 14.3, targetTransit: 15.0 },
  { date: '2026-04-09T08:00:00.000Z', actualTransit: 14.5, targetTransit: 15.0 },
  { date: '2026-04-09T16:00:00.000Z', actualTransit: 14.2, targetTransit: 15.0 },
  { date: '2026-04-10T00:00:00.000Z', actualTransit: 14.0, targetTransit: 15.0 },
]

const chartConfig = {
  actualTransit: {
    color: 'var(--chart-3)',
    label: 'Actual Transit Time',
  },
  targetTransit: {
    color: 'var(--muted-foreground)',
    label: 'Target Baseline',
  },
} satisfies ChartConfig

const chartData = qualitySeries.map((item, index) => ({
  ...item,
  dayIndex: 1 + (index * 27) / (qualitySeries.length - 1),
}))

const weeklyTicks = [4, 11, 18, 25]

function formatWeek(value: number) {
  const weekIndex = weeklyTicks.indexOf(value)
  return weekIndex >= 0 ? `Week ${weekIndex + 1}` : ''
}

export function TrafficQuality() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='font-normal text-sm'>Transit Duration vs Target Baseline</CardTitle>
        <CardAction>
          <Ellipsis className='size-4' />
        </CardAction>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className='h-68 w-full'>
          <ComposedChart data={chartData} margin={{ bottom: 0, left: 0, right: 0, top: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='dayIndex'
              axisLine={false}
              domain={[1, 28]}
              interval={0}
              tickFormatter={formatWeek}
              tickLine={false}
              tickMargin={14}
              ticks={weeklyTicks}
              type='number'
            />
            <YAxis
              axisLine={false}
              domain={[10, 20]}
              tickFormatter={(value) => `${value}d`}
              tickLine={false}
              tickMargin={10}
              width={34}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent className='w-44' labelFormatter={() => 'Transit Duration'} />}
            />
            <Line
              dataKey='targetTransit'
              dot={false}
              stroke='var(--color-targetTransit)'
              strokeOpacity={0.65}
              strokeDasharray='4 4'
              strokeWidth={1.75}
              type='linear'
            />
            <Line
              dataKey='actualTransit'
              dot={false}
              activeDot={{ r: 4 }}
              stroke='var(--color-actualTransit)'
              strokeWidth={2.5}
              type='linear'
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
