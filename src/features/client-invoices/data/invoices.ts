// =============================================================================
// INVOICES MOCK DATA — ERP-ONE
// 25 records: 9 from completed shipment chains + 5 proforma
// Each invoice references its parent shipment, contract, and quotation
// Snowflake table target: erp_client_invoices
// =============================================================================

import { clientCompanies } from '@/lib/mock-data/master-data'
import { invoiceChains, transactionChains } from '@/lib/mock-data/document-chain-data'

type InvoiceRole = 'superadmin' | 'admin' | 'manager' | 'cashier'

// Re-export for backward-compatibility with existing components
export { clientCompanies }

// ─── Build invoices from chains ─────────────────────────────────────────────

const chainInvoices = invoiceChains.map((chain) => {
  const invoiceType =
    chain.idx % 4 === 0
      ? { role: 'superadmin' as InvoiceRole, label: 'Commercial Invoice' }
      : chain.idx % 4 === 1
        ? { role: 'admin' as InvoiceRole, label: 'Proforma Invoice' }
        : chain.idx % 4 === 2
          ? { role: 'manager' as InvoiceRole, label: 'Tax Invoice (Faktur Pajak)' }
          : { role: 'cashier' as InvoiceRole, label: 'Credit Note' }

  const amountStr = `$${chain.totalAmount.toLocaleString('en-US')}.00`
  const baseDate = new Date(chain.invoiceDate!)
  const dueDate = new Date(baseDate.getTime() + 1000 * 60 * 60 * 24 * 30)
    .toISOString()
    .split('T')[0]

  return {
    id: `inv-${String(1000 + chain.idx).padStart(4, '0')}`,
    firstName: chain.client.name,
    lastName: `${chain.client.country} | ${chain.client.city}`,
    username: chain.invoiceNo!,
    email: chain.client.email,
    phoneNumber: chain.client.phone,
    status: chain.invoiceStatus,
    role: invoiceType.role,
    amount: amountStr,
    dueDate,
    createdAt: baseDate,
    updatedAt: baseDate,
  }
})

// ─── Add 5 standalone proforma invoices from non-invoiced chains ────────────

const proformaChains = transactionChains
  .filter((c) => c.stage === 'contract' || c.stage === 'shipping')
  .slice(0, 5)

const proformaInvoices = proformaChains.map((chain, i) => {
  const proformaAmount = Math.round(chain.totalAmount * 0.3) // 30% advance
  const amountStr = `$${proformaAmount.toLocaleString('en-US')}.00`
  const idx = 50 + i
  const baseDate = new Date(chain.contractDate ?? chain.quotationDate)
  const dueDate = new Date(baseDate.getTime() + 1000 * 60 * 60 * 24 * 14)
    .toISOString()
    .split('T')[0]

  return {
    id: `inv-${String(1000 + idx).padStart(4, '0')}`,
    firstName: chain.client.name,
    lastName: `${chain.client.country} | ${chain.client.city}`,
    username: `INV-2026-${String(1000 + idx).padStart(4, '0')}`,
    email: chain.client.email,
    phoneNumber: chain.client.phone,
    status: 'invited' as const, // Draft
    role: 'admin' as InvoiceRole, // Proforma
    amount: amountStr,
    dueDate,
    createdAt: baseDate,
    updatedAt: baseDate,
  }
})

export const invoices = [...chainInvoices, ...proformaInvoices]

// Extended metadata (keyed by invoice id — for Masbro AI & detail views)
export const invoiceExtData = Object.fromEntries(
  invoiceChains.map((chain) => {
    const invoiceId = `inv-${String(1000 + chain.idx).padStart(4, '0')}`
    return [
      invoiceId,
      {
        clientId: chain.client.id,
        clientCity: chain.client.city,
        clientCountry: chain.client.country,
        clientTaxId: chain.client.taxId,
        clientTier: chain.client.tier,
        commodity: chain.commodity.name,
        hsCode: chain.commodity.hsCode,
        linkedShipment: chain.shipmentNo,
        linkedQuotation: chain.quotationNo,
        linkedContract: chain.contractNo,
        linkedSI: chain.siNo,
        linkedPackingList: chain.packingListNo,
        linkedDnDFee: chain.dndFeeNo,
        currency: 'USD',
        amountIDR: chain.totalAmount * 16450,
        vatAmount: Math.round(chain.totalAmount * 0.11),
        poNumber: chain.poNumber,
        stage: chain.stage,
      },
    ]
  })
)

// Convenience: top 10 overdue invoices for Masbro morning briefing
export const overdueInvoices = invoices
  .filter((inv) => inv.status === 'inactive')
  .slice(0, 10)

// Total outstanding AR value for dashboard widget
export const totalOutstandingUSD = invoices
  .filter((inv) => inv.status === 'inactive' || inv.status === 'invited')
  .reduce((sum, inv) => {
    const val = parseFloat(inv.amount.replace(/[$,]/g, ''))
    return sum + val
  }, 0)
