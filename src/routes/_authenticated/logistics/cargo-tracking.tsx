import { createFileRoute } from '@tanstack/react-router'
import { CargoTracking } from '@/features/logistics'

export const Route = createFileRoute('/_authenticated/logistics/cargo-tracking')({
  component: CargoTracking,
})
