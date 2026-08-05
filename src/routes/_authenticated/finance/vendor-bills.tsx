import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { VendorBillsFeature } from '@/features/finance/vendor-bills/index'

const billsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  approvalStatus: z.array(z.string()).optional().catch([]),
  paymentStatus: z.array(z.string()).optional().catch([]),
  billNumber: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/finance/vendor-bills')({
  validateSearch: billsSearchSchema,
  component: VendorBillsFeature,
})
