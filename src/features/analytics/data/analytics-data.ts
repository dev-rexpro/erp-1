import { mockCostAccruals, mockAccountsReceivable, mockVendorBills } from '@/features/finance/data/finance-data'
import { shipmentChains, VENDOR_PARTNERS } from '@/lib/mock-data/document-chain-data'

export interface TradeLanePerformance {
  lane: string
  origin: string
  destination: string
  volumeTeu: number
  activeShipments: number
  revenueUsd: number
  avgTransitDays: number
  targetTransitDays: number
  onTimeRate: number
  customsRedLinePct: number
  marginPct: number
}

export const tradeLanesData: TradeLanePerformance[] = [
  {
    lane: 'Tanjung Priok (IDTPP) → Singapore (SGSIN)',
    origin: 'Tanjung Priok, ID',
    destination: 'Singapore, SG',
    volumeTeu: 4820,
    activeShipments: 42,
    revenueUsd: 1450000,
    avgTransitDays: 2.8,
    targetTransitDays: 3.0,
    onTimeRate: 96.5,
    customsRedLinePct: 2.1,
    marginPct: 28.4,
  },
  {
    lane: 'Tanjung Priok (IDTPP) → Hamburg (DEHAM)',
    origin: 'Tanjung Priok, ID',
    destination: 'Hamburg, DE',
    volumeTeu: 3150,
    activeShipments: 28,
    revenueUsd: 2180000,
    avgTransitDays: 26.4,
    targetTransitDays: 24.0,
    onTimeRate: 88.2,
    customsRedLinePct: 4.8,
    marginPct: 22.1,
  },
  {
    lane: 'Shanghai (CNSHA) → Tanjung Priok (IDTPP)',
    origin: 'Shanghai, CN',
    destination: 'Tanjung Priok, ID',
    volumeTeu: 5240,
    activeShipments: 36,
    revenueUsd: 1980000,
    avgTransitDays: 9.1,
    targetTransitDays: 8.5,
    onTimeRate: 91.0,
    customsRedLinePct: 8.4,
    marginPct: 19.8,
  },
  {
    lane: 'Tanjung Priok (IDTPP) → Los Angeles (USLAX)',
    origin: 'Tanjung Priok, ID',
    destination: 'Los Angeles, US',
    volumeTeu: 2890,
    activeShipments: 22,
    revenueUsd: 2450000,
    avgTransitDays: 21.5,
    targetTransitDays: 20.0,
    onTimeRate: 85.4,
    customsRedLinePct: 5.2,
    marginPct: 25.6,
  },
  {
    lane: 'Tanjung Perak (IDSUB) → Rotterdam (NLRTM)',
    origin: 'Surabaya, ID',
    destination: 'Rotterdam, NL',
    volumeTeu: 1940,
    activeShipments: 14,
    revenueUsd: 1220000,
    avgTransitDays: 28.2,
    targetTransitDays: 26.0,
    onTimeRate: 87.0,
    customsRedLinePct: 3.9,
    marginPct: 21.0,
  },
]

export const carrierPerformanceData = [
  { carrier: 'Maersk Line', shipments: 184, teu: 5820, onTimeRate: 94.2, avgDelayDays: 0.8, costRating: 'High', reliability: 96 },
  { carrier: 'Ocean Network Express (ONE)', shipments: 142, teu: 4190, onTimeRate: 91.5, avgDelayDays: 1.2, costRating: 'Medium', reliability: 92 },
  { carrier: 'CMA CGM', shipments: 98, teu: 2980, onTimeRate: 88.4, avgDelayDays: 1.8, costRating: 'Medium', reliability: 89 },
  { carrier: 'MSC (Mediterranean)', shipments: 126, teu: 3840, onTimeRate: 86.1, avgDelayDays: 2.1, costRating: 'Low', reliability: 85 },
  { carrier: 'Evergreen Line', shipments: 64, teu: 1950, onTimeRate: 93.0, avgDelayDays: 0.9, costRating: 'Medium', reliability: 94 },
]

export const monthlyFreightTrends = [
  { month: 'Jan', revenue: 840000, cost: 620000, profit: 220000, teu: 1850, activeShipments: 110 },
  { month: 'Feb', revenue: 910000, cost: 670000, profit: 240000, teu: 1980, activeShipments: 122 },
  { month: 'Mar', revenue: 1050000, cost: 780000, profit: 270000, teu: 2240, activeShipments: 135 },
  { month: 'Apr', revenue: 1180000, cost: 860000, profit: 320000, teu: 2410, activeShipments: 142 },
  { month: 'May', revenue: 1248000, cost: 910000, profit: 338000, teu: 2580, activeShipments: 156 },
  { month: 'Jun (Est)', revenue: 1320000, cost: 950000, profit: 370000, teu: 2720, activeShipments: 168 },
]

export const customsChannelDistribution = [
  { name: 'Jalur Hijau (Green)', count: 284, percentage: 82.5, color: '#10b981' },
  { name: 'Jalur Kuning (Yellow - Doc Review)', count: 42, percentage: 12.2, color: '#f59e0b' },
  { name: 'Jalur Merah (Red - Physical Inspection)', count: 18, percentage: 5.3, color: '#ef4444' },
]

export const costCategoryBreakdown = [
  { category: 'Ocean Freight Main Leg', amount: 642000, pct: 51.4 },
  { category: 'Terminal Handling Charges (THC)', amount: 185000, pct: 14.8 },
  { category: 'Customs Duties & Tax Clearance', amount: 154000, pct: 12.3 },
  { category: 'Inland Drayage & Trucking', amount: 168000, pct: 13.5 },
  { category: 'Feeder & Barge Transport', amount: 99000, pct: 8.0 },
]

export interface AIInsightResult {
  title: string
  category: 'Leakage' | 'Carrier' | 'Customs' | 'Optimization'
  riskLevel: 'High' | 'Medium' | 'Low' | 'Opportunity'
  summary: string
  metrics: { label: string; value: string; trend?: string }[]
  rootCauses: string[]
  actionPlan: string[]
}

export function generatePresetAIInsight(type: string): AIInsightResult {
  if (type === 'leakage') {
    const unReconciledAccruals = mockCostAccruals.filter((a) => a.status === 'Provisioned')
    const totalUnreconciled = unReconciledAccruals.reduce((sum, a) => sum + a.estimatedAmount, 0)
    return {
      title: 'Cost Variance & Demurrage Leakage Detected',
      category: 'Leakage',
      riskLevel: 'High',
      summary: `Found ${unReconciledAccruals.length} un-reconciled cost provisions totaling $${totalUnreconciled.toLocaleString()} USD across ocean freight and port terminal charges. Variance risk identified in MSC shipments arriving at Tg Priok.`,
      metrics: [
        { label: 'Unreconciled Provisions', value: `$${totalUnreconciled.toLocaleString()}` },
        { label: 'Demurrage Risk Exposure', value: '$18,400 USD', trend: '+12.5%' },
        { label: 'Estimated Margin Impact', value: '-2.4%' },
      ],
      rootCauses: [
        'Delayed final carrier invoices from MSC & CMA CGM for Tg. Priok terminal charges.',
        'Containers exceeding 5 days free time limit at UTC-3 terminal waiting for customs physical inspection.',
        'Discrepancy in ocean freight bunker adjustment factor (BAF) vs initial quote.',
      ],
      actionPlan: [
        'Automate matching between Vendor Bills and Cost Accrual provisions (ACC-2026-101 to ACC-2026-104).',
        'File urgent priority request to Customs Agency for Jalur Merah inspection clearance.',
        'Negotiate extended free storage (7 to 10 days) with MSC for Tg. Priok shipments.',
      ],
    }
  }

  if (type === 'carrier') {
    return {
      title: 'Carrier Reliability & Schedule Adherence Benchmark',
      category: 'Carrier',
      riskLevel: 'Medium',
      summary: 'Maersk Line leads on-time reliability (94.2%), while MSC is experiencing an average transit delay of 2.1 days on the Tg. Priok -> Hamburg lane due to transshipment port congestion at Colombo.',
      metrics: [
        { label: 'Maersk On-Time Rate', value: '94.2%', trend: '+1.4%' },
        { label: 'MSC Transit Delay', value: '2.1 Days', trend: 'Worse' },
        { label: 'Overall Fleet Reliability', value: '91.8%' },
      ],
      rootCauses: [
        'Transshipment delays at Colombo and Port Klang hub terminals.',
        'Feeder vessel schedule misalignment for Tg. Perak (Surabaya) feeder origin routes.',
      ],
      actionPlan: [
        'Shift high-priority European shipments (DEHAM/NLRTM) from MSC to Maersk or ONE Line.',
        'Implement direct booking routes for time-sensitive cargo via Singapore transshipment hub.',
      ],
    }
  }

  if (type === 'customs') {
    return {
      title: 'Customs Clearance Lead Time & Red Line Audit',
      category: 'Customs',
      riskLevel: 'Medium',
      summary: 'Jalur Merah (Red Line physical inspection) is currently 5.3% of total clearances. Import shipments under HS Code 8471.30 (Electronic Machinery) account for 65% of inspection delays.',
      metrics: [
        { label: 'Red Line Ratio', value: '5.3%', trend: '-0.8%' },
        { label: 'Avg Green Line Clearance', value: '4.2 Hours' },
        { label: 'Avg Red Line Inspection', value: '3.8 Days' },
      ],
      rootCauses: [
        'Missing secondary LARTAS (Permit/Quota) attachments in initial PIB submission for electronic components.',
        'HS Code classification variance between Export Packing List and Import Customs Declaration.',
      ],
      actionPlan: [
        'Enable pre-clearance validation rule in Shipping Instruction schema before draft lock.',
        'Ensure automatic document cross-check between Commercial Invoice and Packing List HS Codes.',
      ],
    }
  }

  // default optimization
  const totalAr = mockAccountsReceivable.reduce((s, a) => s + a.balanceDue, 0)
  return {
    title: 'Freight Yield & Revenue Optimization Strategy',
    category: 'Optimization',
    riskLevel: 'Opportunity',
    summary: `Current gross freight yield stands at $484 USD / TEU with net profit margin of 27.1%. Shifting volume to Tg. Priok -> SGSIN feeder shuttle could increase yield by +14% next quarter. Total Accounts Receivable collection outstanding is $${totalAr.toLocaleString()} USD.`,
    metrics: [
      { label: 'Avg Yield per TEU', value: '$484 USD', trend: '+5.2%' },
      { label: 'Net Operating Margin', value: '27.1%', trend: '+1.8%' },
      { label: 'AR Outstanding Balance', value: `$${totalAr.toLocaleString()}` },
    ],
    rootCauses: [
      'High volume demand for refrigerated container (Reefer) export slots for seafood & perishables to SG.',
      'Underutilized contract allocations with ONE Line for North America transpacific routes.',
    ],
    actionPlan: [
      'Increase reefer slot booking quota with Maersk & ONE Line for Q3 export peak season.',
      'Issue automated AR payment reminders for 31-60 days aging bucket customers to boost cash flow.',
    ],
  }
}
