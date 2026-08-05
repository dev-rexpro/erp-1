import { createFileRoute } from '@tanstack/react-router'
import { RolesPermissionsView } from '@/features/admin-settings/roles-permissions-view'

export const Route = createFileRoute('/_authenticated/admin-settings/roles')({
  component: RolesPermissionsView,
})
