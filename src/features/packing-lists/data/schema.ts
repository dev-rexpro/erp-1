import { z } from 'zod'

const packingListStatusSchema = z.union([
  z.literal('active'),      // Approved
  z.literal('inactive'),    // Received
  z.literal('invited'),     // Draft
  z.literal('suspended'),   // Shipped
])
export type PackingListStatus = z.infer<typeof packingListStatusSchema>

const packagingTypeSchema = z.union([
  z.literal('superadmin'), // Cartons
  z.literal('admin'),      // Pallets
  z.literal('manager'),    // Wooden Crates
  z.literal('cashier'),    // Containers
])

const packingListSchema = z.object({
  id: z.string(),
  firstName: z.string(),   // Client Name
  lastName: z.string(),
  username: z.string(),    // Packing List Reference
  email: z.string(),
  phoneNumber: z.string(),
  status: packingListStatusSchema,
  role: packagingTypeSchema,
  amount: z.string(),      // Package Count / Details
  validUntil: z.string(),  // Shipping / Packing Date
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type PackingList = z.infer<typeof packingListSchema>

export const packingListSchemaList = z.array(packingListSchema)
