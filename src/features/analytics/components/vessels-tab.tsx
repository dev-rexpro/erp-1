import { Anchor, Clock, AlertTriangle, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { carrierPerformanceData } from '../data/analytics-data'

const vesselActiveDeployments = [
  { vessel: 'MV Samudera Express 102', carrier: 'Maersk Line', voyage: 'V.2026-08', route: 'Tg. Priok -> Singapore', status: 'Underway', eta: '2026-08-03 14:00', containers: 420, congestionRisk: 'Low' },
  { vessel: 'MSC Rania IV', carrier: 'MSC Mediterranean', voyage: 'V.481W', route: 'Tg. Priok -> Hamburg', status: 'Anchored / Waiting', eta: '2026-08-05 08:30', containers: 310, congestionRisk: 'High' },
  { vessel: 'ONE Competence', carrier: 'Ocean Network Express', voyage: 'V.032E', route: 'Shanghai -> Tg. Priok', status: 'Underway', eta: '2026-08-04 18:00', containers: 540, congestionRisk: 'Low' },
  { vessel: 'CMA CGM Palais Royal', carrier: 'CMA CGM', voyage: 'V.099A', route: 'Tg. Priok -> Los Angeles', status: 'Berthing', eta: '2026-08-02 22:00', containers: 280, congestionRisk: 'Medium' },
  { vessel: 'Ever Given III', carrier: 'Evergreen Line', voyage: 'V.112S', route: 'Surabaya -> Rotterdam', status: 'Underway', eta: '2026-08-10 11:00', containers: 190, congestionRisk: 'Low' },
]

const containerEquipmentBalance = [
  { type: '20ft Standard Dry (20GP)', totalInFleet: 1240, activeInTransit: 820, emptyAtDepot: 310, underMaintenance: 110, utilizationRate: '88.1%' },
  { type: '40ft Standard Dry (40GP)', totalInFleet: 1850, activeInTransit: 1420, emptyAtDepot: 320, underMaintenance: 110, utilizationRate: '92.4%' },
  { type: '40ft High Cube (40HC)', totalInFleet: 2400, activeInTransit: 1980, emptyAtDepot: 320, underMaintenance: 100, utilizationRate: '95.8%' },
  { type: '40ft Refrigerated (40RF Reefer)', totalInFleet: 650, activeInTransit: 510, emptyAtDepot: 110, underMaintenance: 30, utilizationRate: '93.5%' },
]

export function VesselsTab() {
  return (
    <div className='flex flex-col gap-4 sm:gap-6'>
      {/* KPI Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Active Vessels En Route
            </CardTitle>
            <Anchor className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-semibold text-foreground'>28 Vessels</div>
            <p className='mt-1 text-xs text-muted-foreground'>Carrying 1,740 containers globally</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Average Transit Variance
            </CardTitle>
            <Clock className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-semibold text-foreground'>+1.2 Days</div>
            <p className='mt-1 text-xs text-muted-foreground'>Benchmark vs published schedules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Port Congestion Delay Risk
            </CardTitle>
            <AlertTriangle className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-semibold text-foreground'>3 Ports Affected</div>
            <p className='mt-1 text-xs text-muted-foreground'>Colombo, Hamburg, and Tg. Priok UTC-3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Equipment Fleet Utilization
            </CardTitle>
            <ShieldAlert className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-semibold text-foreground'>92.8%</div>
            <p className='mt-1 text-xs text-muted-foreground'>Container turn-around efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Active Deployments Table */}
      <div className='grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12'>
        {/* Carrier Delay Comparison Chart */}
        <Card className='xl:col-span-5'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold text-foreground'>
              Carrier On-Time & Delay Analysis
            </CardTitle>
            <p className='text-xs text-muted-foreground'>Average delay in days by main liner operator</p>
          </CardHeader>
          <CardContent>
            <div className='h-64 w-full pt-2'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={carrierPerformanceData} layout='vertical' margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray='3 3' horizontal={false} className='stroke-border/40' />
                  <XAxis type='number' axisLine={false} tickLine={false} tickFormatter={(v) => `${v}d delay`} className='text-[11px] fill-muted-foreground' />
                  <YAxis dataKey='carrier' type='category' axisLine={false} tickLine={false} width={100} className='text-[11px] fill-foreground font-medium' />
                  <Tooltip
                    formatter={(val: unknown) => [`${val} days`, 'Avg Delay']}
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey='avgDelayDays' fill='#475569' radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vessel Deployments Monitor */}
        <Card className='xl:col-span-7'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold text-foreground'>
              Active Vessel Deployments & Port ETA Monitor
            </CardTitle>
            <p className='text-xs text-muted-foreground'>Real-time vessel position & berthing status</p>
          </CardHeader>
          <CardContent className='px-0'>
            <Table className='text-xs'>
              <TableHeader className='bg-muted/50'>
                <TableRow>
                  <TableHead className='pl-4'>Vessel & Voyage</TableHead>
                  <TableHead>Route Leg</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead className='text-right pr-4'>Containers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vesselActiveDeployments.map((v) => (
                  <TableRow key={v.vessel} className='hover:bg-muted/40'>
                    <TableCell className='pl-4 font-medium text-foreground'>
                      <div>{v.vessel}</div>
                      <div className='text-[10px] text-muted-foreground'>{v.carrier} • {v.voyage}</div>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>{v.route}</TableCell>
                    <TableCell>
                      <Badge variant='outline' className='text-[10px] font-normal'>
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-muted-foreground tabular-nums'>{v.eta}</TableCell>
                    <TableCell className='text-right pr-4 font-semibold tabular-nums'>{v.containers} TEU</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Fleet Table */}
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-semibold text-foreground'>
            Container Equipment Fleet Balance & Turnaround
          </CardTitle>
          <p className='text-xs text-muted-foreground'>Inventory tracking across empty depots, active transit, and maintenance</p>
        </CardHeader>
        <CardContent className='px-0'>
          <Table className='text-xs'>
            <TableHeader className='bg-muted/50'>
              <TableRow>
                <TableHead className='pl-4'>Container Equipment Type</TableHead>
                <TableHead className='text-right'>Total Fleet</TableHead>
                <TableHead className='text-right'>In Transit</TableHead>
                <TableHead className='text-right'>Empty at Depot</TableHead>
                <TableHead className='text-right'>Maintenance</TableHead>
                <TableHead className='text-right pr-4'>Utilization Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {containerEquipmentBalance.map((item) => (
                <TableRow key={item.type} className='hover:bg-muted/40'>
                  <TableCell className='pl-4 font-medium text-foreground'>{item.type}</TableCell>
                  <TableCell className='text-right font-medium tabular-nums'>{item.totalInFleet.toLocaleString()}</TableCell>
                  <TableCell className='text-right font-semibold tabular-nums text-foreground'>{item.activeInTransit.toLocaleString()}</TableCell>
                  <TableCell className='text-right text-muted-foreground tabular-nums'>{item.emptyAtDepot.toLocaleString()}</TableCell>
                  <TableCell className='text-right text-muted-foreground tabular-nums'>{item.underMaintenance.toLocaleString()}</TableCell>
                  <TableCell className='text-right pr-4 font-semibold text-foreground tabular-nums'>{item.utilizationRate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
