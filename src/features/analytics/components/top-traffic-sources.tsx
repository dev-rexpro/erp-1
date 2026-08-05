import { Ellipsis } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, type LabelProps, XAxis, YAxis } from 'recharts'

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const chartConfig = {
  shipments: {
    color: 'var(--chart-1)',
    label: 'Active Shipments',
  },
} satisfies ChartConfig

type TrafficSourceDatum = {
  label: string
  source: string
  shipments: number
}

const modesData: TrafficSourceDatum[] = [
  { label: '894', source: 'Ocean Freight (FCL/LCL)', shipments: 894 },
  { label: '552', source: 'Air Freight', shipments: 552 },
  { label: '381', source: 'Road Transport / Trucking', shipments: 381 },
  { label: '304', source: 'Rail Cargo', shipments: 304 },
  { label: '227', source: 'Express Courier', shipments: 227 },
]

const carriersData: TrafficSourceDatum[] = [
  { label: '168', source: 'Maersk Line', shipments: 168 },
  { label: '120', source: 'MSC (Mediterranean)', shipments: 120 },
  { label: '77', source: 'CMA CGM', shipments: 77 },
  { label: '59', source: 'DHL Global Forwarding', shipments: 59 },
  { label: '43', source: 'FedEx Express', shipments: 43 },
]

const alliancesData: TrafficSourceDatum[] = [
  { label: '184', source: 'Ocean Alliance', shipments: 184 },
  { label: '89', source: '2M Alliance', shipments: 89 },
  { label: '57', source: 'THE Alliance', shipments: 57 },
  { label: '48', source: 'Non-Alliance Carriers', shipments: 48 },
  { label: '36', source: 'Independent Operators', shipments: 36 },
]

function TrafficSourceBarChart({ data }: { data: TrafficSourceDatum[] }) {
  const renderValueLabel = (props: LabelProps) => {
    const { height, value, y } = props

    return (
      <text
        className='fill-foreground'
        dominantBaseline='middle'
        dx={-6}
        fontSize={12}
        textAnchor='end'
        x='100%'
        y={Number(y) + Number(height) / 2}
      >
        {value}
      </text>
    )
  }

  return (
    <ChartContainer config={chartConfig} className='h-64 w-full'>
      <BarChart
        accessibilityLayer
        data={data}
        layout='vertical'
        margin={{
          left: 0,
          right: 48,
        }}
      >
        <CartesianGrid horizontal={false} vertical={false} />
        <YAxis dataKey='source' hide tickLine={false} tickMargin={10} type='category' />
        <XAxis dataKey='shipments' hide type='number' />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='line' />} />
        <Bar barSize={40} dataKey='shipments' fill='var(--color-shipments)' fillOpacity={0.5} radius={8}>
          <LabelList className='fill-foreground font-medium' dataKey='source' fontSize={11} offset={12} position='insideLeft' />
          <LabelList content={renderValueLabel} dataKey='label' />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function TopTrafficSources() {
  return (
    <Card className='h-full gap-2'>
      <CardHeader>
        <CardTitle className='font-normal text-sm'>Freight Carriage Modes & Operators</CardTitle>
        <CardAction>
          <Ellipsis className='size-4' />
        </CardAction>
      </CardHeader>

      <CardContent className='px-0'>
        <Tabs defaultValue='modes' className='flex flex-col gap-3'>
          <TabsList className='w-full justify-start border-b px-2.5' variant='line'>
            <TabsTrigger className='flex-none font-normal text-xs' value='modes'>
              Carriage Modes
            </TabsTrigger>
            <TabsTrigger className='flex-none font-normal text-xs' value='carriers'>
              Carriers
            </TabsTrigger>
            <TabsTrigger className='flex-none font-normal text-xs' value='alliances'>
              Alliances
            </TabsTrigger>
          </TabsList>

          <TabsContent value='modes' className='px-4'>
            <TrafficSourceBarChart data={modesData} />
          </TabsContent>

          <TabsContent value='carriers' className='px-4'>
            <TrafficSourceBarChart data={carriersData} />
          </TabsContent>
          <TabsContent value='alliances' className='px-4'>
            <TrafficSourceBarChart data={alliancesData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
