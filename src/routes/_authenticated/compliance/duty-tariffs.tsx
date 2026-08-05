import { createFileRoute } from '@tanstack/react-router'
import { DutyTariffsView } from '@/features/compliance/components/duty-tariffs'

export const Route = createFileRoute('/_authenticated/compliance/duty-tariffs')({
  component: DutyTariffsView,
})
