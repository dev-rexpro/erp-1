// =============================================================================
// CLIENT CONTRACTS MOCK DATA — ERP-ONE
// 20 records derived from document-chain-data.ts (chains with stage >= contract)
// Each contract references its parent quotation
// Snowflake table target: erp_client_contracts
// =============================================================================

import { contractChains } from '@/lib/mock-data/document-chain-data'

export const contracts = contractChains.map((chain) => {
  const rawValue = chain.totalAmount * 12 // Annual contract value ≈ 12x single shipment
  const amountStr = `$${rawValue.toLocaleString('en-US')}.00`

  const baseDate = new Date(chain.contractDate!)
  const validUntil = new Date(baseDate.getTime() + 1000 * 60 * 60 * 24 * 365)
    .toISOString()
    .split('T')[0]

  // Contract type role mapping:
  // superadmin = Master Agreement | admin = SLA | manager = NDA | cashier = Ad-Hoc
  const role = (['superadmin', 'admin', 'manager', 'cashier'] as const)[chain.idx % 4]

  return {
    id: `ctr-${String(1000 + chain.idx).padStart(4, '0')}`,
    firstName: chain.client.name,
    lastName: chain.client.country,
    username: chain.contractNo!,
    email: chain.client.email,
    phoneNumber: chain.client.phone,
    status: chain.contractStatus,
    role,
    amount: amountStr,
    validUntil,
    createdAt: baseDate,
    updatedAt: baseDate,

    // Extended chain references
    _ext: {
      clientId: chain.client.id,
      linkedQuotation: chain.quotationNo,
      linkedShipment: chain.shipmentNo,
      linkedInvoice: chain.invoiceNo,
      commodity: chain.commodity.name,
      incoterm: chain.incoterm,
      stage: chain.stage,
    },
  }
})
