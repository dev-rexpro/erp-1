import { create } from 'zustand'

export interface NotificationItem {
  id: string
  title: string
  description: string
  category: 'shipment' | 'compliance' | 'finance' | 'system'
  priority: 'urgent' | 'warning' | 'info' | 'success'
  isRead: boolean
  date: string
  time: string
  actionUrl?: string
  actionLabel?: string
  refNumber?: string
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-001',
    title: 'Customs Clearance Released',
    description: 'Shipment SHP-2026-0891 has passed customs inspection at Tanjung Priok Port (SPPB Issued).',
    category: 'shipment',
    priority: 'success',
    isRead: false,
    date: '03 Aug 2026',
    time: '14:32:10 WIB',
    actionUrl: '/logistics/shipments',
    actionLabel: 'View Shipment',
    refNumber: 'SHP-2026-0891',
  },
  {
    id: 'notif-002',
    title: 'License Expiration Warning',
    description: 'Import License (API-U) LIC-2026-0044 will expire in 12 days. Immediate renewal required.',
    category: 'compliance',
    priority: 'urgent',
    isRead: false,
    date: '03 Aug 2026',
    time: '11:15:00 WIB',
    actionUrl: '/compliance/trade-licenses',
    actionLabel: 'Manage License',
    refNumber: 'LIC-2026-0044',
  },
  {
    id: 'notif-003',
    title: 'Payment Received',
    description: 'Client PT Samudera Logistics paid Invoice INV-2026-0182 of IDR 85,500,000.',
    category: 'finance',
    priority: 'success',
    isRead: false,
    date: '03 Aug 2026',
    time: '09:45:30 WIB',
    actionUrl: '/finance/client-invoicing',
    actionLabel: 'View Invoice',
    refNumber: 'INV-2026-0182',
  },
  {
    id: 'notif-004',
    title: 'AI Risk Alert: Port Congestion',
    description: 'RexPro AI detected potential 2-day delay at Singapore Transshipment Hub for Route CGK-SIN.',
    category: 'system',
    priority: 'warning',
    isRead: true,
    date: '02 Aug 2026',
    time: '18:20:15 WIB',
    actionUrl: '/system-intelligence',
    actionLabel: 'View AI Insights',
    refNumber: 'AI-ANOMALY-09',
  },
  {
    id: 'notif-005',
    title: 'Bill of Lading Signature Required',
    description: 'Original BL-2026-9042 draft is ready for operational manager sign-off.',
    category: 'shipment',
    priority: 'warning',
    isRead: true,
    date: '02 Aug 2026',
    time: '15:10:00 WIB',
    actionUrl: '/logistics/shipping-instructions',
    actionLabel: 'Review Document',
    refNumber: 'BL-2026-9042',
  },
  {
    id: 'notif-006',
    title: 'Vendor Rate Updated',
    description: 'Maersk Line updated ocean freight rates for Jakarta - Rotterdam Q3 contract.',
    category: 'finance',
    priority: 'info',
    isRead: true,
    date: '01 Aug 2026',
    time: '16:05:40 WIB',
    actionUrl: '/procurement/vendor-rates',
    actionLabel: 'Check Rates',
    refNumber: 'VR-2026-102',
  },
  {
    id: 'notif-007',
    title: 'System Maintenance Scheduled',
    description: 'Standard system backup scheduled on 05 Aug 2026 from 01:00 to 03:00 WIB.',
    category: 'system',
    priority: 'info',
    isRead: true,
    date: '01 Aug 2026',
    time: '10:00:00 WIB',
  },
]

interface NotificationsStore {
  notifications: NotificationItem[]
  markAllAsRead: () => void
  toggleRead: (id: string) => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notifications: initialNotifications,
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),
  toggleRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: !n.isRead } : n
      ),
    })),
  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearAll: () => set({ notifications: [] }),
}))
