import { createFileRoute } from '@tanstack/react-router'
import { FinanceOverview } from '@/features/finance'

export const Route = createFileRoute('/_authenticated/finance/overview')({
  component: FinanceOverview,
})
