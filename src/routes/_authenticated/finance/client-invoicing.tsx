import { createFileRoute } from '@tanstack/react-router'
import { ClientInvoices } from '@/features/client-invoices'

export const Route = createFileRoute('/_authenticated/finance/client-invoicing')({
  component: ClientInvoices,
})

