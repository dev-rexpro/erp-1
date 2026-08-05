import { useRef, useMemo, useEffect, useState } from 'react'
import { FormProvider, useForm, useWatch, Controller } from 'react-hook-form'
import {
  ArrowLeft,
  Download,
  Printer,
  Save,
  Send,
  Hash,
  CalendarIcon,
  Building2,
  ShieldCheck,
  FileText,
  Clock,
  Scale,
  Handshake,
  CheckCircle2,
  FileSearch,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { StandardDetailView } from '@/components/templates'
import { SapCorporateDocument } from '@/components/templates/sap-corporate-document'

const _defaultContractValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().split('T')[0]

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
import { getInitials } from '@/lib/utils'

import { type Contract } from '../data/schema'
import { useContracts } from './contracts-provider'
import { useDbStore } from '@/stores/db-store'

import {
  INVOICE_PAPER_HEIGHT,
  INVOICE_PAPER_SCALE,
  INVOICE_PAPER_WIDTH,
  defaultInvoiceFrom,
  invoiceClients,
} from '../../client-invoices/components/invoice-form-data'
import { useVisibleCenterPosition } from '../../client-invoices/components/use-visible-center-position'

interface ContractDetailViewProps {
  data: Contract[]
}

interface ContractFormValues {
  contractCode: string
  effectiveDate: string
  validUntil: string
  clientId: string
  clientName: string
  clientEmail: string
  amount: string
  serviceScope: string
  status: string
  // SLA & Commitments
  volumeCommitment: string
  guaranteedTransitTime: string
  freeStorageDays: string
  paymentTerms: string
  // Legal & Governance
  governingLaw: string
  terminationNotice: string
  liabilityCap: string
  signatoryName: string
  terms: string
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

export function ContractDetailView({ data }: ContractDetailViewProps) {
  const { selectedContractId, setSelectedContractId } = useContracts()
  const contracts = useDbStore((state) => state.contracts)
  const previewBodyRef = useRef<HTMLDivElement>(null)

  const paperLayout = useVisibleCenterPosition(previewBodyRef, {
    height: INVOICE_PAPER_HEIGHT,
    maxScale: INVOICE_PAPER_SCALE,
    width: INVOICE_PAPER_WIDTH,
  })

  const contract = useMemo(() => {
    if (selectedContractId === 'new') return null
    return data.find((c) => c.id === selectedContractId) || null
  }, [data, selectedContractId])

  const formDefaults: ContractFormValues = useMemo(() => {
    if (contract) {
      const matched = invoiceClients.find(
        (c) => c.name.toLowerCase() === contract.firstName.toLowerCase()
      )
      return {
        contractCode: contract.username || `CTR-2026-${1000 + contracts.length}`,
        effectiveDate: '2026-01-01',
        validUntil: contract.validUntil || _defaultContractValidUntil,
        clientId: matched?.id || 'bright-enterprises',
        clientName: contract.firstName,
        clientEmail: contract.email,
        amount: contract.amount || '$120,000.00',
        serviceScope: 'Ocean Freight FCL & Inland Trucking Services',
        status: 'Active Contract',
        volumeCommitment: '50 TEUs / Month',
        guaranteedTransitTime: '18 - 22 Days Port-to-Port',
        freeStorageDays: '14 Days Free Storage at Destination',
        paymentTerms: 'Net 30 Days from Invoice Date',
        governingLaw: 'Indonesian Commercial Code / BANI Maritime Arbitration',
        terminationNotice: '60 Days Written Notice',
        liabilityCap: 'USD 250,000 per shipment claim',
        signatoryName: 'Hendra Wijaya (Managing Director)',
        terms: 'This binding agreement establishes service delivery performance objectives, SLA thresholds, freight rate stability guarantees, regulatory trade compliances, and general liability limitations.',
      }
    }
    return {
      contractCode: '',
      effectiveDate: '',
      validUntil: '',
      clientId: '',
      clientName: '',
      clientEmail: '',
      amount: '',
      serviceScope: '',
      status: 'Draft',
      volumeCommitment: '',
      guaranteedTransitTime: '',
      freeStorageDays: '',
      paymentTerms: '',
      governingLaw: '',
      terminationNotice: '',
      liabilityCap: '',
      signatoryName: '',
      terms: '',
    }
  }, [contract, contracts.length])

  const form = useForm<ContractFormValues>({ defaultValues: formDefaults })
  const w = useWatch({ control: form.control }) as ContractFormValues

  useEffect(() => {
    form.reset(formDefaults)
  }, [formDefaults, form])

  const activeClient = useMemo(() => {
    return invoiceClients.find((c) => c.id === w.clientId) || invoiceClients[0]
  }, [w.clientId])

  const handleSubmit = () => {
    toast.success(
      selectedContractId === 'new'
        ? `Contract ${w.contractCode} created!`
        : `Contract ${w.contractCode} updated!`
    )
    setSelectedContractId(null)
  }

  return (
    <FormProvider {...form}>
      <StandardDetailView
        title="Commercial Service Contract"
        subtitle="Define commercial agreements, rate commitments, SLAs, and formal contract terms."
        isNew={selectedContractId === 'new'}
        onBack={() => setSelectedContractId(null)}
        hasPreview={true}
        onPrint={() => window.print()}
        onDownload={() => toast.success('PDF download started!')}
        primaryActions={
          <>
            <Button type='button' variant='outline' onClick={() => toast.success('Contract draft saved!')}>
              <Save className='mr-1.5 size-4' />
              Save
            </Button>
            <Button type='button' onClick={handleSubmit}>
              <Send className='mr-1.5 size-4' />
              Finalize Contract
            </Button>
          </>
        }
        renderForm={() => (
          <form className='flex flex-col gap-4' noValidate onSubmit={(e) => e.preventDefault()}>
            <Tabs defaultValue='overview' className='w-full flex flex-col gap-4'>
              <TabsList className='w-full grid grid-cols-3'>
                <TabsTrigger value='overview'>Overview</TabsTrigger>
                <TabsTrigger value='sla'>SLA & Commitments</TabsTrigger>
                <TabsTrigger value='legal'>Legal & Governance</TabsTrigger>
              </TabsList>

              {/* TAB 1: OVERVIEW */}
              <TabsContent value='overview' className='space-y-4 pt-1'>
                <section className='flex flex-col gap-3'>
                  <FieldGroup>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Contract Reference Code</FieldLabel>
                      <InputGroup>
                        <InputGroupInput className='text-xs' {...form.register('contractCode')} />
                        <InputGroupAddon align='inline-end'>
                          <Hash className='h-3.5 w-3.5 text-muted-foreground' />
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>

                    <div className='grid gap-4 md:grid-cols-2'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Effective Start Date</FieldLabel>
                        <Controller
                          control={form.control}
                          name='effectiveDate'
                          render={({ field }) => (
                            <DatePicker id='effective-date' value={field.value} onChange={field.onChange} />
                          )}
                        />
                      </Field>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Contract Expiry Date</FieldLabel>
                        <Controller
                          control={form.control}
                          name='validUntil'
                          render={({ field }) => (
                            <DatePicker id='valid-until' value={field.value} onChange={field.onChange} />
                          )}
                        />
                      </Field>
                    </div>

                    <div className='grid gap-4 md:grid-cols-2 pt-1'>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Contract Annual Value</FieldLabel>
                        <Input className='text-xs font-semibold' {...form.register('amount')} />
                      </Field>
                      <Field className='gap-1'>
                        <FieldLabel className='text-xs font-medium'>Contract Lifecycle Status</FieldLabel>
                        <Select value={w.status} onValueChange={(v) => form.setValue('status', v)}>
                          <SelectTrigger className='w-full text-xs'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value='Active Contract'>Active Contract</SelectItem>
                              <SelectItem value='Under Renewal'>Under Renewal</SelectItem>
                              <SelectItem value='Draft Agreement'>Draft Agreement</SelectItem>
                              <SelectItem value='Expired'>Expired</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <Field className='gap-1 pt-1'>
                      <FieldLabel className='text-xs font-medium'>Scope of Logistics Services</FieldLabel>
                      <Input className='text-xs' {...form.register('serviceScope')} placeholder='e.g. Ocean Freight FCL & Inland Trucking' />
                    </Field>
                  </FieldGroup>
                </section>

                <Separator />

                <section className='flex flex-col gap-3'>
                  <h2 className='text-sm font-semibold tracking-tight text-foreground flex items-center gap-2'>
                    <Building2 className='h-4 w-4 text-muted-foreground' /> Contracting Client Party
                  </h2>
                  <Field className='gap-1'>
                    <FieldLabel className='text-xs font-medium'>Client Corporate Name</FieldLabel>
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
                      <FieldLabel className='text-xs font-medium'>Client Authorized Signatory</FieldLabel>
                      <Input className='text-xs' {...form.register('signatoryName')} />
                    </Field>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Client Tax ID / NPWP</FieldLabel>
                      <Input className='text-xs text-muted-foreground bg-muted/30' value={activeClient.taxId} readOnly />
                    </Field>
                  </div>
                </section>
              </TabsContent>

              {/* TAB 2: SLA & COMMITMENTS */}
              <TabsContent value='sla' className='space-y-4 pt-1'>
                <section className='flex flex-col gap-3'>
                  <h2 className='text-sm font-semibold tracking-tight text-foreground flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-muted-foreground' /> Service Level Commitments & Volume
                  </h2>

                  <div className='grid gap-4 md:grid-cols-2'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Minimum Volume Commitment</FieldLabel>
                      <Input className='text-xs' {...form.register('volumeCommitment')} placeholder='e.g. 50 TEUs / Month' />
                    </Field>

                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Guaranteed Transit Time SLA</FieldLabel>
                      <Input className='text-xs' {...form.register('guaranteedTransitTime')} placeholder='e.g. 18-22 Days Port-to-Port' />
                    </Field>
                  </div>

                  <div className='grid gap-4 md:grid-cols-2 pt-1'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Free Storage / Demurrage Days</FieldLabel>
                      <Input className='text-xs' {...form.register('freeStorageDays')} placeholder='e.g. 14 Days Free Storage' />
                    </Field>

                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Agreed Payment Terms</FieldLabel>
                      <Select value={w.paymentTerms} onValueChange={(v) => form.setValue('paymentTerms', v)}>
                        <SelectTrigger className='w-full text-xs'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='Net 30 Days from Invoice Date'>Net 30 Days from Invoice Date</SelectItem>
                            <SelectItem value='Net 14 Days from Invoice Date'>Net 14 Days from Invoice Date</SelectItem>
                            <SelectItem value='Net 60 Days for Priority Clients'>Net 60 Days for Priority Clients</SelectItem>
                            <SelectItem value='CAD - Cash Against Documents'>CAD - Cash Against Documents</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </section>
              </TabsContent>

              {/* TAB 3: LEGAL & GOVERNANCE */}
              <TabsContent value='legal' className='space-y-4 pt-1'>
                <section className='flex flex-col gap-3'>
                  <h2 className='text-sm font-semibold tracking-tight text-foreground flex items-center gap-2'>
                    <Scale className='h-4 w-4 text-muted-foreground' /> Legal Jurisdiction & Governance
                  </h2>

                  <Field className='gap-1'>
                    <FieldLabel className='text-xs font-medium'>Governing Law & Arbitration</FieldLabel>
                    <Input className='text-xs' {...form.register('governingLaw')} placeholder='e.g. Indonesian Commercial Code / BANI Maritime' />
                  </Field>

                  <div className='grid gap-4 md:grid-cols-2 pt-1'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Termination Notice Period</FieldLabel>
                      <Input className='text-xs' {...form.register('terminationNotice')} placeholder='e.g. 60 Days Written Notice' />
                    </Field>

                    <Field className='gap-1'>
                      <FieldLabel className='text-xs font-medium'>Liability Claim Limit Cap</FieldLabel>
                      <Input className='text-xs' {...form.register('liabilityCap')} placeholder='e.g. USD 250,000 per claim' />
                    </Field>
                  </div>
                </section>

                <Separator />

                <section className='flex flex-col gap-3'>
                  <h2 className='text-sm font-semibold tracking-tight text-foreground flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-muted-foreground' /> Detailed Terms & Master Declarations
                  </h2>

                  <Field className='gap-1'>
                    <FieldLabel className='text-xs font-medium'>Master Agreement Terms & Clauses</FieldLabel>
                    <Textarea {...form.register('terms')} className='min-h-[120px] text-xs' />
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
                <ContractPaper values={w} client={activeClient} />
              </div>
            </div>
          </div>
        )}
      />
    </FormProvider>
  )
}

/* Contract document paper */
function ContractPaper({ values, client }: { values: ContractFormValues; client: typeof invoiceClients[0] }) {
  const tableHeaders = [
    { key: 'scope', label: 'Contractual Service Scope', width: '40%' },
    { key: 'volume', label: 'Volume Commitment', width: '20%', align: 'center' as const },
    { key: 'transit', label: 'Transit Time SLA', width: '20%', align: 'center' as const },
    { key: 'amount', label: 'Annual Contract Value', width: '20%', align: 'right' as const },
  ]

  const tableRows = [
    {
      scope: values.serviceScope || 'Global Ocean & Air Freight SLA',
      volume: values.volumeCommitment || '120 TEU / Year',
      transit: values.guaranteedTransitTime || '14 Days Max',
      amount: values.amount || '$150,000.00',
    },
  ]

  return (
    <SapCorporateDocument
      documentTitle="SERVICE CONTRACT AGREEMENT"
      documentNumber={values.contractCode || 'CTR-2026-001'}
      issueDate={values.effectiveDate}
      dueDate={values.validUntil}
      status={values.status || 'ACTIVE CONTRACT'}
      partyA={{
        title: 'FIRST PARTY (LOGISTICS PROVIDER)',
        name: defaultInvoiceFrom.name,
        address: defaultInvoiceFrom.addressLines.join(', '),
        taxId: defaultInvoiceFrom.taxId,
        contact: defaultInvoiceFrom.email,
      }}
      partyB={{
        title: 'SECOND PARTY (CLIENT CORP)',
        name: client.name,
        address: client.addressLines.join(', '),
        taxId: client.taxId,
        contact: values.signatoryName || client.email,
      }}
      metadataGrid={[
        { label: 'Effective Date', value: values.effectiveDate || '2026-01-01' },
        { label: 'Validity Date', value: values.validUntil },
        { label: 'Free Storage SLA', value: values.freeStorageDays || '14 Days Free' },
        { label: 'Governing Law', value: values.governingLaw || 'Republic of Indonesia' },
      ]}
      tableHeaders={tableHeaders}
      tableRows={tableRows}
      totals={[
        { label: 'TOTAL ANNUAL CONTRACT VALUE', value: values.amount || '$150,000.00', isGrandTotal: true },
      ]}
      specialInstructions={`Termination Notice: ${values.terminationNotice || '30 Days Written Notice'} | Liability Cap: ${values.liabilityCap || '$50,000.00'}`}
      remarks={values.terms || 'Master Service Agreement executed under SAP ERP ONE Legal Framework.'}
      signatures={[
        { title: 'Logistics Provider Officer', name: defaultInvoiceFrom.issuerName, role: 'Legal Director', date: values.effectiveDate, showStamp: true },
        { title: 'Client Authorized Representative', name: values.signatoryName || 'Client Signatory', role: 'VP Operations', date: values.effectiveDate },
      ]}
    />
  )
}
