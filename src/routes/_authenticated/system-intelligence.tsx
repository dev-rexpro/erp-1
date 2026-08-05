import { createFileRoute } from '@tanstack/react-router'
import { SystemIntelligence } from '@/features/system-intelligence'

export const Route = createFileRoute('/_authenticated/system-intelligence')({
  component: SystemIntelligence,
})
