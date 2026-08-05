import { useState, useRef } from 'react'
import { StandardDetailView } from '@/components/templates'
import { useVendorRates } from './vendor-rates-provider'
import { vendorRates } from '../../data/procurement-data'
import { type VendorRateItem } from '../../data/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  FileSearch,
  Printer,
  Download,
  ShieldCheck,
  Percent,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { INVOICE_PAPER_HEIGHT, INVOICE_PAPER_SCALE, INVOICE_PAPER_WIDTH } from '../../../client-invoices/components/invoice-form-data'
import { useVisibleCenterPosition } from '../../../client-invoices/components/use-visible-center-position'
import { useDbStore } from '@/stores/db-store'

export function VendorRatesDetailView() {
  const { selectedRateId, setSelectedRateId } = useVendorRates()
  const { vendorRates } = useDbStore()
  const [showPreview, setShowPreview] = useState(true)

  const rate = vendorRates.find((r) => r.id === selectedRateId) ?? vendorRates[0]
  const previewBodyRef = useRef<HTMLDivElement>(null)

  const paperLayout = useVisibleCenterPosition(previewBodyRef, {
    height: INVOICE_PAPER_HEIGHT,
    maxScale: INVOICE_PAPER_SCALE,
    width: INVOICE_PAPER_WIDTH,
  })

  return (
    <div className='flex flex-col gap-6 pb-12'>
      <StandardDetailView
        title="Vendor Rate Contract Details"
        subtitle="Review carrier transport tariffs, BAF fuel index adjustments, and volume tier agreements."
        isNew={selectedRateId === 'new'}
        onBack={() => setSelectedRateId(null)}
        hasPreview={false}
        onPrint={() => window.print()}
        onDownload={() => toast.success('Rate Agreement PDF exported.')}
        primaryActions={
          <>
            <Button
              variant='outline'
              onClick={() => toast.success(`Simulating volume rebate tier for ${rate.vendorName} on route ${rate.origin} → ${rate.destination}`)}
              className='h-9 gap-1.5 text-slate-700 dark:text-slate-300'
            >
              <img src='/rexpro-ai_logo.svg' alt='masbro' className='mr-1 size-4' />
              AI Rebate Simulator
            </Button>
            <Button type='button' onClick={() => toast.success(`Rate agreement ${rate.rateCode} confirmed & activated.`)} className='h-9 gap-1.5'>
              <Save className='mr-1.5 size-4' />
              Save Tariff Card
            </Button>
          </>
        }
        renderForm={() => (
          <div className='flex flex-col gap-5'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800'>
                <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                  <ShieldCheck className='size-4 text-slate-500' /> Carrier Route & Equipment Definition
                </h3>
                <span className='px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase'>
                  {rate.serviceMode}
                </span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Carrier Vendor Name</Label>
                  <Input defaultValue={rate.vendorName} className='font-semibold text-slate-900 dark:text-slate-100' />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Tariff Rate Code</Label>
                  <Input defaultValue={rate.rateCode} readOnly className='font-semibold text-xs bg-slate-50/50 dark:bg-slate-900/50' />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Origin (Port / Terminal)</Label>
                  <Input defaultValue={rate.origin} className='font-medium' />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Destination (Port / Depot)</Label>
                  <Input defaultValue={rate.destination} className='font-medium' />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Equipment Type / Unit</Label>
                  <Input defaultValue={rate.equipmentType} />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Est. Transit Duration</Label>
                  <Input defaultValue={rate.transitDays} />
                </div>
              </div>
            </div>

            <div className='space-y-4 pt-4 border-t'>
              <div className='flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800'>
                <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                  <Percent className='size-4 text-slate-500' /> Financial Tariffs & BAF Adjustments
                </h3>
                <span className='text-xs text-muted-foreground'>Currency: {rate.currency}</span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Base Rate (USD)</Label>
                  <Input defaultValue={`$${rate.baseRate.toLocaleString('en-US')}`} className='font-semibold text-slate-900 dark:text-slate-100' />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Fuel BAF Surcharge (%)</Label>
                  <Input defaultValue={`${rate.fuelSurchargePct}%`} className='font-semibold text-slate-700 dark:text-slate-300' />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Effective Total Rate</Label>
                  <Input defaultValue={`$${rate.effectiveRate.toLocaleString('en-US')}`} readOnly className='bg-slate-50/50 dark:bg-slate-900/50 font-bold text-slate-900 dark:text-slate-100' />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 text-xs pt-2'>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>Contract Validity Range</Label>
                  <Input defaultValue={`${rate.validFrom} to ${rate.validUntil}`} readOnly className='text-xs bg-slate-50/30' />
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>Master Agreement Ref</Label>
                  <Input defaultValue={rate.contractRef} readOnly className='text-xs font-semibold bg-slate-50/30' />
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
                <TariffAgreementSheet rate={rate} />
              </div>
            </div>
          </div>
        )}
      />
    </div>
  )
}

function TariffAgreementSheet({ rate }: { rate: VendorRateItem }) {
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
              ERP-ONE Carrier Procurement & Tariff Bureau • Jakarta Headquarters
            </p>
            <p className='text-xs text-slate-600 mt-0.5'>
              Jl. Jend. Sudirman Kav. 52-53, Senayan, Kebayoran Baru, Jakarta Selatan 12190
            </p>
          </div>
          <div className='text-right'>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900 uppercase'>
              Tariff Agreement
            </h1>
            <p className='text-sm font-bold mt-1 text-slate-800'>{rate.rateCode}</p>
            <p className='text-xs font-semibold text-slate-600 mt-0.5'>Ref: {rate.contractRef}</p>
          </div>
        </div>

        {/* Carrier & Route Summary */}
        <div className='grid grid-cols-2 gap-8 text-xs'>
          <div className='p-4 border border-slate-300 bg-slate-50/60 space-y-1.5 rounded'>
            <span className='font-bold uppercase text-slate-700 block border-b border-slate-200 pb-1 mb-1'>
              Contracted Carrier Vendor
            </span>
            <div className='font-bold text-sm text-slate-900'>{rate.vendorName}</div>
            <div className='text-slate-700 font-medium'>Vendor Code: {rate.vendorCode}</div>
            <div className='text-slate-600 uppercase font-semibold'>Mode: {rate.serviceMode}</div>
          </div>
          <div className='p-4 border border-slate-300 bg-slate-50/60 space-y-1.5 rounded'>
            <span className='font-bold uppercase text-slate-700 block border-b border-slate-200 pb-1 mb-1'>
              Transport Corridor & Transit
            </span>
            <div className='font-semibold text-slate-900'>Route Origin: {rate.origin}</div>
            <div className='font-semibold text-slate-900'>Route Dest: {rate.destination}</div>
            <div className='text-slate-700'>Est. Transit: {rate.transitDays}</div>
          </div>
        </div>

        {/* Tariff Matrix Table */}
        <div className='space-y-2'>
          <h3 className='text-xs font-bold uppercase text-slate-700'>Contracted Fee & Surcharge Structure</h3>
          <table className='w-full text-xs text-left border-collapse'>
            <thead>
              <tr className='border-b-2 border-slate-900 font-bold uppercase text-slate-800 bg-slate-100'>
                <th className='py-3 px-3'>Equipment / Service Unit</th>
                <th className='py-3 px-3'>Currency</th>
                <th className='py-3 px-3 text-right'>Base Rate</th>
                <th className='py-3 px-3 text-right'>Fuel BAF (%)</th>
                <th className='py-3 px-3 text-right font-bold'>Effective Rate</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200'>
              <tr className='h-12'>
                <td className='py-3 px-3 font-semibold text-slate-900'>{rate.equipmentType}</td>
                <td className='py-3 px-3 text-slate-700 font-semibold'>{rate.currency}</td>
                <td className='py-3 px-3 text-right font-semibold'>${rate.baseRate.toLocaleString('en-US')}.00</td>
                <td className='py-3 px-3 text-right text-slate-700'>+{rate.fuelSurchargePct}%</td>
                <td className='py-3 px-3 text-right font-bold text-slate-900 text-sm'>
                  ${rate.effectiveRate.toLocaleString('en-US')}.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terms & Validity Note */}
        <div className='p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 space-y-1.5'>
          <span className='font-bold uppercase block text-slate-800'>Agreement Terms & Conditions:</span>
          <p>This tariff rate card remains strictly valid from <strong>{rate.validFrom}</strong> until <strong>{rate.validUntil}</strong> under master agreement <strong>{rate.contractRef}</strong>. All bookings allocated under this agreement shall be guaranteed capacity and invoiced in strict accordance with the effective rate above.</p>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className='pt-12 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs'>
        <div>
          <p className='text-slate-500 font-semibold mb-12'>Confirmed by Carrier Trade VP:</p>
          <div className='border-t border-slate-400 pt-2 w-48 font-bold text-slate-900'>
            Authorized Trade Representative
          </div>
        </div>
        <div className='text-right flex flex-col items-end'>
          <p className='text-slate-500 font-semibold mb-12'>Approved by Rexcorp Procurement:</p>
          <div className='border-t border-slate-400 pt-2 w-48 font-bold text-slate-900 text-center'>
            Fadhlur Rahman (Rexcorp)
          </div>
        </div>
      </div>
    </div>
  )
}
