import React from 'react'
import { ResourcePage } from '@/components/resource/ResourcePage'
import { userAccountSchema } from '@/resources/user-account.schema'

export function UserAccountsView() {
  return <ResourcePage schema={userAccountSchema} />
}

export default UserAccountsView
