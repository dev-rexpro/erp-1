import { useRef, useMemo, useEffect } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { Save, Send, AlertCircle, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { StandardDetailView } from '@/components/templates'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { type Invoice } from '../data/schema'
import { useInvoices } from './invoices-provider'
import { useRbacStore } from '@/stores/rbac-store'

import {
  defaultInvoiceValues,
  invoiceClients,
  INVOICE_PAPER_HEIGHT,
  INVOICE_PAPER_SCALE,
  INVOICE_PAPER_WIDTH,
  getInitialInvoiceFormValues,
  type InvoiceFormValues,
} from './invoice-form-data'
import { getCompanySettings } from '@/lib/company-settings'
import { InvFormDetails } from './inv-form-details'
import { InvFormClient } from './inv-form-client'
import { InvFormItems } from './inv-form-items'
import { InvFormAdjustments } from './inv-form-adjustments'
import { InvPaper } from './inv-paper'
import { useVisibleCenterPosition } from './use-visible-center-position'

interface InvoiceDetailViewProps {
  data: Invoice[]
}

export function InvoiceDetailView({ data }: InvoiceDetailViewProps) {
  const { selectedInvoiceId, setSelectedInvoiceId } = useInvoices()
  const { canAccessModule, getActiveRole } = useRbacStore()
  const previewBodyRef = useRef<HTMLDivElement>(null)

  const canWrite = canAccessModule('finance', 'write')
  const activeRole = getActiveRole()

  const paperLayout = useVisibleCenterPosition(previewBodyRef, {
    height: INVOICE_PAPER_HEIGHT,
    maxScale: INVOICE_PAPER_SCALE,
    width: INVOICE_PAPER_WIDTH,
  })

  const invoice = useMemo(() => {
    if (selectedInvoiceId === 'new') return null
    return data.find((inv) => inv.id === selectedInvoiceId) || null
  }, [data, selectedInvoiceId])

  // Map existing invoice data to the versi2 form schema
  const formDefaults: InvoiceFormValues = useMemo(() => {
    if (invoice) {
      const numericVal = parseFloat(invoice.amount.replace(/[^0-9.]/g, '')) || 1000
      const matchedClient = invoiceClients.find(
        (c) => c.name.toLowerCase() === invoice.firstName.toLowerCase()
      )
      const settings = getCompanySettings()
      return {
        referenceNumber: invoice.username,
        issuedDate: new Date(invoice.createdAt).toISOString().split('T')[0],
        paymentDueDate: invoice.dueDate,
        from: {
          name: settings.name,
          email: settings.email,
          phone: settings.phone,
          website: settings.website,
          addressLines: [settings.address],
          taxId: settings.npwp,
          paymentAccountName: settings.bankAccountName,
          routingNumber: settings.bankAccount,
          issuerName: 'Authorized Signature Person',
        },
        to: matchedClient || defaultInvoiceValues.to,
        taxId: 'vat',
        discountType: 'fixed',
        discountValue: 0,
        poNumber: 'PO-2026-9912',
        shipTo: 'PT Rexindo Aruna Sedaya Main Warehouse, Port of Tanjung Priok, Jakarta, Indonesia',
        bankName: settings.bankName,
        bankAccount: settings.bankAccount,
        bankAccountName: settings.bankAccountName,
        logoUrl: settings.logoUrl,
        stampUrl: settings.stampUrl,
        notes: 'Thank you for your business.',
        items: [
          {
            id: 'item-1',
            description: 'Logistics Advisory and DevOps Consultation Services',
            quantity: 1,
            unitPrice: numericVal,
          },
        ],
      }
    }
    return getInitialInvoiceFormValues()
  }, [invoice])

  const form = useForm<InvoiceFormValues>({ defaultValues: formDefaults })
  const invoiceWatch = useWatch({ control: form.control }) as InvoiceFormValues

  useEffect(() => {
    form.reset(formDefaults)
  }, [formDefaults, form])

  const handleSubmit = () => {
    if (!canWrite) {
      toast.error(`Akses Ditolak: Peran ${activeRole?.name || 'User'} hanya memiliki akses Baca (Read-Only) pada modul Finance.`)
      return
    }
    toast.success(
      selectedInvoiceId === 'new'
        ? `Invoice ${invoiceWatch.referenceNumber} created!`
        : `Invoice ${invoiceWatch.referenceNumber} updated!`
    )
    setSelectedInvoiceId(null)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        form.setValue('logoUrl', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        form.setValue('stampUrl', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <FormProvider {...form}>
      <StandardDetailView
        title="Invoice"
        subtitle="Add invoice details, review the preview, and send it to your client."
        isNew={selectedInvoiceId === 'new'}
        onBack={() => setSelectedInvoiceId(null)}
        hasPreview={true}
        onPrint={handlePrint}
        onDownload={() => toast.success('PDF download started!')}
        primaryActions={
          <>
            <Button
              type='button'
              variant='outline'
              disabled={!canWrite}
              onClick={() => {
                if (!canWrite) {
                  toast.error(`Akses Ditolak: Hak akses Read-Only (${activeRole?.name}).`)
                  return
                }
                toast.success('Invoice saved successfully!')
              }}
            >
              <Save className='mr-1.5 size-4' />
              Save
            </Button>
            <Button type='button' disabled={!canWrite} onClick={handleSubmit}>
              {canWrite ? <Send className='mr-1.5 size-4' /> : <Lock className='mr-1.5 size-4' />}
              Send Invoice
            </Button>
          </>
        }
        renderForm={() => (
          <Tabs defaultValue='invoice' className='flex flex-col gap-4'>
            {!canWrite && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span><strong>Akses Read-Only:</strong> Peran <em>{activeRole?.name}</em> tidak memiliki izin Tulis / Edit untuk modul Finance & Invoicing. Halaman ini hanya untuk peninjauan data.</span>
              </div>
            )}
            <TabsList className='w-full'>
              <TabsTrigger value='invoice'>Invoice</TabsTrigger>
              <TabsTrigger value='payment'>Payment</TabsTrigger>
              <TabsTrigger value='business'>Business</TabsTrigger>
            </TabsList>

            <TabsContent value='invoice' className='flex flex-col gap-4 mt-0'>
              <InvFormDetails />
              <Separator />
              <InvFormClient />
              <Separator />
              <InvFormItems />
              <Separator />
              <InvFormAdjustments />
            </TabsContent>

            <TabsContent value='payment' className='flex flex-col gap-4 mt-0'>
              <section className='flex flex-col gap-3'>
                <h2 className='font-medium tracking-tight text-sm'>Bank Details</h2>
                <FieldGroup>
                  <Field className='gap-1'>
                    <FieldLabel className='text-xs' htmlFor='bank-name'>Bank Name</FieldLabel>
                    <Input id='bank-name' {...form.register('bankName')} placeholder='e.g., MANDIRI' />
                  </Field>
                  <Field className='gap-1'>
                    <FieldLabel className='text-xs' htmlFor='bank-account'>Account Number</FieldLabel>
                    <Input id='bank-account' {...form.register('bankAccount')} placeholder='e.g., 123-456-7890' />
                  </Field>
                  <Field className='gap-1'>
                    <FieldLabel className='text-xs' htmlFor='bank-account-name'>Account Holder / A/N</FieldLabel>
                    <Input id='bank-account-name' {...form.register('bankAccountName')} placeholder='e.g., PT REXINDO ARUNA SEDAYA' />
                  </Field>
                </FieldGroup>
              </section>
            </TabsContent>

            <TabsContent value='business' className='flex flex-col gap-4 mt-0'>
              <section className='flex flex-col gap-3'>
                <h2 className='font-medium tracking-tight text-sm'>Business Identity & Visuals</h2>
                <FieldGroup>
                  <Field className='gap-1'>
                    <FieldLabel className='text-xs' htmlFor='logo-upload'>Upload Company Logo</FieldLabel>
                    <Input id='logo-upload' type='file' accept='image/*' onChange={handleLogoUpload} />
                    {invoiceWatch.logoUrl && (
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='text-[10px] text-green-600 font-semibold'>Logo loaded successfully</span>
                        <Button type='button' variant='ghost' size='sm' className='h-5 px-1.5 text-destructive text-[10px]' onClick={() => form.setValue('logoUrl', '')}>Clear</Button>
                      </div>
                    )}
                  </Field>
                  <Field className='gap-1'>
                    <FieldLabel className='text-xs' htmlFor='stamp-upload'>Upload Company Stamp & Signature</FieldLabel>
                    <Input id='stamp-upload' type='file' accept='image/*' onChange={handleStampUpload} />
                    {invoiceWatch.stampUrl && (
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='text-[10px] text-green-600 font-semibold'>Stamp loaded successfully</span>
                        <Button type='button' variant='ghost' size='sm' className='h-5 px-1.5 text-destructive text-[10px]' onClick={() => form.setValue('stampUrl', '')}>Clear</Button>
                      </div>
                    )}
                  </Field>
                  <Field className='gap-1'>
                    <FieldLabel className='text-xs' htmlFor='notes'>Invoice Notes</FieldLabel>
                    <Textarea id='notes' {...form.register('notes')} placeholder='Terms, manual comments, etc...' className='min-h-[80px]' />
                  </Field>
                </FieldGroup>
              </section>
            </TabsContent>
          </Tabs>
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
                height: paperLayout
                  ? INVOICE_PAPER_HEIGHT * paperLayout.scale
                  : INVOICE_PAPER_HEIGHT * INVOICE_PAPER_SCALE,
                top: paperLayout?.top ?? '50%',
                transform: paperLayout === null ? 'translate(-50%, -50%)' : 'translateX(-50%)',
                width: paperLayout ? INVOICE_PAPER_WIDTH * paperLayout.scale : INVOICE_PAPER_WIDTH * INVOICE_PAPER_SCALE,
              }}
              className='absolute left-1/2 opacity-0 data-[ready=true]:opacity-100 print-paper-wrapper-parent'
              data-ready={paperLayout !== null}
            >
              <div
                style={{ transform: `scale(${paperLayout?.scale ?? INVOICE_PAPER_SCALE})` }}
                className='origin-top-left print-paper-wrapper'
              >
                <InvPaper invoice={invoiceWatch} />
              </div>
            </div>
          </div>
        )}
      />
    </FormProvider>
  )
}
