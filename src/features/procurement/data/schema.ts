import { z } from 'zod'

export const vendorCategorySchema = z.enum([
  'Shipping Line',
  'Port Operator',
  'Terminal Operator',
  'Freight Forwarder',
  'Trucking',
  'Government / Customs',
  'Airline Cargo',
  'Warehousing',
])

export const partnerDirectorySchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  category: vendorCategorySchema,
  country: z.string(),
  city: z.string(),
  address: z.string(),
  contactPerson: z.string(),
  email: z.string(),
  phone: z.string(),
  taxId: z.string(),
  bankAccount: z.string(),
  rating: z.number(),
  slaScore: z.string(),
  paymentTerms: z.string(),
  status: z.enum(['Active', 'Under Review', 'Inactive']),
  // Compatibility for common table actions
  firstName: z.string(),
  username: z.string(),
  role: z.string(),
  amount: z.string(),
  validUntil: z.string(),
})

export type PartnerDirectoryItem = z.infer<typeof partnerDirectorySchema>

export const vendorRateSchema = z.object({
  id: z.string(),
  rateCode: z.string(),
  vendorCode: z.string(),
  vendorName: z.string(),
  origin: z.string(),
  destination: z.string(),
  equipmentType: z.string(),
  serviceMode: z.enum(['ocean-fcl', 'ocean-lcl', 'air', 'land-haulage', 'port-services']),
  currency: z.string(),
  baseRate: z.number(),
  fuelSurchargePct: z.number(),
  effectiveRate: z.number(),
  transitDays: z.string(),
  validFrom: z.string(),
  validUntil: z.string(),
  contractRef: z.string(),
  status: z.enum(['Active', 'Expiring Soon', 'Expired', 'Negotiating']),
  // Compatibility fields
  firstName: z.string(),
  username: z.string(),
  email: z.string(),
  role: z.string(),
  amount: z.string(),
})

export type VendorRateItem = z.infer<typeof vendorRateSchema>

export const purchaseOrderSchema = z.object({
  id: z.string(),
  poNumber: z.string(),
  vendorCode: z.string(),
  vendorName: z.string(),
  orderDate: z.string(),
  deliveryDate: z.string(),
  subtotal: z.number(),
  taxAmount: z.number(),
  totalAmount: z.number(),
  currency: z.string(),
  status: z.enum(['Approved', 'Issued', 'Pending Approval', 'Completed', 'Cancelled']),
  notes: z.string(),
  // Cross references to main document flow chains
  linkedShipment: z.string().nullable(),
  linkedQuotation: z.string().nullable(),
  linkedContract: z.string().nullable(),
  linkedInvoice: z.string().nullable(),
  linkedVendorBill: z.string().nullable(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      qty: z.number(),
      unit: z.string(),
      unitPrice: z.number(),
      totalPrice: z.number(),
    })
  ),
  // Compatibility fields
  firstName: z.string(),
  username: z.string(),
  email: z.string(),
  role: z.string(),
  amount: z.string(),
  validUntil: z.string(),
})

export type PurchaseOrderItem = z.infer<typeof purchaseOrderSchema>
