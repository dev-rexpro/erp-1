import { createFileRoute } from '@tanstack/react-router'
import { Productivity } from '@/features/productivity'

export const Route = createFileRoute('/_authenticated/productivity')({
  component: Productivity,
})
