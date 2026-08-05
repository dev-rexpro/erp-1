import { createFileRoute } from '@tanstack/react-router'
import { CustomsDeclarationsView } from '@/features/compliance/components/customs-declarations'

export const Route = createFileRoute('/_authenticated/compliance/customs-declarations')({
  component: CustomsDeclarationsView,
})
