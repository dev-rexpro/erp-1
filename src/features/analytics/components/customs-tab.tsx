import { FileCheck, ShieldCheck, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

const customsChannelDistributionNeutral = [
  { name: 'Jalur Hijau (Green)', count: 1240, percentage: 82.5, color: '#334155' },
  { name: 'Jalur Kuning (Yellow)', count: 180, percentage: 12.0, color: '#64748b' },
  { name: 'Jalur Merah (Red)', count: 80, percentage: 5.5, color: '#94a3b8' },
]

const topHsCodesAudit = [
  { hsCode: '8471.30.20', description: 'Portable automatic data processing machines (Laptops/Notebooks)', volumeTeu: 820, avgDutyRate: '5.0%', redLineRate: '8.2%', complianceScore: '96.5%' },
  { hsCode: '8517.62.59', description: 'Wireless network routers & switching apparatus', volumeTeu: 640, avgDutyRate: '0.0%', redLineRate: '3.1%', complianceScore: '98.8%' },
  { hsCode: '1511.90.20', description: 'Refined Palm Oil (RBD Palm Olein) for Export', volumeTeu: 1420, avgDutyRate: 'Exempt', redLineRate: '1.8%', complianceScore: '99.4%' },
  { hsCode: '0901.11.10', description: 'Arabica Green Coffee Beans (Export)', volumeTeu: 580, avgDutyRate: 'Exempt', redLineRate: '2.4%', complianceScore: '98.2%' },
  { hsCode: '7210.49.10', description: 'Flat-rolled galvanized steel coils', volumeTeu: 910, avgDutyRate: '10.0%', redLineRate: '6.4%', complianceScore: '94.1%' },
]

const recentCustomsExceptions = [
  { pibNo: 'PIB-2026-88019', importer: 'PT Samudera Export Indonesia', port: 'Tanjung Priok (IDTPP)', channel: 'Jalur Merah', reason: 'Physical inspection required for HS Code 8471 quota verification', status: 'In Inspection', leadTimeDays: '2.8 Days' },
  { pibNo: 'PIB-2026-88024', importer: 'Global Trading Pacific', port: 'Tanjung Perak (IDSUB)', channel: 'Jalur Kuning', reason: 'Document review: Certificate of Origin Form E verification', status: 'Pending Review', leadTimeDays: '1.2 Days' },
  { pibNo: 'PIB-2026-88031', importer: 'Nusantara Customs Agency', port: 'Tanjung Priok (IDTPP)', channel: 'Jalur Hijau', reason: 'Automatic SPPB issued', status: 'Cleared', leadTimeDays: '0.2 Days' },
]

export function CustomsTab() {
  return (
    <div className='flex flex-col gap-4 sm:gap-6'>
      {/* KPI Row */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Jalur Hijau Clearance
            </CardTitle>
            <ShieldCheck className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-semibold text-foreground'>82.5%</div>
            <p className='mt-1 text-xs text-muted-foreground'>Automated SPPB customs release</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Avg Green Line Lead Time
            </CardTitle>
            <Clock className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-semibold text-foreground'>4.2 Hours</div>
            <p className='mt-1 text-xs text-muted-foreground'>From PIB submission to release</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Jalur Merah Ratio
            </CardTitle>
            <AlertCircle className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-semibold text-foreground'>5.3%</div>
            <p className='mt-1 text-xs text-muted-foreground'>Physical container examination rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Document Accuracy Score
            </CardTitle>
            <FileCheck className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-semibold text-foreground'>98.2%</div>
            <p className='mt-1 text-xs text-muted-foreground'>HS Code & invoice audit pass rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Channel Chart + HS Code Table */}
      <div className='grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12'>
        {/* Customs Channel Pie Chart */}
        <Card className='xl:col-span-4'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold text-foreground'>
              Customs Inspection Channels
            </CardTitle>
            <p className='text-xs text-muted-foreground'>Distribution of Green, Yellow, and Red channels</p>
          </CardHeader>
          <CardContent className='flex flex-col items-center justify-center pt-2'>
            <div className='h-56 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={customsChannelDistributionNeutral}
                    dataKey='count'
                    nameKey='name'
                    cx='50%'
                    cy='50%'
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {customsChannelDistributionNeutral.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: unknown, name: unknown) => [
                      `${val} declarations (${customsChannelDistributionNeutral.find((c) => c.name === name)?.percentage ?? 0}%)`,
                      String(name),
                    ]}
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='flex flex-col gap-2 w-full text-xs pt-2 border-t border-border/60'>
              {customsChannelDistributionNeutral.map((c) => (
                <div key={c.name} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='size-2.5 rounded-full' style={{ backgroundColor: c.color }} />
                    <span className='font-medium text-foreground'>{c.name}</span>
                  </div>
                  <span className='font-semibold text-foreground tabular-nums'>{c.count} ({c.percentage}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HS Code Audit Matrix */}
        <Card className='xl:col-span-8'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold text-foreground'>
              Harmonized System (HS Code) Compliance Audit
            </CardTitle>
            <p className='text-xs text-muted-foreground'>Top declared commodity codes, duty rates, and red line risk profile</p>
          </CardHeader>
          <CardContent className='px-0'>
            <Table className='text-xs'>
              <TableHeader className='bg-muted/50'>
                <TableRow>
                  <TableHead className='pl-4'>HS Code & Commodity Description</TableHead>
                  <TableHead className='text-right'>Volume (TEU)</TableHead>
                  <TableHead className='text-right'>Duty Rate</TableHead>
                  <TableHead className='text-right'>Red Line %</TableHead>
                  <TableHead className='text-right pr-4'>Compliance Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topHsCodesAudit.map((item) => (
                  <TableRow key={item.hsCode} className='hover:bg-muted/40'>
                    <TableCell className='pl-4 font-medium text-foreground max-w-xs'>
                      <div className='font-semibold text-foreground'>{item.hsCode}</div>
                      <div className='text-[11px] text-muted-foreground truncate'>{item.description}</div>
                    </TableCell>
                    <TableCell className='text-right font-semibold tabular-nums'>{item.volumeTeu.toLocaleString()}</TableCell>
                    <TableCell className='text-right text-muted-foreground tabular-nums'>{item.avgDutyRate}</TableCell>
                    <TableCell className='text-right tabular-nums text-foreground font-medium'>{item.redLineRate}</TableCell>
                    <TableCell className='text-right pr-4 font-semibold text-foreground tabular-nums'>{item.complianceScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Exception Logs */}
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-semibold text-foreground'>
            Customs Clearance Audit & Inspection Exception Logs
          </CardTitle>
          <p className='text-xs text-muted-foreground'>Declarations requiring manual document verification or physical inspection</p>
        </CardHeader>
        <CardContent className='px-0'>
          <Table className='text-xs'>
            <TableHeader className='bg-muted/50'>
              <TableRow>
                <TableHead className='pl-4'>PIB Ref & Importer</TableHead>
                <TableHead>Port of Entry</TableHead>
                <TableHead>Customs Channel</TableHead>
                <TableHead>Reason / Audit Note</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right pr-4'>Elapsed Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCustomsExceptions.map((ex) => (
                <TableRow key={ex.pibNo} className='hover:bg-muted/40'>
                  <TableCell className='pl-4 font-medium text-foreground'>
                    <div className='font-semibold'>{ex.pibNo}</div>
                    <div className='text-[11px] text-muted-foreground'>{ex.importer}</div>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>{ex.port}</TableCell>
                  <TableCell>
                    <Badge variant='outline' className='text-[10px] font-normal'>
                      {ex.channel}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground max-w-xs truncate'>{ex.reason}</TableCell>
                  <TableCell className='font-medium text-foreground'>{ex.status}</TableCell>
                  <TableCell className='text-right pr-4 text-muted-foreground tabular-nums'>{ex.leadTimeDays}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
