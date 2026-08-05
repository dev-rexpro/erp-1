import React from 'react'
import { ResourcePage } from '@/components/resource/ResourcePage'
import { roleSchema } from '@/resources/role.schema'

export function RolesPermissionsView() {
  return <ResourcePage schema={roleSchema} />
}

export default RolesPermissionsView
