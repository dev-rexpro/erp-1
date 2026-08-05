// =============================================================================
// SERVICE QUOTATIONS MOCK DATA — ERP-ONE
// 30 records derived from document-chain-data.ts
// Each quotation is the origin of a complete transaction chain
// Snowflake table target: erp_service_quotations
// =============================================================================

import { transactionChains } from '@/lib/mock-data/document-chain-data'

export const quotations = transactionChains.map((chain) => {
  const amountStr = `$${chain.totalAmount.toLocaleString('en-US')}.00`
  const validUntil = (() => {
    const d = new Date(chain.quotationDate)
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })()

  // Service type role mapping:
  // superadmin = Air Freight | admin = Ocean FCL | manager = Ocean LCL | cashier = Customs
  const role =
    chain.serviceMode === 'air'
      ? 'superadmin'
      : chain.serviceMode === 'ocean-fcl'
        ? 'admin'
        : 'manager'

  return {
    id: `qt-${String(1000 + chain.idx).padStart(4, '0')}`,
    firstName: chain.client.name,
    lastName: chain.client.country,
    username: chain.quotationNo,
    email: chain.client.email,
    phoneNumber: chain.client.phone,
    status: chain.quotationStatus,
    role: role as 'superadmin' | 'admin' | 'manager' | 'cashier',
    amount: amountStr,
    validUntil,
    createdAt: new Date(chain.quotationDate),
    updatedAt: new Date(chain.quotationDate),

    // Extended fields (used by detail views & document flow)
    _ext: {
      clientId: chain.client.id,
      clientCountry: chain.client.country,
      clientTier: chain.client.tier,
      commodity: chain.commodity.name,
      hsCode: chain.commodity.hsCode,
      originLocode: chain.originPort.locode,
      originPort: chain.originPort.name,
      destLocode: chain.destPort.locode,
      destPort: chain.destPort.name,
      vesselName: chain.serviceMode !== 'air' ? chain.vessel.name : null,
      voyageNumber: chain.serviceMode !== 'air' ? `V${String(100 + chain.idx).padStart(3, '0')}E` : null,
      containerType: chain.containerType,
      transitDays: (() => {
        const etdDate = new Date(chain.etd)
        const etaDate = new Date(chain.eta)
        return Math.ceil((etaDate.getTime() - etdDate.getTime()) / (1000 * 60 * 60 * 24))
      })(),
      etd: chain.etd,
      incoterm: chain.incoterm,
      currency: chain.currency,
      freightCharge: chain.freightCharge,
      surcharge: chain.surcharge,
      handlingFee: chain.handlingFee,
      // Chain references
      linkedContract: chain.contractNo,
      linkedShipment: chain.shipmentNo,
      linkedInvoice: chain.invoiceNo,
      stage: chain.stage,
    },
  }
})

// Convenience: pending quotations for Masbro alert
export const pendingQuotations = quotations
  .filter((q) => q.status === 'invited')
  .slice(0, 15)

// Near-expiry quotations (valid until within 7 days)
export const nearExpiryQuotations = quotations
  .filter((q) => {
    const daysLeft =
      (new Date(q.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return daysLeft > 0 && daysLeft <= 7 && q.status === 'invited'
  })
  .slice(0, 5)
