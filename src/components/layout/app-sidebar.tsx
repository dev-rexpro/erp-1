import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useRbacStore } from '@/stores/rbac-store'
import { ShieldCheck, Users, Shield, Layers, FileSpreadsheet, Lock } from 'lucide-react'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { canAccessModule, canAccessAdminSettings } = useRbacStore()

  const hasAdminAccess = canAccessAdminSettings()

  // Filter navigation items based on active user RBAC permissions
  const filteredNavGroups = sidebarData.navGroups.map((group) => {
    const filteredItems = group.items.filter((item) => {
      // Map item to module ID
      let moduleId = ''
      if (item.url === '/') moduleId = 'dashboard'
      else if (item.title === 'Commercial') moduleId = 'commercial'
      else if (item.title === 'Compliance') moduleId = 'compliance'
      else if (item.title === 'Logistics') moduleId = 'logistics'
      else if (item.title === 'Procurement') moduleId = 'procurement'
      else if (item.title === 'Finance') moduleId = 'finance'
      else if (item.url === '/document-hub') moduleId = 'document-hub'
      else if (item.url === '/analytics') moduleId = 'analytics'
      else if (item.url === '/productivity') moduleId = 'productivity'
      else if (item.title === 'Miscellaneous') return true

      if (!moduleId) return true
      return canAccessModule(moduleId, 'read')
    })

    // If Admin Settings access is permitted, append Admin Settings section under Miscellaneous or as a dedicated item
    if (hasAdminAccess) {
      const hasAdminInList = filteredItems.some((i) => i.url === '/admin-settings/users')
      if (!hasAdminInList) {
        filteredItems.push({
          title: 'Admin Settings',
          url: '/admin-settings/users',
          icon: ShieldCheck,
          items: [
            {
              title: 'User Accounts',
              url: '/admin-settings/users',
              icon: Users,
            },
            {
              title: 'Roles & Permissions',
              url: '/admin-settings/roles',
              icon: Shield,
            },
            {
              title: 'Module Control',
              url: '/admin-settings/modules',
              icon: Layers,
            },
            {
              title: 'System Audit Logs',
              url: '/admin-settings/audit-logs',
              icon: FileSpreadsheet,
            },
            {
              title: 'Security Policies',
              url: '/admin-settings/security',
              icon: Lock,
            },
          ],
        })
      }
    }

    return {
      ...group,
      items: filteredItems,
    }
  })

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>

      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

