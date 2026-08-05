import { type ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  type NavCollapsible,
  type NavItem,
  type NavLink,
  type NavGroup as NavGroupProps,
} from './types'

export function NavGroup({ title: _title, items }: NavGroupProps) {
  const href = useLocation({ select: (location) => location.href })
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`
          return <SidebarMenuLink key={key} item={item} href={href} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavBadge({ children }: { children: ReactNode }) {
  return <Badge className='rounded-full px-1 py-0 text-xs'>{children}</Badge>
}

function SidebarMenuLink({ item, href }: { item: NavItem; href: string }) {
  const { setOpenMobile } = useSidebar()
  const targetUrl = item.url || (item.items && item.items[0]?.url) || '/'

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(href, item)}
        tooltip={item.title}
      >
        <Link to={targetUrl} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function checkIsActive(href: string, item: NavItem) {
  const currentPath = href.split('?')[0]
  
  if (item.url && currentPath === item.url) return true

  if (item.items && item.items.some((sub) => {
    const subUrl = String(sub.url)
    return subUrl === currentPath || (subUrl !== '/' && currentPath.startsWith(subUrl))
  })) {
    return true
  }

  const currentSegment = currentPath.split('/')[1]
  const firstItemUrl = item.url ? String(item.url) : (item.items && item.items[0] ? String(item.items[0].url) : '')
  const itemSegment = firstItemUrl ? firstItemUrl.split('/')[1] : ''

  if (currentSegment && itemSegment && currentSegment === itemSegment && currentSegment !== '') {
    return true
  }

  return false
}
