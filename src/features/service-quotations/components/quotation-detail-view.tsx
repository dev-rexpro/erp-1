import { useRef, useMemo, useEffect, useState } from 'react'
import { FormProvider, useForm, useWatch, Controller } from 'react-hook-form'
import { StandardDetailView } from '@/components/templates'
import { SapCorporateDocument } from '@/components/templates/sap-corporate-document'
import {
  ArrowLeft,
  Download,
  Printer,
  Save,
  Send,
  Hash,
  CalendarIcon,
  Building2,
  Landmark,
  CreditCard,
  ShieldCheck,
  User,
  FileText,
  DollarSign,
  FileSearch,
  BadgePercent,
  CheckCircle2,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const _defaultQuotationValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'

import { type Quotation } from '../data/schema'
import { useQuotations } from './quotations-provider'
import { useDbStore } from '@/stores/db-store'

import {
  INVOICE_PAPER_HEIGHT,
  INVOICE_PAPER_SCALE,
  INVOICE_PAPER_WIDTH,
  defaultInvoiceFrom,
  invoiceClients,
} from '../../client-invoices/components/invoice-form-data'
import { useVisibleCenterPosition } from '../../client-invoices/components/use-visible-center-position'

interface QuotationDetailViewProps {
  data: Quotation[]
}

interface QuotationFormValues {
  quotationNo: string
  validUntil: string
  clientId: string
  clientName: string
  clientEmail: string
  clientContactPerson: string
  amount: string
  serviceCategory: string
  origin: string
  destination: string
  notes: string
  terms: string
  // Terms
  paymentTerms: string
  incoterms: string
  validityPeriod: string
  inclusions: string
  exclusions: string
  // Business
  issuerName: string
  issuerTaxId: string
  salesAgent: string
  salesEmail: string
  salesPhone: string
  currency: string
  costEstimate: string
  marginPercent: string
  bankName: string
  bankAccountNo: string
  swiftCode: string
  approvalStatus: string
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
          className='w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground text-xs'
        >
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
          <CalendarIcon className='text-muted-foreground h-3.5 w-3.5' />
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

export function QuotationDetailView({ data }: QuotationDetailViewProps) {
  const { selectedQuotationId, setSelectedQuotationId } = useQuotations()
  const quotations = useDbStore((state) => state.quotations)
  const previewBodyRef = useRef<HTMLDivElement>(null)

  const paperLayout = useVisibleCenterPosition(previewBodyRef, {
    height: INVOICE_PAPER_HEIGHT,
    maxScale: INVOICE_PAPER_SCALE,
    width: INVOICE_PAPER_WIDTH,
  })

  const quotation = useMemo(() => {
    if (selectedQuotationId === 'new') return null
    return data.find((q) => q.id === selectedQuotationId) || null
  }, [data, selectedQuotationId])

  const formDefaults: QuotationFormValues = useMemo(() => {
    if (quotation) {
      const matched = invoiceClients.find(
        (c) => c.name.toLowerCase() === quotation.firstName.toLowerCase()
      )
      return {
        quotationNo: quotation.username,
        validUntil: quotation.validUntil,
        clientId: matched?.id || 'bright-enterprises',
        clientName: quotation.firstName,
        clientEmail: quotation.email,
        clientContactPerson: 'Hendra Wijaya',
        amount: quotation.amount,
        serviceCategory: quotation.role === 'superadmin' ? 'Air Freight' : quotation.role === 'admin' ? 'Ocean Freight FCL' : 'Customs Clearance',
        origin: 'Tanjung Priok, Jakarta (IDTPP)',
        destination: 'Port of Yokohama (JPYOK)',
        notes: 'Thank you for your interest in our freight forwarding services. Rates are quoted based on current carrier tariffs.',
        terms: '1. Rates are subject to vessel space and container availability at time of booking.\n2. Heavy lift and hazardous goods surcharges apply if applicable.\n3. Payment is required as per agreed commercial payment terms prior to Bill of Lading release.',
        paymentTerms: 'Net 30 Days upon BL issuance',
        incoterms: 'FOB - Free On Board',
        validityPeriod: '30 Days from issue date',
        inclusions: 'BAF, CAF, ISPS, Export Customs Declaration, Loading Port THC',
        exclusions: 'Import Duties, Destination VAT, Storage & Demurrage, Cargo Insurance',
        issuerName: defaultInvoiceFrom.name,
        issuerTaxId: defaultInvoiceFrom.taxId,
        salesAgent: 'Budi Santoso (Senior Freight Manager)',
        salesEmail: defaultInvoiceFrom.email,
        salesPhone: defaultInvoiceFrom.phone,
        currency: 'USD',
        costEstimate: '$7,200.00',
        marginPercent: '15%',
        bankName: 'Bank Mandiri',
        bankAccountNo: '116-00-888999',
        swiftCode: 'BMRIIDJA',
        approvalStatus: 'Approved by Manager',
      }
    }
    return {
      quotationNo: '',
      validUntil: '',
      clientId: '',
      clientName: '',
      clientEmail: '',
      clientContactPerson: '',
      amount: '',
      serviceCategory: '',
      origin: '',
      destination: '',
      notes: '',
      terms: '',
      paymentTerms: '',
      incoterms: '',
      validityPeriod: '',
      inclusions: '',
      exclusions: '',
      issuerName: defaultInvoiceFrom.name,
      issuerTaxId: defaultInvoiceFrom.taxId,
      salesAgent: '',
      salesEmail: '',
      salesPhone: '',
      currency: 'USD',
      costEstimate: '',
      marginPercent: '',
      bankName: '',
      bankAccountNo: '',
      swiftCode: '',
      approvalStatus: 'Draft',
    }
  }, [quotation, quotations.length])

  const form = useForm<QuotationFormValues>({ defaultValues: formDefaults })
  const w = useWatch({ control: form.control }) as QuotationFormValues

  useEffect(() => {
    form.reset(formDefaults)
  }, [formDefaults, form])

  const activeClient = useMemo(() => {
    return invoiceClients.find((c) => c.id === w.clientId) || invoiceClients[0]
  }, [w.clientId])

  const handleSubmit = () => {
    toast.success(
      selectedQuotationId === 'new'
        ? `Quotation ${w.quotationNo} created!`
        : `Quotation ${w.quotationNo} updated!`
    )
    setSelectedQuotationId(null)
  }

  return (
    <FormProvider {...form}>
      <div className='flex flex-col gap-6 pb-12'>
        <StandardDetailView
          title={selectedQuotationId === 'new' ? 'Create New Quotation' : 'Edit Quotation'}
          subtitle="Set service rates, review terms, business parameters, and share with your client."
          isNew={selectedQuotationId === 'new'}
          onBack={() => setSelectedQuotationId(null)}
          hasPreview={true}
          onPrint={() => window.print()}
          onDownload={() => toast.success('PDF download started!')}
          primaryActions={
            <>
              <Button type='button' variant='outline' onClick={() => toast.success('Quotation saved successfully!')}>
                <Save className='mr-1.5 size-4' />
                Save
              </Button>
              <Button type='button' onClick={handleSubmit}>
                <Send className='mr-1.5 size-4' />
                Send Quotation
              </Button>
            </>
          }
          renderForm={() => (
            <form className='flex flex-col gap-4' noValidate onSubmit={(e) => e.preventDefault()}>
              <Tabs defaultValue='quotation' className='w-full flex flex-col gap-4'>
                <TabsList className='w-full grid grid-cols-3'>
                  <TabsTrigger value='quotation'>Quotation</TabsTrigger>
                  <TabsTrigger value='terms'>Terms</TabsTrigger>
                  <TabsTrigger value='business'>Business</TabsTrigger>
                </TabsList>

                {/* TAB 1: QUOTATION PROPOSAL */}
                <TabsContent value='quotation' className='space-y-4 pt-1'>
                  <section className='flex flex-col gap-3'>
                    <FieldGroup>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Quotation Number</FieldLabel>
                        <InputGroup>
                          <InputGroupInput className='text-xs' {...form.register('quotationNo')} />
                          <InputGroupAddon align='inline-end'>
                            <Hash className='h-3.5 w-3.5 text-muted-foreground' />
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <Field className='gap-1'>
                          <FieldLabel className='text-xs font-medium'>Valid Until</FieldLabel>
                          <Controller
                            control={form.control}
                            name='validUntil'
                            render={({ field }) => (
                              <DatePicker id='valid-until' value={field.value} onChange={field.onChange} />
                            )}
                          />
                        </Field>
                        <Field className='gap-1'>
                          <FieldLabel className='text-xs font-medium'>Total Estimate</FieldLabel>
                          <Input className='text-xs font-semibold' {...form.register('amount')} />
                        </Field>
                      </div>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Service Category</FieldLabel>
                        <Select value={w.serviceCategory} onValueChange={(v) => form.setValue('serviceCategory', v)}>
                          <SelectTrigger className='w-full text-xs'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value='Air Freight'>Air Freight</SelectItem>
                              <SelectItem value='Ocean Freight FCL'>Ocean Freight FCL</SelectItem>
                              <SelectItem value='Ocean Freight LCL'>Ocean Freight LCL</SelectItem>
                              <SelectItem value='Customs Clearance'>Customs Clearance</SelectItem>
                              <SelectItem value='Warehousing Logistics'>Warehousing Logistics</SelectItem>
                              <SelectItem value='Door-to-Door Freight'>Door-to-Door Freight</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>

                      <div className='grid gap-4 md:grid-cols-2 pt-1'>
                        <Field className='gap-1'>
                          <FieldLabel className='text-xs font-medium'>Origin Port / City</FieldLabel>
                          <Input className='text-xs' {...form.register('origin')} placeholder='e.g. Tanjung Priok (IDTPP)' />
                        </Field>
                        <Field className='gap-1'>
                          <FieldLabel className='text-xs font-medium'>Destination Port / City</FieldLabel>
                          <Input className='text-xs' {...form.register('destination')} placeholder='e.g. Yokohama (JPYOK)' />
                        </Field>
                      </div>
                    </FieldGroup>
                  </section>

                  <Separator />

                  <section className='flex flex-col gap-3'>
                    <h2 className='text-sm font-semibold tracking-tight text-foreground flex items-center gap-2'>
                      <Building2 className='h-4 w-4 text-muted-foreground' /> Prospect Client Account
                    </h2>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Client Company</FieldLabel>
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
                        <SelectTrigger className='w-full text-xs data-[size=default]:h-auto'>
                          <SelectValue placeholder='Select client'>
                            <div className='flex items-center gap-2 py-0.5'>
                              <Avatar className='h-6 w-6 after:rounded-md'>
                                <AvatarFallback className='rounded-md bg-muted text-[11px] font-bold text-foreground'>
                                  {getInitials(activeClient.name).slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className='text-left text-xs'>
                                <div className='font-medium text-foreground'>{activeClient.name}</div>
                                <div className='text-[11px] text-muted-foreground'>{activeClient.email}</div>
                              </div>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent position='popper'>
                          <SelectGroup>
                            {invoiceClients.map((c) => (
                              <SelectItem key={c.id} value={c.id} className='text-xs'>{c.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>

                    <div className='grid gap-4 md:grid-cols-2 pt-1'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Attention Contact Person</FieldLabel>
                        <Input className='text-xs' {...form.register('clientContactPerson')} placeholder='e.g. Hendra Wijaya' />
                      </Field>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Client Tax ID / NPWP</FieldLabel>
                        <Input className='text-xs text-muted-foreground bg-muted/30' value={activeClient.taxId} readOnly />
                      </Field>
                    </div>
                  </section>
                </TabsContent>

                {/* TAB 2: TERMS & CONDITIONS */}
                <TabsContent value='terms' className='space-y-4 pt-1'>
                  <section className='flex flex-col gap-3'>
                    <h2 className='text-sm font-semibold tracking-tight text-foreground flex items-center gap-2'>
                      <ShieldCheck className='h-4 w-4 text-muted-foreground' /> Commercial & Shipping Terms
                    </h2>
                    
                    <div className='grid gap-4 md:grid-cols-2'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Incoterms</FieldLabel>
                        <Select value={w.incoterms} onValueChange={(v) => form.setValue('incoterms', v)}>
                          <SelectTrigger className='w-full text-xs'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value='FOB - Free On Board'>FOB - Free On Board</SelectItem>
                              <SelectItem value='CIF - Cost, Insurance & Freight'>CIF - Cost, Insurance & Freight</SelectItem>
                              <SelectItem value='DDP - Delivered Duty Paid'>DDP - Delivered Duty Paid</SelectItem>
                              <SelectItem value='EXW - Ex Works'>EXW - Ex Works</SelectItem>
                              <SelectItem value='CFR - Cost & Freight'>CFR - Cost & Freight</SelectItem>
                              <SelectItem value='FCA - Free Carrier'>FCA - Free Carrier</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Payment Terms</FieldLabel>
                        <Select value={w.paymentTerms} onValueChange={(v) => form.setValue('paymentTerms', v)}>
                          <SelectTrigger className='w-full text-xs'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value='Net 30 Days upon BL issuance'>Net 30 Days upon BL issuance</SelectItem>
                              <SelectItem value='Net 14 Days from Invoice'>Net 14 Days from Invoice</SelectItem>
                              <SelectItem value='100% Advance Payment'>100% Advance Payment</SelectItem>
                              <SelectItem value='50% Deposit / 50% upon Vessel Arrival'>50% Deposit / 50% Vessel Arrival</SelectItem>
                              <SelectItem value='CAD - Cash Against Documents'>CAD - Cash Against Documents</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Rate Validity Clause</FieldLabel>
                      <Input className='text-xs' {...form.register('validityPeriod')} placeholder='e.g. 30 Days from issuance date' />
                    </Field>
                  </section>

                  <Separator />

                  <section className='flex flex-col gap-3'>
                    <h2 className='text-sm font-semibold tracking-tight text-foreground flex items-center gap-2'>
                      <FileText className='h-4 w-4 text-muted-foreground' /> Inclusions & Exclusions
                    </h2>

                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Rate Inclusions</FieldLabel>
                      <Textarea {...form.register('inclusions')} className='min-h-[60px] text-xs' placeholder='e.g. Includes BAF, CAF, ISPS, Export Customs Declaration...' />
                    </Field>

                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Rate Exclusions</FieldLabel>
                      <Textarea {...form.register('exclusions')} className='min-h-[60px] text-xs' placeholder='e.g. Excludes Import Taxes, Duties, Storage/Demurrage at Port...' />
                    </Field>
                  </section>

                  <Separator />

                  <section className='flex flex-col gap-3'>
                    <h2 className='text-sm font-semibold tracking-tight text-foreground flex items-center gap-2'>
                      <FileSearch className='h-4 w-4 text-muted-foreground' /> Terms & Special Notes
                    </h2>

                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Standard Terms & Conditions</FieldLabel>
                      <Textarea {...form.register('terms')} className='min-h-[90px] text-xs' />
                    </Field>

                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Additional Operational Notes</FieldLabel>
                      <Textarea {...form.register('notes')} className='min-h-[70px] text-xs' />
                    </Field>
                  </section>
                </TabsContent>

                {/* TAB 3: BUSINESS & ISSUER DATA */}
                <TabsContent value='business' className='space-y-4 pt-1'>
                  <section className='flex flex-col gap-3'>
                    <h2 className='text-sm font-semibold tracking-tight text-foreground flex items-center gap-2'>
                      <Building2 className='h-4 w-4 text-muted-foreground' /> Forwarder / Issuer Profile
                    </h2>

                    <div className='grid gap-4 md:grid-cols-2'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Issuer Company Name</FieldLabel>
                        <Input className='text-xs' {...form.register('issuerName')} />
                      </Field>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Issuer Tax ID / NPWP</FieldLabel>
                        <Input className='text-xs' {...form.register('issuerTaxId')} />
                      </Field>
                    </div>

                    <div className='grid gap-4 md:grid-cols-3 pt-1'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Sales Representative / Manager</FieldLabel>
                        <Input className='text-xs' {...form.register('salesAgent')} />
                      </Field>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Sales Email</FieldLabel>
                        <Input className='text-xs' {...form.register('salesEmail')} />
                      </Field>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Sales Phone</FieldLabel>
                        <Input className='text-xs' {...form.register('salesPhone')} />
                      </Field>
                    </div>
                  </section>

                  <Separator />

                  <section className='flex flex-col gap-3'>
                    <h2 className='text-sm font-semibold tracking-tight text-foreground flex items-center gap-2'>
                      <BadgePercent className='h-4 w-4 text-muted-foreground' /> Financial & Margin Parameters
                    </h2>

                    <div className='grid gap-4 md:grid-cols-4'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Billing Currency</FieldLabel>
                        <Select value={w.currency} onValueChange={(v) => form.setValue('currency', v)}>
                          <SelectTrigger className='w-full text-xs'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value='USD'>USD ($)</SelectItem>
                              <SelectItem value='IDR'>IDR (Rp)</SelectItem>
                              <SelectItem value='SGD'>SGD ($)</SelectItem>
                              <SelectItem value='EUR'>EUR (€)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Internal Cost Estimate</FieldLabel>
                        <Input className='text-xs' {...form.register('costEstimate')} />
                      </Field>

                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Profit Margin %</FieldLabel>
                        <Input className='text-xs' {...form.register('marginPercent')} />
                      </Field>

                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Approval Status</FieldLabel>
                        <Select value={w.approvalStatus} onValueChange={(v) => form.setValue('approvalStatus', v)}>
                          <SelectTrigger className='w-full text-xs'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value='Draft'>Draft</SelectItem>
                              <SelectItem value='Pending Manager Sign-off'>Pending Manager Sign-off</SelectItem>
                              <SelectItem value='Approved by Manager'>Approved by Manager</SelectItem>
                              <SelectItem value='Sent to Customer'>Sent to Customer</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </section>

                  <Separator />

                  <section className='flex flex-col gap-3'>
                    <h2 className='text-sm font-semibold tracking-tight text-foreground flex items-center gap-2'>
                      <Landmark className='h-4 w-4 text-muted-foreground' /> Remittance Bank Account
                    </h2>

                    <div className='grid gap-4 md:grid-cols-3'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Bank Name</FieldLabel>
                        <Input className='text-xs' {...form.register('bankName')} />
                      </Field>

                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Bank Account No</FieldLabel>
                        <Input className='text-xs' {...form.register('bankAccountNo')} />
                      </Field>

                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>SWIFT / BIC Code</FieldLabel>
                        <Input className='text-xs' {...form.register('swiftCode')} />
                      </Field>
                    </div>
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
                  <QuotationPaper values={w} client={activeClient} />
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </FormProvider>
  )
}

function QuotationPaper({ values, client }: { values: QuotationFormValues; client: typeof invoiceClients[0] }) {
  const tableHeaders = [
    { key: 'category', label: 'Service Category / Description', width: '45%' },
    { key: 'route', label: 'Origin → Destination Port', width: '35%' },
    { key: 'total', label: 'Estimated Rate', width: '20%', align: 'right' as const },
  ]

  const tableRows = [
    {
      category: values.serviceCategory || 'Ocean Freight Service Offer',
      route: `${values.origin || 'Origin Port'} → ${values.destination || 'Destination Port'}`,
      total: values.amount || '$1,250.00',
    },
  ]

  return (
    <SapCorporateDocument
      documentTitle="SERVICE QUOTATION"
      documentNumber={values.quotationNo || 'QUO-2026-001'}
      dueDate={values.validUntil}
      status={values.approvalStatus || 'ACTIVE OFFER'}
      partyA={{
        title: 'SERVICE PROVIDER / ISSUER',
        name: values.issuerName || defaultInvoiceFrom.name,
        address: defaultInvoiceFrom.addressLines.join(', '),
        taxId: values.issuerTaxId || defaultInvoiceFrom.taxId,
        contact: values.salesEmail || defaultInvoiceFrom.email,
        extraLines: [{ label: 'Sales Agent', value: values.salesAgent || 'Freight Sales Team' }],
      }}
      partyB={{
        title: 'PREPARED FOR / CLIENT',
        name: client.name,
        address: client.addressLines.join(', '),
        taxId: client.taxId,
        contact: values.clientContactPerson || client.email,
      }}
      metadataGrid={[
        { label: 'Incoterms', value: values.incoterms || 'FOB Tanjung Priok' },
        { label: 'Payment Terms', value: values.paymentTerms || 'Net 30 Days' },
        { label: 'Offer Status', value: values.approvalStatus || 'Active' },
        { label: 'Validity Period', value: `Until ${values.validUntil}` },
      ]}
      tableHeaders={tableHeaders}
      tableRows={tableRows}
      totals={[
        { label: 'ESTIMATED TOTAL QUOTATION', value: values.amount || '$1,250.00', isGrandTotal: true },
      ]}
      specialInstructions={values.inclusions ? `Rate Inclusions: ${values.inclusions}` : undefined}
      remarks={values.terms || values.notes || 'Quotation valid subject to space & equipment availability at time of booking.'}
      paymentDetails={{
        bankName: values.bankName || 'Bank Mandiri (Cab. Jakarta Slipi)',
        accountNo: values.bankAccountNo || '116-00-888999',
        accountName: defaultInvoiceFrom.name,
      }}
      signatures={[
        { title: 'Commercial Sales Manager', name: values.salesAgent || 'Sales Coordinator', role: 'Account Manager', date: values.validUntil },
        { title: 'Authorized Management', name: 'General Manager', showStamp: true, date: values.validUntil },
        { title: 'Client Confirmation', name: '....................................', role: 'Accepted & Confirmed' },
      ]}
    />
  )
}

