import { createFileRoute } from '@tanstack/react-router'
import { AuditLogsView } from '@/features/admin-settings/audit-logs-view'

export const Route = createFileRoute('/_authenticated/admin-settings/audit-logs')({
  component: AuditLogsView,
})
