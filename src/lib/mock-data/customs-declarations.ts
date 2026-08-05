// =============================================================================
// CUSTOMS DECLARATIONS MOCK DATA — ERP-ONE / MASBRO AI
// 80 PIB (Import) + 40 PEB (Export) declarations — CEISA 4.0 simulation
// Snowflake table target: erp_customs_declarations
// =============================================================================

import { clientCompanies, ports, commodities } from '@/lib/mock-data/master-data'

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}
const rng = seededRandom(778899)
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min
const randDate = (daysBack: number): Date => {
  const d = new Date('2026-07-26')
  d.setDate(d.getDate() - Math.floor(rng() * daysBack))
  return d
}

export type CustomsDocType = 'PIB' | 'PEB'
export type CustomsStatus =
  | 'APPROVED'
  | 'IN PROGRESS'
  | 'HOLD'
  | 'UNDER REVIEW'
  | 'REJECTED'
  | 'PENDING'

export interface CustomsDeclaration {
  id: string
  docType: CustomsDocType
  docNumber: string
  shipmentRef: string
  clientId: string
  clientName: string
  originLocode: string
  destLocode: string
  commodity: string
  hsCode: string
  grossWeight: string
  cif: string
  dutyAmount: string
  vatAmount: string
  status: CustomsStatus
  submittedAt: Date
  clearedAt: Date | null
  holdReason: string | null
  officerNote: string | null
  linkedShipment: string
  linkedInvoice: string
  portOfEntry: string
}

// ─── Hold / review reasons (realistic CEISA scenarios) ───────────────────────
const HOLD_REASONS = [
  'Mismatch HS Code — declared 8471.30 vs. tariff book 8473.30',
  'CIF value exceeds threshold — manual valuation required',
  'Missing Certificate of Origin (SKA/CoO)',
  'Phytosanitary certificate required for agricultural products',
  'LARTAS restriction — B2 license required for this commodity',
  'Physical inspection requested by Bea Cukai officer',
  'Importer identity verification pending (NIK cross-check)',
  'Shipment weight discrepancy — manifest vs. B/L mismatch',
]

const OFFICER_NOTES = [
  'Dokumen diminta segera dalam 2×24 jam',
  'Harap kirimkan respons tertulis ke Kantor Pelayanan BC Tanjung Priok',
  'Tunggu verifikasi sistem INSW selesai',
  'Importir diminta hadir untuk klarifikasi di Seksi P2',
  'Surat tanggapan diterima, proses verifikasi berlanjut',
]

// ─── Customs duty rates by HS chapter ────────────────────────────────────────
function getDutyRate(hsCode: string): number {
  const chapter = parseInt(hsCode.substring(0, 2))
  if (chapter >= 1 && chapter <= 24) return 5   // Agri / food
  if (chapter >= 25 && chapter <= 40) return 3   // Chemicals / rubber
  if (chapter >= 72 && chapter <= 83) return 7.5 // Metals
  if (chapter >= 84 && chapter <= 85) return 0   // Machinery / electronics (ACFTA 0%)
  return 5 // default
}

const PIB_STATUSES: CustomsStatus[] = ['APPROVED', 'IN PROGRESS', 'HOLD', 'UNDER REVIEW', 'PENDING', 'REJECTED']
const PIB_WEIGHTS = [0.45, 0.20, 0.15, 0.10, 0.07, 0.03]

function weightedPIBStatus(): CustomsStatus {
  const r = rng()
  let cum = 0
  for (let i = 0; i < PIB_WEIGHTS.length; i++) {
    cum += PIB_WEIGHTS[i]
    if (r < cum) return PIB_STATUSES[i]
  }
  return 'APPROVED'
}

const PEB_STATUSES: CustomsStatus[] = ['APPROVED', 'IN PROGRESS', 'PENDING', 'HOLD']
const PEB_WEIGHTS = [0.70, 0.15, 0.10, 0.05]

function weightedPEBStatus(): CustomsStatus {
  const r = rng()
  let cum = 0
  for (let i = 0; i < PEB_WEIGHTS.length; i++) {
    cum += PEB_WEIGHTS[i]
    if (r < cum) return PEB_STATUSES[i]
  }
  return 'APPROVED'
}

const INDO_PORTS_ENTRY = ['IDJKT', 'IDJBR', 'IDSRG', 'IDBTH']

// ─── Generate PIB (Import) — 80 records ──────────────────────────────────────
const pibs: CustomsDeclaration[] = Array.from({ length: 80 }, (_, i) => {
  const client = pick(clientCompanies.filter(c => c.country !== 'ID'))
  const commodity = pick(commodities)
  const portOfEntry = pick(INDO_PORTS_ENTRY)
  const port = ports.find(p => p.locode === portOfEntry)

  const cifUSD = randInt(5000, 95000)
  const dutyRate = getDutyRate(commodity.hsCode)
  const dutyUSD = Math.round(cifUSD * (dutyRate / 100))
  const vatUSD = Math.round((cifUSD + dutyUSD) * 0.11)

  const status = weightedPIBStatus()
  const submittedAt = randDate(60)
  const clearedAt = status === 'APPROVED'
    ? new Date(submittedAt.getTime() + 1000 * 60 * 60 * randInt(3, 72))
    : null

  const isHold = status === 'HOLD' || status === 'UNDER REVIEW'

  return {
    id: `pib-${String(2026400 + i).padStart(7, '0')}`,
    docType: 'PIB',
    docNumber: `PIB-2026-${String(400 + i).padStart(4, '0')}`,
    shipmentRef: `SHP-2026-${String(1000 + (i % 80)).padStart(4, '0')}`,
    clientId: client.id,
    clientName: client.name,
    originLocode: pick(['CNSHA', 'CNNGB', 'SGSIN', 'USLAX', 'JPYOK', 'AEJEA']),
    destLocode: portOfEntry,
    commodity: commodity.name,
    hsCode: commodity.hsCode,
    grossWeight: `${randInt(1000, 25000).toLocaleString('en-US')} kg`,
    cif: `$${cifUSD.toLocaleString('en-US')}.00`,
    dutyAmount: `$${dutyUSD.toLocaleString('en-US')}.00`,
    vatAmount: `$${vatUSD.toLocaleString('en-US')}.00`,
    status,
    submittedAt,
    clearedAt,
    holdReason: isHold ? pick(HOLD_REASONS) : null,
    officerNote: isHold ? pick(OFFICER_NOTES) : null,
    linkedShipment: `SHP-2026-${String(1000 + (i % 80)).padStart(4, '0')}`,
    linkedInvoice: `INV-2026-${String(1000 + (i % 120)).padStart(4, '0')}`,
    portOfEntry: port?.name ?? portOfEntry,
  }
})

// ─── Generate PEB (Export) — 40 records ──────────────────────────────────────
const pebs: CustomsDeclaration[] = Array.from({ length: 40 }, (_, i) => {
  const client = pick(clientCompanies.filter(c => c.country !== 'ID'))
  const commodity = pick(commodities)
  const portOfExit = pick(INDO_PORTS_ENTRY)
  const port = ports.find(p => p.locode === portOfExit)

  const fobUSD = randInt(3000, 80000)
  const status = weightedPEBStatus()
  const submittedAt = randDate(45)
  const clearedAt = status === 'APPROVED'
    ? new Date(submittedAt.getTime() + 1000 * 60 * 60 * randInt(1, 8))
    : null

  const isHold = status === 'HOLD'

  return {
    id: `peb-${String(2026200 + i).padStart(7, '0')}`,
    docType: 'PEB',
    docNumber: `PEB-2026-${String(200 + i).padStart(4, '0')}`,
    shipmentRef: `SHP-2026-${String(1080 + i).padStart(4, '0')}`,
    clientId: client.id,
    clientName: client.name,
    originLocode: portOfExit,
    destLocode: pick(['CNSHA', 'SGSIN', 'USLAX', 'JPYOK', 'AEJEA']),
    commodity: commodity.name,
    hsCode: commodity.hsCode,
    grossWeight: `${randInt(500, 20000).toLocaleString('en-US')} kg`,
    cif: `$${fobUSD.toLocaleString('en-US')}.00`,
    dutyAmount: '$0.00',  // Exports: no import duty
    vatAmount: '$0.00',   // Exports: VAT-exempt (PPN 0% for ekspor)
    status,
    submittedAt,
    clearedAt,
    holdReason: isHold ? pick(HOLD_REASONS) : null,
    officerNote: isHold ? pick(OFFICER_NOTES) : null,
    linkedShipment: `SHP-2026-${String(1080 + i).padStart(4, '0')}`,
    linkedInvoice: `INV-2026-${String(1050 + i).padStart(4, '0')}`,
    portOfEntry: port?.name ?? portOfExit,
  }
})

export const customsDeclarations: CustomsDeclaration[] = [...pibs, ...pebs]

// Convenience slices for Masbro AI alerts
export const heldDeclarations = customsDeclarations.filter(
  d => d.status === 'HOLD' || d.status === 'UNDER REVIEW'
)
export const pendingDeclarations = customsDeclarations.filter(d => d.status === 'PENDING')
export const recentlyCleared = customsDeclarations
  .filter(d => d.status === 'APPROVED' && d.clearedAt !== null)
  .sort((a, b) => (b.clearedAt?.getTime() ?? 0) - (a.clearedAt?.getTime() ?? 0))
  .slice(0, 10)
