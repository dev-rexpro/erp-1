import { createFileRoute } from '@tanstack/react-router'
import { PackingLists } from '@/features/packing-lists'

export const Route = createFileRoute('/_authenticated/logistics/packing-list')({
  component: PackingLists,
})
