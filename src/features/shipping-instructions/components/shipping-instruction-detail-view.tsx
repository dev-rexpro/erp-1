import { useRef, useMemo, useEffect, useState } from 'react'
import { FormProvider, useForm, useWatch, Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { StandardDetailView } from '@/components/templates'
import { SapCorporateDocument } from '@/components/templates/sap-corporate-document'
import { Save, Send, Hash, CalendarIcon, Plus, Trash2, GripVertical } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'

const _defaultSiDate = new Date().toISOString().split('T')[0]

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { getInitials } from '@/lib/utils'

import { type ShippingInstruction } from '../data/schema'
import { useShippingInstructions } from './shipping-instructions-provider'
import { useDbStore } from '@/stores/db-store'
import { invoiceClients, INVOICE_PAPER_HEIGHT, INVOICE_PAPER_SCALE, INVOICE_PAPER_WIDTH } from '../../client-invoices/components/invoice-form-data'
import { useVisibleCenterPosition } from '../../client-invoices/components/use-visible-center-position'

interface ShippingInstructionDetailViewProps {
  data: ShippingInstruction[]
}

interface SiFormItem {
  id: string
  containerNo: string
  description: string
  packages: string
  weight: string
  volume: string
}

interface SiFormValues {
  siNo: string
  bookingNo: string
  issueDate: string
  clientId: string
  clientName: string
  clientEmail: string
  consigneeName: string
  carrierName: string
  vesselVoyage: string
  movementType: string
  pol: string
  pod: string
  freightTerms: string
  notes: string
  remarks: string
  items: SiFormItem[]
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

export function ShippingInstructionDetailView({ data }: ShippingInstructionDetailViewProps) {
  const { selectedSiId, setSelectedSiId } = useShippingInstructions()
  const shippingInstructions = useDbStore((state) => state.shippingInstructions)
  const [showPreview, setShowPreview] = useState(true)
  const previewBodyRef = useRef<HTMLDivElement>(null)

  const paperLayout = useVisibleCenterPosition(previewBodyRef, {
    height: INVOICE_PAPER_HEIGHT,
    maxScale: INVOICE_PAPER_SCALE,
    width: INVOICE_PAPER_WIDTH,
  })

  const si = useMemo(() => {
    if (selectedSiId === 'new') return null
    return data.find((p) => p.id === selectedSiId) || null
  }, [data, selectedSiId])

  const formDefaults: SiFormValues = useMemo(() => {
    if (si) {
      const matched = invoiceClients.find(
        (c) => c.name.toLowerCase() === si.shipperName.toLowerCase()
      )

      return {
        siNo: si.siNo,
        bookingNo: si.bookingNo,
        issueDate: si.issueDate,
        clientId: matched?.id || 'bright-enterprises',
        clientName: si.shipperName,
        clientEmail: si.email,
        consigneeName: si.consigneeName,
        carrierName: si.carrierName,
        vesselVoyage: si.vesselVoyage,
        movementType: 'FCL / FCL',
        pol: si.pol,
        pod: si.pod,
        freightTerms: si.freightTerms,
        notes: 'Container temperature set to +4°C. Please issue Original Bill of Lading upon vessel departure.',
        remarks: 'All cargo sealed with high-security ISO 17712 bolt seals. Forwarder to issue Telex Release upon request.',
        items: [
          { id: 'item-1', containerNo: si.containerNo, description: 'General Cargo Electronics & Power Supplies', packages: si.packagesCount, weight: si.grossWeight, volume: smOrVal(si.measurementVolume) },
        ]
      }
    }
    return {
      siNo: '',
      bookingNo: '',
      issueDate: '',
      clientId: '',
      clientName: '',
      clientEmail: '',
      consigneeName: '',
      carrierName: '',
      vesselVoyage: '',
      movementType: '',
      pol: '',
      pod: '',
      freightTerms: '',
      notes: '',
      remarks: '',
      items: [],
    }
  }, [si])

  const form = useForm<SiFormValues>({ defaultValues: formDefaults })
  const w = useWatch({ control: form.control }) as SiFormValues

  useEffect(() => {
    form.reset(formDefaults)
  }, [formDefaults, form])

  const activeClient = useMemo(() => {
    return invoiceClients.find((c) => c.id === w.clientId) || invoiceClients[0]
  }, [w.clientId])

  const handleSubmit = () => {
    toast.success(
      selectedSiId === 'new'
        ? `Shipping Instruction ${w.siNo} created successfully!`
        : `Shipping Instruction ${w.siNo} updated successfully!`
    )
    setSelectedSiId(null)
  }

  return (
    <FormProvider {...form}>
      <div className='flex flex-col gap-6 pb-12'>
        <StandardDetailView
          title={selectedSiId === 'new' ? 'Create Shipping Instruction' : 'Edit Shipping Instruction'}
          subtitle="Manage booking details, cargo manifests, and shipping instructions."
          isNew={selectedSiId === 'new'}
          onBack={() => setSelectedSiId(null)}
          hasPreview={true}
          onPrint={() => window.print()}
          onDownload={() => toast.success('PDF Shipping Instruction generated!')}
          primaryActions={
            <>
              <Button type='button' variant='outline' onClick={() => toast.success('Shipping Instruction saved!')}>
                <Save className='mr-1.5 size-4' />
                Save
              </Button>
              <Button type='button' onClick={handleSubmit}>
                <Send className='mr-1.5 size-4' />
                Submit SI
              </Button>
            </>
          }
          renderForm={() => (
            <form className='flex flex-col gap-4' noValidate onSubmit={(e) => e.preventDefault()}>
              <Tabs defaultValue='header' className='w-full'>
                <TabsList className='w-full grid grid-cols-3 mb-4'>
                  <TabsTrigger value='header'>SI Header & Accounts</TabsTrigger>
                  <TabsTrigger value='routing'>Route & Cargo Manifest</TabsTrigger>
                  <TabsTrigger value='notes'>Instructions & Notes</TabsTrigger>
                </TabsList>

                <TabsContent value='header' className='flex flex-col gap-4 mt-0'>
                  <section className='flex flex-col gap-3'>
                    <FieldGroup>
                      <div className='grid gap-5 md:grid-cols-2'>
                        <Field className='gap-1'>
                          <FieldLabel className='text-xs'>SI Reference Number</FieldLabel>
                          <InputGroup>
                            <InputGroupInput {...form.register('siNo')} />
                            <InputGroupAddon align='inline-end'>
                              <Hash className='size-4 text-muted-foreground' />
                            </InputGroupAddon>
                          </InputGroup>
                        </Field>
                        <Field className='gap-1'>
                          <FieldLabel className='text-xs'>Booking Reference No.</FieldLabel>
                          <Input {...form.register('bookingNo')} placeholder='e.g., BK-2026-8840' />
                        </Field>
                      </div>

                      <div className='grid gap-5 md:grid-cols-2'>
                        <Field className='gap-1'>
                          <FieldLabel className='text-xs'>Issue Date</FieldLabel>
                          <Controller
                            control={form.control}
                            name='issueDate'
                            render={({ field }) => (
                              <DatePicker id='si-issue-date' value={field.value} onChange={field.onChange} />
                            )}
                          />
                        </Field>
                        <Field className='gap-1'>
                          <FieldLabel className='text-xs'>Freight Terms</FieldLabel>
                          <Select value={w.freightTerms} onValueChange={(v) => form.setValue('freightTerms', v)}>
                            <SelectTrigger className='w-full'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value='Freight Prepaid'>Freight Prepaid</SelectItem>
                                <SelectItem value='Freight Collect'>Freight Collect</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                    </FieldGroup>
                  </section>

                  <Separator />

                  {/* Shipper & Consignee Section */}
                  <section className='flex flex-col gap-3'>
                    <h2 className='font-medium tracking-tight text-sm'>Shipper & Consignee Accounts</h2>
                    <div className='grid gap-5 md:grid-cols-2'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs'>Shipper (Exporter)</FieldLabel>
                        <Select
                          value={w.clientId}
                          onValueChange={(id) => {
                            const c = invoiceClients.find((x) => x.id === id)
                            if (c) {
                              form.setValue('clientId', c.id)
                              form.setValue('clientName', c.name)
                              form.setValue('clientEmail', c.email)
                            }
                          }}
                        >
                          <SelectTrigger className='w-full data-[size=default]:h-auto'>
                            <SelectValue placeholder='Select shipper'>
                              <div className='flex items-center gap-2 py-0.5'>
                                <Avatar className='after:rounded-md size-7'>
                                  <AvatarFallback className='rounded-md bg-muted text-foreground text-[10px]'>
                                    {getInitials(activeClient.name).slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className='text-left text-xs'>
                                  <div>{activeClient.name}</div>
                                  <div className='text-muted-foreground text-[10px]'>{activeClient.email}</div>
                                </div>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent position='popper'>
                            <SelectGroup>
                              {invoiceClients.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field className='gap-1'>
                        <FieldLabel className='text-xs'>Consignee (Importer)</FieldLabel>
                        <Input {...form.register('consigneeName')} placeholder='Consignee company name & address...' />
                      </Field>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value='routing' className='flex flex-col gap-4 mt-0'>
                  {/* Carrier & Vessel Section */}
                  <section className='flex flex-col gap-3'>
                    <h2 className='font-medium tracking-tight text-sm'>Carrier & Route Information</h2>
                    <div className='grid gap-5 md:grid-cols-2'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs'>Shipping Carrier Line</FieldLabel>
                        <Input {...form.register('carrierName')} placeholder='e.g., Ocean Network Express (ONE)' />
                      </Field>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs'>Vessel & Voyage Number</FieldLabel>
                        <Input {...form.register('vesselVoyage')} placeholder='e.g., MV ONE OLYMPUS V.042E' />
                      </Field>
                    </div>

                    <div className='grid gap-5 md:grid-cols-2'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs'>Port of Loading (POL)</FieldLabel>
                        <Input {...form.register('pol')} placeholder='e.g., Tanjung Priok, Jakarta, ID' />
                      </Field>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs'>Port of Discharge (POD)</FieldLabel>
                        <Input {...form.register('pod')} placeholder='e.g., Port of Singapore, SG' />
                      </Field>
                    </div>
                  </section>

                  <Separator />

                  {/* Cargo Manifest Items Table */}
                  <SiItemsEditor />
                </TabsContent>

                <TabsContent value='notes' className='flex flex-col gap-4 mt-0'>
                  {/* Instructions & Notes Section */}
                  <section className='flex flex-col gap-3'>
                    <h2 className='font-medium tracking-tight text-sm'>Handling Instructions & Remarks</h2>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Special Instructions for Carrier</FieldLabel>
                      <Textarea {...form.register('notes')} className='min-h-[100px]' placeholder='e.g. Temperature control, BL release conditions...' />
                    </Field>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>General Declaration & Remarks</FieldLabel>
                      <Textarea {...form.register('remarks')} className='min-h-[100px]' placeholder='e.g. ISO seal certification details...' />
                    </Field>
                  </section>
                </TabsContent>
              </Tabs>
            </form>
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
                  <ShippingInstructionPaper values={w} client={activeClient} />
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </FormProvider>
  )
}

function smOrVal(val?: string) {
  return val || '1.26 cbm'
}

function SiItemsEditor() {
  const { control, register } = useFormContext<SiFormValues>()
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'items',
    keyName: 'fieldKey',
  })

  function handleAddItem() {
    append({ id: `item-${Date.now()}`, containerNo: 'CMAU-330192-8 / SE-77402', description: '', packages: '1 Carton', weight: '10 kg', volume: '0.05 cbm' })
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='font-medium tracking-tight text-sm'>Cargo Manifest Particulars</h2>
        <Button type='button' variant='ghost' size='sm' onClick={handleAddItem} className='h-8 px-2.5 gap-1.5'>
          <Plus className='size-4' />
          Add Cargo Item
        </Button>
      </div>

      <div className='flex flex-col gap-2'>
        <div className='hidden items-center gap-2 px-1 font-medium text-muted-foreground text-xs md:grid md:grid-cols-[24px_140px_minmax(0,1.5fr)_90px_80px_80px_32px]'>
          <span />
          <span>Container & Seal No</span>
          <span>Goods Description</span>
          <span className='px-2'>Packages</span>
          <span className='px-2'>Weight</span>
          <span className='px-2'>Volume</span>
          <span />
        </div>

        <div className='flex flex-col gap-3'>
          {fields.map((field, index) => (
            <div
              key={field.fieldKey}
              className='grid min-w-0 grid-cols-[24px_1fr_32px] items-center gap-2 rounded-lg md:grid-cols-[24px_140px_minmax(0,1.5fr)_90px_80px_80px_32px]'
            >
              <Button
                type='button'
                variant='ghost'
                className='h-6 w-6 -ml-1 cursor-grab text-muted-foreground active:cursor-grabbing'
                aria-label={`Reorder item ${index + 1}`}
              >
                <GripVertical className='size-3.5' />
              </Button>
              <Input
                className='min-w-0 text-xs'
                placeholder='e.g. TGHU-884910-2'
                {...register(`items.${index}.containerNo` as const)}
              />
              <Input
                className='min-w-0 text-xs'
                placeholder='e.g., General Electronics'
                {...register(`items.${index}.description` as const)}
              />
              <Input
                className='min-w-0 text-xs'
                placeholder='e.g., 41 Cartons'
                {...register(`items.${index}.packages` as const)}
              />
              <Input
                className='min-w-0 text-xs'
                placeholder='e.g., 358 kg'
                {...register(`items.${index}.weight` as const)}
              />
              <Input
                className='min-w-0 text-xs'
                placeholder='e.g., 1.26 cbm'
                {...register(`items.${index}.volume` as const)}
              />
              <Button
                type='button'
                variant='ghost'
                className='h-7 w-7 text-muted-foreground hover:text-destructive'
                onClick={() => remove(index)}
              >
                <Trash2 className='size-4' />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* Printable A4 Shipping Instruction Document Component */
function ShippingInstructionPaper({ values, client }: { values: SiFormValues; client: typeof invoiceClients[0] }) {
  const tableHeaders = [
    { key: 'containerNo', label: 'Container / Seal No', width: '25%' },
    { key: 'description', label: 'Cargo Commodity Description', width: '35%' },
    { key: 'packages', label: 'Packages', width: '12%', align: 'center' as const },
    { key: 'weight', label: 'Gross Weight', width: '14%', align: 'right' as const },
    { key: 'volume', label: 'Volume', width: '14%', align: 'right' as const },
  ]

  const tableRows = values.items.map((item) => ({
    containerNo: item.containerNo || '-',
    description: item.description || '-',
    packages: item.packages || '-',
    weight: item.weight || '-',
    volume: item.volume || '-',
  }))

  return (
    <SapCorporateDocument
      documentTitle="SHIPPING INSTRUCTION"
      documentNumber={values.siNo || 'SI-2026-001'}
      issueDate={values.issueDate}
      status="ISSUED"
      partyA={{
        title: 'SHIPPER / EXPORTER',
        name: client.name,
        address: client.addressLines?.join(', ') || 'Main Logistics Hub, Jakarta',
        contact: client.email,
        taxId: client.taxId,
      }}
      partyB={{
        title: 'CONSIGNEE / IMPORTER',
        name: values.consigneeName || 'Global Import Co., Ltd.',
        address: 'Receiving Dock East, International Port Zone',
        contact: values.freightTerms,
      }}
      metadataGrid={[
        { label: 'Booking Ref', value: values.bookingNo },
        { label: 'Carrier Line', value: values.carrierName || 'Ocean Network Express (ONE)' },
        { label: 'Vessel / Voyage', value: values.vesselVoyage || 'MV ONE OLYMPUS V.042E' },
        { label: 'POL / POD', value: `${values.pol} → ${values.pod}` },
      ]}
      tableHeaders={tableHeaders}
      tableRows={tableRows}
      specialInstructions={values.notes || 'Please handle in accordance with international ocean freight standards.'}
      remarks={values.remarks || 'Declared under SAP ERP ONE Freight forwarding protocol.'}
      signatures={[
        { title: 'Shipper Representative', name: 'Operational Coordinator', role: 'Export Officer', date: values.issueDate },
        { title: 'Carrier Acceptance', name: 'Authorized Officer', role: 'Shipping Agent', showStamp: true, date: values.issueDate },
        { title: 'Consignee Receipt', name: '....................................', role: 'Receiving Dock' },
      ]}
    />
  )
}
