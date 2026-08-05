import { Plane, Ship, Truck, Train } from 'lucide-react'
import { type ShipmentStatus } from './schema'

export const callTypes = new Map<ShipmentStatus, string>([
  ['active', 'bg-blue-100/30 text-blue-900 border-blue-200 dark:text-blue-200'],        // In Transit
  ['inactive', 'bg-emerald-100/30 text-emerald-900 border-emerald-200 dark:text-emerald-200'], // Delivered
  ['invited', 'bg-amber-100/30 text-amber-900 border-amber-200 dark:text-amber-200'],    // Scheduled
  ['suspended', 'bg-destructive/10 text-destructive border-destructive/10 dark:bg-destructive/50 dark:text-primary'], // Delayed
])

export const roles = [
  {
    label: 'Air Freight',
    value: 'superadmin',
    icon: Plane,
  },
  {
    label: 'Ocean Freight',
    value: 'admin',
    icon: Ship,
  },
  {
    label: 'Land Transport',
    value: 'manager',
    icon: Truck,
  },
  {
    label: 'Rail Freight',
    value: 'cashier',
    icon: Train,
  },
] as const
