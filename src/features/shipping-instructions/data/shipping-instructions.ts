// =============================================================================
// SHIPPING INSTRUCTIONS MOCK DATA — ERP-ONE
// 20 records derived from document-chain-data.ts (chains with SI)
// Each SI references contract, quotation, and shares container/BL/vessel data
// Snowflake table target: erp_shipping_instructions
// =============================================================================

import { type ShippingInstruction } from './schema'
import {
  siChains,
  indonesianShippers,
  getCarrierName,
} from '@/lib/mock-data/document-chain-data'

export const shippingInstructions: ShippingInstruction[] = siChains.map(
  (chain) => {
    const shipper = indonesianShippers[chain.idx % indonesianShippers.length]
    const carrierName = getCarrierName(chain.vessel)
    const voyageNo = `V.${String(100 + chain.idx).padStart(3, '0')}${chain.idx % 2 === 0 ? 'E' : 'N'}`
    const vesselVoyage =
      chain.serviceMode === 'air'
        ? `GA-${String(800 + chain.idx)}`
        : `MV ${chain.vessel.name} ${voyageNo}`
    const sealNo = `SE-${String(10000 + chain.idx * 7).padStart(5, '0')}`
    const containerDisplay = chain.containerNo
      ? `${chain.containerNo} / ${sealNo}`
      : `Consol / ${sealNo}`

    return {
      id: `si-${chain.idx + 1}`,
      siNo: chain.siNo!,
      bookingNo: chain.bookingNo,
      shipperName: shipper.name,
      consigneeName: chain.client.name,
      carrierName,
      vesselVoyage,
      pol: `${chain.originPort.name}, ${chain.originPort.city}, ID`,
      pod: `${chain.destPort.name}, ${chain.destPort.country}`,
      containerNo: containerDisplay,
      packagesCount: `${chain.packages} ${chain.packageUnit}`,
      grossWeight: `${chain.grossWeightKg.toLocaleString('en-US')} kg`,
      measurementVolume: chain.volumeCbm
        ? `${chain.volumeCbm.toFixed(2)} cbm`
        : 'N/A',
      freightTerms:
        chain.incoterm === 'FOB' || chain.incoterm === 'EXW'
          ? 'Freight Collect'
          : 'Freight Prepaid',
      status: chain.siStatus,
      issueDate: chain.siDate!,
      updatedAt: new Date(chain.siDate!),
      // Compatibility fields for data table helpers
      firstName: shipper.name,
      username: chain.siNo!,
      email: shipper.email,
      role:
        chain.serviceMode === 'air'
          ? 'superadmin'
          : chain.serviceMode === 'ocean-fcl'
            ? 'admin'
            : 'manager',
      amount: `${chain.packages} ${chain.packageUnit}`,
      validUntil: chain.siDate!,
    }
  }
)
