import { type LinkProps } from '@tanstack/react-router'

type User = {
  name: string
  email: string
  avatar: string
}

type Team = {
  name: string
  logo: React.ElementType
  plan: string
}

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
}

type NavSubItem = BaseNavItem & {
  url: LinkProps['to'] | (string & {})
}

type NavItem = BaseNavItem & {
  url?: LinkProps['to'] | (string & {})
  items?: NavSubItem[]
}

type NavCollapsible = NavItem
type NavLink = NavItem

type NavGroup = {
  title: string
  items: NavItem[]
}

type SidebarData = {
  user: User
  teams: Team[]
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
