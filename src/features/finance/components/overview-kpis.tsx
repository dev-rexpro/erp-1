import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDbStore } from "@/stores/db-store"
import {
  mockAccountsReceivable,
  mockCostAccruals,
  mockVendorBills,
  mockChartOfAccounts,
} from "../data/finance-data"

export function OverviewKpis() {
  const storeAr = useDbStore((s) => s.accountsReceivable)
  const storeAccruals = useDbStore((s) => s.costAccruals)
  const storeBills = useDbStore((s) => s.vendorBills)

  const arList = storeAr.length > 0 ? storeAr : mockAccountsReceivable
  const accrualList = storeAccruals.length > 0 ? storeAccruals : mockCostAccruals
  const billList = storeBills.length > 0 ? storeBills : mockVendorBills

  // 1. Total Accounts Receivable Balance
  const totalArOutstanding = arList.reduce((acc, i) => acc + (i.balanceDue ?? 0), 0)
  const totalArOverdue = arList
    .filter((i) => i.status === 'Overdue' || i.status === 'Disputed')
    .reduce((acc, i) => acc + (i.balanceDue ?? 0), 0)

  // 2. Total Freight Revenue
  const totalRevenue = mockChartOfAccounts
    .filter((a) => a.category === 'Revenue')
    .reduce((acc, a) => acc + a.balance, 0)

  // 3. Cost of Sales & Accruals
  const totalCogs = mockChartOfAccounts
    .filter((a) => a.category === 'Expense')
    .reduce((acc, a) => acc + a.balance, 0)

  // 4. Gross Profit & Margin
  const grossProfit = totalRevenue - totalCogs
  const grossMarginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0'

  // 5. Vendor Bills Liabilities (AP)
  const totalApUnpaid = billList
    .filter((b) => b.paymentStatus !== 'Paid')
    .reduce((acc, b) => acc + (b.totalAmount ?? 0), 0)

  // 6. Provisioned Cost Accruals
  const totalProvisionedAccruals = accrualList
    .filter((a) => a.status === 'Provisioned' || a.status === 'Partially Reconciled')
    .reduce((acc, a) => acc + (a.estimatedAmount ?? 0), 0)

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 shadow-2xs">
      <div className="grid grid-cols-1 xl:grid-cols-12">
        <Card className="gap-2 overflow-hidden rounded-none border-0 border-foreground/10 border-b ring-0 xl:col-span-6 xl:border-r">
          <CardHeader className="pb-1">
            <CardTitle className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Freight Revenue (YTD)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between pt-1">
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(totalRevenue)}</div>
              <p className="text-muted-foreground text-xs">Ocean freight & customs clearance revenue</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-semibold">+14.2% YoY</Badge>
          </CardContent>
        </Card>

        <Card className="gap-2 overflow-hidden rounded-none border-0 border-foreground/10 border-b ring-0 xl:col-span-6">
          <CardHeader className="pb-1">
            <CardTitle className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Gross Operating Profit & Margin
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between pt-1">
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(grossProfit)}</div>
              <p className="text-muted-foreground text-xs">COGS: {formatCurrency(totalCogs)} ({grossMarginPct}% Margin)</p>
            </div>
            <Badge className="bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 font-semibold">{grossMarginPct}% Margin</Badge>
          </CardContent>
        </Card>

        <Card className="gap-2 overflow-hidden rounded-none border-0 border-foreground/10 border-b xl:border-b-0 ring-0 xl:col-span-6 xl:border-r">
          <CardHeader className="pb-1">
            <CardTitle className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Accounts Receivable (AR Balance)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between pt-1">
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(totalArOutstanding)}</div>
              <p className="text-muted-foreground text-xs">{arList.length} active client invoices ({formatCurrency(totalArOverdue)} overdue)</p>
            </div>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
              Avg DSO 32 Days
            </Badge>
          </CardContent>
        </Card>

        <Card className="gap-2 overflow-hidden rounded-none border-0 ring-0 xl:col-span-6">
          <CardHeader className="pb-1">
            <CardTitle className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Vendor Bills & Cost Accruals (AP)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between pt-1">
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(totalApUnpaid + totalProvisionedAccruals)}</div>
              <p className="text-muted-foreground text-xs">AP Unpaid: {formatCurrency(totalApUnpaid)} • Provisions: {formatCurrency(totalProvisionedAccruals)}</p>
            </div>
            <Badge variant="outline" className="border-slate-300 dark:border-slate-700 font-normal">
              {billList.length} Bills Listed
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

