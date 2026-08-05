import { useRef } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  Save,
  FileCheck,
  Building2,
  ShieldCheck,
  DollarSign,
  Boxes,
  Truck,
  RotateCw,
  QrCode,
} from 'lucide-react'
import { toast } from 'sonner'
import { StandardDetailView } from '@/components/templates'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useVisibleCenterPosition } from '@/features/client-invoices/components/use-visible-center-position'
import { CustomsDeclarationItem } from '../../data/customs-data'
import { CustomsPaper } from './customs-paper'

interface CustomsDetailViewProps {
  item: CustomsDeclarationItem
  onBack: () => void
  onSave?: (updated: CustomsDeclarationItem) => void
}

const PAPER_HEIGHT = 1000
const PAPER_WIDTH = 760
const PAPER_SCALE = 1

export function CustomsDetailView({ item, onBack, onSave }: CustomsDetailViewProps) {
  const previewBodyRef = useRef<HTMLDivElement>(null)

  const paperLayout = useVisibleCenterPosition(previewBodyRef, {
    height: PAPER_HEIGHT,
    maxScale: PAPER_SCALE,
    width: PAPER_WIDTH,
  })

  const form = useForm<CustomsDeclarationItem>({
    defaultValues: item,
  })

  const watchedValues = form.watch()

  const handleCeisaSync = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Connecting to CEISA 4.0 Bea Cukai Gateway API...',
        success: 'CEISA 4.0 Sync Completed! Document status updated to SPPB Released.',
        error: 'Failed to communicate with CEISA API',
      }
    )
    form.setValue('ceisaStatus', 'SPPB_ISSUED')
    form.setValue('ceisaLastSync', 'Just Now (Synced)')
  }

  const handleGenerateBilling = () => {
    const code = `82026${Math.floor(1000000000 + Math.random() * 9000000000)}`
    form.setValue('billingCode', code)
    form.setValue('billingStatus', 'UNPAID')
    toast.success(`Kode Billing Simponi generated: ${code}`)
  }

  return (
    <FormProvider {...form}>
      <StandardDetailView
        title={watchedValues.docNo}
        subtitle="PIB & PEB Customs Declaration."
        isNew={false}
        onBack={onBack}
        hasPreview={true}
        onDownload={() => toast.success('Customs document PDF download initiated.')}
        primaryActions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleCeisaSync}
            >
              <RotateCw className="size-3.5 text-primary shrink-0" />
              <span>Sync CEISA 4.0</span>
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 bg-black hover:bg-black/90 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black text-xs font-semibold"
              onClick={() => {
                if (onSave) onSave(form.getValues())
                toast.success('Customs declaration saved successfully!')
              }}
            >
              <Save className="size-3.5 shrink-0" />
              <span>Save Declaration</span>
            </Button>
          </>
        }
        renderForm={() => (
          <form className="flex flex-col gap-4" noValidate onSubmit={(e) => e.preventDefault()}>
            <Tabs defaultValue="header" className="w-full flex flex-col gap-4">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="header" className="text-xs">Header & Parties</TabsTrigger>
                <TabsTrigger value="cargo" className="text-xs">Cargo & Transport</TabsTrigger>
                <TabsTrigger value="duties" className="text-xs">Duties & Billing</TabsTrigger>
                <TabsTrigger value="ceisa" className="text-xs">CEISA 4.0 Sync</TabsTrigger>
              </TabsList>

              {/* TAB 1: HEADER & PARTIES */}
              <TabsContent value="header" className="space-y-4 pt-1">
                <section className="flex flex-col gap-3">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-muted-foreground" /> Customs Registration
                  </h2>

                  <FieldGroup>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field className="gap-1">
                        <FieldLabel className="text-xs font-medium">Dokumen Kepabeanan</FieldLabel>
                        <Select
                          value={watchedValues.docType}
                          onValueChange={(v: 'PIB' | 'PEB') => {
                            form.setValue('docType', v)
                            form.setValue('bcType', v === 'PIB' ? 'BC 2.0 (PIB Impor)' : 'BC 3.0 (PEB Ekspor)')
                          }}
                        >
                          <SelectTrigger className="w-full text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="PIB">BC 2.0 - PIB (Pemberitahuan Impor Barang)</SelectItem>
                              <SelectItem value="PEB">BC 3.0 - PEB (Pemberitahuan Ekspor Barang)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field className="gap-1">
                        <FieldLabel className="text-xs font-medium">Nomor Pendaftaran</FieldLabel>
                        <Input className="text-xs" {...form.register('docNo')} />
                      </Field>
                    </div>

                    <Field className="gap-1 pt-1">
                      <FieldLabel className="text-xs font-medium">Nomor Aju CEISA (26 Digit)</FieldLabel>
                      <Input className="text-xs" {...form.register('ajuNumber')} />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2 pt-1">
                      <Field className="gap-1">
                        <FieldLabel className="text-xs font-medium">Kantor Bea Cukai (KPU DJBC)</FieldLabel>
                        <Input className="text-xs" {...form.register('customsOffice')} />
                      </Field>
                      <Field className="gap-1">
                        <FieldLabel className="text-xs font-medium">Pelabuhan Muat / Bongkar</FieldLabel>
                        <Input className="text-xs" {...form.register('portName')} />
                      </Field>
                    </div>
                  </FieldGroup>
                </section>

                <Separator />

                <section className="flex flex-col gap-3">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" /> Identitas Perusahaan & Trader
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">
                        {watchedValues.docType === 'PIB' ? 'Nama Importir / Consignee' : 'Nama Eksportir / Shipper'}
                      </FieldLabel>
                      <Input className="text-xs" {...form.register('partyName')} />
                    </Field>
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">
                        {watchedValues.docType === 'PIB' ? 'Supplier Luar Negeri' : 'Pembeli Luar Negeri'}
                      </FieldLabel>
                      <Input className="text-xs" {...form.register('counterParty')} />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 pt-1">
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">NPWP Perusahaan (16 Digit)</FieldLabel>
                      <Input className="text-xs" {...form.register('npwp')} />
                    </Field>
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">Nomor Induk Berusaha (NIB)</FieldLabel>
                      <Input className="text-xs" {...form.register('nib')} />
                    </Field>
                  </div>
                </section>
              </TabsContent>

              {/* TAB 2: CARGO & TRANSPORT */}
              <TabsContent value="cargo" className="space-y-4 pt-1">
                <section className="flex flex-col gap-3">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-muted-foreground" /> Commodity & HS Tariff Classification
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">Pos HS Code (BTKI 8-Digit)</FieldLabel>
                      <Input className="text-xs" {...form.register('hsCode')} />
                    </Field>
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">Negara Asal / Tujuan</FieldLabel>
                      <Input className="text-xs" {...form.register('country')} />
                    </Field>
                  </div>

                  <Field className="gap-1 pt-1">
                    <FieldLabel className="text-xs font-medium">Uraian Barang (Goods Description)</FieldLabel>
                    <Textarea className="text-xs min-h-[70px]" {...form.register('goodsDescription')} />
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2 pt-1">
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">Berat Kotor / Gross (kg)</FieldLabel>
                      <Input
                        type="number"
                        className="text-xs"
                        value={watchedValues.grossWeightKg}
                        onChange={(e) => form.setValue('grossWeightKg', Number(e.target.value))}
                      />
                    </Field>
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">Berat Bersih / Net (kg)</FieldLabel>
                      <Input
                        type="number"
                        className="text-xs"
                        value={watchedValues.netWeightKg}
                        onChange={(e) => form.setValue('netWeightKg', Number(e.target.value))}
                      />
                    </Field>
                  </div>
                </section>

                <Separator />

                <section className="flex flex-col gap-3">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" /> Manifest, Carrier & Container Info
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">Sarana Pengangkut (Vessel / Voyage)</FieldLabel>
                      <Input className="text-xs" {...form.register('vesselName')} />
                    </Field>
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">No. Bill of Lading / AWB</FieldLabel>
                      <Input className="text-xs" {...form.register('blNumber')} />
                    </Field>
                  </div>

                  <Field className="gap-1 pt-1">
                    <FieldLabel className="text-xs font-medium">No. Container / Kemasan</FieldLabel>
                    <Input className="text-xs" {...form.register('containerNo')} />
                  </Field>
                </section>
              </TabsContent>

              {/* TAB 3: DUTIES & BILLING */}
              <TabsContent value="duties" className="space-y-4 pt-1">
                <section className="flex flex-col gap-3">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" /> Valuation & Duties Calculation (IDR)
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">Nilai Pabean (USD)</FieldLabel>
                      <Input
                        type="number"
                        className="text-xs"
                        value={watchedValues.valueUSD}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          form.setValue('valueUSD', val)
                          form.setValue('cifIDR', val * watchedValues.exchangeRate)
                        }}
                      />
                    </Field>

                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">NDPBM / Kurs Pajak (IDR/USD)</FieldLabel>
                      <Input
                        type="number"
                        className="text-xs"
                        value={watchedValues.exchangeRate}
                        onChange={(e) => {
                          const rate = Number(e.target.value)
                          form.setValue('exchangeRate', rate)
                          form.setValue('cifIDR', watchedValues.valueUSD * rate)
                        }}
                      />
                    </Field>
                  </div>

                  <div className="p-3 rounded-lg border bg-muted/20 space-y-2 text-xs">
                    <div className="flex justify-between font-medium">
                      <span>Total CIF Pabean IDR:</span>
                      <span className="font-bold">
                        Rp {(watchedValues.valueUSD * watchedValues.exchangeRate).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t text-[11px]">
                      <div>
                        <span className="text-muted-foreground block">Bea Masuk ({watchedValues.dutyBmRate}%):</span>
                        <span className="font-semibold">
                          Rp {watchedValues.dutyBmIDR.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">PPN Impor ({watchedValues.vatRate}%):</span>
                        <span className="font-semibold">
                          Rp {watchedValues.vatIDR.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">PPh Art 22 ({watchedValues.pphRate}%):</span>
                        <span className="font-semibold">
                          Rp {watchedValues.pphIDR.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between border-t pt-2 text-xs font-bold text-foreground">
                      <span>Total Pungutan Kepabeanan:</span>
                      <span className="text-sm text-emerald-700 dark:text-emerald-400">
                        Rp {watchedValues.totalDutyIDR.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </section>

                <Separator />

                <section className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-muted-foreground" /> Kode Billing DJBC Simponi
                    </h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleGenerateBilling}
                    >
                      Generate New Kode Billing
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">Kode Billing (15 Digit)</FieldLabel>
                      <Input className="text-xs font-semibold" {...form.register('billingCode')} />
                    </Field>

                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">Status Pembayaran Billing</FieldLabel>
                      <Select
                        value={watchedValues.billingStatus}
                        onValueChange={(v: 'PAID' | 'UNPAID' | 'EXEMPT') => form.setValue('billingStatus', v)}
                      >
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="PAID">PAID (Sudah Lunas Bank Persepsi)</SelectItem>
                            <SelectItem value="UNPAID">UNPAID (Menunggu Pembayaran Simponi)</SelectItem>
                            <SelectItem value="EXEMPT">EXEMPT (Bebas Pungutan / Ekspor 0%)</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </section>
              </TabsContent>

              {/* TAB 4: CEISA 4.0 SYNC & CHANNEL */}
              <TabsContent value="ceisa" className="space-y-4 pt-1">
                <section className="flex flex-col gap-3">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Jalur Kepabeanan & CEISA 4.0 Gateway
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">Jalur Penetapan (Customs Channel)</FieldLabel>
                      <Select
                        value={watchedValues.channel}
                        onValueChange={(v: 'Green' | 'Yellow' | 'Red') => form.setValue('channel', v)}
                      >
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Green">Jalur Hijau (Automatic Release / Fast Track)</SelectItem>
                            <SelectItem value="Yellow">Jalur Kuning (Pemeriksaan Dokumen / SKA)</SelectItem>
                            <SelectItem value="Red">Jalur Merah (Pemeriksaan Fisik Lapangan TPS)</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">CEISA 4.0 Integration Status</FieldLabel>
                      <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/20 text-xs font-medium">
                        <Badge
                          variant="outline"
                          className={
                            watchedValues.ceisaStatus === 'SPPB_ISSUED' || watchedValues.ceisaStatus === 'NPE_ISSUED'
                              ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                              : watchedValues.ceisaStatus === 'SYNCED'
                              ? 'border-blue-300 text-blue-700 bg-blue-50'
                              : 'border-amber-300 text-amber-700 bg-amber-50'
                          }
                        >
                          {watchedValues.ceisaStatus}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground ml-auto">
                          Last Sync: {watchedValues.ceisaLastSync}
                        </span>
                      </div>
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 pt-1">
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">No. SPPB / NPE (Surat Release)</FieldLabel>
                      <Input className="text-xs font-semibold" {...form.register('sppbNumber')} />
                    </Field>
                    <Field className="gap-1">
                      <FieldLabel className="text-xs font-medium">Tanggal SPPB / NPE</FieldLabel>
                      <Input className="text-xs" {...form.register('sppbDate')} />
                    </Field>
                  </div>

                  <Field className="gap-1 pt-1">
                    <FieldLabel className="text-xs font-medium">Catatan Pejabat Kepabeanan / Petugas P2</FieldLabel>
                    <Textarea className="text-xs min-h-[80px]" {...form.register('officerNotes')} />
                  </Field>
                </section>

                <Separator />

                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-foreground">CEISA 4.0 API Response Payload</h3>
                  <div className="p-3 rounded-lg bg-zinc-950 text-zinc-100 text-[11px] leading-relaxed overflow-x-auto border">
                    {JSON.stringify(
                      {
                        status: 'SUCCESS_200',
                        ceisaGateway: 'https://ceisa40.beacukai.go.id/api/v1',
                        nomorAju: watchedValues.ajuNumber,
                        nomorPendaftaran: watchedValues.docNo,
                        kodeKantor: watchedValues.customsOffice,
                        jalur: watchedValues.channel,
                        sppbNo: watchedValues.sppbNumber,
                        kodeBilling: watchedValues.billingCode,
                        totalPungutanIDR: watchedValues.totalDutyIDR,
                        timestamp: watchedValues.ceisaLastSync,
                      },
                      null,
                      2
                    )}
                  </div>
                </section>
              </TabsContent>
            </Tabs>
          </form>
        )}
        renderPreview={() => (
          <div ref={previewBodyRef} className="relative h-full w-full overflow-hidden">
            <div
              style={{
                height: paperLayout
                  ? PAPER_HEIGHT * paperLayout.scale
                  : PAPER_HEIGHT * PAPER_SCALE,
                top: paperLayout?.top ?? '50%',
                transform: paperLayout === null ? 'translate(-50%, -50%)' : 'translateX(-50%)',
                width: paperLayout ? PAPER_WIDTH * paperLayout.scale : PAPER_WIDTH * PAPER_SCALE,
              }}
              className="absolute left-1/2 opacity-0 data-[ready=true]:opacity-100 print-paper-wrapper-parent"
              data-ready={paperLayout !== null}
            >
              <div
                style={{ transform: `scale(${paperLayout?.scale ?? PAPER_SCALE})` }}
                className="origin-top-left print-paper-wrapper"
              >
                <CustomsPaper item={watchedValues} />
              </div>
            </div>
          </div>
        )}
      />
    </FormProvider>
  )
}
