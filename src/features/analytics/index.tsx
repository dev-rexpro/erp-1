import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AITradeInsights } from './components/ai-trade-insights'
import { AnalyticsKpiStrip } from './components/analytics-kpi-strip'
import { AnalyticsToolbar } from './components/analytics-toolbar'
import { OverviewTab } from './components/overview-tab'
import { VesselsTab } from './components/vessels-tab'
import { CustomsTab } from './components/customs-tab'
import { FinanceTab } from './components/finance-tab'

// Import stylesheet for country flags if needed
import '@/styles/flag-icons/flags.css'

export function Analytics() {
  return (
    <>
      {/* ===== Header ===== */}
      <Header fixed>
        <Search />
        <HeaderRight />
      </Header>

      {/* ===== Main ===== */}
      <Main className='flex flex-col gap-4 sm:gap-6 pb-12'>
        <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl sm:text-3xl text-foreground font-bold tracking-tight'>
              Freight & Trade Intelligence Analytics
            </h1>
            <p className='text-muted-foreground text-xs sm:text-sm mt-0.5'>
              Real-time shipment metrics, vessel transit performance, customs clearance lead times, and AI yield advisor.
            </p>
          </div>
        </div>

        {/* AI Trade Insights Banner */}
        <AITradeInsights />

        {/* Global Freight KPI Strip */}
        <AnalyticsKpiStrip />

        {/* Tabbed Analytics Modules */}
        <Tabs defaultValue='overview' className='flex flex-col gap-4 w-full overflow-hidden'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-2'>
            <TabsList className='gap-1 justify-start overflow-x-auto no-scrollbar flex shrink-0'>
              <TabsTrigger value='overview' className='shrink-0 text-xs'>
                Overview
              </TabsTrigger>
              <TabsTrigger value='vessels' className='shrink-0 text-xs'>
                Vessels & Transit
              </TabsTrigger>
              <TabsTrigger value='customs' className='shrink-0 text-xs'>
                Customs & Compliance
              </TabsTrigger>
              <TabsTrigger value='finance' className='shrink-0 text-xs'>
                Freight Revenue & Yield
              </TabsTrigger>
            </TabsList>

            <AnalyticsToolbar />
          </div>

          <TabsContent value='overview' className='flex flex-col gap-4 mt-0'>
            <OverviewTab />
          </TabsContent>

          <TabsContent value='vessels' className='flex flex-col gap-4 mt-0'>
            <VesselsTab />
          </TabsContent>

          <TabsContent value='customs' className='flex flex-col gap-4 mt-0'>
            <CustomsTab />
          </TabsContent>

          <TabsContent value='finance' className='flex flex-col gap-4 mt-0'>
            <FinanceTab />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

export default Analytics
