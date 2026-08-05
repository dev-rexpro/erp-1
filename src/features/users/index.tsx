import { useSearch, useNavigate, useLocation } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'
import { type NavigateFn } from '@/hooks/use-table-url-state'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider, useUsers } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { UsersReportView } from './components/users-report-view'
import { UsersKanbanView } from './components/users-kanban-view'
import { UserDetailView } from './components/user-detail-view'
import { useDbStore } from '@/stores/db-store'

function UsersContent({
  title,
  description,
  search,
  navigate,
}: {
  title: string
  description: string
  search: Record<string, unknown>
  navigate: NavigateFn
}) {
  const { viewMode, selectedUserId } = useUsers()
  const users = useDbStore((state) => state.users)

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderRight />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6' fixed={viewMode === 'kanban'}>
        {!selectedUserId && (
          <div className='flex flex-wrap items-end justify-between gap-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
              <p className='text-muted-foreground'>{description}</p>
            </div>
            <UsersPrimaryButtons />
          </div>
        )}
        {selectedUserId ? (
          <UserDetailView data={users} key={selectedUserId} />
        ) : viewMode === 'report' ? (
          <UsersReportView data={users} search={search} navigate={navigate} />
        ) : viewMode === 'kanban' ? (
          <UsersKanbanView data={users} search={search} />
        ) : (
          <UsersTable data={users} search={search} navigate={navigate} />
        )}
      </Main>

      <UsersDialogs />
    </>
  )
}

export function Users() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate() as unknown as NavigateFn
  const { pathname } = useLocation()
  const isClientAccounts = pathname.includes('client-accounts')

  const title = isClientAccounts ? 'Client Accounts' : 'User List'
  const description = isClientAccounts
    ? 'Manage your client accounts, active contracts, and credentials here.'
    : 'Manage your users and their roles here.'

  return (
    <UsersProvider>
      <UsersContent
        title={title}
        description={description}
        search={search}
        navigate={navigate}
      />
    </UsersProvider>
  )
}
