import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { CostAccrualsFeature } from '@/features/finance/cost-accruals/index'

const accrualsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.array(z.string()).optional().catch([]),
  category: z.array(z.string()).optional().catch([]),
  id: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/finance/cost-accruals')({
  validateSearch: accrualsSearchSchema,
  component: CostAccrualsFeature,
})
