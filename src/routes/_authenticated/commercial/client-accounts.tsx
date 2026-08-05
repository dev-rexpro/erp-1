import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ClientAccounts } from '@/features/client-accounts'

const clientAccountsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.array(z.string()).optional().catch([]),
  country: z.array(z.string()).optional().catch([]),
  tier: z.array(z.string()).optional().catch([]),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute(
  '/_authenticated/commercial/client-accounts'
)({
  validateSearch: clientAccountsSearchSchema,
  component: ClientAccounts,
})

