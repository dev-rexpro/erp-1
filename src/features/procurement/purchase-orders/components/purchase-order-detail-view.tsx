import { useState, useRef } from 'react'
import { StandardDetailView } from '@/components/templates'
import { SapCorporateDocument } from '@/components/templates/sap-corporate-document'
import { defaultInvoiceFrom } from '@/features/client-invoices/components/invoice-form-data'
import { usePurchaseOrders } from './purchase-orders-provider'
import { purchaseOrders } from '../../data/procurement-data'
import { type PurchaseOrderItem } from '../../data/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DocumentFlowView, type DocumentFlowNode } from '@/components/document-flow-view'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  MoreVertical,
  FileSearch,
  Printer,
  Download,
  GitBranch,
  CheckCircle2,
  Building2,
  Layers,
  RefreshCw,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { INVOICE_PAPER_HEIGHT, INVOICE_PAPER_SCALE, INVOICE_PAPER_WIDTH } from '../../../client-invoices/components/invoice-form-data'
import { useVisibleCenterPosition } from '../../../client-invoices/components/use-visible-center-position'
import { useDbStore } from '@/stores/db-store'

export function PurchaseOrderDetailView() {
  const { selectedPoId, setSelectedPoId } = usePurchaseOrders()
  const { purchaseOrders } = useDbStore()
  const [showPreview, setShowPreview] = useState(true)
  const [showDocFlow, setShowDocFlow] = useState(false)
  const [isRevisionMode, setIsRevisionMode] = useState(false)

  const po = purchaseOrders.find((p) => p.id === selectedPoId) ?? purchaseOrders[0]
  const previewBodyRef = useRef<HTMLDivElement>(null)

  const paperLayout = useVisibleCenterPosition(previewBodyRef, {
    height: INVOICE_PAPER_HEIGHT,
    maxScale: INVOICE_PAPER_SCALE,
    width: INVOICE_PAPER_WIDTH,
  })

  const flowNodes: DocumentFlowNode[] = [
    {
      id: 'flow-1',
      docType: 'Quotation',
      docNumber: po.linkedQuotation ?? 'QT-2026-1001',
      date: po.orderDate,
      time: '09:30 AM',
      status: 'Completed',
      refValue: po.totalAmount,
      currency: po.currency,
      children: [
        {
          id: 'flow-2',
          docType: 'Contract / SLA',
          docNumber: po.linkedContract ?? 'CTR-2026-1001',
          date: po.orderDate,
          time: '11:15 AM',
          status: 'Completed',
          refValue: po.totalAmount * 12,
          currency: po.currency,
          children: [
            {
              id: 'flow-3',
              docType: 'Shipment Order',
              docNumber: po.linkedShipment ?? 'SHP-2026-1001',
              date: po.deliveryDate,
              time: '08:00 AM',
              status: 'Active',
              refValue: po.totalAmount,
              currency: po.currency,
              children: [
                {
                  id: 'flow-4',
                  docType: 'Purchase Order (Current)',
                  docNumber: po.poNumber,
                  date: po.orderDate,
                  time: '14:20 PM',
                  status: po.status === 'Completed' ? 'Completed' : 'Active',
                  refValue: po.totalAmount,
                  currency: po.currency,
                  children: po.linkedVendorBill
                    ? [
                        {
                          id: 'flow-5',
                          docType: 'Vendor Bill',
                          docNumber: po.linkedVendorBill,
                          date: po.deliveryDate,
                          time: '16:00 PM',
                          status: 'In Process',
                          refValue: po.totalAmount,
                          currency: po.currency,
                        },
                      ]
                    : [],
                },
              ],
            },
          ],
        },
      ],
    },
  ]

  const handleApprove = () => {
    toast.success(`Purchase Order ${po.poNumber} officially approved & released in ERP document flow.`)
    setIsRevisionMode(false)
  }

  const handleRevisionRequest = () => {
    toast.warning(`PO ${po.poNumber} placed in Revision state. Reroute through approval workflow.`)
    setIsRevisionMode(true)
  }

  if (showDocFlow) {
    return (
      <DocumentFlowView
        docNumber={po.poNumber}
        businessPartner={`${po.vendorCode} (${po.vendorName})`}
        materialOrRef={`Procurement PO (${po.poNumber})`}
        initialNodes={flowNodes}
        onBack={() => setShowDocFlow(false)}
      />
    )
  }

  return (
    <div className='flex flex-col gap-6 pb-12'>
      <StandardDetailView
        title="Purchase Order Details"
        subtitle="Review contracted vendor allocations, operational service items, and document flow."
        isNew={selectedPoId === 'new'}
        onBack={() => setSelectedPoId(null)}
        hasPreview={true}
        onPrint={() => window.print()}
        onDownload={() => toast.success('PDF Purchase Order generated!')}
        primaryActions={
          <>
            {isRevisionMode ? (
              <Button
                size='sm'
                className='h-9 gap-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                onClick={handleApprove}
              >
                <CheckCircle2 className='size-4' />
                Approve & Release
              </Button>
            ) : (
              <Button size='sm' onClick={() => toast.success('Sent electronic PO copy to vendor.')} className='h-9 gap-1.5 bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 font-semibold'>
                <Send className='mr-1.5 size-4' />
                Share Vendor Copy
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-9 w-9 p-0 border-slate-300 dark:border-slate-700'>
                  <MoreVertical className='size-4 text-slate-600 dark:text-slate-400' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-52'>
                <DropdownMenuLabel className='text-xs'>Document Operations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowDocFlow(true)} className='gap-2 text-xs font-semibold cursor-pointer'>
                  <GitBranch className='size-4 text-slate-700 dark:text-slate-300' />
                  Document Flow
                </DropdownMenuItem>
                {!isRevisionMode && (
                  <DropdownMenuItem onClick={handleRevisionRequest} className='gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300'>
                    <RefreshCw className='size-4 text-slate-500' />
                    Request Revision
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => window.print()} className='gap-2 text-xs cursor-pointer'>
                  <Printer className='size-4 text-slate-500' />
                  Print Purchase Order
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success('PDF Purchase Order downloaded')} className='gap-2 text-xs cursor-pointer'>
                  <Download className='size-4 text-slate-500' />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info('Audit Log Exported')} className='gap-2 text-xs cursor-pointer'>
                  Export Audit Log
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
        renderForm={() => (
          <div className='flex flex-col gap-5'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800'>
                <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                  <Building2 className='size-4 text-slate-500' /> Vendor Partner Parameters
                </h3>
                <span className='text-xs text-muted-foreground'>Currency: {po.currency}</span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Vendor Name</Label>
                  <Input defaultValue={po.vendorName} readOnly={!isRevisionMode} className='font-semibold bg-slate-50/50 dark:bg-slate-900/50' />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Vendor Account Code</Label>
                  <Input defaultValue={po.vendorCode} readOnly className='font-semibold text-xs bg-slate-50/50 dark:bg-slate-900/50' />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Order Issue Date</Label>
                  <Input defaultValue={po.orderDate} readOnly={!isRevisionMode} type='date' className='bg-slate-50/50 dark:bg-slate-900/50' />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>Required Delivery Date</Label>
                  <Input defaultValue={po.deliveryDate} readOnly={!isRevisionMode} type='date' className='font-semibold text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-900/50' />
                </div>
              </div>

              <div className='space-y-1.5 pt-2'>
                <Label className='text-xs font-medium text-muted-foreground'>Operational Scope & Instructions</Label>
                <textarea
                  rows={2}
                  defaultValue={po.notes}
                  readOnly={!isRevisionMode}
                  className='w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400'
                />
              </div>
            </div>

            <div className='space-y-4 pt-4 border-t'>
              <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                <Layers className='size-4 text-slate-500' /> Contracted Line Items
              </h3>
              <div className='border rounded-md overflow-hidden'>
                <table className='w-full text-left text-xs'>
                  <thead className='bg-slate-100/70 dark:bg-slate-800/70 border-b text-slate-600 dark:text-slate-400 font-semibold uppercase text-[11px]'>
                    <tr>
                      <th className='p-2.5'>Description</th>
                      <th className='p-2.5 text-right'>Qty</th>
                      <th className='p-2.5'>Unit</th>
                      <th className='p-2.5 text-right'>Unit Rate</th>
                      <th className='p-2.5 text-right font-bold'>Total Value</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {po.lineItems.map((item: any, i: number) => (
                      <tr key={i} className='hover:bg-slate-50/50 dark:hover:bg-slate-900/30'>
                        <td className='p-2.5 font-medium text-slate-900 dark:text-slate-100'>{item.description}</td>
                        <td className='p-2.5 text-right font-semibold'>{item.qty}</td>
                        <td className='p-2.5 text-slate-500'>{item.unit}</td>
                        <td className='p-2.5 text-right'>${item.unitPrice.toLocaleString()}</td>
                        <td className='p-2.5 text-right font-bold text-slate-900 dark:text-slate-100'>
                          ${item.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='flex flex-col items-end gap-1.5 text-xs pt-2'>
                <div className='flex justify-between w-48 text-muted-foreground'>
                  <span>Subtotal:</span>
                  <span className='font-semibold text-foreground'>${po.subtotal.toLocaleString()}.00</span>
                </div>
                <div className='flex justify-between w-48 text-muted-foreground'>
                  <span>VAT (11%):</span>
                  <span className='font-semibold text-foreground'>${po.taxAmount.toLocaleString()}.00</span>
                </div>
                <div className='flex justify-between w-48 text-slate-900 dark:text-slate-100 font-bold text-sm pt-2 border-t'>
                  <span>Total Payable:</span>
                  <span>${po.totalAmount.toLocaleString()}.00</span>
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
                <PurchaseOrderPaper po={po} />
              </div>
            </div>
          </div>
        )}
      />
    </div>
  )
}

function PurchaseOrderPaper({ po }: { po: PurchaseOrderItem }) {
  const tableHeaders = [
    { key: 'itemNo', label: 'Item', width: '8%', align: 'center' as const },
    { key: 'description', label: 'Material / Service Description', width: '42%' },
    { key: 'qty', label: 'Qty', width: '12%', align: 'center' as const },
    { key: 'unitPrice', label: 'Unit Rate (USD)', width: '18%', align: 'right' as const },
    { key: 'totalPrice', label: 'Total Value (USD)', width: '20%', align: 'right' as const },
  ]

  const tableRows = po.lineItems.map((item, i) => ({
    itemNo: i + 1,
    description: item.description,
    qty: `${item.qty} ${item.unit}`,
    unitPrice: `$${item.unitPrice.toLocaleString()}`,
    totalPrice: `$${item.totalPrice.toLocaleString()}`,
  }))

  return (
    <SapCorporateDocument
      documentTitle="PURCHASE ORDER"
      documentNumber={po.poNumber}
      issueDate={po.orderDate}
      dueDate={po.deliveryDate}
      status={po.status?.toUpperCase() || 'APPROVED'}
      partyA={{
        title: 'BUYER / PROCUREMENT ISSUER',
        name: defaultInvoiceFrom.name,
        address: defaultInvoiceFrom.addressLines.join(', '),
        taxId: defaultInvoiceFrom.taxId,
        contact: defaultInvoiceFrom.email,
        extraLines: [{ label: 'Buyer Ref', value: 'Rexcorp Global Trade - Procurement' }],
      }}
      partyB={{
        title: 'VENDOR / SUPPLIER',
        name: po.vendorName,
        address: 'Main Industrial Partner Yard',
        taxId: `Vendor Code: ${po.vendorCode}`,
        contact: 'Net 30 Days Payment Terms',
      }}
      metadataGrid={[
        { label: 'Linked Shipment', value: po.linkedShipment ?? 'Direct Stock' },
        { label: 'Linked Quotation', value: po.linkedQuotation ?? 'N/A' },
        { label: 'Required Delivery', value: po.deliveryDate },
        { label: 'Payment Terms', value: 'Net 30 Days' },
      ]}
      tableHeaders={tableHeaders}
      tableRows={tableRows}
      totals={[
        { label: 'Subtotal Net Value', value: `$${po.subtotal.toLocaleString()}.00` },
        { label: 'Value Added Tax (11%)', value: `$${po.taxAmount.toLocaleString()}.00` },
        { label: 'TOTAL PURCHASE ORDER VALUE', value: `$${po.totalAmount.toLocaleString()}.00`, isGrandTotal: true },
      ]}
      specialInstructions={`Please quote PO Number ${po.poNumber} on all related vendor invoices, bills of lading, and shipping advice.`}
      remarks={po.notes || 'Purchased in accordance with SAP ERP ONE Procurement Standard Terms & Conditions.'}
      signatures={[
        { title: 'Vendor Representative Acceptance', name: 'Authorized Officer', role: 'Supplier Representative' },
        { title: 'ERP-ONE Authorized Manager', name: 'Fadhlur Rahman', role: 'Head of Procurement', showStamp: true, date: po.orderDate },
      ]}
    />
  )
}
