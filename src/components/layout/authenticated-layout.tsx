import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider, useLayout } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { MasbroSidebar } from '@/components/layout/masbro-sidebar'
import { useRexProAi } from '@/store/use-rexpro-ai'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

function AuthenticatedLayoutContent({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const { isOpen } = useRexProAi()
  const { variant } = useLayout()

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SkipToMain />
      <AppSidebar />
      <SidebarInset
        className={cn(
          // Set content container, so we can use container queries
          '@container/content',

          // If layout is fixed, set the height
          // to 100svh to prevent overflow
          'has-data-[layout=fixed]:h-svh',

          // If layout is fixed and sidebar is inset,
          // set the height to 100svh - spacing (total margins) to prevent overflow
          'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]',

          // Symmetrical margin alignment on the right side when right sidebar is active
          variant === 'inset' && isOpen && 'md:mr-0'
        )}
      >
        {children ?? <Outlet />}
      </SidebarInset>
      <MasbroSidebar />
    </SidebarProvider>
  )
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <SearchProvider>
      <LayoutProvider>
        <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
      </LayoutProvider>
    </SearchProvider>
  )
}
