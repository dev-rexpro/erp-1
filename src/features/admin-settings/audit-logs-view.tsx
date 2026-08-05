import React from 'react'
import { ResourcePage } from '@/components/resource/ResourcePage'
import { auditLogSchema } from '@/resources/audit-log.schema'

export function AuditLogsView() {
  return <ResourcePage schema={auditLogSchema} />
}

export default AuditLogsView
