import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/system-intelligence')({
  beforeLoad: () => {
    throw redirect({
      to: '/admin-settings/system-intelligence',
    })
  },
})
