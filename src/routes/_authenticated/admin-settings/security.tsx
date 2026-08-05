import { createFileRoute } from '@tanstack/react-router'
import { SecurityPoliciesView } from '@/features/admin-settings/security-policies-view'

export const Route = createFileRoute('/_authenticated/admin-settings/security')({
  component: SecurityPoliciesView,
})
