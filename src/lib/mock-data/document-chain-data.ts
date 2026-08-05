// =============================================================================
// DOCUMENT CHAIN DATA — ERP-ONE CENTRAL DATA GENERATOR
// 30 complete transaction chains with strict referential integrity
// Chain: Quotation → Contract → SI → Packing List → Shipment → Invoice → D&D
// Snowflake migration target: erp_document_chains
// =============================================================================

import {
  clientCompanies,
  ports,
  vessels,
  commodities,
  type ClientCompany,
  type Port,
  type Vessel,
} from './master-data'

// ─── Deterministic pseudo-random (shared seed for all chains) ────────────────
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}
const rng = seededRandom(777888)
const randInt = (min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChainStage =
  | 'quotation'
  | 'contract'
  | 'shipping'
  | 'in-transit'
  | 'delivered'
  | 'invoiced'
  | 'closed'

export interface TransactionChain {
  idx: number
  // Master data references
  client: ClientCompany
  commodity: (typeof commodities)[number]
  originPort: Port
  destPort: Port
  vessel: Vessel
  // Logistics
  serviceMode: 'ocean-fcl' | 'ocean-lcl' | 'air'
  containerType: '20GP' | '40GP' | '40HC' | null
  containerNo: string | null
  blNumber: string
  bookingNo: string
  incoterm: string
  currency: string
  // Financial
  freightCharge: number
  surcharge: number
  handlingFee: number
  totalAmount: number
  // Cargo
  packages: number
  packageUnit: string
  grossWeightKg: number
  volumeCbm: number | null
  // Document numbers
  quotationNo: string
  contractNo: string | null
  siNo: string | null
  packingListNo: string | null
  shipmentNo: string | null
  invoiceNo: string | null
  dndFeeNo: string | null
  // PO reference
  poNumber: string | null
  vendorBillNo: string | null
  // Dates
  quotationDate: string
  contractDate: string | null
  siDate: string | null
  etd: string
  eta: string
  invoiceDate: string | null
  // Workflow
  stage: ChainStage
  // Status per module
  quotationStatus: 'active' | 'inactive' | 'invited' | 'suspended'
  contractStatus: 'active' | 'inactive' | 'invited' | 'suspended'
  shipmentStatus: 'active' | 'inactive' | 'invited' | 'suspended'
  invoiceStatus: 'active' | 'inactive' | 'invited' | 'suspended'
  siStatus: 'Submitted' | 'Draft' | 'Confirmed' | 'Amended' | 'Cancelled'
  // D&D
  hasDnD: boolean
  dndOverdueDays: number
  dndFeeType: 'Demurrage' | 'Detention' | 'Storage'
  dndDailyRate: number
}

// ─── Route definitions ──────────────────────────────────────────────────────

const ROUTES: {
  origin: string
  dest: string
  transitDays: [number, number]
  mode: 'ocean-fcl' | 'ocean-lcl' | 'air'
  label: string
}[] = [
  { origin: 'IDJKT', dest: 'CNSHA', transitDays: [10, 14], mode: 'ocean-fcl', label: 'Jakarta → Shanghai' },
  { origin: 'IDJKT', dest: 'SGSIN', transitDays: [3, 5], mode: 'ocean-fcl', label: 'Jakarta → Singapore' },
  { origin: 'IDJKT', dest: 'USLAX', transitDays: [22, 28], mode: 'ocean-fcl', label: 'Jakarta → Los Angeles' },
  { origin: 'IDJKT', dest: 'JPYOK', transitDays: [9, 13], mode: 'ocean-fcl', label: 'Jakarta → Yokohama' },
  { origin: 'IDJKT', dest: 'AEJEA', transitDays: [16, 22], mode: 'ocean-fcl', label: 'Jakarta → Jebel Ali' },
  { origin: 'IDJBR', dest: 'CNNGB', transitDays: [11, 15], mode: 'ocean-fcl', label: 'Surabaya → Ningbo' },
  { origin: 'IDJBR', dest: 'SGSIN', transitDays: [4, 6], mode: 'ocean-fcl', label: 'Surabaya → Singapore' },
  { origin: 'IDSRG', dest: 'CNTAO', transitDays: [13, 17], mode: 'ocean-fcl', label: 'Semarang → Qingdao' },
  { origin: 'IDBTH', dest: 'SGSIN', transitDays: [1, 2], mode: 'ocean-lcl', label: 'Batam → Singapore (LCL)' },
  { origin: 'IDCGK', dest: 'SGSIN', transitDays: [1, 1], mode: 'air', label: 'Jakarta (Air) → Singapore' },
  { origin: 'IDCGK', dest: 'JPNRT', transitDays: [2, 2], mode: 'air', label: 'Jakarta (Air) → Tokyo' },
  { origin: 'IDCGK', dest: 'USLAX', transitDays: [2, 3], mode: 'air', label: 'Jakarta (Air) → Los Angeles' },
  { origin: 'IDJKT', dest: 'CNSZX', transitDays: [9, 13], mode: 'ocean-fcl', label: 'Jakarta → Shenzhen' },
  { origin: 'IDJKT', dest: 'USNYC', transitDays: [28, 35], mode: 'ocean-fcl', label: 'Jakarta → New York' },
  { origin: 'IDJBR', dest: 'JPYOK', transitDays: [10, 14], mode: 'ocean-fcl', label: 'Surabaya → Yokohama' },
]

// ─── Container number generator ─────────────────────────────────────────────
const CTR_PREFIXES = ['OOLU', 'MSCU', 'MSKU', 'TCKU', 'HLXU', 'CCLU', 'EITU']
function genContainerNo(i: number): string {
  return `${CTR_PREFIXES[i % CTR_PREFIXES.length]}${String(3100000 + i * 13).padStart(7, '0')}`
}

// ─── BL number generator ────────────────────────────────────────────────────
const BL_PREFIXES = ['OOLU', 'MSCL', 'MAEU', 'COSU', 'EGLV']
function genBLNumber(i: number, mode: string): string {
  if (mode === 'air') return `AWB${String(160000 + i).padStart(6, '0')}`
  return `${BL_PREFIXES[i % BL_PREFIXES.length]}${String(2026000 + i * 3).padStart(7, '0')}`
}

// ─── Date helper ────────────────────────────────────────────────────────────
function addDays(baseDate: string, days: number): string {
  const d = new Date(baseDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// ─── Incoterms ──────────────────────────────────────────────────────────────
const INCOTERMS = ['FOB', 'CFR', 'CIF', 'EXW', 'DDP']

// ─── Stage distribution (30 chains) ─────────────────────────────────────────
// 5 quotation-only, 4 at contract, 3 at shipping, 6 in-transit,
// 4 delivered+invoiced, 5 closed(paid), 3 with D&D
const STAGE_SEQUENCE: ChainStage[] = [
  // 0-4: quotation-only
  'quotation', 'quotation', 'quotation', 'quotation', 'quotation',
  // 5-8: contract stage
  'contract', 'contract', 'contract', 'contract',
  // 9-11: shipping (SI + PL created)
  'shipping', 'shipping', 'shipping',
  // 12-17: in-transit
  'in-transit', 'in-transit', 'in-transit', 'in-transit', 'in-transit', 'in-transit',
  // 18-21: delivered + invoiced (unpaid)
  'invoiced', 'invoiced', 'invoiced', 'invoiced',
  // 22-26: closed (fully paid)
  'closed', 'closed', 'closed', 'closed', 'closed',
  // 27-29: delivered with D&D disputes
  'invoiced', 'invoiced', 'invoiced',
]

// ─── Foreign client companies (non-ID, our customers) ────────────────────────
const foreignClients = clientCompanies.filter((c) => c.country !== 'ID')
const idClients = clientCompanies.filter((c) => c.country === 'ID')

// ─── Terminal names ─────────────────────────────────────────────────────────
const TERMINALS: Record<string, string> = {
  IDJKT: 'Jakarta International Container Terminal (JICT)',
  IDJBR: 'Teluk Lamong Terminal, Surabaya',
  IDSRG: 'TPKS Container Terminal, Semarang',
  IDBTH: 'Batu Ampar Port, Batam',
  IDCGK: 'Soekarno-Hatta Cargo Terminal',
}

// =============================================================================
// GENERATE 30 CHAINS
// =============================================================================

export const transactionChains: TransactionChain[] = Array.from(
  { length: 30 },
  (_, i) => {
    const stage = STAGE_SEQUENCE[i]
    const route = ROUTES[i % ROUTES.length]
    const client = foreignClients[i % foreignClients.length]
    const commodity = commodities[i % commodities.length]
    const vessel = vessels[i % vessels.length]
    const originPort = ports.find((p) => p.locode === route.origin) ?? ports[0]
    const destPort = ports.find((p) => p.locode === route.dest) ?? ports[5]

    const containerType =
      route.mode === 'ocean-fcl'
        ? (['20GP', '40GP', '40HC'] as const)[i % 3]
        : null
    const containerNo =
      route.mode !== 'air' ? genContainerNo(i) : null
    const blNumber = genBLNumber(i, route.mode)
    const bookingNo = `BK-2026-${String(8000 + i).padStart(4, '0')}`

    // Financial
    const freightCharge =
      route.mode === 'air'
        ? randInt(2000, 12000)
        : route.mode === 'ocean-lcl'
          ? randInt(600, 3000)
          : randInt(1200, 7000)
    const surcharge = Math.round(freightCharge * 0.18)
    const handlingFee = Math.round(freightCharge * 0.10)
    const totalAmount = freightCharge + surcharge + handlingFee

    // Cargo
    const packages =
      route.mode === 'air'
        ? randInt(5, 50)
        : randInt(10, 200)
    const packageUnit =
      route.mode === 'air'
        ? 'Cartons'
        : i % 3 === 0
          ? 'Pallets'
          : i % 3 === 1
            ? 'Cartons'
            : 'Crates'
    const grossWeightKg =
      route.mode === 'air'
        ? randInt(200, 5000)
        : randInt(5000, 26000)
    const volumeCbm =
      route.mode !== 'air' ? randInt(8, 67) : null

    // Dates — work backward from "now" = 2026-07-26
    const baseDate = '2026-07-26'
    const quotationDaysBack =
      stage === 'quotation'
        ? randInt(3, 15)
        : stage === 'contract'
          ? randInt(20, 40)
          : randInt(45, 90)
    const quotationDate = addDays(baseDate, -quotationDaysBack)
    const contractDate =
      stage !== 'quotation'
        ? addDays(quotationDate, randInt(3, 10))
        : null
    const siDate =
      ['shipping', 'in-transit', 'delivered', 'invoiced', 'closed'].includes(stage)
        ? addDays(contractDate!, randInt(2, 7))
        : null

    const [minTransit, maxTransit] = route.transitDays
    const transitDays = randInt(minTransit, maxTransit)
    const etdOffset =
      stage === 'quotation'
        ? randInt(10, 30)
        : stage === 'contract'
          ? randInt(7, 20)
          : randInt(-30, -5) // already departed
    const etd = addDays(baseDate, etdOffset)
    const eta = addDays(etd, transitDays)

    const invoiceDate =
      ['invoiced', 'closed'].includes(stage)
        ? addDays(eta, randInt(1, 5))
        : null

    // Status mapping
    const quotationStatus =
      stage === 'quotation'
        ? ((['active', 'invited', 'invited', 'suspended', 'invited'] as const)[i % 5])
        : 'active' as const
    const contractStatus =
      stage === 'quotation'
        ? 'invited' as const
        : stage === 'contract'
          ? 'invited' as const
          : 'active' as const
    const shipmentStatus =
      stage === 'in-transit'
        ? 'active' as const
        : ['invoiced', 'closed'].includes(stage)
          ? 'inactive' as const
          : stage === 'shipping'
            ? 'invited' as const
            : 'invited' as const
    const invoiceStatus =
      stage === 'closed'
        ? 'active' as const // paid
        : stage === 'invoiced'
          ? (i >= 27 ? 'suspended' as const : 'inactive' as const) // overdue or disputed
          : 'invited' as const
    const siStatus =
      stage === 'shipping'
        ? 'Draft' as const
        : ['in-transit', 'invoiced', 'closed'].includes(stage)
          ? 'Confirmed' as const
          : 'Draft' as const

    // D&D — chains 27-29 have D&D
    const hasDnD = i >= 27 || (stage === 'invoiced' && i % 5 === 0)
    const dndOverdueDays = hasDnD ? randInt(2, 8) : 0
    const dndFeeType: TransactionChain['dndFeeType'] = hasDnD
      ? (['Demurrage', 'Detention', 'Storage'] as const)[i % 3]
      : 'Demurrage'
    const dndDailyRate = hasDnD
      ? containerType === '40HC' || containerType === '40GP'
        ? randInt(120, 200)
        : randInt(80, 150)
      : 0

    // Document numbers
    const quotationNo = `QT-2026-${String(1000 + i).padStart(4, '0')}`
    const contractNo =
      stage !== 'quotation'
        ? `CTR-2026-${String(1000 + i).padStart(4, '0')}`
        : null
    const siNo =
      siDate
        ? `SI-2026-${String(1000 + i).padStart(4, '0')}`
        : null
    const packingListNo =
      siDate
        ? `PL-2026-${String(1000 + i).padStart(4, '0')}`
        : null
    const shipmentNo =
      ['in-transit', 'invoiced', 'closed'].includes(stage)
        ? `SHP-2026-${String(1000 + i).padStart(4, '0')}`
        : ['shipping'].includes(stage)
          ? `SHP-2026-${String(1000 + i).padStart(4, '0')}`
          : null
    const invoiceNo = invoiceDate
      ? `INV-2026-${String(1000 + i).padStart(4, '0')}`
      : null
    const dndFeeNo = hasDnD
      ? `DND-2026-${String(800 + i).padStart(3, '0')}`
      : null

    const poNumber =
      ['in-transit', 'invoiced', 'closed'].includes(stage)
        ? `PO-2026-${String(300 + i).padStart(4, '0')}`
        : null
    const vendorBillNo =
      ['invoiced', 'closed'].includes(stage)
        ? `BILL-${vessel.carrier.toUpperCase().replace(/\s/g, '')}-2026-${String(100 + i).padStart(3, '0')}`
        : null

    return {
      idx: i,
      client,
      commodity,
      originPort,
      destPort,
      vessel,
      serviceMode: route.mode,
      containerType,
      containerNo,
      blNumber,
      bookingNo,
      incoterm: INCOTERMS[i % INCOTERMS.length],
      currency: 'USD',
      freightCharge,
      surcharge,
      handlingFee,
      totalAmount,
      packages,
      packageUnit,
      grossWeightKg,
      volumeCbm,
      quotationNo,
      contractNo,
      siNo,
      packingListNo,
      shipmentNo,
      invoiceNo,
      dndFeeNo,
      poNumber,
      vendorBillNo,
      quotationDate,
      contractDate,
      siDate,
      etd,
      eta,
      invoiceDate,
      stage,
      quotationStatus,
      contractStatus,
      shipmentStatus,
      invoiceStatus,
      siStatus,
      hasDnD,
      dndOverdueDays,
      dndFeeType,
      dndDailyRate,
    }
  }
)

// =============================================================================
// CONVENIENCE ACCESSORS
// =============================================================================

/** All chains that have a contract */
export const contractChains = transactionChains.filter((c) => c.contractNo)

/** All chains that have a shipping instruction */
export const siChains = transactionChains.filter((c) => c.siNo)

/** All chains that have a shipment */
export const shipmentChains = transactionChains.filter((c) => c.shipmentNo)

/** All chains that have an invoice */
export const invoiceChains = transactionChains.filter((c) => c.invoiceNo)

/** All chains with D&D fees */
export const dndChains = transactionChains.filter((c) => c.hasDnD && c.dndFeeNo)

/** Indonesian shipper companies (used as "our" clients in SI/PL) */
export const indonesianShippers = idClients

/** Carrier name from vessel */
export function getCarrierName(v: Vessel): string {
  const map: Record<string, string> = {
    OOCL: 'OOCL',
    MSC: 'MSC Mediterranean Shipping',
    Maersk: 'Maersk Line',
    Evergreen: 'Evergreen Marine',
    COSCO: 'COSCO Shipping',
    ONE: 'Ocean Network Express (ONE)',
    PIL: 'Pacific International Lines (PIL)',
    HMM: 'HMM (Hyundai Merchant Marine)',
    'CMA CGM': 'CMA CGM',
    'Yang Ming': 'Yang Ming Marine',
  }
  return map[v.carrier] ?? v.carrier
}

/** Get terminal name for a port locode */
export function getTerminalName(locode: string): string {
  return TERMINALS[locode] ?? `${locode} Container Terminal`
}

/** Vendor names for procurement */
export const VENDOR_PARTNERS = [
  { id: 'VND-1001', name: 'Ocean Network Express Indonesia', code: 'ONE-ID', category: 'Shipping Line', country: 'ID' },
  { id: 'VND-1002', name: 'Maersk Line Indonesia PT', code: 'MAERSK-ID', category: 'Shipping Line', country: 'ID' },
  { id: 'VND-1003', name: 'Evergreen Marine Corp (Indonesia)', code: 'EGRN-ID', category: 'Shipping Line', country: 'ID' },
  { id: 'VND-1004', name: 'COSCO Shipping Lines Indonesia', code: 'COSCO-ID', category: 'Shipping Line', country: 'ID' },
  { id: 'VND-1005', name: 'CMA CGM Lines Indonesia', code: 'CMACGM-ID', category: 'Shipping Line', country: 'ID' },
  { id: 'VND-1006', name: 'PT Pelabuhan Indonesia (Persero)', code: 'PELINDO', category: 'Port Operator', country: 'ID' },
  { id: 'VND-1007', name: 'Jakarta International Container Terminal', code: 'JICT', category: 'Terminal Operator', country: 'ID' },
  { id: 'VND-1008', name: 'DHL Freight Services Indonesia', code: 'DHL-ID', category: 'Freight Forwarder', country: 'ID' },
  { id: 'VND-1009', name: 'PT Lintas Karunia Logistics', code: 'LKL', category: 'Trucking', country: 'ID' },
  { id: 'VND-1010', name: 'Direktorat Jenderal Bea Dan Cukai', code: 'DJBC', category: 'Government / Customs', country: 'ID' },
  { id: 'VND-1011', name: 'Garuda Indonesia Cargo', code: 'GA-CARGO', category: 'Airline Cargo', country: 'ID' },
  { id: 'VND-1012', name: 'PT Kamadjaja Logistics', code: 'KJL', category: 'Warehousing', country: 'ID' },
  { id: 'VND-1013', name: 'Hapag-Lloyd Indonesia', code: 'HAPAG-ID', category: 'Shipping Line', country: 'ID' },
  { id: 'VND-1014', name: 'Yang Ming Marine Indonesia', code: 'YANGMING-ID', category: 'Shipping Line', country: 'ID' },
  { id: 'VND-1015', name: 'PT Samudera Indonesia Tbk', code: 'SMDR', category: 'Shipping Line', country: 'ID' },
]
