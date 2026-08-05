import { createFileRoute } from '@tanstack/react-router'
import PurchaseOrdersPage from '@/features/procurement/purchase-orders'

export const Route = createFileRoute('/_authenticated/procurement/purchase-orders')({
  component: PurchaseOrdersPage,
})
