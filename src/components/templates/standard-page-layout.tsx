import React from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'

export type ViewMode = 'list' | 'report' | 'kanban' | 'detail'

export interface StandardPageLayoutProps {
  title: string
  description?: string
  viewMode: ViewMode
  selectedItemId?: string | null
  primaryActions?: React.ReactNode
  renderTable?: () => React.ReactNode
  renderKanban?: () => React.ReactNode
  renderReport?: () => React.ReactNode
  renderDetail?: (id: string) => React.ReactNode
  children?: React.ReactNode // Fallback if specific render props aren't used
}

export function StandardPageLayout({
  title,
  description,
  viewMode,
  selectedItemId,
  primaryActions,
  renderTable,
  renderKanban,
  renderReport,
  renderDetail,
  children,
}: StandardPageLayoutProps) {
  const isDetailView = selectedItemId != null && selectedItemId !== ''

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderRight />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6' fixed={viewMode === 'kanban'}>
        {!isDetailView && (
          <div className='flex flex-wrap items-end justify-between gap-2'>
            <div>
              <h2 className='text-lg font-bold tracking-tight'>{title}</h2>
              {description && <p className='text-xs text-muted-foreground'>{description}</p>}
            </div>
            {primaryActions}
          </div>
        )}

        {isDetailView && renderDetail ? (
          renderDetail(selectedItemId)
        ) : viewMode === 'report' && renderReport ? (
          renderReport()
        ) : viewMode === 'kanban' && renderKanban ? (
          renderKanban()
        ) : viewMode === 'list' && renderTable ? (
          renderTable()
        ) : (
          children
        )}
      </Main>
    </>
  )
}
