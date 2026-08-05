import { createFileRoute } from '@tanstack/react-router'
import { TradeLicensesView } from '@/features/compliance/components/trade-licenses'

export const Route = createFileRoute('/_authenticated/compliance/trade-licenses')({
  component: TradeLicensesView,
})
