import { Outlet } from '@tanstack/react-router'
import { Monitor, Bell, Palette, Wrench, UserCog, Building, Database, Cpu } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: <Wrench size={18} />,
  },
  {
    title: 'Company Settings',
    href: '/settings/company',
    icon: <Building size={18} />,
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: <Palette size={18} />,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: <Bell size={18} />,
  },
  {
    title: 'Display',
    href: '/settings/display',
    icon: <Monitor size={18} />,
  },
  {
    title: 'Data Management',
    href: '/settings/data',
    icon: <Database size={18} />,
  },
  {
    title: 'System Intelligence',
    href: '/settings/intelligence',
    icon: <Cpu size={18} />,
  },
]

export function Settings() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <HeaderRight />
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-lg font-bold tracking-tight'>
            Settings
          </h1>
          <p className='text-xs text-muted-foreground'>
            Manage your account settings and preferences.
          </p>
        </div>
        <Separator className='my-4' />
        <div className='flex flex-1 flex-col overflow-y-auto p-1'>
          <Outlet />
        </div>
      </Main>
    </>
  )
}
