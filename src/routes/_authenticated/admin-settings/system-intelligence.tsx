import { createFileRoute } from '@tanstack/react-router'
import { SystemIntelligence } from '@/features/system-intelligence'

export const Route = createFileRoute('/_authenticated/admin-settings/system-intelligence')({
  component: SystemIntelligence,
})
