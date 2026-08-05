import { DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockAccountsReceivable, mockCostAccruals, mockVendorBills } from '@/features/finance/data/finance-data'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

const clientYieldBreakdown = [
  { segment: 'Industrial Manufacturers & Electronics', volumeTeu: 3420, grossRevenue: 1850000, netYieldPerTeu: 540, marginPct: '29.2%' },
  { segment: 'Agricultural & Commodities Exporters', volumeTeu: 2890, grossRevenue: 1240000, netYieldPerTeu: 429, marginPct: '24.5%' },
  { segment: 'Retail & FMCG Importers', volumeTeu: 1980, grossRevenue: 980000, netYieldPerTeu: 495, marginPct: '26.8%' },
  { segment: 'Chemical & Hazardous Goods Cargo', volumeTeu: 850, grossRevenue: 620000, netYieldPerTeu: 729, marginPct: '34.1%' },
]

export function FinanceTab() {
  // Aggregate real finance numbers from mock datasets
  const totalArOutstanding = mockAccountsReceivable.reduce((s, a) => s + a.balanceDue, 0)
  const totalOverdueAr = mockAccountsReceivable.filter((a) => a.status === 'Overdue').reduce((s, a) => s + a.balanceDue, 0)

  const totalApOutstanding = mockVendorBills.filter((b) => b.paymentStatus !== 'Paid').reduce((s, b) => s + b.totalAmount, 0)
  const unReconciledAccruals = mockCostAccruals.filter((a) => a.status === 'Provisioned').reduce((s, a) => s + a.estimatedAmount, 0)

  return (
    <div className='flex flex-col gap-4 sm:gap-6'>
      {/* KPI Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Accounts Receivable (AR)
            </CardTitle>
            <DollarSign className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-semibold text-foreground'>{formatCurrency(totalArOutstanding)}</div>
            <p className='mt-1 text-xs text-muted-foreground'>
              Overdue: <span className='font-medium text-foreground'>{formatCurrency(totalOverdueAr)}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Accounts Payable (AP)
            </CardTitle>
            <TrendingUp className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-semibold text-foreground'>{formatCurrency(totalApOutstanding)}</div>
            <p className='mt-1 text-xs text-muted-foreground'>Pending carrier & vendor invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Unreconciled Cost Provisions
            </CardTitle>
            <AlertCircle className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-semibold text-foreground'>{formatCurrency(unReconciledAccruals)}</div>
            <p className='mt-1 text-xs text-muted-foreground'>Estimated vs actual vendor bill gap</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Average Freight Net Yield
            </CardTitle>
            <CheckCircle2 className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-semibold text-foreground'>$484 / TEU</div>
            <p className='mt-1 text-xs text-muted-foreground'>Net operating contribution margin</p>
          </CardContent>
        </Card>
      </div>

      {/* Yield & Client Segment Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-semibold text-foreground'>
            Freight Yield & Profitability Matrix by Client Industry Segment
          </CardTitle>
          <p className='text-xs text-muted-foreground'>Volume, gross revenue, net yield per TEU, and profit margin</p>
        </CardHeader>
        <CardContent className='px-0'>
          <Table className='text-xs'>
            <TableHeader className='bg-muted/50'>
              <TableRow>
                <TableHead className='pl-4'>Client Industry Segment</TableHead>
                <TableHead className='text-right'>Volume (TEU)</TableHead>
                <TableHead className='text-right'>Gross Revenue</TableHead>
                <TableHead className='text-right'>Net Yield / TEU</TableHead>
                <TableHead className='text-right pr-4'>Operating Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientYieldBreakdown.map((item) => (
                <TableRow key={item.segment} className='hover:bg-muted/40'>
                  <TableCell className='pl-4 font-medium text-foreground'>{item.segment}</TableCell>
                  <TableCell className='text-right font-medium tabular-nums'>{item.volumeTeu.toLocaleString()}</TableCell>
                  <TableCell className='text-right font-medium tabular-nums'>{formatCurrency(item.grossRevenue)}</TableCell>
                  <TableCell className='text-right font-semibold text-foreground tabular-nums'>
                    ${item.netYieldPerTeu} / TEU
                  </TableCell>
                  <TableCell className='text-right pr-4 font-semibold text-foreground tabular-nums'>
                    {item.marginPct}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AR Aging & Accrual Variance Tables side-by-side */}
      <div className='grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12'>
        {/* AR Aging Buckets */}
        <Card className='xl:col-span-6'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold text-foreground'>
              Customer Accounts Receivable Aging Summary
            </CardTitle>
            <p className='text-xs text-muted-foreground'>Outstanding balances by payment term aging bucket</p>
          </CardHeader>
          <CardContent className='px-0'>
            <Table className='text-xs'>
              <TableHeader className='bg-muted/50'>
                <TableRow>
                  <TableHead className='pl-4'>Customer Name</TableHead>
                  <TableHead>Aging Category</TableHead>
                  <TableHead className='text-right pr-4'>Balance Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAccountsReceivable.slice(0, 5).map((ar) => (
                  <TableRow key={ar.id} className='hover:bg-muted/40'>
                    <TableCell className='pl-4 font-medium text-foreground'>
                      <div>{ar.customerName}</div>
                      <div className='text-[10px] text-muted-foreground'>{ar.invoiceNumber}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline' className='text-[10px] font-normal'>
                        {ar.agingCategory}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right pr-4 font-semibold tabular-nums text-foreground'>
                      {formatCurrency(ar.balanceDue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Unreconciled Cost Accruals */}
        <Card className='xl:col-span-6'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold text-foreground'>
              Cost Accruals & Provision Reconciliations
            </CardTitle>
            <p className='text-xs text-muted-foreground'>Estimated voyage expenses vs actual vendor bills</p>
          </CardHeader>
          <CardContent className='px-0'>
            <Table className='text-xs'>
              <TableHeader className='bg-muted/50'>
                <TableRow>
                  <TableHead className='pl-4'>Cost Category & Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right pr-4'>Est. Provision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCostAccruals.slice(0, 5).map((acc) => (
                  <TableRow key={acc.id} className='hover:bg-muted/40'>
                    <TableCell className='pl-4 font-medium text-foreground max-w-xs truncate'>
                      <div>{acc.category}</div>
                      <div className='text-[10px] text-muted-foreground'>{acc.vendorName} • {acc.shipmentRef}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline' className='text-[10px] font-normal'>
                        {acc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right pr-4 font-semibold tabular-nums text-foreground'>
                      {formatCurrency(acc.estimatedAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
