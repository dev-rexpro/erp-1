import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ClientContracts } from '@/features/client-contracts'

const contractsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('invited'),
        z.literal('suspended'),
      ])
    )
    .optional()
    .catch([]),
  role: z
    .array(z.enum(['superadmin', 'admin', 'manager', 'cashier']))
    .optional()
    .catch([]),
  username: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/commercial/client-contracts')({
  validateSearch: contractsSearchSchema,
  component: ClientContracts,
})


