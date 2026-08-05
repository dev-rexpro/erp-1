import { createFileRoute } from '@tanstack/react-router'
import { DataManagementSettings } from '@/features/settings/data-management'

export const Route = createFileRoute('/_authenticated/settings/data')({
  component: DataManagementSettings,
})
