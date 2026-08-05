import { z } from 'zod'

export const dndFeeStatusSchema = z.enum([
  'Accruing',
  'Billed',
  'Waived',
  'Settled',
  'Disputed',
])
export type DndFeeStatus = z.infer<typeof dndFeeStatusSchema>

export const dndFeeTypeSchema = z.enum([
  'Demurrage',
  'Detention',
  'Storage',
])
export type DndFeeType = z.infer<typeof dndFeeTypeSchema>

export const dndFeeItemSchema = z.object({
  id: z.string(),
  containerNo: z.string(),
  blNumber: z.string(),
  carrierName: z.string(),
  terminalName: z.string(),
  equipmentType: z.string(),
  dischargeDate: z.string(),
  freeTimeDays: z.number(),
  freeTimeExpiry: z.string(),
  gateOutDate: z.string(),
  emptyReturnDate: z.string(),
  dwellDays: z.number(),
  overdueDays: z.number(),
  dailyRate: z.number(),
  totalFee: z.number(),
  waivedAmount: z.number(),
  feeType: dndFeeTypeSchema,
  status: dndFeeStatusSchema,
  notes: z.string(),
  // compatibility fields for data table helpers
  firstName: z.string(),
  username: z.string(),
  email: z.string(),
  role: z.string(),
  amount: z.string(),
  validUntil: z.string(),
})

export type DndFeeItem = z.infer<typeof dndFeeItemSchema>
