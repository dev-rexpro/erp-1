import { Package, Layers, Boxes, Truck } from 'lucide-react'
import { type PackingListStatus } from './schema'

export const callTypes = new Map<PackingListStatus, string>([
  ['active', 'bg-emerald-100/30 text-emerald-900 border-emerald-200 dark:text-emerald-200'],    // Approved
  ['inactive', 'bg-neutral-300/40 text-neutral-800 border-neutral-300'],                       // Received
  ['invited', 'bg-sky-200/40 text-sky-900 border-sky-300 dark:text-sky-100'],                  // Draft
  ['suspended', 'bg-blue-100/30 text-blue-900 border-blue-200 dark:text-blue-200'],            // Shipped
])

export const roles = [
  {
    label: 'Cartons',
    value: 'superadmin',
    icon: Package,
  },
  {
    label: 'Pallets',
    value: 'admin',
    icon: Layers,
  },
  {
    label: 'Wooden Crates',
    value: 'manager',
    icon: Boxes,
  },
  {
    label: 'Containers',
    value: 'cashier',
    icon: Truck,
  },
] as const
