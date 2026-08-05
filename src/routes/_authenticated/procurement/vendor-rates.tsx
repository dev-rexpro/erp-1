import { createFileRoute } from '@tanstack/react-router'
import VendorRatesPage from '@/features/procurement/vendor-rates'

export const Route = createFileRoute('/_authenticated/procurement/vendor-rates')({
  component: VendorRatesPage,
})
