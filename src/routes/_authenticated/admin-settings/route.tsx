import { createFileRoute } from '@tanstack/react-router'
import { AdminSettingsLayout } from '@/features/admin-settings/admin-settings-layout'

export const Route = createFileRoute('/_authenticated/admin-settings')({
  component: AdminSettingsLayout,
})
