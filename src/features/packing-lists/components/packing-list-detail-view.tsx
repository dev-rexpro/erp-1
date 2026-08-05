import { useRef, useMemo, useEffect, useState } from 'react'
import { FormProvider, useForm, useWatch, Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { ArrowLeft, Download, Printer, Save, Send, Hash, CalendarIcon, Plus, Trash2, GripVertical, FileSearch } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const _defaultPackingDate = new Date().toISOString().split('T')[0]
const _defaultPLIssueDate = new Date().toISOString().split('T')[0]

import { StandardDetailView } from '@/components/templates/standard-detail-view'
import { SapCorporateDocument } from '@/components/templates/sap-corporate-document'

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

import { type PackingList } from '../data/schema'
import { usePackingLists } from './packing-lists-provider'
import { useDbStore } from '@/stores/db-store'

import {
  INVOICE_PAPER_HEIGHT,
  INVOICE_PAPER_SCALE,
  INVOICE_PAPER_WIDTH,
  defaultInvoiceFrom,
  invoiceClients,
} from '../../client-invoices/components/invoice-form-data'
import { useVisibleCenterPosition } from '../../client-invoices/components/use-visible-center-position'

interface PackingListDetailViewProps {
  data: PackingList[]
}

interface PackingListItem {
  id: string
  description: string
  quantity: number
  packages: string
  weight: string
  volume: string
}

interface PackingListFormValues {
  packingListNo: string
  packingDate: string
  clientId: string
  clientName: string
  clientEmail: string
  amount: string
  formatType: string
  origin: string
  destination: string
  notes: string
  terms: string
  items: PackingListItem[]
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

export function PackingListDetailView({ data }: PackingListDetailViewProps) {
  const { selectedPackingListId, setSelectedPackingListId } = usePackingLists()
  const packingLists = useDbStore((state) => state.packingLists)
  const [showPreview, setShowPreview] = useState(true)
  const previewBodyRef = useRef<HTMLDivElement>(null)

  const paperLayout = useVisibleCenterPosition(previewBodyRef, {
    height: INVOICE_PAPER_HEIGHT,
    maxScale: INVOICE_PAPER_SCALE,
    width: INVOICE_PAPER_WIDTH,
  })

  const packingList = useMemo(() => {
    if (selectedPackingListId === 'new') return null
    return data.find((p) => p.id === selectedPackingListId) || null
  }, [data, selectedPackingListId])

  const formDefaults: PackingListFormValues = useMemo(() => {
    if (packingList) {
      const matched = invoiceClients.find(
        (c) => c.name.toLowerCase() === packingList.firstName.toLowerCase()
      )
      
      const formatMap: Record<string, string> = {
        superadmin: 'Cartons',
        admin: 'Pallets',
        manager: 'Wooden Crates',
        cashier: 'Containers',
      }

      return {
        packingListNo: packingList.username,
        packingDate: packingList.validUntil,
        clientId: matched?.id || 'bright-enterprises',
        clientName: packingList.firstName,
        clientEmail: packingList.email,
        amount: packingList.amount,
        formatType: formatMap[packingList.role] || 'Cartons',
        origin: 'Global Logistics Hub, ID',
        destination: 'Receiving Dock East, SG',
        notes: 'Cartons are stackable. Please handle with care. Sensitive electronics enclosed.',
        terms: 'All items are inspected prior to dispatch. Client is responsible for checking seals upon receipt.',
        items: [
          { id: 'item-1', description: 'Industrial Power Inverters', quantity: 4, packages: '2 Crates', weight: '340 kg', volume: '1.20 cbm' },
          { id: 'item-2', description: 'Spare Circuit Boards', quantity: 15, packages: '1 Carton', weight: '18 kg', volume: '0.06 cbm' },
        ]
      }
    }
    return {
      packingListNo: '',
      issueDate: '',
      clientId: '',
      clientName: '',
      clientEmail: '',
      amount: '',
      formatType: '',
      packingDate: '',
      origin: '',
      destination: '',
      notes: '',
      terms: '',
      items: [],
    }
  }, [packingList])

  const form = useForm<PackingListFormValues>({ defaultValues: formDefaults })
  const w = useWatch({ control: form.control }) as PackingListFormValues

  useEffect(() => {
    form.reset(formDefaults)
  }, [formDefaults, form])

  const activeClient = useMemo(() => {
    return invoiceClients.find((c) => c.id === w.clientId) || invoiceClients[0]
  }, [w.clientId])

  const handleSubmit = () => {
    toast.success(
      selectedPackingListId === 'new'
        ? `Packing list ${w.packingListNo} created!`
        : `Packing list ${w.packingListNo} updated!`
    )
    setSelectedPackingListId(null)
  }

  return (
    <FormProvider {...form}>
      <StandardDetailView
        title="Packing List"
        subtitle="Set package quantities, review inventory, and prepare the printable manifest document."
        isNew={selectedPackingListId === 'new'}
        onBack={() => setSelectedPackingListId(null)}
        hasPreview={true}
        onPrint={() => window.print()}
        onDownload={() => toast.success('PDF Manifest generated!')}
        primaryActions={
          <>
            <Button type='button' variant='outline' onClick={() => toast.success('Packing List saved!')}>
              <Save className='mr-1.5 size-4' />
              Save
            </Button>
            <Button type='button' onClick={handleSubmit}>
              <Send className='mr-1.5 size-4' />
              Approve Packing List
            </Button>
          </>
        }
        renderForm={() => (
          <>
            <Tabs defaultValue='manifest' className='w-full'>
              <TabsList className='w-full grid grid-cols-3 mb-4'>
                <TabsTrigger value='manifest'>Manifest & Items</TabsTrigger>
                <TabsTrigger value='routing'>Routing Info</TabsTrigger>
                <TabsTrigger value='notes'>Notes & Declarations</TabsTrigger>
              </TabsList>

              <TabsContent value='manifest' className='flex flex-col gap-4 mt-0'>
                <section className='flex flex-col gap-3'>
                  <FieldGroup>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Packing List Number</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...form.register('packingListNo')} />
                        <InputGroupAddon align='inline-end'>
                          <Hash className='size-4 text-muted-foreground' />
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                    <div className='grid gap-5 md:grid-cols-2'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs'>Packing Date</FieldLabel>
                        <Controller
                          control={form.control}
                          name='packingDate'
                          render={({ field }) => (
                            <DatePicker id='packing-date' value={field.value} onChange={field.onChange} />
                          )}
                        />
                      </Field>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs'>Packaging Format</FieldLabel>
                        <Select value={w.formatType} onValueChange={(v) => form.setValue('formatType', v)}>
                          <SelectTrigger className='w-full'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value='Cartons'>Cartons (CTN)</SelectItem>
                              <SelectItem value='Pallets'>Pallets (PLT)</SelectItem>
                              <SelectItem value='Wooden Crates'>Wooden Crates</SelectItem>
                              <SelectItem value='Containers'>Containers (FCL)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </FieldGroup>
                </section>

                <Separator />

                <section className='flex flex-col gap-3'>
                  <h2 className='font-medium tracking-tight text-sm'>Consignee (Bill To)</h2>
                  <div className='flex items-center gap-3 rounded-lg border p-3 bg-slate-50/50 dark:bg-slate-900/50'>
                    <Avatar className='h-9 w-9 bg-slate-100 dark:bg-slate-800 text-xs'>
                      <AvatarFallback>{getInitials(activeClient.name)}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col overflow-hidden leading-tight'>
                      <span className='truncate font-medium text-sm'>{activeClient.name}</span>
                      <span className='truncate text-xs text-muted-foreground'>{activeClient.email}</span>
                    </div>
                    <Button type='button' variant='outline' size='sm' className='ml-auto h-8 text-xs'>
                      Change
                    </Button>
                  </div>
                </section>

                <Separator />

                <PackingListItemsEditor />
              </TabsContent>

              <TabsContent value='routing' className='flex flex-col gap-4 mt-0'>
                <section className='flex flex-col gap-3'>
                  <h2 className='font-medium tracking-tight text-sm'>Routing Details (Port-to-Port)</h2>
                  <div className='grid gap-5 md:grid-cols-2'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Port of Loading / Origin</FieldLabel>
                      <Input {...form.register('origin')} placeholder='e.g., Global Logistics Hub, ID' />
                    </Field>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Port of Discharge / Destination</FieldLabel>
                      <Input {...form.register('destination')} placeholder='e.g., Receiving Dock East, SG' />
                    </Field>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value='notes' className='flex flex-col gap-4 mt-0'>
                <section className='flex flex-col gap-3'>
                  <h2 className='font-medium tracking-tight text-sm'>Instructions & Declarations</h2>
                  <Field className='gap-1'>
                    <FieldLabel className='text-xs'>Manifest Notes / Additional info</FieldLabel>
                    <Textarea {...form.register('notes')} className='min-h-[100px]' />
                  </Field>
                  <Field className='gap-1'>
                    <FieldLabel className='text-xs'>Inspection Terms</FieldLabel>
                    <Textarea {...form.register('terms')} className='min-h-[100px]' />
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
                <PackingListPaper values={w} client={activeClient} />
              </div>
            </div>
          </div>
        )}
      />
    </FormProvider>
  )
}

function PackingListItemsEditor() {
  const { control, register } = useFormContext<PackingListFormValues>()
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'items',
    keyName: 'fieldKey',
  })

  function handleAddItem() {
    append({ id: `item-${Date.now()}`, description: '', quantity: 1, packages: '1 Carton', weight: '10 kg', volume: '0.05 cbm' })
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='font-medium tracking-tight text-sm'>Manifest Line Items</h2>
        <Button type='button' variant='ghost' size='sm' onClick={handleAddItem} className='h-8 px-2.5 gap-1.5'>
          <Plus className='size-4' />
          Add Cargo Item
        </Button>
      </div>

      <div className='flex flex-col gap-2'>
        <div className='hidden items-center gap-2 px-1 font-medium text-muted-foreground text-xs md:grid md:grid-cols-[24px_minmax(0,1.5fr)_70px_110px_90px_90px_32px]'>
          <span />
          <span>Description of Goods</span>
          <span className='px-2'>Qty</span>
          <span className='px-2'>Packages</span>
          <span className='px-2'>Weight</span>
          <span className='px-2'>Volume</span>
          <span />
        </div>

        <div className='flex flex-col gap-3'>
          {fields.map((field, index) => (
            <div
              key={field.fieldKey}
              className='grid min-w-0 grid-cols-[24px_1fr_32px] items-center gap-2 rounded-lg md:grid-cols-[24px_minmax(0,1.5fr)_70px_110px_90px_90px_32px]'
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
                className='min-w-0 text-sm max-md:col-span-3'
                placeholder='e.g., iPhone 15 Pro Max'
                {...register(`items.${index}.description` as const)}
              />
              <Input
                type='number'
                className='text-sm max-md:col-start-2 max-md:row-start-2'
                placeholder='Qty'
                {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
              />
              <Input
                className='text-sm max-md:col-start-3 max-md:row-start-2'
                placeholder='Packages'
                {...register(`items.${index}.packages` as const)}
              />
              <Input
                className='text-sm max-md:col-start-4 max-md:row-start-2'
                placeholder='Weight'
                {...register(`items.${index}.weight` as const)}
              />
              <Input
                className='text-sm'
                placeholder='Volume'
                {...register(`items.${index}.volume` as const)}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                aria-label={`Remove item ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2 className='size-4' />
              </Button>
            </div>
          ))}
          {fields.length === 0 && (
            <div className='text-center py-4 border border-dashed rounded-lg text-xs text-muted-foreground'>
              No items declared. Click "Add Cargo Item" to declare.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function PackingListPaper({ values, client }: { values: PackingListFormValues; client: typeof invoiceClients[0] }) {
  const tableHeaders = [
    { key: 'description', label: 'Commodity / Description of Goods', width: '40%' },
    { key: 'quantity', label: 'Qty', width: '12%', align: 'center' as const },
    { key: 'packages', label: 'Packages', width: '16%', align: 'center' as const },
    { key: 'weight', label: 'Gross Weight', width: '16%', align: 'right' as const },
    { key: 'volume', label: 'Volume', width: '16%', align: 'right' as const },
  ]

  const tableRows = (values.items || []).map((item) => ({
    description: item.description || 'N/A',
    quantity: item.quantity,
    packages: item.packages || '-',
    weight: item.weight || '-',
    volume: item.volume || '-',
  }))

  return (
    <SapCorporateDocument
      documentTitle="PACKING LIST"
      documentNumber={values.packingListNo || 'PL-2026-001'}
      issueDate={values.packingDate}
      status="APPROVED"
      partyA={{
        title: 'SHIPPER / EXPORTER',
        name: defaultInvoiceFrom.name,
        address: defaultInvoiceFrom.addressLines.join(', '),
        taxId: defaultInvoiceFrom.taxId,
        contact: defaultInvoiceFrom.email,
      }}
      partyB={{
        title: 'CONSIGNEE / BUYER',
        name: client.name,
        address: client.addressLines.join(', '),
        taxId: client.taxId,
        contact: client.email,
      }}
      metadataGrid={[
        { label: 'Format Type', value: values.formatType },
        { label: 'Total Consignment', value: values.amount },
        { label: 'Port of Loading', value: values.origin || 'Jakarta' },
        { label: 'Port of Discharge', value: values.destination || 'Singapore' },
      ]}
      tableHeaders={tableHeaders}
      tableRows={tableRows}
      specialInstructions={values.notes || 'Please handle all packages with appropriate care. Report any broken seal immediately.'}
      remarks={values.terms || 'All goods inspected and packed according to SAP ERP ONE Quality Standards.'}
      signatures={[
        { title: 'Warehouse Inspector', name: 'Pak Joko', role: 'Packing Supervisor', date: values.packingDate },
        { title: 'Logistics Manager', name: defaultInvoiceFrom.issuerName, showStamp: true, date: values.packingDate },
        { title: 'Carrier Driver', name: '....................................', role: 'Driver Signature' },
      ]}
    />
  )
}
