import React, { useState } from 'react'
import {
  ShieldCheck,
  RotateCcw,
  Check,
  Search,
  ChevronRight,
  Save,
} from 'lucide-react'
import { useRbacStore } from '@/stores/rbac-store'
import { resourceStore } from '@/lib/resource-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'

export interface PermissionMenuItem {
  id: string
  name: string
  url: string
  category: string
  isSubmodule?: boolean
  parentId?: string
}

export interface PermissionCategoryGroup {
  category: string
  items: PermissionMenuItem[]
}

export const ERP_MENU_STRUCTURE: PermissionCategoryGroup[] = [
  {
    category: 'Operations & Freight Forwarding',
    items: [
      { id: 'dashboard', name: 'Executive Dashboard', url: '/', category: 'Operations' },
      { id: 'logistics', name: 'Logistics & Freight', url: '/logistics', category: 'Operations' },
      { id: 'shipments', name: 'Shipments', url: '/logistics/shipments', category: 'Operations', isSubmodule: true, parentId: 'logistics' },
      { id: 'shipping-instructions', name: 'Shipping Instructions', url: '/logistics/shipping-instructions', category: 'Operations', isSubmodule: true, parentId: 'logistics' },
      { id: 'packing-list', name: 'Packing List', url: '/logistics/packing-list', category: 'Operations', isSubmodule: true, parentId: 'logistics' },
      { id: 'cargo-tracking', name: 'Cargo Tracking', url: '/logistics/cargo-tracking', category: 'Operations', isSubmodule: true, parentId: 'logistics' },
      { id: 'dnd-fee', name: 'DnD Fee (Demurrage & Detention)', url: '/logistics/dnd-fee', category: 'Operations', isSubmodule: true, parentId: 'logistics' },
      { id: 'compliance', name: 'Customs & Compliance', url: '/compliance', category: 'Operations' },
      { id: 'customs-declarations', name: 'Customs Declarations (PIB/PEB)', url: '/compliance/customs-declarations', category: 'Operations', isSubmodule: true, parentId: 'compliance' },
      { id: 'trade-licenses', name: 'Trade Licenses & Permits', url: '/compliance/trade-licenses', category: 'Operations', isSubmodule: true, parentId: 'compliance' },
      { id: 'duty-tariffs', name: 'Duty & Tariff Calculations', url: '/compliance/duty-tariffs', category: 'Operations', isSubmodule: true, parentId: 'compliance' },
      { id: 'document-hub', name: 'Document Hub', url: '/document-hub', category: 'Operations' },
    ],
  },
  {
    category: 'Commercial & Sales',
    items: [
      { id: 'commercial', name: 'Commercial & Sales', url: '/commercial', category: 'Commercial' },
      { id: 'client-accounts', name: 'Client Accounts (CRM)', url: '/commercial/client-accounts', category: 'Commercial', isSubmodule: true, parentId: 'commercial' },
      { id: 'service-quotations', name: 'Service Quotations', url: '/commercial/service-quotations', category: 'Commercial', isSubmodule: true, parentId: 'commercial' },
      { id: 'client-contracts', name: 'Client Contracts & SLA', url: '/commercial/client-contracts', category: 'Commercial', isSubmodule: true, parentId: 'commercial' },
    ],
  },
  {
    category: 'Procurement & Carrier Vendors',
    items: [
      { id: 'procurement', name: 'Procurement & Vendors', url: '/procurement', category: 'Procurement' },
      { id: 'partner-directory', name: 'Partner & Carrier Directory', url: '/procurement/partner-directory', category: 'Procurement', isSubmodule: true, parentId: 'procurement' },
      { id: 'vendor-rates', name: 'Vendor Rate Cards', url: '/procurement/vendor-rates', category: 'Procurement', isSubmodule: true, parentId: 'procurement' },
      { id: 'purchase-orders', name: 'Vendor Purchase Orders', url: '/procurement/purchase-orders', category: 'Procurement', isSubmodule: true, parentId: 'procurement' },
    ],
  },
  {
    category: 'Finance & Revenue',
    items: [
      { id: 'finance', name: 'Finance & Revenue', url: '/finance', category: 'Finance' },
      { id: 'overview', name: 'Financial Overview', url: '/finance/overview', category: 'Finance', isSubmodule: true, parentId: 'finance' },
      { id: 'client-invoicing', name: 'Client Invoicing', url: '/finance/client-invoicing', category: 'Finance', isSubmodule: true, parentId: 'finance' },
      { id: 'accounts-receivable', name: 'Accounts Receivable', url: '/finance/accounts-receivable', category: 'Finance', isSubmodule: true, parentId: 'finance' },
      { id: 'cost-accruals', name: 'Cost Accruals', url: '/finance/cost-accruals', category: 'Finance', isSubmodule: true, parentId: 'finance' },
      { id: 'vendor-bills', name: 'Vendor Bills (AP)', url: '/finance/vendor-bills', category: 'Finance', isSubmodule: true, parentId: 'finance' },
      { id: 'general-ledger', name: 'General Ledger', url: '/finance/general-ledger', category: 'Finance', isSubmodule: true, parentId: 'finance' },
    ],
  },
  {
    category: 'System & Admin Settings',
    items: [
      { id: 'admin-settings', name: 'Admin Settings', url: '/admin-settings', category: 'Administration' },
      { id: 'user-accounts', name: 'User Accounts', url: '/admin-settings/users', category: 'Administration', isSubmodule: true, parentId: 'admin-settings' },
      { id: 'roles-permissions', name: 'Roles & Security Matrices', url: '/admin-settings/roles', category: 'Administration', isSubmodule: true, parentId: 'admin-settings' },
      { id: 'security-policies', name: 'Security Policies & Whitelist', url: '/admin-settings/security-policies', category: 'Administration', isSubmodule: true, parentId: 'admin-settings' },
      { id: 'audit-logs', name: 'Audit Trail & Activity Logs', url: '/admin-settings/audit-logs', category: 'Administration', isSubmodule: true, parentId: 'admin-settings' },
      { id: 'module-control', name: 'Module Control & Licensing', url: '/admin-settings/module-control', category: 'Administration', isSubmodule: true, parentId: 'admin-settings' },
      { id: 'analytics', name: 'Analytics & BI', url: '/analytics', category: 'Administration' },
      { id: 'productivity', name: 'Initiatives & Task Tracking', url: '/productivity', category: 'Administration' },
    ],
  },
  {
    category: 'Communications & Workspace Tools',
    items: [
      { id: 'mail', name: 'Corporate Mail', url: '/mail', category: 'Tools' },
      { id: 'chats', name: 'Internal Chat Channels', url: '/chats', category: 'Tools' },
      { id: 'users', name: 'Employee Directory', url: '/users', category: 'Tools' },
      { id: 'help-center', name: 'Help Center', url: '/help-center', category: 'Tools' },
    ],
  },
]

interface UserPermissionsTabProps {
  userRecord: Record<string, any>
  onSaveComplete?: () => void
}

export const UserPermissionsTab: React.FC<UserPermissionsTabProps> = ({
  userRecord,
  onSaveComplete,
}) => {
  const { roles, updateUser, addAuditLog, getActiveUser, getActiveRole } = useRbacStore()

  const userAccount = useRbacStore((state) =>
    state.users.find(
      (u) => u.id === userRecord.id || u.email?.toLowerCase() === userRecord.email?.toLowerCase()
    )
  )

  const initialRoleId =
    userAccount?.roleId ||
    roles.find((r) => r.name === userRecord.roleName)?.id ||
    roles[0]?.id ||
    'role-logistics-mgr'

  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialRoleId)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Local state for custom overrides
  const [customOverrides, setCustomOverrides] = useState<
    Record<string, { read: boolean; write: boolean }>
  >(() => userAccount?.customOverrides || userRecord?.customOverrides || {})

  const currentRole = roles.find((r) => r.id === selectedRoleId)

  // Get base permission for an item from selectedRole
  const getRoleBasePermission = (itemId: string, parentId?: string) => {
    if (!currentRole) return { read: false, write: false }
    if (currentRole.isSystemAdmin) return { read: true, write: true }

    const targetId = itemId
    const perm = currentRole.permissions.find(
      (p) => p.moduleId === targetId || (parentId && p.moduleId === parentId)
    )
    return perm ? { read: perm.read, write: perm.write } : { read: false, write: false }
  }

  // Get effective permission taking overrides into account
  const getEffectivePermission = (item: PermissionMenuItem) => {
    const base = getRoleBasePermission(item.id, item.parentId)
    const override = customOverrides[item.id]

    if (override) {
      return {
        read: override.read,
        write: override.write,
        isOverridden: true,
      }
    }
    return {
      read: base.read,
      write: base.write,
      isOverridden: false,
    }
  }

  // Handle permission toggle with standard Checkbox
  const handleToggle = (item: PermissionMenuItem, mode: 'read' | 'write', value: boolean) => {
    setCustomOverrides((prev) => {
      const current = prev[item.id] || getRoleBasePermission(item.id, item.parentId)
      let nextRead = mode === 'read' ? value : current.read
      let nextWrite = mode === 'write' ? value : current.write

      if (mode === 'write' && value) {
        nextRead = true
      }
      if (mode === 'read' && !value) {
        nextWrite = false
      }

      const updated = { ...prev, [item.id]: { read: nextRead, write: nextWrite } }

      // Propagate parent toggle to submodules
      const subitems = ERP_MENU_STRUCTURE.flatMap((g) => g.items).filter(
        (i) => i.parentId === item.id
      )
      subitems.forEach((sub) => {
        let subRead = mode === 'read' ? value : (prev[sub.id]?.read ?? getRoleBasePermission(sub.id, item.id).read)
        let subWrite = mode === 'write' ? value : (prev[sub.id]?.write ?? getRoleBasePermission(sub.id, item.id).write)
        if (mode === 'write' && value) subRead = true
        if (mode === 'read' && !value) subWrite = false

        updated[sub.id] = { read: subRead, write: subWrite }
      })

      return updated
    })
  }

  const handleGrantAllRead = () => {
    const newOverrides: Record<string, { read: boolean; write: boolean }> = {}
    ERP_MENU_STRUCTURE.flatMap((g) => g.items).forEach((item) => {
      const current = customOverrides[item.id] || getRoleBasePermission(item.id, item.parentId)
      newOverrides[item.id] = { read: true, write: current.write }
    })
    setCustomOverrides(newOverrides)
    toast.success('Granted read access to all modules')
  }

  const handleGrantAllWrite = () => {
    const newOverrides: Record<string, { read: boolean; write: boolean }> = {}
    ERP_MENU_STRUCTURE.flatMap((g) => g.items).forEach((item) => {
      newOverrides[item.id] = { read: true, write: true }
    })
    setCustomOverrides(newOverrides)
    toast.success('Granted full read and write access to all modules')
  }

  const handleRevokeAll = () => {
    const newOverrides: Record<string, { read: boolean; write: boolean }> = {}
    ERP_MENU_STRUCTURE.flatMap((g) => g.items).forEach((item) => {
      newOverrides[item.id] = { read: false, write: false }
    })
    setCustomOverrides(newOverrides)
    toast.info('Revoked access for all modules')
  }

  const handleResetToRoleDefaults = () => {
    setCustomOverrides({})
    toast.success('Reset permissions to base role defaults')
  }

  const handleSaveAuthorizations = () => {
    setIsSaving(true)
    const targetUserId = userAccount?.id || userRecord.id

    updateUser(targetUserId, {
      roleId: selectedRoleId,
      customOverrides,
    })

    const targetRoleObj = roles.find((r) => r.id === selectedRoleId)
    resourceStore.save('userAccount', {
      id: String(userRecord.id),
      ...userRecord,
      roleName: targetRoleObj?.name || userRecord.roleName,
      customOverrides,
    })

    const currentUser = getActiveUser()
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: getActiveRole()?.name || 'Admin',
      action: 'PERM_CHANGE',
      module: 'User Accounts',
      target: `User: ${userRecord.name} (${userRecord.email})`,
      details: `Updated custom authorization matrix for ${userRecord.name}`,
      ipAddress: '127.0.0.1',
    })

    setTimeout(() => {
      setIsSaving(false)
      toast.success(`Permissions saved for ${userRecord.name}`)
      if (onSaveComplete) onSaveComplete()
    }, 300)
  }

  const overriddenCount = Object.keys(customOverrides).length

  return (
    <div className='flex flex-col gap-6 text-xs w-full'>
      {/* Top Configuration Card */}
      <Card className='border shadow-none py-0 gap-0 overflow-hidden'>
        <CardHeader className='px-3.5 py-3 border-b bg-muted/40'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <CardTitle className='text-xs font-semibold flex items-center gap-2'>
                Authorization Matrix
                {overriddenCount > 0 && (
                  <Badge variant='outline' className='text-[10px] font-normal py-0'>
                    {overriddenCount} Custom Overrides
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className='text-[11px] mt-0.5 text-muted-foreground'>
                Set per-menu access and write rights for {userRecord.name}.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-3.5 space-y-3'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Base Role Selection */}
            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-foreground'>
                Assigned Base Security Role
              </label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className='h-8 text-xs'>
                  <SelectValue placeholder='Select security role' />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id} className='text-xs'>
                      <div className='flex items-center justify-between gap-2 w-full'>
                        <span>{r.name}</span>
                        {r.isSystemAdmin && (
                          <Badge variant='outline' className='text-[9px] px-1 py-0'>
                            Admin
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Filter */}
            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-foreground'>
                Filter Modules & Routes
              </label>
              <div className='relative'>
                <Input
                  placeholder='Search menu or route...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='h-8 text-xs pl-8'
                />
                <Search className='size-3.5 text-muted-foreground absolute left-2.5 top-2.5' />
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className='flex flex-wrap items-center justify-between gap-2 pt-2 border-t'>
            <span className='text-muted-foreground text-[11px]'>
              Base role: <strong>{currentRole?.name}</strong> ({currentRole?.department})
            </span>

            <div className='flex items-center gap-1.5 flex-wrap'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleGrantAllRead}
                className='h-7 px-2 text-[11px]'
              >
                Grant All Read
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleGrantAllWrite}
                className='h-7 px-2 text-[11px]'
              >
                Grant All Write
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleRevokeAll}
                className='h-7 px-2 text-[11px]'
              >
                Revoke All
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleResetToRoleDefaults}
                className='h-7 px-2 text-[11px] gap-1'
              >
                <RotateCcw className='size-3' /> Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Matrix List */}
      <div className='space-y-4'>
        {ERP_MENU_STRUCTURE.map((group) => {
          const filteredItems = group.items.filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
              group.category.toLowerCase().includes(searchQuery.toLowerCase())
          )

          if (filteredItems.length === 0) return null

          return (
            <Card key={group.category} className='border shadow-none py-0 gap-0 overflow-hidden'>
              <CardHeader className='px-3.5 py-2.5 border-b bg-muted/50'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
                    {group.category}
                  </CardTitle>
                  <span className='text-[10px] text-muted-foreground'>
                    {filteredItems.length} items
                  </span>
                </div>
              </CardHeader>

              <CardContent className='p-0 divide-y'>
                {filteredItems.map((item) => {
                  const perm = getEffectivePermission(item)
                  const isSub = item.isSubmodule

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between px-3.5 py-2 gap-2 hover:bg-muted/30 transition-colors ${
                        isSub ? 'pl-7 sm:pl-8' : ''
                      }`}
                    >
                      {/* Left: Module Info */}
                      <div className='flex items-center gap-2.5 min-w-0'>
                        {isSub && <ChevronRight className='size-3.5 text-muted-foreground shrink-0' />}

                        <div className='space-y-0.5 min-w-0'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <span className={`text-xs text-foreground ${isSub ? 'font-normal' : 'font-medium'}`}>
                              {item.name}
                            </span>
                            <span className='text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border'>
                              {item.url}
                            </span>
                          </div>
                          {perm.isOverridden && (
                            <span className='text-[10px] text-amber-600 dark:text-amber-400 font-medium block'>
                              Custom Override
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Permission Checkboxes */}
                      <div className='flex items-center gap-6 shrink-0 self-end sm:self-center'>
                        {/* Read Checkbox */}
                        <label className='flex items-center gap-2 cursor-pointer select-none'>
                          <Checkbox
                            checked={perm.read}
                            onCheckedChange={(val) => handleToggle(item, 'read', Boolean(val))}
                          />
                          <span className='text-xs text-foreground'>Read Access</span>
                        </label>

                        {/* Write Checkbox */}
                        <label className='flex items-center gap-2 cursor-pointer select-none'>
                          <Checkbox
                            checked={perm.write}
                            disabled={!perm.read}
                            onCheckedChange={(val) => handleToggle(item, 'write', Boolean(val))}
                          />
                          <span className={`text-xs ${perm.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            Write / Edit
                          </span>
                        </label>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Bottom Save Action */}
      <div className='flex items-center justify-between p-3.5 rounded-lg border bg-card shadow-none gap-4'>
        <div className='text-xs text-muted-foreground'>
          Configuring permissions for <strong>{userRecord.name}</strong> ({overriddenCount} overrides)
        </div>

        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleResetToRoleDefaults}
            className='h-8 text-xs'
          >
            Reset
          </Button>
          <Button
            onClick={handleSaveAuthorizations}
            disabled={isSaving}
            size='sm'
            className='h-8 px-4 gap-1.5 text-xs font-medium'
          >
            <Check className='size-3.5' />
            <span>{isSaving ? 'Saving...' : 'Save Permissions'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
