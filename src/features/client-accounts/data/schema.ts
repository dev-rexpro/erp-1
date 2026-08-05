import { z } from 'zod'

export const clientAccountSchema = z.object({
  id: z.string().min(1, 'Client ID is required'),
  name: z.string().min(1, 'Company name is required'),
  shortName: z.string().min(1, 'Short name is required'),
  initials: z.string().min(1, 'Initials required'),
  country: z.enum(['ID', 'CN', 'SG', 'US', 'JP', 'AE']),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  taxId: z.string().min(1, 'Tax ID / NPWP is required'),
  tier: z.enum(['Priority', 'Standard', 'Non-priority']),
  industry: z.string().min(1, 'Industry is required'),
  currency: z.string().min(1, 'Currency is required'),
  creditLimit: z.number().min(0),
  arBalance: z.number().min(0),
  paymentTerms: z.string().min(1, 'Payment terms required'),
  bankName: z.string().min(1, 'Bank name required'),
  bankAccountNo: z.string().min(1, 'Bank account number required'),
  swiftCode: z.string().min(1, 'SWIFT code required'),
  contactPerson: z.string().min(1, 'Contact person required'),
  contactRole: z.string().min(1, 'Contact role required'),
  status: z.enum(['Active', 'On Hold', 'Inactive']),
})

export type ClientAccountFormValues = z.infer<typeof clientAccountSchema>
