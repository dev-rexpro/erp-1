import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setCurrentSessionUser } from '@/lib/resource-store'

export interface ERPModule {
  id: string
  name: string
  category: 'Operations' | 'Commercial & Finance' | 'Administration'
  url: string
  description: string
  isActive: boolean
  subModules?: { id: string; name: string; url: string }[]
}

export interface ModulePermission {
  moduleId: string
  read: boolean
  write: boolean
}

export interface ERPRole {
  id: string
  name: string
  department: string
  description: string
  isSystemAdmin: boolean
  permissions: ModulePermission[]
}

export interface UserAccount {
  id: string
  username: string
  name: string
  email: string
  avatar?: string
  department: string
  position: string
  roleId: string
  status: 'active' | 'inactive' | 'suspended'
  lastActive: string
  customOverrides?: Record<string, { read: boolean; write: boolean }>
}

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: string
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'POLICY_CHANGE' | 'PERM_CHANGE'
  module: string
  target: string
  details: string
  ipAddress: string
}

export interface SecurityPolicy {
  mfaEnforced: boolean
  passwordMinLength: number
  passwordExpireDays: number
  sessionTimeoutMinutes: number
  ipWhitelist: string[]
  maxFailedLogins: number
  requireSpecialChar: boolean
}

interface RbacState {
  activeUserId: string
  users: UserAccount[]
  roles: ERPRole[]
  modules: ERPModule[]
  auditLogs: AuditLog[]
  securityPolicy: SecurityPolicy[]

  // Actions
  setActiveUserId: (userId: string) => void
  addUser: (user: Omit<UserAccount, 'id' | 'lastActive'>) => void
  updateUser: (id: string, updates: Partial<UserAccount>) => void
  deleteUser: (id: string) => void
  
  addRole: (role: Omit<ERPRole, 'id'>) => void
  updateRole: (id: string, updates: Partial<ERPRole>) => void
  deleteRole: (id: string) => void
  
  toggleModuleActive: (id: string) => void
  updateModulePermissionsForRole: (roleId: string, moduleId: string, field: 'read' | 'write', value: boolean) => void
  
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void
  updateSecurityPolicy: (policy: Partial<SecurityPolicy>) => void

  // Helpers
  getActiveUser: () => UserAccount
  getActiveRole: () => ERPRole | undefined
  canAccessModule: (moduleId: string, mode?: 'read' | 'write') => boolean
  canAccessAdminSettings: () => boolean
}

export const INITIAL_MODULES: ERPModule[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    category: 'Operations',
    url: '/',
    description: 'Executive overview, key metrics, and daily operational feed',
    isActive: true,
  },
  {
    id: 'commercial',
    name: 'Commercial',
    category: 'Commercial & Finance',
    url: '/commercial',
    description: 'Client accounts, service quotations, and client agreements',
    isActive: true,
    subModules: [
      { id: 'client-accounts', name: 'Client Accounts', url: '/commercial/client-accounts' },
      { id: 'service-quotations', name: 'Service Quotations', url: '/commercial/service-quotations' },
      { id: 'client-contracts', name: 'Client Contracts', url: '/commercial/client-contracts' },
    ],
  },
  {
    id: 'compliance',
    name: 'Customs & Compliance',
    category: 'Operations',
    url: '/compliance',
    description: 'Customs declarations (PI/PEB), trade licenses, and HS code tariffs',
    isActive: true,
    subModules: [
      { id: 'customs-declarations', name: 'Customs Declarations', url: '/compliance/customs-declarations' },
      { id: 'trade-licenses', name: 'Trade Licenses', url: '/compliance/trade-licenses' },
      { id: 'duty-tariffs', name: 'Duty Tariffs', url: '/compliance/duty-tariffs' },
    ],
  },
  {
    id: 'logistics',
    name: 'Logistics & Freight',
    category: 'Operations',
    url: '/logistics',
    description: 'Shipment tracking, bill of lading, packing list, vessel schedules',
    isActive: true,
    subModules: [
      { id: 'shipments', name: 'Shipments', url: '/logistics/shipments' },
      { id: 'shipping-instructions', name: 'Shipping Instructions', url: '/logistics/shipping-instructions' },
      { id: 'packing-list', name: 'Packing List', url: '/logistics/packing-list' },
      { id: 'cargo-tracking', name: 'Cargo Tracking', url: '/logistics/cargo-tracking' },
      { id: 'dnd-fee', name: 'DnD Fee', url: '/logistics/dnd-fee' },
    ],
  },
  {
    id: 'procurement',
    name: 'Procurement & Vendors',
    category: 'Operations',
    url: '/procurement',
    description: 'Carrier partner directory, ocean/air rates, and vendor purchase orders',
    isActive: true,
    subModules: [
      { id: 'partner-directory', name: 'Partner Directory', url: '/procurement/partner-directory' },
      { id: 'vendor-rates', name: 'Vendor Rates', url: '/procurement/vendor-rates' },
      { id: 'purchase-orders', name: 'Purchase Orders', url: '/procurement/purchase-orders' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    category: 'Commercial & Finance',
    url: '/finance',
    description: 'Invoicing, accounts receivable, cost accruals, vendor bills, GL',
    isActive: true,
    subModules: [
      { id: 'overview', name: 'Overview', url: '/finance/overview' },
      { id: 'client-invoicing', name: 'Client Invoices', url: '/finance/client-invoicing' },
      { id: 'accounts-receivable', name: 'Accounts Receivable', url: '/finance/accounts-receivable' },
      { id: 'cost-accruals', name: 'Cost Accruals', url: '/finance/cost-accruals' },
      { id: 'vendor-bills', name: 'Vendor Bills', url: '/finance/vendor-bills' },
      { id: 'general-ledger', name: 'General Ledger', url: '/finance/general-ledger' },
    ],
  },
  {
    id: 'document-hub',
    name: 'Document Hub',
    category: 'Operations',
    url: '/document-hub',
    description: 'Central repository for shipping documents, BL, invoices, COO',
    isActive: true,
  },
  {
    id: 'analytics',
    name: 'Analytics & Intelligence',
    category: 'Administration',
    url: '/analytics',
    description: 'Corporate BI, route yields, freight cost analysis, and forecasting',
    isActive: true,
  },
  {
    id: 'productivity',
    name: 'Initiatives & Tasks',
    category: 'Administration',
    url: '/productivity',
    description: 'Team tasks, milestone tracking, and operational action items',
    isActive: true,
  },
  {
    id: 'mail',
    name: 'Corporate Mail',
    category: 'Administration',
    url: '/mail',
    description: 'Integrated corporate communications & freight inquiries',
    isActive: true,
  },
  {
    id: 'chats',
    name: 'Internal Chat',
    category: 'Administration',
    url: '/chats',
    description: 'Real-time internal team messaging & operational channels',
    isActive: true,
  },
  {
    id: 'users',
    name: 'User Directory',
    category: 'Administration',
    url: '/users',
    description: 'Employee corporate directory & contact information',
    isActive: true,
  },
  {
    id: 'admin-settings',
    name: 'Admin Settings',
    category: 'Administration',
    url: '/admin-settings',
    description: 'ICT control center, user accounts, roles, permissions, audit trail',
    isActive: true,
  },
]

export const INITIAL_ROLES: ERPRole[] = [
  {
    id: 'role-ict-admin',
    name: 'ICT Admin (Full Control)',
    department: 'ICT & Systems Administration',
    description: 'Full administrative access to all modules, RBAC controls, and security policies',
    isSystemAdmin: true,
    permissions: INITIAL_MODULES.map((m) => ({ moduleId: m.id, read: true, write: true })),
  },
  {
    id: 'role-logistics-mgr',
    name: 'Logistics & Freight Specialist',
    department: 'Operations / Freight Forwarding',
    description: 'Full control over shipments, packing lists, tracking; read-only on finance and compliance',
    isSystemAdmin: false,
    permissions: [
      { moduleId: 'dashboard', read: true, write: true },
      { moduleId: 'logistics', read: true, write: true },
      { moduleId: 'procurement', read: true, write: false },
      { moduleId: 'compliance', read: true, write: false },
      { moduleId: 'commercial', read: true, write: false },
      { moduleId: 'finance', read: false, write: false },
      { moduleId: 'document-hub', read: true, write: true },
      { moduleId: 'analytics', read: true, write: false },
      { moduleId: 'productivity', read: true, write: true },
      { moduleId: 'mail', read: true, write: true },
      { moduleId: 'chats', read: true, write: true },
      { moduleId: 'users', read: true, write: false },
      { moduleId: 'admin-settings', read: false, write: false },
    ],
  },
  {
    id: 'role-customs-officer',
    name: 'Customs & Compliance Officer',
    department: 'Compliance / Customs Clearance',
    description: 'Full control over customs declarations, PIB/PEB, duty tariffs, and trade permits',
    isSystemAdmin: false,
    permissions: [
      { moduleId: 'dashboard', read: true, write: true },
      { moduleId: 'compliance', read: true, write: true },
      { moduleId: 'logistics', read: true, write: false },
      { moduleId: 'procurement', read: true, write: false },
      { moduleId: 'commercial', read: false, write: false },
      { moduleId: 'finance', read: false, write: false },
      { moduleId: 'document-hub', read: true, write: true },
      { moduleId: 'analytics', read: true, write: false },
      { moduleId: 'productivity', read: true, write: true },
      { moduleId: 'mail', read: true, write: true },
      { moduleId: 'chats', read: true, write: true },
      { moduleId: 'users', read: true, write: false },
      { moduleId: 'admin-settings', read: false, write: false },
    ],
  },
  {
    id: 'role-finance-lead',
    name: 'Finance & Accounting Lead',
    department: 'Finance & Revenue',
    description: 'Full control over invoices, Accounts Receivable, GL, cost accruals, and vendor bills',
    isSystemAdmin: false,
    permissions: [
      { moduleId: 'dashboard', read: true, write: true },
      { moduleId: 'finance', read: true, write: true },
      { moduleId: 'commercial', read: true, write: false },
      { moduleId: 'procurement', read: true, write: false },
      { moduleId: 'logistics', read: true, write: false },
      { moduleId: 'compliance', read: true, write: false },
      { moduleId: 'document-hub', read: true, write: false },
      { moduleId: 'analytics', read: true, write: true },
      { moduleId: 'productivity', read: true, write: true },
      { moduleId: 'mail', read: true, write: true },
      { moduleId: 'chats', read: true, write: true },
      { moduleId: 'users', read: true, write: false },
      { moduleId: 'admin-settings', read: false, write: false },
    ],
  },
  {
    id: 'role-commercial-mgr',
    name: 'Commercial Account Executive',
    department: 'Marketing',
    description: 'Manages client accounts, service quotations, and commercial contracts',
    isSystemAdmin: false,
    permissions: [
      { moduleId: 'dashboard', read: true, write: true },
      { moduleId: 'commercial', read: true, write: true },
      { moduleId: 'finance', read: true, write: false },
      { moduleId: 'logistics', read: true, write: false },
      { moduleId: 'procurement', read: true, write: false },
      { moduleId: 'compliance', read: false, write: false },
      { moduleId: 'document-hub', read: true, write: true },
      { moduleId: 'analytics', read: true, write: false },
      { moduleId: 'productivity', read: true, write: true },
      { moduleId: 'mail', read: true, write: true },
      { moduleId: 'chats', read: true, write: true },
      { moduleId: 'users', read: true, write: false },
      { moduleId: 'admin-settings', read: false, write: false },
    ],
  },
  {
    id: 'role-proc-mgr',
    name: 'Procurement & Vendor Specialist',
    department: 'Procurement',
    description: 'Manages vendor directory, carrier rates, and purchase orders',
    isSystemAdmin: false,
    permissions: [
      { moduleId: 'dashboard', read: true, write: true },
      { moduleId: 'procurement', read: true, write: true },
      { moduleId: 'logistics', read: true, write: false },
      { moduleId: 'finance', read: true, write: false },
      { moduleId: 'compliance', read: true, write: false },
      { moduleId: 'commercial', read: true, write: false },
      { moduleId: 'document-hub', read: true, write: true },
      { moduleId: 'analytics', read: true, write: false },
      { moduleId: 'productivity', read: true, write: true },
      { moduleId: 'mail', read: true, write: true },
      { moduleId: 'chats', read: true, write: true },
      { moduleId: 'users', read: true, write: false },
      { moduleId: 'admin-settings', read: false, write: false },
    ],
  },
]

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-001',
    username: 'fdrahman',
    name: 'Fadhlur Rahman',
    email: 'fdrahman@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'ICT',
    position: 'ICT Manager',
    roleId: 'role-ict-admin',
    status: 'active',
    lastActive: '2026-08-03 11:30 WIB',
  },
  {
    id: 'usr-014',
    username: 'adita01',
    name: 'Rudi Aditama',
    email: 'rudi.aditama@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'ICT',
    position: 'ICT Officer',
    roleId: 'role-ict-admin',
    status: 'active',
    lastActive: '2026-08-03 10:15 WIB',
  },
  {
    id: 'usr-002',
    username: 'sugia01',
    name: 'Bambang Sugianto',
    email: 'bambang.sugianto@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'Operation',
    position: 'Operation Manager',
    roleId: 'role-logistics-mgr',
    status: 'active',
    lastActive: '2026-08-03 11:00 WIB',
  },
  {
    id: 'usr-003',
    username: 'prata01',
    name: 'Rizky Pratama',
    email: 'rizky.pratama@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'Operation',
    position: 'Export Officer',
    roleId: 'role-logistics-mgr',
    status: 'active',
    lastActive: '2026-08-03 10:45 WIB',
  },
  {
    id: 'usr-004',
    username: 'lesta01',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'Operation',
    position: 'Import Officer',
    roleId: 'role-logistics-mgr',
    status: 'active',
    lastActive: '2026-08-03 09:20 WIB',
  },
  {
    id: 'usr-005',
    username: 'kurna01',
    name: 'Hendra Kurniawan',
    email: 'hendra.kurniawan@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'Operation',
    position: 'Customs Clearance Officer',
    roleId: 'role-customs-officer',
    status: 'active',
    lastActive: '2026-08-03 11:10 WIB',
  },
  {
    id: 'usr-006',
    username: 'prata02',
    name: 'Budi Pratama',
    email: 'budi.pratama@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'Marketing',
    position: 'Marketing Manager',
    roleId: 'role-commercial-mgr',
    status: 'active',
    lastActive: '2026-08-03 10:00 WIB',
  },
  {
    id: 'usr-007',
    username: 'saput01',
    name: 'Aditia Saputra',
    email: 'aditia.saputra@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'Marketing',
    position: 'Account Officer',
    roleId: 'role-commercial-mgr',
    status: 'active',
    lastActive: '2026-08-03 11:25 WIB',
  },
  {
    id: 'usr-008',
    username: 'indah01',
    name: 'Maya Indah',
    email: 'maya.indah@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'Marketing',
    position: 'Customer Service Officer',
    roleId: 'role-commercial-mgr',
    status: 'active',
    lastActive: '2026-08-03 08:50 WIB',
  },
  {
    id: 'usr-009',
    username: 'hiday01',
    name: 'Farhan Hidayat',
    email: 'farhan.hidayat@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'Procurement',
    position: 'Procurement Manager',
    roleId: 'role-proc-mgr',
    status: 'active',
    lastActive: '2026-08-03 09:40 WIB',
  },
  {
    id: 'usr-010',
    username: 'nugra01',
    name: 'Kevin Nugraha',
    email: 'kevin.nugraha@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'Procurement',
    position: 'Pricing & Vendor Officer',
    roleId: 'role-proc-mgr',
    status: 'active',
    lastActive: '2026-08-03 10:30 WIB',
  },
  {
    id: 'usr-011',
    username: 'wahyu01',
    name: 'Sri Wahyuni',
    email: 'sri.wahyuni@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'Finance',
    position: 'Finance Manager',
    roleId: 'role-finance-lead',
    status: 'active',
    lastActive: '2026-08-03 11:15 WIB',
  },
  {
    id: 'usr-012',
    username: 'fitri01',
    name: 'Anisa Fitriani',
    email: 'anisa.fitriani@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'Finance',
    position: 'AR & Billing Officer',
    roleId: 'role-finance-lead',
    status: 'active',
    lastActive: '2026-08-03 11:05 WIB',
  },
  {
    id: 'usr-013',
    username: 'ramad01',
    name: 'Fajar Ramadhan',
    email: 'fajar.ramadhan@rexcorp.id',
    avatar: '/avatars/shadcn.jpg',
    department: 'Finance',
    position: 'AP & Tax Officer',
    roleId: 'role-finance-lead',
    status: 'active',
    lastActive: '2026-08-03 09:10 WIB',
  },
]

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-08-03 08:28:12',
    userId: 'usr-001',
    userName: 'Fadhlur Rahman',
    userRole: 'ICT Admin (Full Control)',
    action: 'LOGIN',
    module: 'Authentication',
    target: 'System Login',
    details: 'User logged in successfully via SAML SSO',
    ipAddress: '10.120.4.15',
  },
  {
    id: 'log-002',
    timestamp: '2026-08-03 08:12:00',
    userId: 'usr-002',
    userName: 'Hendra Tan',
    userRole: 'Logistics & Freight Specialist',
    action: 'UPDATE',
    module: 'Logistics & Freight',
    target: 'Shipment SHP-2026-0891',
    details: 'Updated Vessel ETD date to 05 Aug 2026',
    ipAddress: '10.120.4.22',
  },
  {
    id: 'log-003',
    timestamp: '2026-08-03 07:45:30',
    userId: 'usr-004',
    userName: 'Siti Rahma',
    userRole: 'Finance & Accounting Lead',
    action: 'CREATE',
    module: 'Finance & Accounting',
    target: 'Invoice INV-2026-0182',
    details: 'Generated client invoice for PT Samudera Logistics',
    ipAddress: '10.120.5.11',
  },
  {
    id: 'log-004',
    timestamp: '2026-08-02 16:20:05',
    userId: 'usr-001',
    userName: 'Fadhlur Rahman',
    userRole: 'ICT Admin (Full Control)',
    action: 'PERM_CHANGE',
    module: 'Admin Settings',
    target: 'Role: Customs & Compliance Officer',
    details: 'Modified read-write permission for Document Hub module',
    ipAddress: '10.120.4.15',
  },
  {
    id: 'log-005',
    timestamp: '2026-08-02 14:10:00',
    userId: 'usr-003',
    userName: 'Budi Santoso',
    userRole: 'Customs & Compliance Officer',
    action: 'CREATE',
    module: 'Customs & Compliance',
    target: 'PEB Declaration PEB-88392',
    details: 'Submitted customs export declaration for Tanjung Priok',
    ipAddress: '10.120.6.8',
  },
]

export const INITIAL_SECURITY_POLICY: SecurityPolicy = {
  mfaEnforced: true,
  passwordMinLength: 12,
  passwordExpireDays: 90,
  sessionTimeoutMinutes: 30,
  ipWhitelist: ['10.120.0.0/16', '192.168.1.0/24'],
  maxFailedLogins: 5,
  requireSpecialChar: true,
}

export const useRbacStore = create<RbacState>()(
  persist(
    (set, get) => ({
      activeUserId: 'usr-001',
      users: INITIAL_USERS,
      roles: INITIAL_ROLES,
      modules: INITIAL_MODULES,
      auditLogs: INITIAL_AUDIT_LOGS,
      securityPolicy: [INITIAL_SECURITY_POLICY],

      setActiveUserId: (userId) => {
        set({ activeUserId: userId })
        const user = get().users.find((u) => u.id === userId)
        if (user) {
          setCurrentSessionUser(`${user.name} (${user.position})`)
          get().addAuditLog({
            userId: user.id,
            userName: user.name,
            userRole: get().roles.find((r) => r.id === user.roleId)?.name || 'User',
            action: 'LOGIN',
            module: 'User Switcher',
            target: 'Active User Profile',
            details: `Switched active logged-in profile to ${user.name} (${user.email})`,
            ipAddress: '127.0.0.1',
          })
        }
      },

      addUser: (userData) => {
        const id = `usr-${Date.now().toString().slice(-4)}`
        const newUser: UserAccount = {
          ...userData,
          id,
          lastActive: 'Just created',
        }
        set((state) => ({ users: [...state.users, newUser] }))
        const currentUser = get().getActiveUser()
        get().addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: get().getActiveRole()?.name || 'Admin',
          action: 'CREATE',
          module: 'Admin Settings',
          target: `User Account: ${newUser.name}`,
          details: `Created new user account for ${newUser.email}`,
          ipAddress: '127.0.0.1',
        })
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        }))
        const currentUser = get().getActiveUser()
        get().addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: get().getActiveRole()?.name || 'Admin',
          action: 'UPDATE',
          module: 'Admin Settings',
          target: `User Account ID: ${id}`,
          details: `Updated user account details`,
          ipAddress: '127.0.0.1',
        })
      },

      deleteUser: (id) => {
        const targetUser = get().users.find((u) => u.id === id)
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }))
        if (targetUser) {
          const currentUser = get().getActiveUser()
          get().addAuditLog({
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: get().getActiveRole()?.name || 'Admin',
            action: 'DELETE',
            module: 'Admin Settings',
            target: `User Account: ${targetUser.name}`,
            details: `Deleted user account ${targetUser.email}`,
            ipAddress: '127.0.0.1',
          })
        }
      },

      addRole: (roleData) => {
        const id = `role-${Date.now().toString().slice(-4)}`
        const newRole: ERPRole = { ...roleData, id }
        set((state) => ({ roles: [...state.roles, newRole] }))
        const currentUser = get().getActiveUser()
        get().addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: get().getActiveRole()?.name || 'Admin',
          action: 'CREATE',
          module: 'Admin Settings',
          target: `Role: ${newRole.name}`,
          details: `Created new ERP role definition`,
          ipAddress: '127.0.0.1',
        })
      },

      updateRole: (id, updates) => {
        set((state) => ({
          roles: state.roles.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }))
      },

      deleteRole: (id) => {
        set((state) => ({
          roles: state.roles.filter((r) => r.id !== id),
        }))
      },

      toggleModuleActive: (id) => {
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, isActive: !m.isActive } : m
          ),
        }))
      },

      updateModulePermissionsForRole: (roleId, moduleId, field, value) => {
        set((state) => ({
          roles: state.roles.map((r) => {
            if (r.id !== roleId) return r
            const existingPerms = r.permissions || []
            const exists = existingPerms.some((p) => p.moduleId === moduleId)

            let updatedPerms: ModulePermission[]
            if (exists) {
              updatedPerms = existingPerms.map((p) => {
                if (p.moduleId !== moduleId) return p
                return { ...p, [field]: value }
              })
            } else {
              updatedPerms = [
                ...existingPerms,
                { moduleId, read: field === 'read' ? value : false, write: field === 'write' ? value : false },
              ]
            }
            return { ...r, permissions: updatedPerms }
          }),
        }))

        const currentUser = get().getActiveUser()
        const targetRole = get().roles.find((r) => r.id === roleId)
        get().addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: get().getActiveRole()?.name || 'Admin',
          action: 'PERM_CHANGE',
          module: 'Admin Settings',
          target: `Role: ${targetRole?.name || roleId}`,
          details: `Updated ${field.toUpperCase()} permission for module '${moduleId}' to ${value}`,
          ipAddress: '127.0.0.1',
        })
      },

      addAuditLog: (logData) => {
        const newLog: AuditLog = {
          ...logData,
          id: `log-${Date.now().toString().slice(-5)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        }
        set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }))
      },

      updateSecurityPolicy: (policyUpdates) => {
        set((state) => {
          const current = state.securityPolicy[0] || INITIAL_SECURITY_POLICY
          return { securityPolicy: [{ ...current, ...policyUpdates }] }
        })
        const currentUser = get().getActiveUser()
        get().addAuditLog({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: get().getActiveRole()?.name || 'Admin',
          action: 'POLICY_CHANGE',
          module: 'Admin Settings',
          target: 'Security Policy',
          details: `Updated system security policy settings`,
          ipAddress: '127.0.0.1',
        })
      },

      getActiveUser: () => {
        const { users, activeUserId } = get()
        return users.find((u) => u.id === activeUserId) || users[0] || INITIAL_USERS[0]
      },

      getActiveRole: () => {
        const user = get().getActiveUser()
        return get().roles.find((r) => r.id === user.roleId)
      },

      canAccessModule: (moduleId, mode = 'read') => {
        const user = get().getActiveUser()
        if (user.status !== 'active') return false

        // Check custom user override
        if (user.customOverrides && user.customOverrides[moduleId]) {
          return user.customOverrides[moduleId][mode]
        }

        const role = get().roles.find((r) => r.id === user.roleId)
        if (!role) return false
        if (role.isSystemAdmin) return true

        const SUBMODULE_PARENT_MAP: Record<string, string> = {
          'client-accounts': 'commercial',
          'service-quotations': 'commercial',
          'client-contracts': 'commercial',

          'customs-declarations': 'compliance',
          'trade-licenses': 'compliance',
          'duty-tariffs': 'compliance',

          'shipments': 'logistics',
          'shipping-instructions': 'logistics',
          'packing-list': 'logistics',
          'cargo-tracking': 'logistics',
          'dnd-fee': 'logistics',

          'partner-directory': 'procurement',
          'vendor-rates': 'procurement',
          'purchase-orders': 'procurement',

          'overview': 'finance',
          'client-invoicing': 'finance',
          'accounts-receivable': 'finance',
          'cost-accruals': 'finance',
          'vendor-bills': 'finance',
          'general-ledger': 'finance',
        }

        let perm = role.permissions.find((p) => p.moduleId === moduleId)
        if (!perm && SUBMODULE_PARENT_MAP[moduleId]) {
          const parentId = SUBMODULE_PARENT_MAP[moduleId]
          perm = role.permissions.find((p) => p.moduleId === parentId)
        }

        if (!perm) return false
        return mode === 'write' ? perm.write : perm.read
      },

      canAccessAdminSettings: () => {
        const user = get().getActiveUser()
        if (user.status !== 'active') return false
        const role = get().roles.find((r) => r.id === user.roleId)
        if (!role) return false
        if (role.isSystemAdmin) return true
        const perm = role.permissions.find((p) => p.moduleId === 'admin-settings')
        return perm ? perm.read : false
      },
    }),
    {
      name: 'erp-rbac-storage',
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          return {
            ...persistedState,
            users: INITIAL_USERS,
            roles: INITIAL_ROLES,
          }
        }
        return persistedState
      },
      partialize: (state) => ({
        activeUserId: state.activeUserId,
        users: state.users,
        roles: state.roles,
        modules: state.modules,
        auditLogs: state.auditLogs,
        securityPolicy: state.securityPolicy,
      }),
    }
  )
)
