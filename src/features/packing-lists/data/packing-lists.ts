// =============================================================================
// PACKING LISTS MOCK DATA — ERP-ONE
// 20 records derived from document-chain-data.ts (1:1 with SIs)
// Each packing list references its parent SI and downstream shipment
// Snowflake table target: erp_packing_lists
// =============================================================================

import { siChains, indonesianShippers } from '@/lib/mock-data/document-chain-data'
import { type PackingList, type PackingListStatus } from './schema'

export const packingLists: (PackingList & { _ext: Record<string, unknown> })[] = siChains.map((chain) => {
  const shipper = indonesianShippers[chain.idx % indonesianShippers.length]

  const formatType = (['Cartons', 'Pallets', 'Wooden Crates', 'Containers'] as const)[
    chain.idx % 4
  ]
  const formatKey = (['superadmin', 'admin', 'manager', 'cashier'] as const)[
    chain.idx % 4
  ]

  const amountStr = `${chain.packages} ${formatType}`
  const baseDate = new Date(chain.siDate!)
  baseDate.setDate(baseDate.getDate() + 1) // PL created day after SI
  const validUntil = chain.etd // Ship date = ETD

  // Status mapping:
  // active = Approved, inactive = Received, invited = Draft, suspended = Shipped
  const status: PackingListStatus =
    ['in-transit', 'invoiced', 'closed'].includes(chain.stage)
      ? 'suspended' // Shipped
      : chain.stage === 'shipping'
        ? 'invited' // Draft
        : 'active' // Approved

  return {
    id: `pl-${String(1000 + chain.idx).padStart(4, '0')}`,
    firstName: shipper.name,
    lastName: chain.client.country,
    username: chain.packingListNo!,
    email: shipper.email,
    phoneNumber: shipper.phone,
    status,
    role: formatKey,
    amount: amountStr,
    validUntil,
    createdAt: baseDate,
    updatedAt: baseDate,

    // Extended chain references
    _ext: {
      clientId: chain.client.id,
      consigneeName: chain.client.name,
      linkedSI: chain.siNo,
      linkedShipment: chain.shipmentNo,
      linkedQuotation: chain.quotationNo,
      linkedContract: chain.contractNo,
      commodity: chain.commodity.name,
      hsCode: chain.commodity.hsCode,
      containerNo: chain.containerNo,
      grossWeightKg: chain.grossWeightKg,
      volumeCbm: chain.volumeCbm,
      packages: chain.packages,
      packageUnit: chain.packageUnit,
      stage: chain.stage,
    },
  }
})
