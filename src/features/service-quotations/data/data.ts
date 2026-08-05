import { Plane, Ship, FileText, Warehouse } from 'lucide-react'
import { type QuotationStatus } from './schema'

export const callTypes = new Map<QuotationStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 border-teal-200 dark:text-teal-200'],    // Accepted
  ['inactive', 'bg-neutral-300/40 text-neutral-800 border-neutral-300'],           // Expired
  ['invited', 'bg-sky-200/40 text-sky-900 border-sky-300 dark:text-sky-100'],      // Draft
  ['suspended', 'bg-destructive/10 text-destructive border-destructive/10 dark:bg-destructive/50 dark:text-primary'], // Rejected
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
    label: 'Customs Clearance',
    value: 'manager',
    icon: FileText,
  },
  {
    label: 'Warehousing',
    value: 'cashier',
    icon: Warehouse,
  },
] as const
