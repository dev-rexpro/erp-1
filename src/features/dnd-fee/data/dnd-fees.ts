// =============================================================================
// D&D FEE MOCK DATA — ERP-ONE
// 10 records derived from document-chain-data.ts (chains with D&D)
// Container numbers and BL numbers match parent shipments exactly
// Snowflake table target: erp_dnd_fees
// =============================================================================

import { type DndFeeItem } from './schema'
import {
  dndChains,
  shipmentChains,
  getCarrierName,
  getTerminalName,
} from '@/lib/mock-data/document-chain-data'

// Use D&D chains first, then supplement from shipment chains to reach 10
const allDndSources = [
  ...dndChains,
  ...shipmentChains
    .filter((c) => !c.hasDnD && c.containerNo)
    .slice(0, Math.max(0, 10 - dndChains.length)),
]
  .slice(0, 10)

export const mockDndFees: DndFeeItem[] = allDndSources.map((chain, i) => {
  const carrierName = getCarrierName(chain.vessel)
  const terminalName = getTerminalName(chain.originPort.locode)
  const equipmentType =
    chain.containerType === '40HC'
      ? '40ft High Cube Container'
      : chain.containerType === '40GP'
        ? '40ft Standard Dry Container'
        : chain.containerType === '20GP'
          ? '20ft Standard Dry Container'
          : '40ft Refrigerated Container (Reefer)'

  const overdueDays = chain.hasDnD ? chain.dndOverdueDays : i + 1
  const dailyRate = chain.hasDnD ? chain.dndDailyRate : 100 + i * 15
  const totalFee = overdueDays * dailyRate
  const feeType = chain.hasDnD
    ? chain.dndFeeType
    : (['Demurrage', 'Detention', 'Storage'] as const)[i % 3]

  const dischargeDate = chain.eta
  const freeTimeDays = i % 2 === 0 ? 7 : 5
  const freeTimeExpiry = (() => {
    const d = new Date(dischargeDate)
    d.setDate(d.getDate() + freeTimeDays)
    return d.toISOString().split('T')[0]
  })()
  const gateOutDate = (() => {
    const d = new Date(freeTimeExpiry)
    d.setDate(d.getDate() + overdueDays)
    return d.toISOString().split('T')[0]
  })()
  const emptyReturnDate = (() => {
    const d = new Date(gateOutDate)
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })()
  const dwellDays = freeTimeDays + overdueDays

  const statusOptions: DndFeeItem['status'][] = [
    'Accruing',
    'Billed',
    'Disputed',
    'Settled',
    'Waived',
  ]
  const status = statusOptions[i % statusOptions.length]
  const waivedAmount = status === 'Waived' ? totalFee : 0
  const effectiveFee = status === 'Waived' ? 0 : totalFee

  const notes = [
    'Import container held at terminal pending customs physical inspection.',
    'Empty container returned late to carrier depot after factory unloading.',
    'Reefer plugin demurrage disputed due to terminal power outage.',
    'Container picked up within allowance. Zero fee accrued.',
    'Carrier granted full demurrage waiver due to vessel arrival delay.',
    'Extended storage at bonded warehouse pending DJBC approval.',
    'Container detained at factory beyond free return period.',
    'Port congestion caused delayed gate-out — waiver requested.',
    'Multi-stop delivery resulted in extended container dwell time.',
    'Late B/L surrender delayed container pickup from terminal.',
  ][i % 10]

  const feeId = chain.dndFeeNo ?? `DND-2026-${String(800 + i).padStart(3, '0')}`

  return {
    id: feeId,
    containerNo: chain.containerNo ?? `TEMP${String(i).padStart(7, '0')}`,
    blNumber: chain.blNumber,
    carrierName,
    terminalName,
    equipmentType,
    dischargeDate,
    freeTimeDays,
    freeTimeExpiry,
    gateOutDate,
    emptyReturnDate,
    dwellDays,
    overdueDays,
    dailyRate,
    totalFee: effectiveFee,
    waivedAmount,
    feeType,
    status,
    notes,
    // Compatibility fields
    firstName: chain.containerNo ?? feeId,
    username: feeId,
    email: chain.client.email,
    role: (['superadmin', 'admin', 'manager', 'cashier'] as const)[i % 4],
    amount: `$${effectiveFee.toLocaleString('en-US')}.00${status === 'Waived' ? ' (Waived)' : ''}`,
    validUntil: gateOutDate,
  }
})
