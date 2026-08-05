import { Ellipsis, ArrowUpRight } from 'lucide-react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  monthlyFreightTrends,
  tradeLanesData,
  costCategoryBreakdown,
  carrierPerformanceData,
} from '../data/analytics-data'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

export function OverviewTab() {
  return (
    <div className='flex flex-col gap-4 sm:gap-6'>
      {/* Chart Row 1: Freight Revenue vs Cost & TEU Trend */}
      <div className='grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12'>
        {/* Freight Revenue vs Operating Cost */}
        <Card className='xl:col-span-8'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <div>
              <CardTitle className='text-sm font-semibold text-foreground'>
                Monthly Freight Revenue & Operating Cost Trend
              </CardTitle>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Gross billings vs freight procurement costs & net operating margin
              </p>
            </div>
            <CardAction>
              <Ellipsis className='size-4 text-muted-foreground' />
            </CardAction>
          </CardHeader>

          <CardContent>
            <div className='h-72 w-full pt-2'>
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart data={monthlyFreightTrends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} className='stroke-border/40' />
                  <XAxis dataKey='month' axisLine={false} tickLine={false} className='text-[11px] fill-muted-foreground' />
                  <YAxis
                    yAxisId='left'
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`}
                    className='text-[11px] fill-muted-foreground'
                  />
                  <YAxis
                    yAxisId='right'
                    orientation='right'
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v} TEU`}
                    className='text-[11px] fill-muted-foreground'
                  />
                  <Tooltip
                    formatter={(value: unknown, name: unknown) => [
                      typeof value === 'number' && name !== 'TEUs' ? formatCurrency(value) : `${value} TEUs`,
                      String(name),
                    ]}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar yAxisId='left' dataKey='revenue' name='Revenue' fill='#334155' radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar yAxisId='left' dataKey='cost' name='Operating Cost' fill='#94a3b8' radius={[4, 4, 0, 0]} barSize={24} />
                  <Line yAxisId='right' type='monotone' dataKey='teu' name='TEUs' stroke='#0f172a' strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Operating Cost Breakdown */}
        <Card className='xl:col-span-4'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <div>
              <CardTitle className='text-sm font-semibold text-foreground'>
                Operating Cost Breakdown
              </CardTitle>
              <p className='text-xs text-muted-foreground mt-0.5'>Proportions by freight expenditure type</p>
            </div>
            <CardAction>
              <Ellipsis className='size-4 text-muted-foreground' />
            </CardAction>
          </CardHeader>

          <CardContent className='flex flex-col gap-3 pt-2'>
            {costCategoryBreakdown.map((item) => (
              <div key={item.category} className='flex flex-col gap-1.5'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='font-medium text-foreground truncate max-w-[180px]'>{item.category}</span>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold text-foreground'>{formatCurrency(item.amount)}</span>
                    <span className='text-muted-foreground text-[11px] tabular-nums'>({item.pct}%)</span>
                  </div>
                </div>
                <Progress value={item.pct} className='h-2' />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Trade Lane Performance Matrix & Carrier On-Time Ranking */}
      <div className='grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12'>
        {/* Trade Lane Performance Matrix */}
        <Card className='xl:col-span-8'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <div>
              <CardTitle className='text-sm font-semibold text-foreground'>
                Trade Lane Route Matrix
              </CardTitle>
              <p className='text-xs text-muted-foreground mt-0.5'>Volume, yield, and average transit speed by O/D pair</p>
            </div>
            <CardAction>
              <Ellipsis className='size-4 text-muted-foreground' />
            </CardAction>
          </CardHeader>

          <CardContent className='px-0'>
            <Table className='text-xs'>
              <TableHeader className='bg-muted/50'>
                <TableRow>
                  <TableHead className='pl-4'>Origin / Destination</TableHead>
                  <TableHead className='text-right'>Volume (TEU)</TableHead>
                  <TableHead className='text-right'>Revenue</TableHead>
                  <TableHead className='text-right'>Avg Transit</TableHead>
                  <TableHead className='text-right'>On-Time %</TableHead>
                  <TableHead className='text-right pr-4'>Margin %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradeLanesData.map((lane) => (
                  <TableRow key={lane.lane} className='hover:bg-muted/40'>
                    <TableCell className='pl-4 font-medium text-foreground'>
                      <div>{lane.lane}</div>
                      <div className='text-[10px] text-muted-foreground'>{lane.activeShipments} active shipments</div>
                    </TableCell>
                    <TableCell className='text-right font-semibold tabular-nums'>{lane.volumeTeu.toLocaleString()}</TableCell>
                    <TableCell className='text-right tabular-nums'>{formatCurrency(lane.revenueUsd)}</TableCell>
                    <TableCell className='text-right tabular-nums text-muted-foreground'>
                      {lane.avgTransitDays}d <span className='text-[10px]'>(tgt: {lane.targetTransitDays}d)</span>
                    </TableCell>
                    <TableCell className='text-right tabular-nums'>
                      <Badge variant='outline' className='text-[10px] font-normal'>
                        {lane.onTimeRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right pr-4 font-semibold tabular-nums text-foreground'>
                      {lane.marginPct}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Carrier Reliability Ranking */}
        <Card className='xl:col-span-4'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <div>
              <CardTitle className='text-sm font-semibold text-foreground'>
                Carrier On-Time Performance
              </CardTitle>
              <p className='text-xs text-muted-foreground mt-0.5'>Primary vessel operators benchmark</p>
            </div>
            <CardAction>
              <Ellipsis className='size-4 text-muted-foreground' />
            </CardAction>
          </CardHeader>

          <CardContent className='flex flex-col gap-3 pt-1'>
            {carrierPerformanceData.map((c) => (
              <div key={c.carrier} className='flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20'>
                <div className='flex flex-col'>
                  <span className='font-semibold text-xs text-foreground'>{c.carrier}</span>
                  <span className='text-[11px] text-muted-foreground'>
                    {c.shipments} shipments • {c.teu.toLocaleString()} TEU
                  </span>
                </div>
                <div className='text-right'>
                  <div className='text-xs font-semibold text-foreground flex items-center justify-end gap-1'>
                    <ArrowUpRight className='size-3 text-muted-foreground' />
                    {c.onTimeRate}%
                  </div>
                  <div className='text-[10px] text-muted-foreground'>+{c.avgDelayDays}d avg delay</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
