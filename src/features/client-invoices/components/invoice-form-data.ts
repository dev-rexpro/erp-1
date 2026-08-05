import { addDays, format } from 'date-fns'
import { getCompanySettings } from '@/lib/company-settings'

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface InvoiceTaxOption {
  id: string
  name: string
  rate: number
}

export type InvoiceDiscountType = 'fixed' | 'percent'

export const INVOICE_PAPER_WIDTH = 816
export const INVOICE_PAPER_HEIGHT = 1123 // standard A4 height in ratio
export const INVOICE_PAPER_SCALE = 0.55

export interface InvoiceFromDetails {
  name: string
  email: string
  phone: string
  website: string
  addressLines: string[]
  taxId: string
  paymentAccountName: string
  routingNumber: string
  issuerName: string
}

export interface InvoiceToDetails {
  id: string
  name: string
  email: string
  addressLines: string[]
  taxId: string
}

export interface InvoiceFormValues {
  referenceNumber: string
  issuedDate: string
  paymentDueDate: string
  from: InvoiceFromDetails
  to: InvoiceToDetails
  taxId: string
  discountType: InvoiceDiscountType
  discountValue: number
  items: InvoiceLineItem[]
  poNumber?: string
  shipTo?: string
  bankName?: string
  bankAccount?: string
  bankAccountName?: string
  logoUrl?: string
  stampUrl?: string
  notes?: string
}

export function getInitialInvoiceFormValues(): InvoiceFormValues {
  const company = getCompanySettings()
  const today = new Date()
  
  return {
    referenceNumber: '',
    issuedDate: format(today, 'yyyy-MM-dd'),
    paymentDueDate: format(addDays(today, 14), 'yyyy-MM-dd'),
    from: {
      name: company.name,
      email: company.email,
      phone: company.phone,
      website: company.website,
      addressLines: [company.address],
      taxId: company.npwp, // NPWP
      paymentAccountName: company.bankAccountName,
      routingNumber: company.bankAccount,
      issuerName: 'Authorized Signature Person',
    },
    to: {
      id: '',
      name: '',
      email: '',
      addressLines: [''],
      taxId: '',
    },
    taxId: 'ppn',
    discountType: 'fixed',
    discountValue: 0,
    poNumber: '',
    shipTo: '',
    bankName: company.bankName,
    bankAccount: company.bankAccount,
    bankAccountName: company.bankAccountName,
    logoUrl: company.logoUrl,
    stampUrl: company.stampUrl,
    notes: '',
    items: [],
  }
}

export const defaultInvoiceFrom: InvoiceFromDetails = {
  name: 'PT REXINDO ARUNA SEDAYA',
  email: 'hello@rexindo-aruna.com',
  phone: '+62-21-5555-0184',
  website: 'rexindo-aruna.com',
  addressLines: ['Main Office St., Jakarta, Indonesia'],
  taxId: '01.234.567.8-901.000', // NPWP
  paymentAccountName: 'MANDIRI REXINDO',
  routingNumber: '1234567890', // Acc Number
  issuerName: 'Authorized Signature Person',
}

export const defaultInvoiceValues: InvoiceFormValues = getInitialInvoiceFormValues()

export const invoiceTaxOptions: InvoiceTaxOption[] = [
  { id: 'ppn', name: 'VAT 11%', rate: 11 },
  { id: 'ppn12', name: 'VAT 12%', rate: 12 },
  { id: 'gst', name: 'GST 18%', rate: 18 },
  { id: 'vat', name: 'VAT 12%', rate: 12 },
  { id: 'service-tax', name: 'Service Tax 10%', rate: 10 },
  { id: 'none', name: 'No Tax', rate: 0 },
]

export const invoiceClients: InvoiceToDetails[] = [
  {
    id: 'bright-enterprises',
    name: 'Bright Enterprises',
    email: 'billing@brightenterprises.com',
    addressLines: ['450 Park Avenue South', 'New York, NY 10016', 'United States'],
    taxId: 'US-EIN-84-2938475',
  },
  defaultInvoiceValues.to,
  {
    id: 'northline-gmbh',
    name: 'Northline GmbH',
    email: 'ap@northline.de',
    addressLines: ['Kastanienallee 32', '10435 Berlin', 'Germany'],
    taxId: 'DE-VAT-219384756',
  },
]

export function getLineAmount(item?: InvoiceLineItem) {
  if (!item) return 0
  const quantity = Number.isFinite(item.quantity) ? item.quantity : 0
  const unitPrice = Number.isFinite(item.unitPrice) ? item.unitPrice : 0
  return quantity * unitPrice
}

export function getInvoiceItems(invoice: InvoiceFormValues) {
  return invoice.items
}

export function getInvoiceSubtotal(invoice: InvoiceFormValues) {
  return getInvoiceItems(invoice).reduce((subtotal, item) => subtotal + getLineAmount(item), 0)
}

export function getInvoiceTaxOption(invoice: InvoiceFormValues) {
  return invoiceTaxOptions.find((taxOption) => taxOption.id === invoice.taxId) ?? invoiceTaxOptions[0]
}

export function getInvoiceTax(invoice: InvoiceFormValues) {
  const taxRate = getInvoiceTaxOption(invoice).rate
  return Math.max(getInvoiceSubtotal(invoice) - getInvoiceDiscount(invoice), 0) * (taxRate / 100)
}

export function getInvoiceDiscount(invoice: InvoiceFormValues) {
  const subtotal = getInvoiceSubtotal(invoice)
  const discountValue = Number.isFinite(invoice.discountValue) ? invoice.discountValue : 0
  const discount = invoice.discountType === 'percent' ? subtotal * (discountValue / 100) : discountValue
  return Math.min(Math.max(discount, 0), subtotal)
}

export function getInvoiceTotal(invoice: InvoiceFormValues) {
  return Math.max(getInvoiceSubtotal(invoice) - getInvoiceDiscount(invoice), 0) + getInvoiceTax(invoice)
}

export function terbilang(nominal: number): string {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ]
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ]
  const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion']

  const num = Math.floor(nominal)
  if (num === 0) return 'Zero Rupiah'

  function convertChunk(n: number): string {
    let s = ''
    if (n >= 100) {
      s += ones[Math.floor(n / 100)] + ' Hundred '
      n %= 100
    }
    if (n >= 20) {
      s += tens[Math.floor(n / 10)] + ' '
      n %= 10
    }
    if (n > 0) {
      s += ones[n] + ' '
    }
    return s.trim()
  }

  let temp = num
  let chunkIdx = 0
  let words = ''

  while (temp > 0) {
    const chunk = temp % 1000
    if (chunk > 0) {
      const chunkStr = convertChunk(chunk)
      const scaleStr = scales[chunkIdx]
      words = chunkStr + (scaleStr ? ' ' + scaleStr : '') + (words ? ' ' + words : '')
    }
    temp = Math.floor(temp / 1000)
    chunkIdx++
  }

  return words.trim() + ' Rupiah'
}
export { terbilang as spelledOut }
