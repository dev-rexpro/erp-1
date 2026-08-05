import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { GeneralLedgerFeature } from '@/features/finance/general-ledger/index'

const glSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.array(z.string()).optional().catch([]),
  voucherNo: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/finance/general-ledger')({
  validateSearch: glSearchSchema,
  component: GeneralLedgerFeature,
})
