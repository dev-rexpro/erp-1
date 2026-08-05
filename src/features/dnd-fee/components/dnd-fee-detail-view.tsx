import { useRef, useMemo, useEffect, useState } from 'react'
import { FormProvider, useForm, useWatch, Controller } from 'react-hook-form'
import { Save, Send, CalendarIcon, Box } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { StandardDetailView } from '@/components/templates'
import { SapCorporateDocument } from '@/components/templates/sap-corporate-document'

const _defaultDischargeDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0]
const _defaultGateOutDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0]

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

import { type DndFeeItem } from '../data/schema'
import { useDndFee } from './dnd-fee-provider'
import { useDbStore } from '@/stores/db-store'
import { defaultInvoiceFrom, INVOICE_PAPER_HEIGHT, INVOICE_PAPER_SCALE, INVOICE_PAPER_WIDTH } from '../../client-invoices/components/invoice-form-data'
import { useVisibleCenterPosition } from '../../client-invoices/components/use-visible-center-position'

interface DndFeeDetailViewProps {
  data: DndFeeItem[]
}

interface DndFormValues {
  containerNo: string
  blNumber: string
  carrierName: string
  terminalName: string
  equipmentType: string
  dischargeDate: string
  freeTimeDays: number
  gateOutDate: string
  emptyReturnDate: string
  dailyRate: number
  waivedAmount: number
  feeType: 'Demurrage' | 'Detention' | 'Storage'
  status: 'Accruing' | 'Billed' | 'Waived' | 'Settled' | 'Disputed'
  notes: string
}

function DatePicker({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const date = parseDateValue(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant='outline'
          data-empty={!date}
          className='w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground'
        >
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
          <CalendarIcon className='text-muted-foreground size-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={(selectedDate) => {
            if (!selectedDate) return
            onChange(format(selectedDate, 'yyyy-MM-dd'))
            setOpen(false)
          }}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  )
}

function parseDateValue(value: string) {
  const date = parseISO(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function DndFeeDetailView({ data }: DndFeeDetailViewProps) {
  const { selectedDndId, setSelectedDndId } = useDndFee()
  const dndFees = useDbStore((state) => state.dndFees)

  const previewBodyRef = useRef<HTMLDivElement>(null)

  const paperLayout = useVisibleCenterPosition(previewBodyRef, {
    height: INVOICE_PAPER_HEIGHT,
    maxScale: INVOICE_PAPER_SCALE,
    width: INVOICE_PAPER_WIDTH,
  })

  const item = useMemo(() => {
    if (selectedDndId === 'new') return null
    return data.find((d) => d.id === selectedDndId) || null
  }, [data, selectedDndId])

  const formDefaults: DndFormValues = useMemo(() => {
    if (item) {
      return {
        containerNo: item.containerNo,
        blNumber: item.blNumber,
        carrierName: item.carrierName,
        terminalName: item.terminalName,
        equipmentType: item.equipmentType,
        dischargeDate: item.dischargeDate,
        freeTimeDays: item.freeTimeDays,
        gateOutDate: item.gateOutDate,
        emptyReturnDate: item.emptyReturnDate,
        dailyRate: item.dailyRate,
        waivedAmount: item.waivedAmount,
        feeType: item.feeType,
        status: item.status,
        notes: item.notes || 'Port congestion caused delay in container pickup. Negotiation applied for waived days.',
      }
    }
    return {
      containerNo: '',
      blNumber: '',
      carrierName: '',
      terminalName: '',
      equipmentType: '',
      dischargeDate: '',
      freeTimeDays: 0,
      gateOutDate: '',
      emptyReturnDate: '',
      dailyRate: 0,
      waivedAmount: 0,
      feeType: 'Demurrage',
      status: 'Accruing',
      notes: '',
    }
  }, [item])

  const form = useForm<DndFormValues>({ defaultValues: formDefaults })
  const w = useWatch({ control: form.control }) as DndFormValues

  useEffect(() => {
    form.reset(formDefaults)
  }, [formDefaults, form])

  // Automatic Overdue & Fee Calculations
  const calculatedDwellDays = useMemo(() => {
    if (!w.dischargeDate || !w.gateOutDate) return 0
    const d1 = new Date(w.dischargeDate).getTime()
    const d2 = new Date(w.gateOutDate).getTime()
    const diff = Math.max(0, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)))
    return diff
  }, [w.dischargeDate, w.gateOutDate])

  const calculatedOverdueDays = Math.max(0, calculatedDwellDays - (w.freeTimeDays || 0))
  const calculatedGrossFee = calculatedOverdueDays * (w.dailyRate || 0)
  const calculatedNetFee = Math.max(0, calculatedGrossFee - (w.waivedAmount || 0))

  const handleSubmit = () => {
    toast.success(
      selectedDndId === 'new'
        ? `D&D Record for container ${w.containerNo} recorded!`
        : `D&D Record for container ${w.containerNo} updated!`
    )
    setSelectedDndId(null)
  }

  return (
    <FormProvider {...form}>
      <StandardDetailView
        title="D&D Fee"
        subtitle="Calculate container dwell days, free-time allowances, and penalty tariffs."
        isNew={selectedDndId === 'new'}
        onBack={() => setSelectedDndId(null)}
        hasPreview={true}
        onPrint={() => window.print()}
        onDownload={() => toast.success('PDF download started!')}
        primaryActions={
          <>
            <Button type='button' variant='outline' onClick={() => toast.success('D&D calculation saved!')}>
              <Save className='mr-1.5 size-4' />
              Save
            </Button>
            <Button type='button' onClick={handleSubmit}>
              <Send className='mr-1.5 size-4' />
              Settle D&D Fee
            </Button>
          </>
        }
        renderForm={() => (
          <>
            <Tabs defaultValue='container' className='w-full'>
              <TabsList className='w-full grid grid-cols-3 mb-4'>
                <TabsTrigger value='container'>Container & Carrier</TabsTrigger>
                <TabsTrigger value='calculator'>D&D Fee Calculator</TabsTrigger>
                <TabsTrigger value='settlement'>Settlement & Waiver</TabsTrigger>
              </TabsList>

              <TabsContent value='container' className='flex flex-col gap-4 mt-0'>
                <section className='flex flex-col gap-3'>
                  <FieldGroup>
                    <div className='grid gap-5 md:grid-cols-2'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs'>Container Number</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...form.register('containerNo')} />
                          <InputGroupAddon align='inline-end'>
                            <Box className='size-4 text-muted-foreground' />
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs'>Bill of Lading (BL) Ref</FieldLabel>
                        <Input {...form.register('blNumber')} />
                      </Field>
                    </div>

                    <div className='grid gap-5 md:grid-cols-2'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs'>Shipping Carrier Line</FieldLabel>
                        <Input {...form.register('carrierName')} placeholder='e.g., Ocean Network Express (ONE)' />
                      </Field>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs'>Equipment / Container Type</FieldLabel>
                        <Select value={w.equipmentType} onValueChange={(v) => form.setValue('equipmentType', v)}>
                          <SelectTrigger className='w-full'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value='20ft Standard Dry Container'>20ft Standard Dry Container</SelectItem>
                              <SelectItem value='40ft Standard Dry Container'>40ft Standard Dry Container</SelectItem>
                              <SelectItem value='40ft High Cube Container'>40ft High Cube Container</SelectItem>
                              <SelectItem value='45ft High Cube Container'>45ft High Cube Container</SelectItem>
                              <SelectItem value='20ft Reefer Container'>20ft Reefer Container</SelectItem>
                              <SelectItem value='40ft High Cube Reefer Container'>40ft High Cube Reefer Container</SelectItem>
                              <SelectItem value='20ft Open Top Container'>20ft Open Top Container</SelectItem>
                              <SelectItem value='40ft Open Top Container'>40ft Open Top Container</SelectItem>
                              <SelectItem value='20ft Flat Rack Container'>20ft Flat Rack Container</SelectItem>
                              <SelectItem value='40ft Flat Rack Container'>40ft Flat Rack Container</SelectItem>
                              <SelectItem value='20ft ISO Tank Container'>20ft ISO Tank Container</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Port Terminal Name</FieldLabel>
                      <Input {...form.register('terminalName')} placeholder='e.g., Jakarta International Container Terminal (JICT)' />
                    </Field>
                  </FieldGroup>
                </section>
              </TabsContent>

              <TabsContent value='calculator' className='flex flex-col gap-4 mt-0'>
                {/* D&D Timeline & Rate Matrix Calculator */}
                <section className='flex flex-col gap-3'>
                  <h2 className='font-medium tracking-tight text-sm'>Free-Time & Dwell Timeline Calculator</h2>
                  <div className='grid gap-5 md:grid-cols-2'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Vessel Discharge Date</FieldLabel>
                      <Controller
                        control={form.control}
                        name='dischargeDate'
                        render={({ field }) => (
                          <DatePicker id='dnd-discharge-date' value={field.value} onChange={field.onChange} />
                        )}
                      />
                    </Field>

                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Free-Time Days Allowed</FieldLabel>
                      <Select value={String(w.freeTimeDays)} onValueChange={(v) => form.setValue('freeTimeDays', Number(v))}>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='3'>3 Days Free Time</SelectItem>
                            <SelectItem value='5'>5 Days Free Time</SelectItem>
                            <SelectItem value='7'>7 Days Free Time</SelectItem>
                            <SelectItem value='14'>14 Days Free Time</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <div className='grid gap-5 md:grid-cols-2'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Gate-Out Date / Pickup Date</FieldLabel>
                      <Controller
                        control={form.control}
                        name='gateOutDate'
                        render={({ field }) => (
                          <DatePicker id='dnd-gateout-date' value={field.value} onChange={field.onChange} />
                        )}
                      />
                    </Field>

                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Daily Overdue Penalty Rate (USD/Day)</FieldLabel>
                      <Input
                        type='number'
                        value={w.dailyRate}
                        onChange={(e) => form.setValue('dailyRate', Number(e.target.value))}
                        placeholder='150'
                      />
                    </Field>
                  </div>

                  {/* Calculated Summary Box */}
                  <div className='rounded-lg border bg-slate-50/70 dark:bg-slate-900/70 p-3.5 text-xs flex flex-col gap-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-slate-500'>Total Container Dwell Days:</span>
                      <span className='font-semibold text-slate-800 dark:text-slate-200'>{calculatedDwellDays} Days</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-slate-500'>Calculated Overdue Days:</span>
                      <span className={`font-bold ${calculatedOverdueDays > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>
                        {calculatedOverdueDays > 0 ? `+${calculatedOverdueDays} Days Overdue` : '0 Days (Within Free Time)'}
                      </span>
                    </div>
                    <div className='flex justify-between items-center border-t pt-2'>
                      <span className='font-medium text-slate-700 dark:text-slate-300'>Gross D&D Fee:</span>
                      <span className='font-bold text-slate-900 dark:text-slate-100'>${calculatedGrossFee.toLocaleString()}</span>
                    </div>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value='settlement' className='flex flex-col gap-4 mt-0'>
                {/* Fee Classification & Concessions */}
                <section className='flex flex-col gap-3'>
                  <h2 className='font-medium tracking-tight text-sm'>Fee Classification & Waiver Concessions</h2>
                  <div className='grid gap-5 md:grid-cols-2'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>D&D Fee Type</FieldLabel>
                      <Select value={w.feeType} onValueChange={(v: any) => form.setValue('feeType', v)}>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='Demurrage'>Demurrage (Port Dwell)</SelectItem>
                            <SelectItem value='Detention'>Detention (Depot Return)</SelectItem>
                            <SelectItem value='Storage'>Storage (Terminal Yard)</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Carrier Concession / Waived Amount ($)</FieldLabel>
                      <Input
                        type='number'
                        value={w.waivedAmount}
                        onChange={(e) => form.setValue('waivedAmount', Number(e.target.value))}
                        placeholder='0'
                      />
                    </Field>
                  </div>

                  <Field className='gap-1'>
                    <FieldLabel className='text-xs'>Dispute & Settlement Notes</FieldLabel>
                    <Textarea {...form.register('notes')} className='min-h-[100px]' placeholder='Add notes regarding carrier demurrage waivers or customs hold reasons...' />
                  </Field>
                </section>
              </TabsContent>
            </Tabs>
          </>
        )}
        renderPreview={() => (
          <div ref={previewBodyRef} className="absolute inset-0">
            {paperLayout === null ? (
              <div className='absolute inset-0 grid place-items-center text-muted-foreground text-sm'>
                Loading Preview
              </div>
            ) : null}
            <div
              style={{
                height: paperLayout ? INVOICE_PAPER_HEIGHT * paperLayout.scale : INVOICE_PAPER_HEIGHT * INVOICE_PAPER_SCALE,
                top: paperLayout?.top ?? '50%',
                transform: paperLayout === null ? 'translate(-50%, -50%)' : 'translateX(-50%)',
                width: paperLayout ? INVOICE_PAPER_WIDTH * paperLayout.scale : INVOICE_PAPER_WIDTH * INVOICE_PAPER_SCALE,
              }}
              className='absolute left-1/2 opacity-0 data-[ready=true]:opacity-100'
              data-ready={paperLayout !== null}
            >
              <div
                style={{ transform: `scale(${paperLayout?.scale ?? INVOICE_PAPER_SCALE})` }}
                className='origin-top-left'
              >
                <DndFeePaper
                  values={w}
                  dwellDays={calculatedDwellDays}
                  overdueDays={calculatedOverdueDays}
                  grossFee={calculatedGrossFee}
                  netFee={calculatedNetFee}
                />
              </div>
            </div>
          </div>
        )}
      />
    </FormProvider>
  )
}

/* Printable A4 Demurrage & Detention Fee Statement Document Component */
function DndFeePaper({
  values,
  dwellDays,
  overdueDays,
  grossFee,
  netFee,
}: {
  values: DndFormValues
  dwellDays: number
  overdueDays: number
  grossFee: number
  netFee: number
}) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const tableHeaders = [
    { key: 'description', label: 'Demurrage / Detention Particulars', width: '45%' },
    { key: 'overdue', label: 'Overdue Days', width: '15%', align: 'center' as const },
    { key: 'rate', label: 'Daily Tariff', width: '20%', align: 'right' as const },
    { key: 'subtotal', label: 'Calculated Amount', width: '20%', align: 'right' as const },
  ]

  const tableRows = [
    {
      description: `${values.feeType} Assessment (${values.containerNo} - ${values.equipmentType}) • Total Dwell: ${dwellDays} Days (${values.freeTimeDays} Days Free)`,
      overdue: `${overdueDays} Days`,
      rate: `$${values.dailyRate}/Day`,
      subtotal: formatCurrency(grossFee),
    },
  ]

  if (values.waivedAmount > 0) {
    tableRows.push({
      description: 'Carrier Approved Waiver Concession / Rate Discount',
      overdue: '—',
      rate: '—',
      subtotal: `-${formatCurrency(values.waivedAmount)}`,
    })
  }

  return (
    <SapCorporateDocument
      documentTitle="DEMURRAGE & DETENTION FEE STATEMENT"
      documentNumber={`DND-${values.containerNo}`}
      issueDate={values.gateOutDate}
      status={values.status || 'UNPAID'}
      partyA={{
        title: 'ISSUING TERMINAL / OPERATOR',
        name: values.terminalName || 'Tanjung Priok Container Terminal 1',
        address: 'Port Zone Office, Jakarta, Indonesia',
        contact: values.carrierName,
      }}
      partyB={{
        title: 'BILLED PARTY / CONTAINER LESSEE',
        name: defaultInvoiceFrom.name,
        address: defaultInvoiceFrom.addressLines.join(', '),
        taxId: defaultInvoiceFrom.taxId,
        contact: defaultInvoiceFrom.email,
      }}
      metadataGrid={[
        { label: 'Container No', value: values.containerNo },
        { label: 'B/L Reference', value: values.blNumber },
        { label: 'Carrier Line', value: values.carrierName },
        { label: 'Discharge → Gate-Out', value: `${values.dischargeDate} → ${values.gateOutDate}` },
      ]}
      tableHeaders={tableHeaders}
      tableRows={tableRows}
      totals={[
        { label: 'Gross D&D Fee Subtotal', value: formatCurrency(grossFee) },
        { label: 'Approved Concession / Waiver', value: `-${formatCurrency(values.waivedAmount || 0)}` },
        { label: 'NET PAYABLE D&D STATEMENT', value: formatCurrency(netFee), isGrandTotal: true },
      ]}
      specialInstructions={`Free Time Allowed: ${values.freeTimeDays} Days | Total Dwell Time: ${dwellDays} Days | Overdue Billable Days: ${overdueDays} Days`}
      remarks={values.notes || 'Container storage and detention charges computed according to port tariff schedules.'}
      signatures={[
        { title: 'Terminal Yard Controller', name: 'Port Operations', role: 'Gate Supervisor', date: values.gateOutDate },
        { title: 'Authorized Port Officer', name: 'Finance Controller', showStamp: true, date: values.gateOutDate },
      ]}
    />
  )
}
