import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useProductivityStore } from '@/stores/productivity-store'

import { CalendarPanel } from './components/calendar-panel'
import { FocusCard } from './components/focus-card'
import { ProjectsSection } from './components/projects-section'
import { QuickActions } from './components/quick-actions'
import { QuoteCard } from './components/quote-card'
import { RecentNotesCard } from './components/recent-notes-card'
import { SummaryCards } from './components/summary-cards'
import { TasksSection } from './components/tasks-section'
import { WeeklySummaryCard } from './components/weekly-summary-card'

export function Productivity() {
  const { activeUserId, users, setActiveUserId } = useProductivityStore()
  const activeUser = users.find((u) => u.id === activeUserId) || users[0]

  return (
    <>
      {/* ===== Header ===== */}
      <Header fixed>
        <Search />
        <HeaderRight />
      </Header>

      {/* ===== Main Content ===== */}
      <Main className='flex flex-col gap-6'>
        {/* User Workspace Header */}
        <div className='flex items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-xs'>
          <div className='flex items-center gap-3.5'>
            <Avatar className='h-12 w-12 border border-border shadow-xs'>
              <AvatarImage src={activeUser.avatar} alt={activeUser.name} />
              <AvatarFallback>{activeUser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <h1 className='text-2xl font-bold tracking-tight text-foreground'>
                  Good day, {activeUser.name}
                </h1>
                <Badge variant='outline' className='text-xs font-normal bg-muted/50'>
                  {activeUser.role}
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground'>
                {activeUser.email} &bull; Your personal tasks, notes & freight initiatives.
              </p>
            </div>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-12'>
          <section className='lg:col-span-9 flex flex-col gap-6'>
            <SummaryCards />
            <TasksSection />
            <ProjectsSection />
            <QuickActions />
            <QuoteCard />
          </section>

          <section className='flex flex-col gap-6 lg:col-span-3'>
            <CalendarPanel />
            <FocusCard />
            <RecentNotesCard />
            <WeeklySummaryCard />
          </section>
        </div>
      </Main>
    </>
  )
}
