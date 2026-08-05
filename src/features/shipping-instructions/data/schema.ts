import { z } from 'zod'

export const shippingInstructionStatusSchema = z.enum([
  'Submitted',
  'Draft',
  'Confirmed',
  'Amended',
  'Cancelled',
])
export type ShippingInstructionStatus = z.infer<typeof shippingInstructionStatusSchema>

export const shippingInstructionItemSchema = z.object({
  id: z.string(),
  siNo: z.string(),
  bookingNo: z.string(),
  shipperName: z.string(),
  consigneeName: z.string(),
  carrierName: z.string(),
  vesselVoyage: z.string(),
  pol: z.string(),
  pod: z.string(),
  containerNo: z.string(),
  packagesCount: z.string(),
  grossWeight: z.string(),
  measurementVolume: z.string(),
  freightTerms: z.string(),
  status: shippingInstructionStatusSchema,
  issueDate: z.string(),
  updatedAt: z.date(),
  // compatibility fields for data table helpers
  firstName: z.string(),
  username: z.string(),
  email: z.string(),
  role: z.string(),
  amount: z.string(),
  validUntil: z.string(),
})

export type ShippingInstruction = z.infer<typeof shippingInstructionItemSchema>
