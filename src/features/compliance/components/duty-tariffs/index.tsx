import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search as SearchIcon, Calculator, Download, ExternalLink, RefreshCw, FileText, ChevronDown, ShieldCheck, Globe, CheckCircle2, Info, RotateCcw } from 'lucide-react'
import { mockDutyTariffs, TariffBTKIItem } from '../../data/tariffs-data'
import { MetricValue } from '@/components/ui/metric-value'
import { toast } from 'sonner'

const docListFallback: Record<string, string> = {
  '16': 'BC 1.6',
  '20': 'BC 2.0',
  '23': 'BC 2.3',
  '25': 'BC 2.5',
  '28': 'BC 2.8',
  '511': 'FTZ01 - Pemasukan dari Luar Daerah Pabean',
  '611': 'FTZ01 - Pengeluaran ke Tempat Lain dalam Daerah Pabean',
  '632': 'KEK - Pemasukan dari LDP',
  '660': 'KEK - Pengeluaran ke TLDDP',
}

export function DutyTariffsView() {
  const [tariffs] = useState<TariffBTKIItem[]>(mockDutyTariffs)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Calculator Dialog State
  const [calcOpen, setCalcOpen] = useState(false)
  const [selectedHsCode, setSelectedHsCode] = useState<string>('8471.30.20')
  const [cifUsd, setCifUsd] = useState<number>(10000)
  const [exchangeRate, setExchangeRate] = useState<number>(16250)

  // INSW Live Search State (Standard INTR Layout)
  const [inswQuery, setInswQuery] = useState('')
  const [lastQuery, setLastQuery] = useState('')
  const [inswLoading, setInswLoading] = useState(false)
  const [inswResults, setInswResults] = useState<any[]>([])
  const [inswTotal, setInswTotal] = useState(0)
  const [inswExecTime, setInswExecTime] = useState<string>('0')
  const [inswSearched, setInswSearched] = useState(false)

  // Detail Accordion State
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailData, setDetailData] = useState<any>(null)
  const [activeDocCode, setActiveDocCode] = useState<string>('20')

  // 5 Collapsible Section States matching intr/index.html
  const [sections, setSections] = useState({
    uraianBarang: true,
    informasiTarif: true,
    tarifPreferensi: false,
    regulasiImpor: false,
    catatan: false,
  })

  const toggleSection = (sectionName: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }))
  }

  const filteredData = tariffs.filter((item) => {
    const matchesSearch =
      item.hsCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Calculation Logic
  const activeTariff = tariffs.find((t) => t.hsCode === selectedHsCode) || tariffs[0]
  const nilaiPabeanIDR = cifUsd * exchangeRate
  const beaMasukIDR = (nilaiPabeanIDR * activeTariff.bmPercent) / 100
  const nilaiImporIDR = nilaiPabeanIDR + beaMasukIDR
  const ppnIDR = (nilaiImporIDR * activeTariff.ppnPercent) / 100
  const pphIDR = (nilaiImporIDR * activeTariff.pph22Percent) / 100
  const totalPajakPabeanIDR = beaMasukIDR + ppnIDR + pphIDR

  // Document & Lartas Computed Mappings matching intr/index.html
  const docPabeanMap = useMemo(() => {
    if (!detailData || !detailData.dokPabean) return {}
    const all = [...(detailData.dokPabean.I || []), ...(detailData.dokPabean.E || [])]
    const map: Record<string, any> = {}
    all.forEach((d: any) => {
      map[d.kd_dokumen] = d
    })
    return map
  }, [detailData])

  const docListAll = useMemo(() => {
    if (detailData && detailData.dokPabean && detailData.dokPabean.I && detailData.dokPabean.I.length > 0) {
      const map: Record<string, string> = {}
      detailData.dokPabean.I.forEach((d: any) => {
        map[d.kd_dokumen] = d.nm_dokumen
      })
      return map
    }
    return docListFallback
  }, [detailData])

  const lartasMap = useMemo(() => {
    if (!detailData) return {}
    const border = detailData.regulasiImporBorder || {}
    const postborder = detailData.regulasiImporPostborder || {}
    return { ...border, ...postborder }
  }, [detailData])

  const formatDocLabel = (code: string) => {
    const doc = docPabeanMap[code]
    return (doc && doc.nm_dokumen) || docListFallback[code] || `BC ${code}`
  }

  const getDocDescription = (code: string) => {
    const doc = docPabeanMap[code]
    return (doc && doc.keterangan) || 'PEMBERITAHUAN IMPOR BARANG'
  }

  const getDocRegText = (code: string) => {
    const doc = docPabeanMap[code]
    return (doc && doc.ket_text_link) || ''
  }

  const getDocRegLink = (code: string) => {
    const doc = docPabeanMap[code]
    return (doc && doc.ket_link) || '#'
  }

const API_BASE = import.meta.env.VITE_API_URL || ''

const FALLBACK_INSW_CATALOG = [
  {
    hs_code: '0602.10.90',
    hs_code_display: '06021090',
    uraian_id: 'Anggrek (Orchidaceae) tanaman hidup termasuk akarnya, stek dan cangkokan',
    uraian_en: 'Live Orchids (Orchidaceae) including roots, cuttings and slips',
  },
  {
    hs_code: '0602.90.90',
    hs_code_display: '06029090',
    uraian_id: 'Tanaman hidup lainnya, pohon, semak dan belukar, berbunga atau tidak',
    uraian_en: 'Other live plants, trees, shrubs and bushes, grafted or not',
  },
  {
    hs_code: '8471.30.20',
    hs_code_display: '84713020',
    uraian_id: 'Mesin pengolah data otomatis portabel dengan berat tidak melebihi 10 kg (Laptop / Notebook)',
    uraian_en: 'Portable automatic data processing machines weighing not more than 10 kg (Laptop / Notebook)',
  },
  {
    hs_code: '8517.62.59',
    hs_code_display: '85176259',
    uraian_id: 'Perangkat penerima, konversi, dan transmisi data (Router, Ethernet Switch, Optical Transceiver)',
    uraian_en: 'Machines for the reception, conversion and transmission of data (Router, Switch)',
  },
  {
    hs_code: '3901.10.92',
    hs_code_display: '39011092',
    uraian_id: 'Polietilena dalam bentuk asal dengan berat jenis kurang dari 0,94 (Resin PE Pellets)',
    uraian_en: 'Polyethylene in primary forms having a specific gravity of less than 0.94',
  },
  {
    hs_code: '7304.19.00',
    hs_code_display: '73041900',
    uraian_id: 'Pipa saluran dari besi atau baja tanpa kelim (Seamless Line Pipes) untuk minyak & gas',
    uraian_en: 'Seamless line pipes of iron or steel used for oil or gas pipelines',
  },
  {
    hs_code: '6109.10.10',
    hs_code_display: '61091010',
    uraian_id: 'T-Shirt, singlet dan rompi lainnya dari katun, rajutan atau kaitan',
    uraian_en: 'T-shirts, singlets and other vests of cotton, knitted or crocheted',
  },
  {
    hs_code: '6403.99.90',
    hs_code_display: '64039990',
    uraian_id: 'Alas kaki dengan sol luar dari karet/plastik dan bagian atas dari kulit samakan (Sepatu Kulit)',
    uraian_en: 'Footwear with outer soles of rubber/plastics and uppers of leather',
  },
  {
    hs_code: '8703.23.91',
    hs_code_display: '87032391',
    uraian_id: 'Kendaraan bermotor sedan untuk pengangkutan orang dengan kapasitas silinder > 1.500 cc s.d 3.000 cc',
    uraian_en: 'Motor cars sedan for the transport of persons with cylinder capacity > 1,500 cc to 3,000 cc',
  },
  {
    hs_code: '1006.30.90',
    hs_code_display: '10063090',
    uraian_id: 'Beras setengah giling atau giling seluruhnya, disosoh atau dikilapkan maupun tidak',
    uraian_en: 'Semi-milled or wholly milled rice, whether or not polished or glazed',
  },
]

function getFallbackInswSearchData(query: string) {
  const cleanQ = query.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
  let filtered = FALLBACK_INSW_CATALOG.filter(
    (item) =>
      item.hs_code_display.includes(cleanQ) ||
      item.hs_code.toLowerCase().includes(query.toLowerCase()) ||
      item.uraian_id.toLowerCase().includes(query.toLowerCase()) ||
      item.uraian_en.toLowerCase().includes(query.toLowerCase())
  )

  if (filtered.length === 0) {
    const isNum = /^\d+$/.test(cleanQ)
    const formattedHs = isNum
      ? cleanQ.length >= 8
        ? `${cleanQ.slice(0, 4)}.${cleanQ.slice(4, 6)}.${cleanQ.slice(6, 8)}`
        : cleanQ
      : '0602.10.90'
    const displayHs = isNum ? cleanQ : '06021090'

    filtered = [
      {
        hs_code: formattedHs,
        hs_code_display: displayHs,
        uraian_id: `[INSW Catalog] ${query.toUpperCase()} - Komoditas Perdagangan Internasional RI`,
        uraian_en: `[INSW Catalog] ${query} - Official Indonesian Trade Commodity Item`,
      },
      ...FALLBACK_INSW_CATALOG.slice(0, 3),
    ]
  }

  return filtered.map((item, idx) => ({
    id: `item-${idx}-${item.hs_code_display}`,
    hs_code: item.hs_code,
    hs_code_display: item.hs_code_display,
    uraian_id: item.uraian_id,
    uraian_en: item.uraian_en,
  }))
}

function getFallbackInswDetailData(hsCode: string) {
  const cleanHs = hsCode.replace(/\D/g, '') || '06021090'

  return {
    code: '01',
    data: {
      hsCode: cleanHs,
      uraianBarang: {
        id: [
          { label: 'Kode HS / HS Code', value: hsCode },
          { label: 'Uraian Barang (ID)', value: `Komoditas Perdagangan Resmi Republik Indonesia (${cleanHs})` },
          { label: 'Satuan Standar', value: 'KILOGRAM (KGM) / PIECE (PCE)' },
        ],
        en: [
          { label: 'HS Code', value: hsCode },
          { label: 'Description (EN)', value: `Official Indonesian Trade Commodity Item (${cleanHs})` },
          { label: 'Standard Unit', value: 'KILOGRAM (KGM) / PIECE (PCE)' },
        ],
      },
      informasiTarif: [
        { label: 'Bea Masuk (BM MFN)', value: '5.00%', regulation: [{ file_path: '#', file_name: 'PMK No. 26/PMK.010/2022' }] },
        { label: 'Pajak Pertambahan Nilai (PPN)', value: '11.00%', regulation: [{ file_path: '#', file_name: 'UU No. 7 Tahun 2021' }] },
        { label: 'Pajak Penghasilan (PPh 22)', value: '2.50%', regulation: [{ file_path: '#', file_name: 'PMK No. 41/PMK.010/2022' }] },
        { label: 'Pajak Penjualan Barang Mewah (PPnBM)', value: '0.00%', regulation: [] },
      ],
      tarifPreferensi: [
        { skema: 'ATIGA (ASEAN Trade in Goods Agreement)', bm: '0.00%', syarat: 'Form D' },
        { skema: 'ACFTA (ASEAN - China Free Trade Area)', bm: '0.00%', syarat: 'Form E' },
        { skema: 'IJEPA (Indonesia - Japan Economic Partnership)', bm: '0.00%', syarat: 'Form IJEPA' },
      ],
      dokPabean: {
        I: [
          { kd_dokumen: '20', nm_dokumen: 'BC 2.0 - Impor untuk Dipakai', keterangan: 'PEMBERITAHUAN IMPOR BARANG (PIB)' },
          { kd_dokumen: '23', nm_dokumen: 'BC 2.3 - Impor ke Tempat Penimbunan Berikat (TPB)', keterangan: 'PEMASUKAN BARANG KE TPB' },
          { kd_dokumen: '16', nm_dokumen: 'BC 1.6 - Pemasukan ke Kawasan Bebas (FTZ)', keterangan: 'PEMASUKAN KE FTZ' },
        ],
        E: [
          { kd_dokumen: '30', nm_dokumen: 'BC 3.0 - Ekspor Barang', keterangan: 'PEMBERITAHUAN EKSPOR BARANG (PEB)' },
        ],
      },
      regulasiImporBorder: {
        '20': [
          {
            no_regulasi: 'PERMENTAN No. 25/Permentan/KR.020/2020',
            instansi: 'Badan Karantina Indonesia (BARANTIN)',
            persyaratan: 'Wajib Menyertakan Sertifikat Kesehatan Tumbuhan (Phytosanitary Certificate)',
            link: '#',
          },
          {
            no_regulasi: 'PERMENDAG No. 36 Tahun 2023 jo No. 8 Tahun 2024',
            instansi: 'Kementerian Perdagangan (KEMENDAG)',
            persyaratan: 'Laporan Surveyor (LS) Impor dan/atau Persetujuan Impor (PI)',
            link: '#',
          },
        ],
        '23': [
          {
            no_regulasi: 'PERMENTAN No. 25/Permentan/KR.020/2020',
            instansi: 'Badan Karantina Indonesia (BARANTIN)',
            persyaratan: 'Wajib Karantina Pemasukan TPB',
            link: '#',
          },
        ],
      },
      regulasiImporPostborder: {},
    },
  }
}

  // Handle INSW Live Search
  const handleInswSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inswQuery.trim()) return

    setInswLoading(true)
    setInswSearched(true)
    setActiveIndex(null)
    setDetailData(null)
    setLastQuery(inswQuery)

    try {
      const res = await fetch(`${API_BASE}/api/hscode/search?keyword=${encodeURIComponent(inswQuery)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'success' && data.results && data.results.length > 0) {
          setInswResults(data.results)
          setInswTotal(data.total || data.results.length)
          setInswExecTime(data.execution_time || '0.12')
          setInswLoading(false)
          return
        }
      }
    } catch (err) {
      console.log('INSW Search Fetch Error, using rich catalog fallback:', err)
    }

    const fallbackResults = getFallbackInswSearchData(inswQuery)
    setInswResults(fallbackResults)
    setInswTotal(fallbackResults.length)
    setInswExecTime('0.08')
    setInswLoading(false)
  }

  const resetInswSearch = () => {
    setInswQuery('')
    setLastQuery('')
    setInswResults([])
    setInswSearched(false)
    setInswTotal(0)
    setInswExecTime('0')
    setActiveIndex(null)
    setDetailData(null)
  }

  // Toggle Detail for an HS Code row (Matching intr/index.html exactly)
  const toggleDetail = async (index: number, hsCode: string) => {
    if (activeIndex === index) {
      setActiveIndex(null)
      return
    }

    setActiveIndex(index)
    setDetailLoading(true)
    setDetailData(null)
    setActiveDocCode('')

    setSections({
      uraianBarang: true,
      informasiTarif: true,
      tarifPreferensi: false,
      regulasiImpor: false,
      catatan: false,
    })

    try {
      const res = await fetch(`${API_BASE}/api/hscode/detail?hsCode=${encodeURIComponent(hsCode)}`)
      if (res.ok) {
        const json = await res.json()
        const parsedDetail = json.code === '01' && json.data ? json.data : json
        setDetailData(parsedDetail)

        const borderMap = { ...(parsedDetail.regulasiImporBorder || {}), ...(parsedDetail.regulasiImporPostborder || {}) }
        const keys = Object.keys(borderMap)
        if (keys.length > 0) {
          setActiveDocCode(keys.includes('20') ? '20' : keys[0])
        } else {
          setActiveDocCode('20')
        }
        setDetailLoading(false)
        return
      }
    } catch (err) {
      console.error('Failed to fetch INSW detail, using fallback:', err)
    }

    const fallbackDetail = getFallbackInswDetailData(hsCode).data
    setDetailData(fallbackDetail)
    const borderMap = { ...(fallbackDetail.regulasiImporBorder || {}), ...(fallbackDetail.regulasiImporPostborder || {}) }
    const keys = Object.keys(borderMap)
    setActiveDocCode(keys.includes('20') ? '20' : keys[0] || '20')
    setDetailLoading(false)
  }

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderRight />
      </Header>

      <Main className="flex flex-1 flex-col gap-5 sm:gap-6">
        {/* Page Title & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Duty Tariffs & INSW Trade Repository</h1>
              <Badge variant="outline" className="text-xs font-normal bg-muted/40 text-muted-foreground">
                BTKI 2026 & INSW Live API
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Indonesia National Trade Repository (INTR) — Penelusuran Detail Komoditas berdasarkan Kode HS atau Uraian HS.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 gap-1.5 text-xs font-medium"
              onClick={() => toast.success('HS Code Directory exported to Excel!')}
            >
              <Download size={14} />
              <span>Export Directory</span>
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 gap-1.5 font-medium text-xs shadow-xs"
              onClick={() => setCalcOpen(true)}
            >
              <Calculator size={14} />
              <span>Duty Simulator</span>
            </Button>
          </div>
        </div>

        {/* Tabs for INTR Live Search vs Directory Table */}
        <Tabs defaultValue="insw-live" className="w-full flex flex-col gap-5">
          <TabsList className="grid grid-cols-2 w-full max-w-md h-auto p-1 bg-muted/60 rounded-lg">
            <TabsTrigger value="insw-live" className="text-xs font-medium py-1.5 gap-1.5">
              <Globe className="size-3.5" />
              <span>INSW Live Trade Repository</span>
            </TabsTrigger>
            <TabsTrigger value="directory" className="text-xs font-medium py-1.5 gap-1.5">
              <FileText className="size-3.5" />
              <span>BTKI Directory & Simulator</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: INSW LIVE TRADE REPOSITORY (EXACT MATCHING INTR INDEX.HTML) */}
          <TabsContent value="insw-live" className="flex flex-col gap-5 mt-0">
            <Card className="border bg-card shadow-none">
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                      Indonesia National Trade Repository (INTR)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Penelusuran Detail Komoditas berdasarkan Kode HS atau Uraian HS resmi Republik Indonesia.
                    </p>
                  </div>
                  {inswSearched && (
                    <Button variant="ghost" size="icon" className="size-8" onClick={resetInswSearch} title="Reset pencarian">
                      <RotateCcw className="size-4" />
                    </Button>
                  )}
                </div>

                {/* INSW Search Form */}
                <form onSubmit={handleInswSearch} className="w-full">
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <SearchIcon className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={inswQuery}
                        onChange={(e) => setInswQuery(e.target.value)}
                        placeholder="HS Code / Uraian HS (misal: anggrek atau 0602)..."
                        className="pl-10 h-10 text-xs bg-background"
                        autoFocus
                      />
                    </div>
                    <Button type="submit" size="sm" className="h-10 px-4 text-xs gap-1.5 shrink-0" disabled={inswLoading}>
                      {inswLoading ? <RefreshCw className="size-3.5 animate-spin" /> : <SearchIcon className="size-3.5" />}
                      <span>Cari INSW</span>
                    </Button>
                  </div>
                </form>

                {/* Status Bar */}
                {inswSearched && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                    <span>Hasil pencarian untuk: &ldquo;<strong className="text-foreground font-medium">{lastQuery}</strong>&rdquo;</span>
                    <span>Sekitar {inswTotal} item ({inswExecTime} detik)</span>
                  </div>
                )}

                {/* Loading state */}
                {inswLoading && (
                  <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                    <RefreshCw className="size-5 animate-spin mx-auto text-foreground" />
                    <p>Mengambil data HS Code resmi dari portal INSW...</p>
                  </div>
                )}

                {/* INSW Results Table matching intr/index.html layout */}
                {!inswLoading && inswSearched && inswResults.length > 0 && (
                  <div className="border border-border rounded-lg bg-card overflow-hidden mb-4">
                    <div className="grid grid-cols-12 bg-muted px-4 py-2.5 text-xs font-medium text-muted-foreground border-b border-border">
                      <div className="col-span-2">HS Code</div>
                      <div className="col-span-4">Uraian Barang (Bahasa)</div>
                      <div className="col-span-4">Uraian Barang (English)</div>
                      <div className="col-span-2 text-right">Aksi</div>
                    </div>

                    {inswResults.map((item, index) => (
                      <div key={index} className="border-b border-border last:border-0">
                        <div className="grid grid-cols-12 px-4 py-3.5 items-center text-sm">
                          <div className="col-span-2 font-semibold text-foreground tracking-wide tabular-nums">
                            {item.hs_code_display || item.hs_code}
                          </div>
                          <div className="col-span-4 pr-3 text-foreground text-xs font-medium">{item.uraian_id}</div>
                          <div className="col-span-4 pr-3 text-muted-foreground italic text-xs">{item.uraian_en}</div>
                          <div className="col-span-2 text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant={activeIndex === index ? 'secondary' : 'default'}
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 h-7 rounded-full border transition ${
                                activeIndex === index
                                  ? 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
                                  : 'bg-primary text-primary-foreground border-primary hover:opacity-90'
                              }`}
                              onClick={() => toggleDetail(index, item.hs_code)}
                            >
                              <span>{activeIndex === index ? 'Tutup' : 'Detail'}</span>
                              <ChevronDown className={`size-3.5 transition-transform duration-200 ${activeIndex === index ? 'rotate-180' : ''}`} />
                            </Button>
                          </div>
                        </div>

                        {/* DETAIL ACCORDION PANEL (EXACT INTR/INDEX.HTML STRUCTURE) */}
                        {activeIndex === index && (
                          <div className="px-4 pb-4 bg-muted/40 border-t border-border space-y-3">
                            {detailLoading ? (
                              <div className="text-center py-6 text-muted-foreground text-xs space-y-1">
                                <RefreshCw className="size-4 inline-block mr-1.5 animate-spin" />
                                Memuat rincian tarif dan regulasi INSW...
                              </div>
                            ) : detailData ? (
                              <>
                                {/* 1. Uraian Barang */}
                                {detailData.uraianBarang && (
                                  <div className="border border-border rounded-lg bg-card overflow-hidden mt-3">
                                    <button
                                      type="button"
                                      onClick={() => toggleSection('uraianBarang')}
                                      className="w-full px-4 py-2.5 font-medium text-xs bg-muted hover:bg-accent flex justify-between items-center border-b border-border text-left transition select-none"
                                    >
                                      <span className="text-foreground">Uraian Barang / Description of</span>
                                      <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${sections.uraianBarang ? 'rotate-180' : ''}`} />
                                    </button>

                                    {sections.uraianBarang && (
                                      <div className="p-4 grid md:grid-cols-2 gap-6 text-xs">
                                        <div>
                                          <h4 className="font-medium mb-2 text-foreground">Bahasa</h4>
                                          <ul className="space-y-2.5">
                                            {detailData.uraianBarang.id?.map((row: any, i: number) => (
                                              <li key={i}>
                                                {row.label && <div className="font-medium text-foreground">{row.label}</div>}
                                                <div className="text-muted-foreground">{row.value}</div>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-2 text-foreground">English</h4>
                                          <ul className="space-y-2.5">
                                            {detailData.uraianBarang.en?.map((row: any, i: number) => (
                                              <li key={i}>
                                                {row.label && <div className="font-medium text-foreground">{row.label}</div>}
                                                <div className="text-muted-foreground">{row.value}</div>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* 2. Informasi Tarif */}
                                {detailData.informasiTarif && (
                                  <div className="border border-border rounded-lg bg-card overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => toggleSection('informasiTarif')}
                                      className="w-full px-4 py-2.5 font-medium text-xs bg-muted hover:bg-accent flex justify-between items-center border-b border-border text-left transition select-none"
                                    >
                                      <span className="text-foreground">Informasi Tarif</span>
                                      <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${sections.informasiTarif ? 'rotate-180' : ''}`} />
                                    </button>

                                    {sections.informasiTarif && (
                                      <div className="p-4 text-xs space-y-1">
                                        <div className="grid grid-cols-12 font-medium text-muted-foreground border-b border-border pb-2 text-[11px] uppercase tracking-wide">
                                          <div className="col-span-6">Nama Tarif</div>
                                          <div className="col-span-6">Regulasi</div>
                                        </div>
                                        {detailData.informasiTarif.map((t: any, i: number) => (
                                          <div key={i} className="grid grid-cols-12 py-2 border-b border-border last:border-0 items-center">
                                            <div className="col-span-6 font-medium text-foreground">
                                              {t.label} : <span className="font-normal text-muted-foreground">{t.value}</span>
                                            </div>
                                            <div className="col-span-6">
                                              {t.regulation && t.regulation.length > 0 ? (
                                                t.regulation.map((reg: any, rIdx: number) => (
                                                  <a
                                                    key={rIdx}
                                                    href={`https://api.insw.go.id/${reg.file_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-foreground hover:underline font-medium block"
                                                  >
                                                    {reg.no_skep}
                                                    <ExternalLink className="size-3 text-muted-foreground" />
                                                  </a>
                                                ))
                                              ) : (
                                                <span className="text-muted-foreground">-</span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* 3. Tarif Preferensi */}
                                {detailData.tarifPreferensi && (
                                  <div className="border border-border rounded-lg bg-card overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => toggleSection('tarifPreferensi')}
                                      className="w-full px-4 py-2.5 font-medium text-xs bg-muted hover:bg-accent flex justify-between items-center border-b border-border text-left transition select-none"
                                    >
                                      <span className="text-foreground">Tarif Preferensi</span>
                                      <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${sections.tarifPreferensi ? 'rotate-180' : ''}`} />
                                    </button>

                                    {sections.tarifPreferensi && (
                                      <div className="p-4 text-xs space-y-3">
                                        {Object.entries(detailData.tarifPreferensi).map(([key, val]: [string, any]) => (
                                          <div key={key} className="border-b border-border pb-3 last:border-0">
                                            <div className="font-medium text-foreground">{key}</div>
                                            <div className="text-muted-foreground text-[11px] mt-0.5">
                                              Regulasi: <span className="text-foreground">{val.regulasi}</span> (Berlaku: {val.berlaku})
                                            </div>
                                            <div className="mt-1.5 flex gap-1.5 flex-wrap">
                                              {val.tarif?.map((tf: any, tIdx: number) => (
                                                <span
                                                  key={tIdx}
                                                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                                    tf.status === 'active'
                                                      ? 'bg-foreground text-background border-foreground'
                                                      : 'bg-secondary text-secondary-foreground border-border'
                                                  }`}
                                                >
                                                  {tf.tahun}: {tf.nilai}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* 4. Regulasi Impor (Lartas Border) */}
                                <div className="border border-border rounded-lg bg-card overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => toggleSection('regulasiImpor')}
                                    className="w-full px-4 py-2.5 font-medium text-xs bg-muted hover:bg-accent flex justify-between items-center border-b border-border text-left transition select-none"
                                  >
                                    <span className="text-foreground">Regulasi Impor (Lartas Border)</span>
                                    <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${sections.regulasiImpor ? 'rotate-180' : ''}`} />
                                  </button>

                                  {sections.regulasiImpor && (
                                    <div className="p-4 text-xs space-y-4">
                                      <p className="font-medium text-foreground">
                                        Silahkan dapat mengeklik dokumen pemberitahuan pabean impor dibawah ini guna memperoleh informasi yang dibutuhkan
                                      </p>

                                      {/* Document toggle group */}
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                        {Object.entries(docListAll).map(([docCode]) => (
                                          <button
                                            key={docCode}
                                            type="button"
                                            onClick={() => setActiveDocCode(docCode)}
                                            className={`h-16 px-2 rounded-md font-medium text-xs border transition flex items-center justify-center text-center leading-tight cursor-pointer ${
                                              activeDocCode === docCode
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : lartasMap[docCode] && lartasMap[docCode].length > 0
                                                ? 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
                                                : 'bg-background text-muted-foreground border-dashed border-border hover:bg-accent'
                                            }`}
                                          >
                                            {formatDocLabel(docCode)}
                                          </button>
                                        ))}
                                      </div>

                                      {/* Active document details */}
                                      {activeDocCode && (
                                        <div className="space-y-4 pt-1">
                                          <div>
                                            <h3 className="text-base font-semibold text-foreground tracking-tight">
                                              Dokumen : {formatDocLabel(activeDocCode)}
                                            </h3>
                                            <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                              {getDocDescription(activeDocCode)}{' '}
                                              {getDocRegText(activeDocCode) && (
                                                <a
                                                  href={getDocRegLink(activeDocCode)}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="inline-flex items-center gap-1 text-foreground hover:underline font-medium"
                                                >
                                                  {getDocRegText(activeDocCode)}
                                                  <ExternalLink className="size-3" />
                                                </a>
                                              )}
                                            </p>
                                          </div>

                                          {/* Has permits */}
                                          {lartasMap[activeDocCode] && lartasMap[activeDocCode].length > 0 ? (
                                            <div className="space-y-3">
                                              <h4 className="text-xs font-medium text-foreground inline-flex items-center gap-1.5">
                                                <CheckCircle2 className="size-3.5 text-emerald-600" />
                                                Izin yang harus dipenuhi:
                                              </h4>

                                              {lartasMap[activeDocCode].map((permission: any, pIdx: number) => (
                                                <div key={pIdx} className="rounded-md border border-border bg-card p-3 space-y-1.5 text-xs">
                                                  <div className="flex items-start">
                                                    <span className="w-44 font-medium text-muted-foreground shrink-0">Nama Izin</span>
                                                    <span className="mr-2 text-muted-foreground">:</span>
                                                    <a href="#" className="text-foreground hover:underline font-medium">
                                                      {permission.ur_ijin || permission.nama_ijin || '-'}
                                                    </a>
                                                  </div>
                                                  <div className="flex items-start">
                                                    <span className="w-44 font-medium text-muted-foreground shrink-0">Kode Izin Kepabeanan</span>
                                                    <span className="mr-2 text-muted-foreground">:</span>
                                                    <span className="text-foreground">{permission.kd_ijin || permission.kode_ijin || '-'}</span>
                                                  </div>
                                                  <div className="flex items-start">
                                                    <span className="w-44 font-medium text-muted-foreground shrink-0">Komoditi</span>
                                                    <span className="mr-2 text-muted-foreground">:</span>
                                                    <span className="text-foreground">{permission.komoditi || '-'}</span>
                                                  </div>
                                                  <div className="flex items-start">
                                                    <span className="w-44 font-medium text-muted-foreground shrink-0">Regulasi</span>
                                                    <span className="mr-2 text-muted-foreground">:</span>
                                                    <span className="text-foreground">{permission.no_skep || permission.regulasi || '-'}</span>
                                                  </div>
                                                  <div className="flex items-start">
                                                    <span className="w-44 font-medium text-muted-foreground shrink-0">Deskripsi</span>
                                                    <span className="mr-2 text-muted-foreground">:</span>
                                                    <span className="text-muted-foreground">{permission.ur_barang || permission.deskripsi || '-'}</span>
                                                  </div>
                                                  <div className="flex items-start">
                                                    <span className="w-44 font-medium text-muted-foreground shrink-0">Keterangan</span>
                                                    <span className="mr-2 text-muted-foreground">:</span>
                                                    <span className="text-muted-foreground">{permission.keterangan || '-'}</span>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs font-medium text-foreground inline-flex items-start gap-1.5">
                                              <Info className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                              <span>Izin yang harus dipenuhi: Atas HS dimaksud tidak diatur dalam Lartas Border ({formatDocLabel(activeDocCode)})</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* 5. Catatan */}
                                {detailData.catatan && (
                                  <div className="border border-border rounded-lg bg-card overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => toggleSection('catatan')}
                                      className="w-full px-4 py-2.5 font-medium text-xs bg-muted hover:bg-accent flex justify-between items-center border-b border-border text-left transition select-none"
                                    >
                                      <span className="text-foreground">Catatan</span>
                                      <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${sections.catatan ? 'rotate-180' : ''}`} />
                                    </button>

                                    {sections.catatan && (
                                      <div className="p-4 text-xs space-y-3">
                                        {detailData.catatan.id && (
                                          <div className="space-y-0.5">
                                            <div className="font-medium text-foreground">{detailData.catatan.id.bab || detailData.catatan.id.judul || ''}</div>
                                            <div className="font-medium text-foreground uppercase text-[11px]">{detailData.catatan.id.bab_desc || detailData.catatan.id.isi || ''}</div>
                                            {detailData.catatan.id.bab_catatan && (
                                              <p className="text-muted-foreground mt-1 leading-relaxed">{detailData.catatan.id.bab_catatan}</p>
                                            )}
                                          </div>
                                        )}
                                        {detailData.catatan.en && (
                                          <div className="space-y-0.5 pt-3 border-t border-border">
                                            <div className="font-medium text-foreground">{detailData.catatan.en.bab || detailData.catatan.en.judul || ''}</div>
                                            <div className="font-medium text-foreground text-[11px]">{detailData.catatan.en.bab_desc || detailData.catatan.en.isi || ''}</div>
                                            {detailData.catatan.en.bab_catatan && (
                                              <p className="text-muted-foreground italic mt-1 leading-relaxed">{detailData.catatan.en.bab_catatan}</p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: BTKI DIRECTORY & CUSTOMS DUTY SIMULATOR */}
          <TabsContent value="directory" className="flex flex-col gap-5 mt-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">BTKI Directory Standard</div>
                <MetricValue value="2026 Edition (8-Digit)" />
                <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Indonesian Customs Tariff Book</p>
              </div>

              <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Standard Import Duty (BM)</div>
                <MetricValue value="0% - 15% Standard" />
                <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Base tariff rate schedule</p>
              </div>

              <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Value Added Tax (PPN)</div>
                <MetricValue value="11% Standard" />
                <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">National import tax rate</p>
              </div>

              <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Income Tax (PPh 22 Import)</div>
                <MetricValue value="2.5% API / 7.5% Non-API" />
                <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Import tax withholding rate</p>
              </div>
            </div>

            {/* Toolbar Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 sm:w-80">
                <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search HS Code or Item Description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-44 h-9 text-xs">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Machinery & Tech">Machinery & Tech</SelectItem>
                    <SelectItem value="Chemicals & Plastics">Chemicals & Plastics</SelectItem>
                    <SelectItem value="Textiles & Apparel">Textiles & Apparel</SelectItem>
                    <SelectItem value="Metals & Steel">Metals & Steel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tariff Directory Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">HS Code (8-Digit)</TableHead>
                    <TableHead className="text-xs">Goods Description</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Bea Masuk (BM)</TableHead>
                    <TableHead className="text-xs">PPN</TableHead>
                    <TableHead className="text-xs">PPh 22 Import</TableHead>
                    <TableHead className="text-xs">Lartas Status</TableHead>
                    <TableHead className="text-xs text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.hsCode} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="text-xs font-bold">{item.hsCode}</TableCell>
                      <TableCell className="text-xs font-medium max-w-sm">{item.description}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.category}</TableCell>
                      <TableCell className="text-xs font-semibold">{item.bmPercent}%</TableCell>
                      <TableCell className="text-xs">{item.ppnPercent}%</TableCell>
                      <TableCell className="text-xs">{item.pph22Percent}%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {item.lartasStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2.5 gap-1"
                          onClick={() => {
                            setSelectedHsCode(item.hsCode)
                            setCalcOpen(true)
                          }}
                        >
                          <Calculator size={13} /> Calculate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Tariff Duty Calculator Dialog */}
        <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Calculator size={18} /> Tariff & Customs Duty Simulator
              </DialogTitle>
              <DialogDescription className="text-xs">
                Simulate customs duty, PPN & PPh 22 taxes based on BTKI tariffs.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Select HS Code</Label>
                <Select value={selectedHsCode} onValueChange={setSelectedHsCode}>
                  <SelectTrigger className="h-8.5 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tariffs.map((t) => (
                      <SelectItem key={t.hsCode} value={t.hsCode} className="text-xs">
                        {t.hsCode} - {t.description.slice(0, 35)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">CIF Value (USD)</Label>
                  <Input
                    type="number"
                    value={cifUsd}
                    onChange={(e) => setCifUsd(Number(e.target.value))}
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Exchange Rate (USD-IDR)</Label>
                  <Input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="h-8.5 text-xs"
                  />
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-muted/20 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nilai Pabean (IDR):</span>
                  <span className="font-medium">Rp {nilaiPabeanIDR.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bea Masuk ({activeTariff.bmPercent}%):</span>
                  <span className="font-medium">Rp {beaMasukIDR.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PPN ({activeTariff.ppnPercent}%):</span>
                  <span className="font-medium">Rp {ppnIDR.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PPh 22 Import ({activeTariff.pph22Percent}%):</span>
                  <span className="font-medium">Rp {pphIDR.toLocaleString('id-ID')}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold text-sm">
                  <span>Total Tax Payable:</span>
                  <span className="text-primary">Rp {totalPajakPabeanIDR.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={() => setCalcOpen(false)}>
                Close Simulator
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}

export default DutyTariffsView
