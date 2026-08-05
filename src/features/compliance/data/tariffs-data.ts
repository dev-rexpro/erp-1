export interface TariffBTKIItem {
  hsCode: string
  description: string
  bmPercent: number
  ppnPercent: number
  pph22Percent: number
  lartasStatus: 'Bebas (No Restriction)' | 'Wajib LS (Surveyor Certificate)' | 'Izin Kemendag' | 'SNI Wajib'
  category: 'Machinery & Tech' | 'Chemicals & Plastics' | 'Textiles & Apparel' | 'Metals & Steel'
}

export const mockDutyTariffs: TariffBTKIItem[] = [
  {
    hsCode: '8471.30.20',
    description: 'Laptops, Notebooks & Portable Automatic Data Processing Machines',
    bmPercent: 0,
    ppnPercent: 11,
    pph22Percent: 2.5,
    lartasStatus: 'Wajib LS (Surveyor Certificate)',
    category: 'Machinery & Tech',
  },
  {
    hsCode: '8517.62.59',
    description: 'Ethernet Switches, Routers & Optical Network Transceivers',
    bmPercent: 5,
    ppnPercent: 11,
    pph22Percent: 2.5,
    lartasStatus: 'Bebas (No Restriction)',
    category: 'Machinery & Tech',
  },
  {
    hsCode: '7304.19.00',
    description: 'Seamless Line Pipes of Iron or Steel for Oil & Gas Pipelines',
    bmPercent: 10,
    ppnPercent: 11,
    pph22Percent: 7.5,
    lartasStatus: 'Izin Kemendag',
    category: 'Metals & Steel',
  },
  {
    hsCode: '3901.10.92',
    description: 'Polyethylene Resins in Primary Forms (Low Density LDPE Pellets)',
    bmPercent: 5,
    ppnPercent: 11,
    pph22Percent: 2.5,
    lartasStatus: 'Bebas (No Restriction)',
    category: 'Chemicals & Plastics',
  },
  {
    hsCode: '6109.10.10',
    description: 'T-Shirts, Singlets & Vests of Cotton (Knitted or Crocheted)',
    bmPercent: 25,
    ppnPercent: 11,
    pph22Percent: 7.5,
    lartasStatus: 'SNI Wajib',
    category: 'Textiles & Apparel',
  },
]
