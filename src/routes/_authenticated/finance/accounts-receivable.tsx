import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { AccountsReceivableFeature } from '@/features/finance/accounts-receivable/index'

const arSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.array(z.string()).optional().catch([]),
  agingCategory: z.array(z.string()).optional().catch([]),
  invoiceNumber: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/finance/accounts-receivable')({
  validateSearch: arSearchSchema,
  component: AccountsReceivableFeature,
})
