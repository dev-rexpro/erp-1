import { FileText, FileSpreadsheet, Receipt, CreditCard } from 'lucide-react'
import { type InvoiceStatus } from './schema'

export const callTypes = new Map<InvoiceStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 border-teal-200 dark:text-teal-200'],    // Paid
  ['inactive', 'bg-destructive/10 text-destructive border-destructive/10 dark:bg-destructive/50 dark:text-primary'], // Overdue
  ['invited', 'bg-sky-200/40 text-sky-900 border-sky-300 dark:text-sky-100'],      // Draft
  ['suspended', 'bg-neutral-300/40 text-neutral-800 border-neutral-300'],           // Canceled
])

export const roles = [
  {
    label: 'Commercial Invoice',
    value: 'superadmin',
    icon: FileText,
  },
  {
    label: 'Proforma Invoice',
    value: 'admin',
    icon: FileSpreadsheet,
  },
  {
    label: 'Tax Invoice',
    value: 'manager',
    icon: Receipt,
  },
  {
    label: 'Credit Note',
    value: 'cashier',
    icon: CreditCard,
  },
] as const
