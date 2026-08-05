import React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  FileText,
  FileCheck2,
  ShieldAlert,
  Award,
  Receipt,
  Truck,
  FileSpreadsheet,
  Boxes,
  MapPin,
  Clock,
  ShoppingBag,
  Percent,
  ShoppingCart,
  DollarSign,
  CreditCard,
  Building2,
  PiggyBank,
  TrendingUp,
  BookOpen,
  Mail,
  MessagesSquare,
  Users,
  HelpCircle,
  UserCheck,
  Shield,
  Layers,
  Lock,
  UserCog,
  Wrench,
  Building,
  Palette,
  Bell,
  Monitor,
  Database
} from 'lucide-react'

export interface SubTabItem {
  title: string
  url: string
  badge?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface ModuleTabGroup {
  id: string
  title: string
  matchPrefixes: string[]
  items: SubTabItem[]
}

export const MODULE_TAB_GROUPS: ModuleTabGroup[] = [
  {
    id: 'commercial',
    title: 'Commercial',
    matchPrefixes: ['/commercial'],
    items: [
      { title: 'Client Accounts', url: '/commercial/client-accounts', icon: Briefcase },
      { title: 'Service Quotations', url: '/commercial/service-quotations', icon: FileText },
      { title: 'Client Contracts', url: '/commercial/client-contracts', icon: FileCheck2 },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance',
    matchPrefixes: ['/compliance'],
    items: [
      { title: 'Customs Declarations', url: '/compliance/customs-declarations', icon: ShieldAlert },
      { title: 'Trade Licenses', url: '/compliance/trade-licenses', icon: Award },
      { title: 'Duty Tariffs', url: '/compliance/duty-tariffs', icon: Receipt },
    ],
  },
  {
    id: 'logistics',
    title: 'Logistics',
    matchPrefixes: ['/logistics'],
    items: [
      { title: 'Shipments', url: '/logistics/shipments', icon: Truck },
      { title: 'Shipping Instructions', url: '/logistics/shipping-instructions', icon: FileSpreadsheet },
      { title: 'Packing List', url: '/logistics/packing-list', icon: Boxes },
      { title: 'Cargo Tracking', url: '/logistics/cargo-tracking', icon: MapPin },
      { title: 'DnD Fee', url: '/logistics/dnd-fee', icon: Clock },
    ],
  },
  {
    id: 'procurement',
    title: 'Procurement',
    matchPrefixes: ['/procurement'],
    items: [
      { title: 'Partner Directory', url: '/procurement/partner-directory', icon: ShoppingBag },
      { title: 'Vendor Rates', url: '/procurement/vendor-rates', icon: Percent },
      { title: 'Purchase Orders', url: '/procurement/purchase-orders', icon: ShoppingCart },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    matchPrefixes: ['/finance'],
    items: [
      { title: 'Overview', url: '/finance/overview', icon: DollarSign },
      { title: 'Client Invoices', url: '/finance/client-invoicing', icon: CreditCard },
      { title: 'Accounts Receivable', url: '/finance/accounts-receivable', icon: Building2 },
      { title: 'Cost Accruals', url: '/finance/cost-accruals', icon: PiggyBank },
      { title: 'Vendor Bills', url: '/finance/vendor-bills', icon: TrendingUp },
      { title: 'General Ledger', url: '/finance/general-ledger', icon: BookOpen },
    ],
  },
  {
    id: 'miscellaneous',
    title: 'Miscellaneous',
    matchPrefixes: ['/mail', '/chats', '/users', '/help-center'],
    items: [
      { title: 'Mails', url: '/mail', icon: Mail },
      { title: 'Chats', url: '/chats', badge: '3', icon: MessagesSquare },
      { title: 'Users', url: '/users', icon: Users },
      { title: 'Help Center', url: '/help-center', icon: HelpCircle },
    ],
  },
  {
    id: 'admin-settings',
    title: 'Admin Settings',
    matchPrefixes: ['/admin-settings'],
    items: [
      { title: 'User Accounts', url: '/admin-settings/users', icon: UserCheck },
      { title: 'Roles & Permissions', url: '/admin-settings/roles', icon: Shield },
      { title: 'Module Control', url: '/admin-settings/modules', icon: Layers },
      { title: 'System Audit Logs', url: '/admin-settings/audit-logs', icon: FileSpreadsheet },
      { title: 'Security Policies', url: '/admin-settings/security', icon: Lock },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    matchPrefixes: ['/settings'],
    items: [
      { title: 'Profile', url: '/settings', icon: UserCog },
      { title: 'Account', url: '/settings/account', icon: Wrench },
      { title: 'Company Settings', url: '/settings/company', icon: Building },
      { title: 'Appearance', url: '/settings/appearance', icon: Palette },
      { title: 'Notifications', url: '/settings/notifications', icon: Bell },
      { title: 'Display', url: '/settings/display', icon: Monitor },
      { title: 'Data Management', url: '/settings/data', icon: Database },
    ],
  },
]

export function SubNavTabs() {
  const pathname = useLocation({ select: (location) => location.pathname })

  const activeGroup = MODULE_TAB_GROUPS.find((group) => {
    return (
      group.matchPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/')) ||
      group.items.some((item) => item.url === pathname)
    )
  })

  if (!activeGroup || activeGroup.items.length <= 1) {
    return null
  }

  return (
    <div className='w-full border-b border-border/80 bg-background/50 backdrop-blur-md px-4 sm:px-6 transition-all'>
      <div className='flex items-center gap-6 overflow-x-auto no-scrollbar -mb-px'>
        {activeGroup.items.map((tab) => {
          const isActive =
            pathname === tab.url ||
            (tab.url !== '/settings' && tab.url !== '/admin-settings' && pathname.startsWith(tab.url + '/'))

          return (
            <Link
              key={tab.url}
              to={tab.url}
              className={cn(
                'inline-flex items-center gap-2 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap select-none',
                isActive
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60'
              )}
            >
              <span>{tab.title}</span>
              {tab.badge && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
