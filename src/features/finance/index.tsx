import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Download, RotateCw, FileSpreadsheet, ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'

import { BalanceDistributionCard } from './components/balance-distribution-card'
import { FinanceNotification } from './components/finance-notification'
import { IncomeBreakdown } from './components/income-breakdown'
import { OverviewKpis } from './components/overview-kpis'
import { TransactionsOverviewCard } from './components/transactions-overview-card'
import { UpcomingTransactions } from './components/upcoming-transactions'
import { Wallet } from './components/wallet'

export function FinanceOverview() {
  const navigate = useNavigate()
  const formattedDate = format(new Date(), 'EEEE, do MMMM yyyy')
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now')

  const handleRefresh = () => {
    setLastRefreshed('Just now')
  }

  const handleExport = () => {
    const data = [
      ['Metric', 'Value'],
      ['Total Freight Revenue', '$1,248,500.00'],
      ['Logistics COGS', '$832,100.00'],
      ['Gross Profit', '$416,400.00'],
      ['Gross Margin', '33.3%'],
      ['Accounts Receivable Balance', '$584,200.00'],
      ['Vendor Bills Payable', '$312,400.00'],
      ['Cost Accrual Provisions', '$184,600.00'],
    ]
    const csvContent = 'data:text/csv;charset=utf-8,' + data.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Finance_Summary_${format(new Date(), 'yyyyMMdd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <Header>
        <Search />
        <HeaderRight />
      </Header>

      <Main className='flex flex-col gap-4 md:gap-6'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>Finance Overview</h1>
            <p className='text-muted-foreground text-sm'>
              Freight forwarding financial performance, accounts receivable, vendor bills, cost accruals, and ledger analysis.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Button size='sm' variant='outline' onClick={() => navigate({ to: '/finance/accounts-receivable' as any })}>
              <ArrowUpRight className='size-3.5 mr-1' />
              AR Invoices
            </Button>
            <Button size='sm' variant='outline' onClick={() => navigate({ to: '/finance/vendor-bills' as any })}>
              <FileSpreadsheet className='size-3.5 mr-1' />
              Vendor Bills
            </Button>
            <Button size='sm' variant='outline' onClick={handleExport}>
              <Download className='size-3.5 mr-1' />
              Export Summary
            </Button>
          </div>
        </div>

        <div className='flex items-center justify-between border-b border-border/60 pb-3 text-xs text-muted-foreground'>
          <div className='flex items-center gap-2 font-medium text-foreground'>
            <span>{formattedDate}</span>
            <span>•</span>
            <span className='text-emerald-600 dark:text-emerald-400 font-semibold'>Enterprise Freight Finance Engine</span>
          </div>
          <button
            onClick={handleRefresh}
            className='flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer'
          >
            <RotateCw className='size-3.5' />
            <span>Updated: {lastRefreshed}</span>
          </button>
        </div>

        {/* Dashboard Sections */}
        <div className='flex flex-col gap-5'>
          {/* Top KPIs & Revenue Breakdown */}
          <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
            <div className='xl:col-span-6'>
              <OverviewKpis />
            </div>

            <div className='flex flex-col gap-4 xl:col-span-6'>
              <IncomeBreakdown />
              <FinanceNotification />
            </div>
          </div>

          {/* Performance Chart & Working Capital */}
          <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
            <div className='xl:col-span-7'>
              <TransactionsOverviewCard />
            </div>
            <div className='xl:col-span-5'>
              <BalanceDistributionCard />
            </div>
          </div>

          {/* Treasury & Upcoming Maturities */}
          <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
            <div className='xl:col-span-6'>
              <Wallet />
            </div>
            <div className='xl:col-span-6'>
              <UpcomingTransactions />
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}

