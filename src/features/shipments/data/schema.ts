import { z } from 'zod'

const shipmentStatusSchema = z.union([
  z.literal('active'),      // In Transit
  z.literal('inactive'),    // Delivered
  z.literal('invited'),     // Scheduled
  z.literal('suspended'),   // Delayed
])
export type ShipmentStatus = z.infer<typeof shipmentStatusSchema>

const shipmentCarrierSchema = z.union([
  z.literal('superadmin'), // Air Freight
  z.literal('admin'),      // Ocean Freight
  z.literal('manager'),    // Land Transport
  z.literal('cashier'),    // Rail Freight
])

const shipmentSchema = z.object({
  id: z.string(),
  firstName: z.string(),   // Client Name
  lastName: z.string(),
  username: z.string(),    // Shipment Number
  email: z.string(),
  phoneNumber: z.string(),
  status: shipmentStatusSchema,
  role: shipmentCarrierSchema,
  amount: z.string(),      // Total Freight Value
  validUntil: z.string(),  // Delivery ETA
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Shipment = z.infer<typeof shipmentSchema>

export const shipmentListSchema = z.array(shipmentSchema)
