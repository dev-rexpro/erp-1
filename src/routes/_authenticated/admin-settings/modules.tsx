import { createFileRoute } from '@tanstack/react-router'
import { ModuleControlView } from '@/features/admin-settings/module-control-view'

export const Route = createFileRoute('/_authenticated/admin-settings/modules')({
  component: ModuleControlView,
})
