import { z } from 'zod'

const quotationStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type QuotationStatus = z.infer<typeof quotationStatusSchema>

const quotationRoleSchema = z.union([
  z.literal('superadmin'), // Air Freight
  z.literal('admin'),      // Ocean Freight
  z.literal('manager'),    // Customs Clearance
  z.literal('cashier'),    // Warehousing
])

const quotationSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(), // acts as Quotation Number, e.g., QT-2026-0001
  email: z.string(),
  phoneNumber: z.string(),
  status: quotationStatusSchema,
  role: quotationRoleSchema,
  amount: z.string(),
  validUntil: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Quotation = z.infer<typeof quotationSchema>

export const quotationListSchema = z.array(quotationSchema)
