import { createFileRoute } from '@tanstack/react-router'
import { ShippingInstructions } from '@/features/shipping-instructions'

export const Route = createFileRoute('/_authenticated/logistics/shipping-instructions')({
  component: ShippingInstructions,
})
