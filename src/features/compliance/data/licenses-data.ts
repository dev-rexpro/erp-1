export interface TradeLicenseItem {
  id: string
  licenseNumber: string
  title: string
  issuer: string
  issueDate: string
  expiryDate: string
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Under Renewal'
  category: 'Import (API-U)' | 'Customs Broker (PPJK)' | 'Quarantine' | 'Safety & ISO'
  daysRemaining: number
  scope: string
}

export const mockTradeLicenses: TradeLicenseItem[] = [
  {
    id: 'LIC-2026-01',
    licenseNumber: 'NIB-912001928102',
    title: 'Nomor Induk Berusaha (NIB) & Angka Pengenal Importir (API-U)',
    issuer: 'Ministry of Investment / BKPM OSS Indonesia',
    issueDate: '2023-01-15',
    expiryDate: '2028-01-15',
    status: 'Active',
    category: 'Import (API-U)',
    daysRemaining: 538,
    scope: 'General Trade & Nationwide International Freight Import Licensing',
  },
  {
    id: 'LIC-2026-02',
    licenseNumber: 'PPJK-00492/BC/2024',
    title: 'Surat Izin Pengusaha Pengurusan Jasa Kepabeanan (PPJK)',
    issuer: 'Directorate General of Customs and Excise (DJBC)',
    issueDate: '2024-03-10',
    expiryDate: '2026-09-10',
    status: 'Expiring Soon',
    category: 'Customs Broker (PPJK)',
    daysRemaining: 46,
    scope: 'Official Customs Clearance Authorization at Port of Tanjung Priok & Soekarno-Hatta',
  },
  {
    id: 'LIC-2026-03',
    licenseNumber: 'SKEP-KARANTINA-8812',
    title: 'Sertifikat Instalasi Karantina Tumbuhan & Hewan (IKT/IKH)',
    issuer: 'Indonesian Quarantine Authority (Barantin)',
    issueDate: '2023-08-20',
    expiryDate: '2026-08-20',
    status: 'Expiring Soon',
    category: 'Quarantine',
    daysRemaining: 25,
    scope: 'Cold Storage & Biological Hazardous Cargo Clearance Inspection',
  },
  {
    id: 'LIC-2026-04',
    licenseNumber: 'ISO-9001-2026-REX',
    title: 'ISO 9001:2026 Quality Management Certification',
    issuer: 'SGS International Accreditation',
    issueDate: '2024-05-01',
    expiryDate: '2027-05-01',
    status: 'Active',
    category: 'Safety & ISO',
    daysRemaining: 279,
    scope: 'International Freight Logistics & Supply Chain Operations Assurance',
  },
  {
    id: 'LIC-2026-05',
    licenseNumber: 'IT-ELEKTRONIK-2025-09',
    title: 'Izin Importir Terdaftar Barang Elektronik & Telematika',
    issuer: 'Ministry of Trade (Kemendag RI)',
    issueDate: '2025-02-10',
    expiryDate: '2026-02-10',
    status: 'Under Renewal',
    category: 'Import (API-U)',
    daysRemaining: -166,
    scope: 'Specialized ICT & High-Tech Electronics Import Quota Authorization',
  },
]
