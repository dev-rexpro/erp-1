import { Shield, FileCheck, Lock, Briefcase } from 'lucide-react'
import { type ContractStatus } from './schema'

export const callTypes = new Map<ContractStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 border-teal-200 dark:text-teal-200'],    // Active
  ['inactive', 'bg-neutral-300/40 text-neutral-800 border-neutral-300'],           // Expired
  ['invited', 'bg-sky-200/40 text-sky-900 border-sky-300 dark:text-sky-100'],      // Pending Sign
  ['suspended', 'bg-destructive/10 text-destructive border-destructive/10 dark:bg-destructive/50 dark:text-primary'], // Terminated
])

export const roles = [
  {
    label: 'Annual Master Agreement',
    value: 'superadmin',
    icon: Shield,
  },
  {
    label: 'Service Level Agreement',
    value: 'admin',
    icon: FileCheck,
  },
  {
    label: 'Non-Disclosure Agreement',
    value: 'manager',
    icon: Lock,
  },
  {
    label: 'Ad-Hoc Booking Contract',
    value: 'cashier',
    icon: Briefcase,
  },
] as const
