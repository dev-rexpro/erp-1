import { useState, useRef } from 'react'
import { usePartnerDirectory } from './partner-directory-provider'
import { partnerDirectory } from '../../data/procurement-data'
import { type PartnerDirectoryItem } from '../../data/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  FileSearch,
  Printer,
  Download,
  Building2,
  CreditCard,
  Save,
  Mail,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { INVOICE_PAPER_HEIGHT, INVOICE_PAPER_SCALE, INVOICE_PAPER_WIDTH } from '../../../client-invoices/components/invoice-form-data'
import { useVisibleCenterPosition } from '../../../client-invoices/components/use-visible-center-position'
import { StandardDetailView } from '@/components/templates'
import { useDbStore } from '@/stores/db-store'

export function PartnerDirectoryDetailView() {
  const { selectedPartnerId, setSelectedPartnerId } = usePartnerDirectory()
  const { vendors: partnerDirectory } = useDbStore()
  const [showPreview, setShowPreview] = useState(true)

  const partner = partnerDirectory.find((p: any) => p.id === selectedPartnerId) ?? partnerDirectory[0]
  const previewBodyRef = useRef<HTMLDivElement>(null)

  const paperLayout = useVisibleCenterPosition(previewBodyRef, {
    height: INVOICE_PAPER_HEIGHT,
    maxScale: INVOICE_PAPER_SCALE,
    width: INVOICE_PAPER_WIDTH,
  })

  return (
    <StandardDetailView
      title="Vendor Partner Profile"
      subtitle="Manage institutional vendor registration, KYC banking details, and service quality ratings."
      isNew={selectedPartnerId === 'new'}
      onBack={() => setSelectedPartnerId(null)}
      hasPreview={false}
      onPrint={() => window.print()}
      onDownload={() => toast.success('Vendor Registration Sheet downloaded as PDF.')}
      primaryActions={
        <>
          <Button variant='outline' onClick={() => window.open(`mailto:${partner.email}`)}>
            <Mail className='mr-1.5 size-4 text-slate-600' />
            Email Partner
          </Button>
          <Button type='button' onClick={() => toast.success(`Partner profile for ${partner.name} saved successfully!`)}>
            <Save className='mr-1.5 size-4' />
            Save Profile
          </Button>
        </>
      }
      renderForm={() => (
        <div className='flex flex-col gap-5'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800'>
              <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                <Building2 className='size-4 text-slate-500' /> General Entity Information
              </h3>
              <span className='px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200'>
                {partner.category}
              </span>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-muted-foreground'>Entity Legal Name</Label>
                <Input defaultValue={partner.name} className='font-semibold text-slate-900 dark:text-slate-100' />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-muted-foreground'>Partner Code / ID</Label>
                <Input defaultValue={partner.code} readOnly className='font-semibold text-xs bg-slate-50/50 dark:bg-slate-900/50' />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-muted-foreground'>Primary Contact Person</Label>
                <Input defaultValue={partner.contactPerson} />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-muted-foreground'>Email Communication</Label>
                <Input defaultValue={partner.email} type='email' />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-muted-foreground'>Telephone Switchboard</Label>
                <Input defaultValue={partner.phone} />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-muted-foreground'>Country & City</Label>
                <Input defaultValue={`${partner.city}, ${partner.country}`} />
              </div>
            </div>

            <div className='space-y-1.5 pt-1'>
              <Label className='text-xs font-medium text-muted-foreground'>Registered Corporate Address</Label>
              <Input defaultValue={partner.address} className='text-xs' />
            </div>
          </div>

          <div className='space-y-4 pt-4 border-t'>
            <div className='flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800'>
              <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                <CreditCard className='size-4 text-slate-500' /> Financial & KYC Parameters
              </h3>
              <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1'>
                <CheckCircle2 className='size-3.5' /> Verified KYC
              </span>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-muted-foreground'>Tax ID (NPWP / EIN)</Label>
                <Input defaultValue={partner.taxId} className='font-semibold text-xs text-slate-900 dark:text-slate-100' />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-muted-foreground'>Bank Account details</Label>
                <Input defaultValue={partner.bankAccount} className='text-xs' />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-muted-foreground'>Contract Payment Terms</Label>
                <Input defaultValue={partner.paymentTerms} className='font-medium' />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium text-muted-foreground'>Service Quality Rating</Label>
                <Input defaultValue={`${partner.rating.toFixed(1)} ★ (${partner.slaScore})`} readOnly className='bg-slate-50/50 dark:bg-slate-900/50 font-semibold text-slate-800 dark:text-slate-200' />
              </div>
            </div>
          </div>
        </div>
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
              <PartnerRegistrationSheet partner={partner} />
            </div>
          </div>
        </div>
      )}
    />
  )
}

function PartnerRegistrationSheet({ partner }: { partner: PartnerDirectoryItem }) {
  return (
    <div className='w-[800px] min-h-[1130px] bg-white text-slate-900 shadow-xl p-12 flex flex-col justify-between border border-slate-300'>
      <div className='space-y-8'>
        {/* Header Branding */}
        <div className='flex items-start justify-between border-b-2 border-slate-900 pb-6'>
          <div>
            <h2 className='text-2xl font-bold uppercase tracking-wide text-slate-900'>
              Rexcorp Global Trade
            </h2>
            <p className='text-xs font-semibold mt-1 text-slate-700'>
              ERP-ONE Vendor Registration & Compliance Bureau • Jakarta Headquarters
            </p>
            <p className='text-xs text-slate-600 mt-0.5'>
              Jl. Jend. Sudirman Kav. 52-53, Senayan, Kebayoran Baru, Jakarta Selatan 12190
            </p>
          </div>
          <div className='text-right'>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900 uppercase'>
              Vendor Record
            </h1>
            <p className='text-sm font-bold mt-1 text-slate-800'>Ref: {partner.code}</p>
            <p className='text-xs font-semibold text-slate-600 mt-0.5'>Status: {partner.status}</p>
          </div>
        </div>

        {/* Vendor Classification Banner */}
        <div className='p-5 border border-slate-300 bg-slate-50/60 rounded flex justify-between items-center'>
          <div>
            <span className='text-xs font-bold uppercase text-slate-500 block mb-1'>Certified Vendor Partner</span>
            <div className='text-xl font-bold text-slate-900'>{partner.name}</div>
            <div className='text-xs font-medium text-slate-600 mt-0.5'>Category: {partner.category} • Location: {partner.city}, {partner.country}</div>
          </div>
          <div className='text-right'>
            <div className='text-xs font-bold uppercase text-slate-500 mb-1'>SLA Performance Score</div>
            <div className='text-lg font-bold text-slate-900'>{partner.slaScore}</div>
            <div className='text-xs text-slate-600 font-semibold'>Rating: {partner.rating.toFixed(1)} / 5.0 ★</div>
          </div>
        </div>

        {/* Detailed KYC Matrix */}
        <div className='space-y-4'>
          <h3 className='text-sm font-bold uppercase text-slate-800 border-b border-slate-300 pb-2'>
            Entity Contact & Legal Credentials
          </h3>
          <div className='grid grid-cols-2 gap-6 text-xs'>
            <div className='space-y-2 border border-slate-200 p-4 rounded bg-white'>
              <div className='flex justify-between border-b border-slate-100 pb-1.5'>
                <span className='text-slate-500 font-medium'>Primary Contact Person:</span>
                <span className='font-bold text-slate-900'>{partner.contactPerson}</span>
              </div>
              <div className='flex justify-between border-b border-slate-100 pb-1.5'>
                <span className='text-slate-500 font-medium'>Email Communication:</span>
                <span className='font-semibold text-slate-900'>{partner.email}</span>
              </div>
              <div className='flex justify-between border-b border-slate-100 pb-1.5'>
                <span className='text-slate-500 font-medium'>Telephone Desk:</span>
                <span className='font-semibold text-slate-900'>{partner.phone}</span>
              </div>
              <div className='pt-1'>
                <span className='text-slate-500 font-medium block mb-0.5'>Corporate Address:</span>
                <span className='text-slate-800 font-medium leading-relaxed block'>{partner.address}</span>
              </div>
            </div>

            <div className='space-y-2 border border-slate-200 p-4 rounded bg-white'>
              <div className='flex justify-between border-b border-slate-100 pb-1.5'>
                <span className='text-slate-500 font-medium'>Tax ID Number (NPWP):</span>
                <span className='font-bold text-slate-900'>{partner.taxId}</span>
              </div>
              <div className='flex justify-between border-b border-slate-100 pb-1.5'>
                <span className='text-slate-500 font-medium'>Banking Account Ref:</span>
                <span className='font-bold text-slate-900'>{partner.bankAccount}</span>
              </div>
              <div className='flex justify-between border-b border-slate-100 pb-1.5'>
                <span className='text-slate-500 font-medium'>Contract Terms:</span>
                <span className='font-semibold text-slate-900'>{partner.paymentTerms}</span>
              </div>
              <div className='pt-1'>
                <span className='text-slate-500 font-medium block mb-0.5'>Audit & Qualification Note:</span>
                <span className='text-slate-700 leading-relaxed block'>Vendor partner meets ISO 9001 and DJBC supply chain security standard. Authorized for immediate purchase orders & tariff allocation.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className='pt-12 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs'>
        <div>
          <p className='text-slate-500 font-semibold mb-12'>Verified by Compliance Officer:</p>
          <div className='border-t border-slate-400 pt-2 w-48 font-bold text-slate-900'>
            Anita Setyawati (Auditor)
          </div>
        </div>
        <div className='text-right flex flex-col items-end'>
          <p className='text-slate-500 font-semibold mb-12'>Approved by VP Logistics & Trade:</p>
          <div className='border-t border-slate-400 pt-2 w-48 font-bold text-slate-900 text-center'>
            Fadhlur Rahman (Rexcorp)
          </div>
        </div>
      </div>
    </div>
  )
}
