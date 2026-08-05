import React from 'react'
import { ResourcePage } from '@/components/resource/ResourcePage'
import { moduleControlSchema } from '@/resources/module-control.schema'

export function ModuleControlView() {
  return <ResourcePage schema={moduleControlSchema} />
}

export default ModuleControlView
