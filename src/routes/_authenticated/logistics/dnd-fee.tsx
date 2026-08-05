import { createFileRoute } from '@tanstack/react-router'
import { DndFeeFeature } from '@/features/dnd-fee'

export const Route = createFileRoute('/_authenticated/logistics/dnd-fee')({
  component: DndFeeFeature,
})
