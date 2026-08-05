// =============================================================================
// SHIPMENTS MOCK DATA — ERP-ONE
// 20 records derived from document-chain-data.ts (chains with shipments)
// Each shipment cross-references quotation, contract, SI, packing list, invoice
// Snowflake table target: erp_shipments
// =============================================================================

import { shipmentChains } from '@/lib/mock-data/document-chain-data'

export const shipments = shipmentChains.map((chain) => {
  const amountStr = `$${chain.freightCharge.toLocaleString('en-US')}.00`
  const etaStr = chain.eta

  // Status: active = In Transit | inactive = Delivered | invited = Scheduled | suspended = Delayed
  const status = chain.shipmentStatus

  // Progress percentage based on status
  const progress =
    status === 'inactive'
      ? 100
      : status === 'invited'
        ? Math.floor((chain.idx % 3) * 5)
        : status === 'suspended'
          ? 30 + (chain.idx % 4) * 10
          : 40 + (chain.idx % 6) * 10

  return {
    id: `shp-${String(1000 + chain.idx).padStart(4, '0')}`,
    firstName: chain.client.name,
    lastName: chain.client.country,
    username: chain.shipmentNo!,
    email: chain.client.email,
    phoneNumber: chain.client.phone,
    status,
    role: chain.serviceMode === 'air' ? ('superadmin' as const) : ('admin' as const),
    amount: amountStr,
    validUntil: etaStr,
    createdAt: new Date(chain.etd),
    updatedAt: new Date(chain.etd),

    // Extended fields
    _ext: {
      clientId: chain.client.id,
      clientCountry: chain.client.country,
      clientTier: chain.client.tier,
      commodity: chain.commodity.name,
      hsCode: chain.commodity.hsCode,
      tempControl: chain.commodity.tempControl,
      originLocode: chain.originPort.locode,
      destLocode: chain.destPort.locode,
      routeLabel: `${chain.originPort.city} → ${chain.destPort.city}`,
      vesselName: chain.serviceMode !== 'air' ? chain.vessel.name : null,
      vesselCarrier: chain.serviceMode !== 'air' ? chain.vessel.carrier : null,
      voyageNo: chain.serviceMode !== 'air' ? `V${String(100 + chain.idx).padStart(3, '0')}E` : null,
      flightNo: chain.serviceMode === 'air' ? `GA-${String(800 + chain.idx)}` : null,
      blNumber: chain.blNumber,
      containerNo: chain.containerNo,
      containerType: chain.containerType,
      weightKg: `${chain.grossWeightKg.toLocaleString('en-US')} kg`,
      cbm: chain.volumeCbm ? `${chain.volumeCbm} CBM` : null,
      transitDays: (() => {
        const etdDate = new Date(chain.etd)
        const etaDate = new Date(chain.eta)
        return Math.ceil((etaDate.getTime() - etdDate.getTime()) / (1000 * 60 * 60 * 24))
      })(),
      progress,
      incoterm: chain.incoterm,
      pibNumber:
        status === 'inactive' || status === 'active'
          ? `PIB-2026-${String(400 + chain.idx).padStart(4, '0')}`
          : null,
      customsStatus:
        status === 'suspended'
          ? 'HOLD'
          : status === 'inactive'
            ? 'CLEARED'
            : status === 'active'
              ? 'IN PROGRESS'
              : 'PENDING',
      // Chain references
      linkedInvoice: chain.invoiceNo ?? `INV-2026-${String(1000 + chain.idx).padStart(4, '0')}`,
      linkedQuotation: chain.quotationNo,
      linkedContract: chain.contractNo,
      linkedSI: chain.siNo,
      linkedPackingList: chain.packingListNo,
      linkedDnDFee: chain.dndFeeNo,
      stage: chain.stage,
    },
  }
})

// Convenience slices for Masbro alerts
export const delayedShipments = shipments.filter((s) => s.status === 'suspended')
export const customsHoldShipments = shipments.filter(
  (s) => s._ext.customsStatus === 'HOLD' || s._ext.customsStatus === 'UNDER REVIEW'
)
export const inTransitShipments = shipments.filter((s) => s.status === 'active')
