// =============================================================================
// FINANCE MOCK DATA — ERP-ONE
// ~55 records: AR(15) + Cost Accruals(12) + Vendor Bills(10) + GL(18)
// All cross-referenced to shipment chains, invoices, and procurement
// Snowflake table target: erp_finance_*
// =============================================================================

import {
  transactionChains,
  invoiceChains,
  shipmentChains,
  VENDOR_PARTNERS,
} from '@/lib/mock-data/document-chain-data'

// ─── INTERFACES ─────────────────────────────────────────────────────────────

export interface AccountsReceivableItem {
  id: string
  customerName: string
  customerCode: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  currency: string
  amount: number
  paidAmount: number
  balanceDue: number
  agingCategory: 'Current' | '1-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days'
  status: 'Paid' | 'Partial' | 'Current' | 'Overdue' | 'Disputed'
  paymentTerms: string
  salesPerson: string
}

export interface CostAccrualItem {
  id: string
  category: 'Ocean Freight Provision' | 'Customs Duty' | 'Port Terminal Handling' | 'Demurrage & Detention' | 'Trucking Accrual'
  shipmentRef: string
  blNumber: string
  vendorName: string
  accrualDate: string
  estimatedAmount: number
  actualAmount: number | null
  variance: number | null
  currency: string
  status: 'Provisioned' | 'Partially Reconciled' | 'Fully Reconciled' | 'Reversed'
  notes: string
}

export interface VendorBillItem {
  id: string
  billNumber: string
  vendorName: string
  vendorCode: string
  poReference: string
  shipmentRef: string
  billDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  currency: string
  approvalStatus: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected'
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid' | 'Scheduled'
  paymentMethod: string
}

export interface GeneralLedgerEntry {
  id: string
  voucherNo: string
  postingDate: string
  period: string
  accountCode: string
  accountName: string
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'
  reference: string
  memo: string
  debit: number
  credit: number
  currency: string
  status: 'Posted' | 'Unposted' | 'Reversed'
  createdBy: string
}

export interface ChartOfAccountItem {
  code: string
  name: string
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'
  balance: number
  currency: string
  status: 'Active' | 'Inactive'
}

// ─── SALES PERSONS ──────────────────────────────────────────────────────────
const SALES_PERSONS = ['Rizky Pratama', 'Anisa Wijaya', 'Deni Kurniawan', 'Budi Santoso', 'Sari Dewi']
const PAYMENT_METHODS = ['Bank Transfer (BCA)', 'Bank Transfer (Mandiri)', 'Virtual Account', 'Bank Transfer (CIMB)']

// ─── ACCOUNTS RECEIVABLE (15 records) ───────────────────────────────────────

const arSourceChains = [
  ...invoiceChains,
  ...transactionChains.filter(c => c.stage === 'contract').slice(0, 6),
].slice(0, 15)

export const mockAccountsReceivable: AccountsReceivableItem[] = arSourceChains.map((chain, i) => {
  const isPaid = chain.stage === 'closed'
  const isPartial = chain.stage === 'invoiced' && i % 3 === 0
  const isDisputed = i >= 27 // D&D disputed chains
  const isOverdue = chain.stage === 'invoiced' && !isPartial && !isDisputed

  const amount = chain.totalAmount
  const paidAmount = isPaid ? amount : isPartial ? Math.round(amount * 0.4) : 0
  const balanceDue = amount - paidAmount

  const issueDate = chain.invoiceDate ?? chain.contractDate ?? chain.quotationDate
  const dueDate = (() => {
    const d = new Date(issueDate)
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })()

  // Aging
  const daysOverdue = Math.ceil(
    (new Date('2026-07-26').getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  const agingCategory: AccountsReceivableItem['agingCategory'] =
    daysOverdue <= 0 ? 'Current'
    : daysOverdue <= 30 ? '1-30 Days'
    : daysOverdue <= 60 ? '31-60 Days'
    : daysOverdue <= 90 ? '61-90 Days'
    : '90+ Days'

  const status: AccountsReceivableItem['status'] =
    isPaid ? 'Paid'
    : isDisputed ? 'Disputed'
    : isPartial ? 'Partial'
    : isOverdue ? 'Overdue'
    : 'Current'

  return {
    id: `AR-2026-${String(i + 1).padStart(3, '0')}`,
    customerName: chain.client.name,
    customerCode: `CUST-${chain.client.id.replace('-', '')}`,
    invoiceNumber: chain.invoiceNo ?? `INV-2026-${String(1000 + chain.idx).padStart(4, '0')}`,
    issueDate,
    dueDate,
    currency: 'USD',
    amount,
    paidAmount,
    balanceDue,
    agingCategory,
    status,
    paymentTerms: 'Net 30',
    salesPerson: SALES_PERSONS[i % SALES_PERSONS.length],
  }
})

// ─── COST ACCRUALS (12 records) ─────────────────────────────────────────────

const accrualCategories: CostAccrualItem['category'][] = [
  'Ocean Freight Provision',
  'Customs Duty',
  'Port Terminal Handling',
  'Demurrage & Detention',
  'Trucking Accrual',
]

const accrualSourceChains = shipmentChains.slice(0, 12)

export const mockCostAccruals: CostAccrualItem[] = accrualSourceChains.map((chain, i) => {
  const category = accrualCategories[i % accrualCategories.length]
  const vendor = VENDOR_PARTNERS[i % VENDOR_PARTNERS.length]

  const estimatedAmount =
    category === 'Ocean Freight Provision' ? chain.freightCharge
    : category === 'Customs Duty' ? Math.round(chain.totalAmount * 0.12)
    : category === 'Port Terminal Handling' ? Math.round(chain.totalAmount * 0.08)
    : category === 'Demurrage & Detention' ? chain.dndDailyRate * chain.dndOverdueDays || 2400
    : Math.round(chain.totalAmount * 0.06)

  const isReconciled = chain.stage === 'closed' || chain.stage === 'invoiced'
  const isReversed = i === 11 // One reversed entry for realism
  const variance = isReconciled ? Math.round(estimatedAmount * (Math.random() > 0.5 ? 0.02 : -0.03)) : null
  const actualAmount = isReconciled ? estimatedAmount + (variance ?? 0) : null

  const status: CostAccrualItem['status'] =
    isReversed ? 'Reversed'
    : isReconciled && i % 3 === 0 ? 'Fully Reconciled'
    : isReconciled ? 'Partially Reconciled'
    : 'Provisioned'

  const accrualDate = chain.etd

  return {
    id: `ACCR-2026-${String(500 + i + 1).padStart(3, '0')}`,
    category,
    shipmentRef: chain.shipmentNo!,
    blNumber: chain.blNumber,
    vendorName: vendor.name,
    accrualDate,
    estimatedAmount,
    actualAmount,
    variance,
    currency: 'USD',
    status,
    notes: `${category} for ${chain.commodity.name} shipment ${chain.originPort.city} → ${chain.destPort.city}`,
  }
})

// ─── VENDOR BILLS (10 records) ──────────────────────────────────────────────

const vbSourceChains = shipmentChains
  .filter(c => ['invoiced', 'closed'].includes(c.stage))
  .slice(0, 10)

export const mockVendorBills: VendorBillItem[] = vbSourceChains.map((chain, i) => {
  const vendor = VENDOR_PARTNERS[i % VENDOR_PARTNERS.length]
  const subtotal = chain.freightCharge + chain.surcharge
  const taxAmount = Math.round(subtotal * 0.11)
  const totalAmount = subtotal + taxAmount

  const billDate = chain.eta
  const dueDate = (() => {
    const d = new Date(billDate)
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })()

  const approvalStatuses: VendorBillItem['approvalStatus'][] = ['Approved', 'Pending Approval', 'Approved', 'Draft']
  const paymentStatuses: VendorBillItem['paymentStatus'][] = ['Paid', 'Scheduled', 'Unpaid', 'Partial']

  return {
    id: `VB-2026-${String(4100 + i + 1)}`,
    billNumber: chain.vendorBillNo ?? `BILL-VND-2026-${String(100 + i).padStart(3, '0')}`,
    vendorName: vendor.name,
    vendorCode: vendor.code,
    poReference: chain.poNumber ?? `PO-2026-${String(300 + chain.idx).padStart(4, '0')}`,
    shipmentRef: chain.shipmentNo!,
    billDate,
    dueDate,
    subtotal,
    taxAmount,
    totalAmount,
    currency: 'USD',
    approvalStatus: approvalStatuses[i % approvalStatuses.length],
    paymentStatus: paymentStatuses[i % paymentStatuses.length],
    paymentMethod: PAYMENT_METHODS[i % PAYMENT_METHODS.length],
  }
})

// ─── GENERAL LEDGER (18 records) ────────────────────────────────────────────

const glEntries: GeneralLedgerEntry[] = []

// AR collection entries (6 pairs = 12 entries from paid invoices)
const paidChains = invoiceChains.filter(c => c.stage === 'closed').slice(0, 6)
paidChains.forEach((chain, i) => {
  const postingDate = chain.invoiceDate!
  const voucherNo = `JV-2026-${String(9040 + i * 2 + 1)}`

  // Debit: Cash
  glEntries.push({
    id: `JV-2026-${String(9040 + i * 2 + 1)}`,
    voucherNo,
    postingDate,
    period: postingDate.substring(0, 7),
    accountCode: '1110-01',
    accountName: 'Cash & Bank - BCA USD Operating',
    accountType: 'Asset',
    reference: chain.invoiceNo!,
    memo: `Collection from ${chain.client.shortName} for Invoice ${chain.invoiceNo}`,
    debit: chain.totalAmount,
    credit: 0,
    currency: 'USD',
    status: 'Posted',
    createdBy: SALES_PERSONS[i % SALES_PERSONS.length],
  })

  // Credit: AR
  glEntries.push({
    id: `JV-2026-${String(9040 + i * 2 + 2)}`,
    voucherNo,
    postingDate,
    period: postingDate.substring(0, 7),
    accountCode: '1130-00',
    accountName: 'Accounts Receivable - Trade',
    accountType: 'Asset',
    reference: chain.invoiceNo!,
    memo: `Clear AR balance for ${chain.client.shortName} ${chain.invoiceNo}`,
    debit: 0,
    credit: chain.totalAmount,
    currency: 'USD',
    status: 'Posted',
    createdBy: SALES_PERSONS[i % SALES_PERSONS.length],
  })
})

// Vendor bill postings (3 pairs = 6 entries)
const postedVBChains = vbSourceChains.filter((_, i) => i < 3)
postedVBChains.forEach((chain, i) => {
  const vendor = VENDOR_PARTNERS[i % VENDOR_PARTNERS.length]
  const subtotal = chain.freightCharge + chain.surcharge
  const taxAmount = Math.round(subtotal * 0.11)
  const totalAmount = subtotal + taxAmount
  const postingDate = chain.eta
  const voucherNo = `JV-2026-${String(9060 + i * 2 + 1)}`

  // Debit: Expense
  glEntries.push({
    id: `JV-2026-${String(9060 + i * 2 + 1)}`,
    voucherNo,
    postingDate,
    period: postingDate.substring(0, 7),
    accountCode: '5110-00',
    accountName: 'Cost of Sales - Ocean Freight',
    accountType: 'Expense',
    reference: `VB-2026-${String(4100 + i + 1)}`,
    memo: `Vendor bill ${vendor.name} freight ${chain.shipmentNo}`,
    debit: subtotal,
    credit: 0,
    currency: 'USD',
    status: 'Posted',
    createdBy: SALES_PERSONS[(i + 2) % SALES_PERSONS.length],
  })

  // Credit: AP
  glEntries.push({
    id: `JV-2026-${String(9060 + i * 2 + 2)}`,
    voucherNo,
    postingDate,
    period: postingDate.substring(0, 7),
    accountCode: '2110-00',
    accountName: 'Accounts Payable - Trade',
    accountType: 'Liability',
    reference: `VB-2026-${String(4100 + i + 1)}`,
    memo: `Record AP liability for ${vendor.name} bill`,
    debit: 0,
    credit: totalAmount,
    currency: 'USD',
    status: 'Posted',
    createdBy: SALES_PERSONS[(i + 2) % SALES_PERSONS.length],
  })
})

export const mockGeneralLedger: GeneralLedgerEntry[] = glEntries

// ─── CHART OF ACCOUNTS ──────────────────────────────────────────────────────

// Calculate dynamic balances from actual transactions
const totalARCollected = paidChains.reduce((s, c) => s + c.totalAmount, 0)
const totalAPPosted = postedVBChains.reduce((s, c) => {
  const subtotal = c.freightCharge + c.surcharge
  return s + subtotal + Math.round(subtotal * 0.11)
}, 0)
const totalRevenue = invoiceChains.reduce((s, c) => s + c.totalAmount, 0)
const totalCOGS = shipmentChains.reduce((s, c) => s + c.freightCharge, 0)
const totalARBalance = invoiceChains
  .filter(c => c.stage !== 'closed')
  .reduce((s, c) => s + c.totalAmount, 0)

export const mockChartOfAccounts: ChartOfAccountItem[] = [
  { code: '1110-01', name: 'Cash & Bank - BCA USD Operating', category: 'Asset', balance: totalARCollected, currency: 'USD', status: 'Active' },
  { code: '1110-02', name: 'Cash & Bank - Mandiri IDR Main', category: 'Asset', balance: Math.round(totalARCollected * 0.6 * 16450), currency: 'IDR', status: 'Active' },
  { code: '1130-00', name: 'Accounts Receivable - Trade', category: 'Asset', balance: totalARBalance, currency: 'USD', status: 'Active' },
  { code: '1140-00', name: 'Prepaid Expenses & Advances', category: 'Asset', balance: 64200, currency: 'USD', status: 'Active' },
  { code: '2110-00', name: 'Accounts Payable - Trade', category: 'Liability', balance: totalAPPosted, currency: 'USD', status: 'Active' },
  { code: '2140-00', name: 'Accrued Operational Liabilities', category: 'Liability', balance: Math.round(totalCOGS * 0.15), currency: 'USD', status: 'Active' },
  { code: '3100-00', name: 'Capital Share Stock', category: 'Equity', balance: 1000000, currency: 'USD', status: 'Active' },
  { code: '3200-00', name: 'Retained Earnings', category: 'Equity', balance: Math.round(totalRevenue * 0.45), currency: 'USD', status: 'Active' },
  { code: '4110-00', name: 'Freight Service Revenue', category: 'Revenue', balance: totalRevenue, currency: 'USD', status: 'Active' },
  { code: '4120-00', name: 'Customs Clearance Revenue', category: 'Revenue', balance: Math.round(totalRevenue * 0.18), currency: 'USD', status: 'Active' },
  { code: '5110-00', name: 'Cost of Sales - Ocean Freight', category: 'Expense', balance: totalCOGS, currency: 'USD', status: 'Active' },
  { code: '5120-00', name: 'Cost of Sales - Port & Terminal', category: 'Expense', balance: Math.round(totalCOGS * 0.22), currency: 'USD', status: 'Active' },
]
