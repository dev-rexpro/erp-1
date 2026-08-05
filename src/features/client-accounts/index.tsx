import React from 'react'
import { ResourcePage } from '@/components/resource/ResourcePage'
import { companySchema } from '@/resources/company.schema'

export function ClientAccounts() {
  return <ResourcePage schema={companySchema} />
}

export default ClientAccounts
