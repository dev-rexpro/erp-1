import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search as SearchIcon, ShieldCheck, FileCheck, DollarSign, AlertCircle, RotateCw, Globe2, QrCode } from 'lucide-react'
import { mockCustomsDeclarations, CustomsDeclarationItem } from '../../data/customs-data'
import { CustomsDetailView } from './customs-detail-view'
import { MetricValue } from '@/components/ui/metric-value'
import { toast } from 'sonner'

export function CustomsDeclarationsView() {
  const [declarations, setDeclarations] = useState<CustomsDeclarationItem[]>(mockCustomsDeclarations)
  const [searchQuery, setSearchQuery] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all')
  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [selectedDeclaration, setSelectedDeclaration] = useState<CustomsDeclarationItem | null>(null)

  const handleCreateNew = () => {
    const newDec: CustomsDeclarationItem = {
      id: `DEC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      docType: 'PIB',
      bcType: 'BC 2.0 (PIB Impor)',
      docNo: `PIB-${Math.floor(100000 + Math.random() * 900000)}-20260726`,
      ajuNumber: `000000-000021-20260726-${Math.floor(100000 + Math.random() * 900000)}`,
      submissionDate: '2026-07-26',
      partyName: 'PT Rexindo Global Trade',
      npwp: '01.345.678.9-012.000',
      nib: '9120009823412',
      customsOffice: '040300 - KPU Bea Cukai Tanjung Priok',
      portName: 'Tanjung Priok (IDTPP)',
      hsCode: '8517.62.00',
      goodsDescription: 'Telecommunication Networks Switching & Transmission Gear',
      valueUSD: 150000,
      exchangeRate: 16250,
      cifIDR: 2437500000,
      dutyBmRate: 5,
      dutyBmIDR: 121875000,
      vatRate: 11,
      vatIDR: 281531250,
      pphRate: 2.5,
      pphIDR: 63984375,
      totalDutyIDR: 467390625,
      channel: 'Green',
      status: 'Document Audit',
      counterParty: 'Cisco Systems Asia Pacific',
      country: 'United States',
      grossWeightKg: 14200,
      netWeightKg: 13500,
      containerNo: 'TCLU9812034 (1x40HC)',
      vesselName: 'MV MAERSK MC-KINNEY v.204W',
      blNumber: 'MAEU9021830192',
      billingCode: '820260726019283',
      billingStatus: 'UNPAID',
      ceisaStatus: 'SYNCED',
      ceisaLastSync: 'Just Now',
      sppbNumber: 'PENDING_RELEASE',
      sppbDate: '-',
      officerNotes: 'Daftar PIB Impor Baru — Menunggu Verifikasi CEISA Bea Cukai.',
    }

    setDeclarations((prev) => [newDec, ...prev])
    setSelectedDeclaration(newDec)
    toast.success('New PIB Import declaration initialized! Complete data and sync to CEISA.')
  }

  const handleSaveItem = (updated: CustomsDeclarationItem) => {
    setDeclarations((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    setSelectedDeclaration(updated)
  }

  const filteredData = declarations.filter((item) => {
    const matchesSearch =
      item.docNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.goodsDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.counterParty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ajuNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = docTypeFilter === 'all' || item.docType === docTypeFilter
    const matchesChannel = channelFilter === 'all' || item.channel.toLowerCase() === channelFilter.toLowerCase()
    return matchesSearch && matchesType && matchesChannel
  })

  const pibCount = declarations.filter((d) => d.docType === 'PIB').length
  const pebCount = declarations.filter((d) => d.docType === 'PEB').length
  const greenCount = declarations.filter((d) => d.channel === 'Green').length
  const greenRatio = declarations.length > 0 ? Math.round((greenCount / declarations.length) * 100) : 100
  const totalDuty = declarations.reduce((acc, curr) => acc + curr.totalDutyIDR, 0)

  if (selectedDeclaration) {
    return (
      <>
        <Header fixed>
          <Search />
          <HeaderRight />
        </Header>
        <Main className="flex flex-1 flex-col gap-5 sm:gap-6">
          <CustomsDetailView
            item={selectedDeclaration}
            onBack={() => setSelectedDeclaration(null)}
            onSave={handleSaveItem}
          />
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderRight />
      </Header>

      <Main className="flex flex-1 flex-col gap-5 sm:gap-6">
        {/* Page Title & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Customs Declarations (PIB & PEB)</h1>
            <p className="text-xs text-muted-foreground">
              Import Declarations (PIB) & Export Declarations (PEB), Customs Channels & CEISA 4.0 Bea Cukai Integration.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 gap-1.5 text-xs font-medium"
              onClick={() => toast.success('Customs declaration statuses synced with CEISA 4.0 API!')}
            >
              <RotateCw size={14} />
              <span>Sync CEISA 4.0</span>
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 gap-1.5 bg-black hover:bg-black/90 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black font-semibold text-xs shadow-xs transition-colors"
              onClick={handleCreateNew}
            >
              <Plus size={15} />
              <span>Submit PIB / PEB</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total Declarations</div>
            <MetricValue value={`${pibCount} PIB / ${pebCount} PEB`} />
            <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Active customs filings</p>
          </div>

          <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Green Lane Ratio</div>
            <MetricValue value={`${greenRatio}% Fast Track`} />
            <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Direct clearance without inspection</p>
          </div>

          <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total Duties & Levies</div>
            <MetricValue value={`Rp ${totalDuty >= 1000000000 ? `${(totalDuty / 1000000000).toFixed(2)} M` : `${(totalDuty / 1000000).toFixed(0)} Jt`}`} />
            <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Import BM, PPN & PPh 22</p>
          </div>

          <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Physical Inspections</div>
            <MetricValue value={`${declarations.filter((d) => d.channel === 'Red').length} Red Lane`} />
            <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Pending physical inspection</p>
          </div>
        </div>

        {/* Toolbar Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 sm:w-80">
            <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search PIB/PEB No, Aju No, Goods, Party..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* PIB / PEB Type Filter */}
            <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
              <SelectTrigger className="w-36 h-9 text-xs">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types (PIB & PEB)</SelectItem>
                <SelectItem value="PIB">PIB (Import)</SelectItem>
                <SelectItem value="PEB">PEB (Export)</SelectItem>
              </SelectContent>
            </Select>

            {/* Channel Filter */}
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-36 h-9 text-xs">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="green">Jalur Hijau (Green)</SelectItem>
                <SelectItem value="yellow">Jalur Kuning (Yellow)</SelectItem>
                <SelectItem value="red">Jalur Merah (Red)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Declarations Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">Document Number</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">CEISA Aju No</TableHead>
                <TableHead className="text-xs">Goods Description</TableHead>
                <TableHead className="text-xs">HS Code</TableHead>
                <TableHead className="text-xs">Port & Office</TableHead>
                <TableHead className="text-xs">CIF Value (USD)</TableHead>
                <TableHead className="text-xs">Duties & Taxes (IDR)</TableHead>
                <TableHead className="text-xs">Channel</TableHead>
                <TableHead className="text-xs">CEISA Status</TableHead>
                <TableHead className="text-xs text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/40 transition-colors whitespace-nowrap"
                  onClick={() => setSelectedDeclaration(item)}
                >
                  <TableCell className="text-xs font-semibold">
                    {item.docNo}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.submissionDate}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                    {item.ajuNumber}
                  </TableCell>
                  <TableCell className="text-xs font-medium max-w-[220px] truncate">
                    {item.goodsDescription}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.hsCode}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                    {item.portName}
                  </TableCell>
                  <TableCell className="text-xs font-medium">${item.valueUSD.toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-medium">
                    {item.totalDutyIDR > 0 ? `Rp ${item.totalDutyIDR.toLocaleString('id-ID')}` : 'Exempt (Rp 0)'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-normal gap-1.5 ${
                        item.channel === 'Green'
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : item.channel === 'Yellow'
                          ? 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          item.channel === 'Green' ? 'bg-emerald-500' : item.channel === 'Yellow' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      />
                      {item.channel} Lane
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-[11px] font-normal ${
                        item.ceisaStatus === 'SPPB_ISSUED' || item.ceisaStatus === 'NPE_ISSUED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : item.ceisaStatus === 'SYNCED'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.ceisaStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2.5">
                      View Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
