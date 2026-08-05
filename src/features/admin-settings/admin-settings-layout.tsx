import { Outlet } from '@tanstack/react-router'
import {
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { useRbacStore } from '@/stores/rbac-store'

export function AdminSettingsLayout() {
  const { canAccessAdminSettings, setActiveUserId, getActiveUser } = useRbacStore()
  
  const hasAccess = canAccessAdminSettings()
  const currentUser = getActiveUser()

  if (!hasAccess) {
    return (
      <>
        <Header fixed>
          <Search />
          <HeaderRight />
        </Header>

        <Main fixed>
          <div className='flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card max-w-lg mx-auto my-8 space-y-4'>
            <div className='p-3 rounded-full bg-destructive/10 text-destructive'>
              <AlertTriangle className='size-8' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-base font-semibold'>Access Restricted</h2>
              <p className='text-xs text-muted-foreground leading-relaxed'>
                Your current account profile (<strong className='text-foreground'>{currentUser.name}</strong>) does not have Administrator privileges to view system control settings.
              </p>
            </div>
            <Button
              size='sm'
              className='text-xs gap-1.5'
              onClick={() => setActiveUserId('usr-001')}
            >
              <RefreshCw className='size-3.5' />
              Switch to ICT Admin (Fadhlur Rahman)
            </Button>
          </div>
        </Main>
      </>
    )
  }

  return <Outlet />
}
