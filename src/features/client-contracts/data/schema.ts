import { z } from 'zod'

const contractStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type ContractStatus = z.infer<typeof contractStatusSchema>

const contractRoleSchema = z.union([
  z.literal('superadmin'), // Annual Master Agreement
  z.literal('admin'),      // SLA
  z.literal('manager'),    // NDA
  z.literal('cashier'),    // Ad-Hoc
])

const contractSchema = z.object({
  id: z.string(),
  firstName: z.string(), // Company / client name
  lastName: z.string(),
  username: z.string(), // acts as Contract Code e.g. CTR-2026-0034
  email: z.string(),
  phoneNumber: z.string(),
  status: contractStatusSchema,
  role: contractRoleSchema,
  amount: z.string(),
  validUntil: z.string(), // End date
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Contract = z.infer<typeof contractSchema>

export const contractListSchema = z.array(contractSchema)
