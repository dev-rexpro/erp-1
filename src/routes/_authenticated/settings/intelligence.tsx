import { createFileRoute } from '@tanstack/react-router'
import { IntelligenceSettingsView } from '@/features/settings/intelligence'

export const Route = createFileRoute('/_authenticated/settings/intelligence')({
  component: IntelligenceSettingsView,
})
