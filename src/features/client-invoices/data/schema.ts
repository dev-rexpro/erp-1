import { z } from 'zod'

const invoiceStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>

const invoiceRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('manager'),
  z.literal('cashier'),
])

const invoiceSchema = z.object({
  id: z.string(),
  firstName: z.string(), // Client name
  lastName: z.string(),
  username: z.string(), // Invoice number, e.g. INV-2026-1000
  email: z.string(),
  phoneNumber: z.string(),
  status: invoiceStatusSchema,
  role: invoiceRoleSchema,
  amount: z.string(),
  dueDate: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Invoice = z.infer<typeof invoiceSchema>

export const invoiceListSchema = z.array(invoiceSchema)
