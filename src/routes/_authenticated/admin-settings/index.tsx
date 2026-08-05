import { createFileRoute } from '@tanstack/react-router'
import { UserAccountsView } from '@/features/admin-settings/user-accounts-view'

export const Route = createFileRoute('/_authenticated/admin-settings/')({
  component: UserAccountsView,
})
