// =============================================================================
// PROCUREMENT MOCK DATA — ERP-ONE
// Fully synchronized with document-chain-data.ts and Vendor Partners
// Snowflake tables target: erp_partner_directory, erp_vendor_rates, erp_purchase_orders
// =============================================================================

import {
  VENDOR_PARTNERS,
  transactionChains,
} from '@/lib/mock-data/document-chain-data'
import {
  type PartnerDirectoryItem,
  type VendorRateItem,
  type PurchaseOrderItem,
} from './schema'

// ─── 1. PARTNER DIRECTORY (15 VENDOR PARTNERS) ─────────────────────────────

const CONTACT_PERSONS = [
  'Hendra Gunawan (Head of Commercial)',
  'Susanna Tan (VP Trade & Rates)',
  'Bambang Wijoyono (Operations Director)',
  'Grace Heryanto (Key Account Manager)',
  'Denis Kusuma (Logistics Specialist)',
  'Ir. Darso Wardoyo (Port Terminal Manager)',
  'Anita Setyawati (Customs Liaison Officer)',
  'Jonathan Hartono (Air Cargo Director)',
  'Lukman Hakim (Haulage & Fleet Mgr)',
  'Dra. Nurul Hidayati (DJBC Coordinator)',
  'Captain Robert Wibowo (Marine Advisor)',
  'Chrystel Lie (Contract Executive)',
  'Stefanus Chandra (Pricing Manager)',
  'William Gani (Inland Depot Supervisor)',
  'Michael Tandjung (Strategic Partner VP)',
]

const ADDRESSES: Record<string, { city: string; address: string }> = {
  'ONE-ID': { city: 'Jakarta', address: 'Sinar Mas Land Plaza, Tower 2, Lt. 24, Jl. M.H. Thamrin No. 51' },
  'MAERSK-ID': { city: 'Jakarta', address: 'International Financial Centre Tower 2, Lt. 28, Jl. Jend. Sudirman Kav. 22-23' },
  'EGRN-ID': { city: 'Jakarta', address: 'Wisma Eka Jiwa Lt. 9, Jl. Mangga Dua Raya, Jakarta Pusat' },
  'COSCO-ID': { city: 'Jakarta', address: 'Gedung Artha Graha Lt. 17, SCBD Lot 25, Jl. Jend. Sudirman' },
  'CMACGM-ID': { city: 'Jakarta', address: 'Menara Mandiri 2, Lt. 15, Jl. Jend. Sudirman Kav. 54-55' },
  'PELINDO': { city: 'Surabaya', address: 'Jl. Perak Timur No. 610, Perak Utara, Pabean Cantian' },
  'JICT': { city: 'Jakarta', address: 'Pelabuhan Tanjung Priok, Terminal Petikemas Koja, Jl. Sulawesi No. 1' },
  'DHL-ID': { city: 'Tangerang', address: 'Soewarna Business Park, Block A No. 1, Soekarno-Hatta Int Airport' },
  'LKL': { city: 'Surabaya', address: 'Jl. Margomulyo Permai I Blok A-12, Tandes, Surabaya' },
  'DJBC': { city: 'Jakarta', address: 'Jl. Ahmad Yani (Bypass) No. Rawamangun, Jakarta Timur' },
  'GA-CARGO': { city: 'Tangerang', address: 'Cargo Area Bandara Soekarno-Hatta Terminal Cargo 3, Cengkareng' },
  'KJL': { city: 'Surabaya', address: 'Jl. Rungkut Industri Raya No. 22, Surabaya' },
  'HAPAG-ID': { city: 'Jakarta', address: 'Wisma BSI, Lt. 18, Jl. Kebon Sirih No. 67, Menteng' },
  'YANGMING-ID': { city: 'Jakarta', address: 'Mid Plaza 2, Lt. 14, Jl. Jend. Sudirman Kav. 10-11' },
  'SMDR': { city: 'Jakarta', address: 'Gedung Samudera Indonesia, Jl. Letjen S. Parman Kav. 35' },
}

export const partnerDirectory: PartnerDirectoryItem[] = VENDOR_PARTNERS.map((vendor, index) => {
  const loc = ADDRESSES[vendor.code] || { city: 'Jakarta', address: 'Jl. Sudirman No. 100, Jakarta' }
  const contact = CONTACT_PERSONS[index % CONTACT_PERSONS.length]
  const email = `partner.desk@${vendor.code.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.id`
  const phone = `+62 21 ${5000 + index * 132}-${800 + index * 11}`
  const taxId = `01.442.${200 + index}.8-054.000`
  const bankAccount = `Bank BCA (USD) - 8810-${3320 + index}-000`
  const rating = 4.6 + (index % 5) * 0.1
  const slaScore = `${95 + (index % 5)}% On-Time SLA`
  const paymentTerms = index % 3 === 0 ? 'Net 30 Days' : index % 3 === 1 ? 'Net 15 Days' : 'Immediate / Cash Balance'

  return {
    id: vendor.id,
    code: vendor.code,
    name: vendor.name,
    category: vendor.category as any,
    country: vendor.country,
    city: loc.city,
    address: loc.address,
    contactPerson: contact,
    email,
    phone,
    taxId,
    bankAccount,
    rating: parseFloat(rating.toFixed(1)),
    slaScore,
    paymentTerms,
    status: index === 14 ? 'Under Review' : 'Active',
    // Compatibility fields
    firstName: vendor.name,
    username: vendor.code,
    role: vendor.category,
    amount: `${slaScore} (${rating.toFixed(1)} ★)`,
    validUntil: paymentTerms,
  }
})

// ─── 2. VENDOR RATES (CARRIER RATE CARDS) ─────────────────────────────────

const RATE_DEFINITIONS = [
  { vendorCode: 'ONE-ID', vendorName: 'Ocean Network Express Indonesia', origin: 'IDJKT (Jakarta)', dest: 'CNSHA (Shanghai)', eq: '40ft High Cube Dry', mode: 'ocean-fcl', base: 1850, baf: 12, days: '10-12 Days', ref: 'CTR-RATE-2026-ONE-01' },
  { vendorCode: 'MAERSK-ID', vendorName: 'Maersk Line Indonesia PT', origin: 'IDJBR (Surabaya)', dest: 'SGSIN (Singapore)', eq: '20ft Standard Dry', mode: 'ocean-fcl', base: 680, baf: 10, days: '3-4 Days', ref: 'CTR-RATE-2026-MSK-05' },
  { vendorCode: 'EGRN-ID', vendorName: 'Evergreen Marine Corp (Indonesia)', origin: 'IDJKT (Jakarta)', dest: 'USLAX (Los Angeles)', eq: '40ft High Cube Dry', mode: 'ocean-fcl', base: 4200, baf: 15, days: '22-25 Days', ref: 'CTR-RATE-2026-EGL-12' },
  { vendorCode: 'COSCO-ID', vendorName: 'COSCO Shipping Lines Indonesia', origin: 'IDJKT (Jakarta)', dest: 'CNNGB (Ningbo)', eq: '40ft Standard Dry', mode: 'ocean-fcl', base: 1720, baf: 14, days: '11-14 Days', ref: 'CTR-RATE-2026-COS-03' },
  { vendorCode: 'CMACGM-ID', vendorName: 'CMA CGM Lines Indonesia', origin: 'IDJKT (Jakarta)', dest: 'AEJEA (Jebel Ali)', eq: '40ft High Cube Dry', mode: 'ocean-fcl', base: 2650, baf: 12, days: '16-18 Days', ref: 'CTR-RATE-2026-CMA-08' },
  { vendorCode: 'PELINDO', vendorName: 'PT Pelabuhan Indonesia (Persero)', origin: 'Tanjung Perak (IDJBR)', dest: 'Terminal Handling', eq: 'Container THC (40ft)', mode: 'port-services', base: 220, baf: 0, days: 'N/A', ref: 'PELINDO-TARIF-2026' },
  { vendorCode: 'JICT', vendorName: 'Jakarta International Container Terminal', origin: 'Tanjung Priok (IDJKT)', dest: 'Stevedoring & Lift', eq: 'Container THC (20ft)', mode: 'port-services', base: 165, baf: 0, days: 'N/A', ref: 'JICT-TARIF-2026' },
  { vendorCode: 'DHL-ID', vendorName: 'DHL Freight Services Indonesia', origin: 'IDBTH (Batam)', dest: 'SGSIN (Singapore)', eq: 'LCL Groupage / CBM', mode: 'ocean-lcl', base: 45, baf: 8, days: '1-2 Days', ref: 'DHL-RATE-LCL-2026' },
  { vendorCode: 'LKL', vendorName: 'PT Lintas Karunia Logistics', origin: 'Caturwulan Depot', dest: 'Tanjung Perak Port', eq: 'Trailer Haulage (40ft)', mode: 'land-haulage', base: 180, baf: 5, days: 'Same Day', ref: 'TRUCK-LKL-2026' },
  { vendorCode: 'GA-CARGO', vendorName: 'Garuda Indonesia Cargo', origin: 'IDCGK (Soekarno-Hatta)', dest: 'JPNRT (Tokyo Narita)', eq: 'Air Freight / kg (Min 500kg)', mode: 'air', base: 4, baf: 20, days: '1 Day (Direct)', ref: 'GACARGO-JP-2026' },
  { vendorCode: 'HAPAG-ID', vendorName: 'Hapag-Lloyd Indonesia', origin: 'IDSRG (Semarang)', dest: 'CNTAO (Qingdao)', eq: '20ft Standard Dry', mode: 'ocean-fcl', base: 1450, baf: 11, days: '13-16 Days', ref: 'CTR-RATE-2026-HLX-09' },
  { vendorCode: 'YANGMING-ID', vendorName: 'Yang Ming Marine Indonesia', origin: 'IDJKT (Jakarta)', dest: 'JPYOK (Yokohama)', eq: '40ft High Cube Dry', mode: 'ocean-fcl', base: 2100, baf: 13, days: '10-13 Days', ref: 'CTR-RATE-2026-YML-14' },
]

export const vendorRates: VendorRateItem[] = RATE_DEFINITIONS.map((item, index) => {
  const effectiveRate = Math.round(item.base * (1 + item.baf / 100))
  const validFrom = '2026-01-01'
  const validUntil = index % 4 === 3 ? '2026-08-31' : '2026-12-31'
  const status: VendorRateItem['status'] = index % 4 === 3 ? 'Expiring Soon' : 'Active'
  const amountStr = `$${effectiveRate.toLocaleString('en-US')}${item.mode === 'air' ? '/kg' : item.mode === 'ocean-lcl' ? '/cbm' : '/unit'}`

  return {
    id: `RATE-2026-${String(101 + index)}`,
    rateCode: `VR-${String(202600 + index)}`,
    vendorCode: item.vendorCode,
    vendorName: item.vendorName,
    origin: item.origin,
    destination: item.dest,
    equipmentType: item.eq,
    serviceMode: item.mode as any,
    currency: 'USD',
    baseRate: item.base,
    fuelSurchargePct: item.baf,
    effectiveRate,
    transitDays: item.days,
    validFrom,
    validUntil,
    contractRef: item.ref,
    status,
    // Compatibility
    firstName: item.vendorName,
    username: `VR-${String(202600 + index)}`,
    email: `${item.vendorCode.toLowerCase()}@partner-rates.co.id`,
    role: item.mode.toUpperCase(),
    amount: amountStr,
  }
})

// ─── 3. PURCHASE ORDERS (20 RECORDS LINKED TO CHAINS) ─────────────────────

// Select chains that have advanced past quotation stage (e.g. shipments or in-transit)
const poSourceChains = transactionChains.filter((c) => c.poNumber !== null || ['in-transit', 'invoiced', 'closed', 'shipping'].includes(c.stage)).slice(0, 20)

export const purchaseOrders: PurchaseOrderItem[] = poSourceChains.map((chain, index) => {
  const poNumber = chain.poNumber ?? `PO-2026-${String(300 + index).padStart(4, '0')}`
  const vendor = VENDOR_PARTNERS[index % VENDOR_PARTNERS.length]

  const orderDate = chain.contractDate ?? chain.quotationDate
  const deliveryDate = chain.etd

  // Compute realistic breakdown
  const freightCost = chain.freightCharge
  const handlingCost = chain.handlingFee
  const subtotal = freightCost + handlingCost
  const taxAmount = Math.round(subtotal * 0.11) // 11% Indonesian VAT
  const totalAmount = subtotal + taxAmount
  const amountStr = `$${totalAmount.toLocaleString('en-US')}.00`

  const status: PurchaseOrderItem['status'] =
    chain.stage === 'closed' ? 'Completed' :
    chain.stage === 'invoiced' || chain.stage === 'in-transit' ? 'Approved' :
    chain.stage === 'shipping' ? 'Issued' : 'Pending Approval'

  const lineItems = [
    {
      description: `Ocean/Air Freight Service (${chain.originPort.city} to ${chain.destPort.city}) - ${chain.commodity.name}`,
      qty: chain.serviceMode === 'air' ? chain.grossWeightKg : 1,
      unit: chain.serviceMode === 'air' ? 'KG' : (chain.containerType ?? 'LCL Unit'),
      unitPrice: chain.serviceMode === 'air' ? Math.round(freightCost / chain.grossWeightKg) : freightCost,
      totalPrice: freightCost,
    },
    {
      description: `Origin Terminal Handling & Stevedoring (${chain.originPort.name})`,
      qty: 1,
      unit: 'Lot',
      unitPrice: handlingCost,
      totalPrice: handlingCost,
    },
  ]

  return {
    id: `PO-${String(1001 + index)}`,
    poNumber,
    vendorCode: vendor.code,
    vendorName: vendor.name,
    orderDate,
    deliveryDate,
    subtotal,
    taxAmount,
    totalAmount,
    currency: 'USD',
    status,
    notes: `Procurement order supporting shipment ${chain.shipmentNo ?? 'Pending'} for client ${chain.client.shortName}. Ref Quotation: ${chain.quotationNo}.`,
    linkedShipment: chain.shipmentNo,
    linkedQuotation: chain.quotationNo,
    linkedContract: chain.contractNo,
    linkedInvoice: chain.invoiceNo,
    linkedVendorBill: chain.vendorBillNo,
    lineItems,
    // Compatibility fields
    firstName: vendor.name,
    username: poNumber,
    email: `procurement@${vendor.code.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.id`,
    role: vendor.category,
    amount: amountStr,
    validUntil: deliveryDate,
  }
})
