import { useState } from 'react'
import {
  ArrowLeft,
  Printer,
  Download,
  CreditCard,
  Edit,
  RotateCcw,
  ShieldCheck,
  MoreVertical,
  GitBranch,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBills } from './bills-provider'
import { VendorBillItem } from '../../data/finance-data'
import { DocumentFlowView, DocumentFlowNode } from '@/components/document-flow-view'
import { toast } from 'sonner'

interface BillsDetailViewProps {
  data: VendorBillItem[]
}

export function BillsDetailView({ data }: BillsDetailViewProps) {
  const { selectedBillId, setSelectedBillId } = useBills()

  const initialItem = data.find((i) => i.id === selectedBillId) || data[0]
  const [item, setItem] = useState<VendorBillItem>(initialItem)

  // Edit Form State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editVendor, setEditVendor] = useState(item.vendorName)
  const [editSubtotal, setEditSubtotal] = useState(item.subtotal.toString())
  const [editTax, setEditTax] = useState(item.taxAmount.toString())
  const [editPoRef, setEditPoRef] = useState(item.poReference)

  // Cancellation State
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Full Page Document Flow View State
  const [isDocFlowViewActive, setIsDocFlowViewActive] = useState(false)

  const isEditable = item.paymentStatus !== 'Paid'

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleSaveEdit = () => {
    const sub = parseFloat(editSubtotal) || item.subtotal
    const tax = parseFloat(editTax) || item.taxAmount
    const total = sub + tax

    const updated = {
      ...item,
      vendorName: editVendor,
      subtotal: sub,
      taxAmount: tax,
      totalAmount: total,
      poReference: editPoRef,
    }
    setItem(updated)
    setIsEditDialogOpen(false)
    toast.success(`Vendor Bill ${item.billNumber} updated successfully!`)
  }

  const handleCancelSubmit = () => {
    if (!cancelReason) return
    setIsCancelOpen(false)
    toast.success(`AP Credit Memo / Reversal Chain request for ${item.billNumber} submitted.`)
    setCancelReason('')
  }

  // ERP Interconnected Document Flow Nodes
  const billsDocFlowNodes: DocumentFlowNode[] = [
    {
      id: '1',
      docType: 'Carrier Purchase Order',
      docNumber: item.poReference,
      lineItem: '01',
      quantity: 1,
      unit: 'JOB',
      refValue: item.totalAmount,
      currency: 'USD',
      date: '2026-06-01',
      time: '10:00:00',
      status: 'Completed',
      children: [
        {
          id: '1-1',
          docType: 'Shipping Instruction & Manifest',
          docNumber: item.shipmentRef,
          lineItem: '01',
          quantity: 1,
          unit: 'JOB',
          date: '2026-06-05',
          time: '14:30:00',
          status: 'Completed',
          children: [
            {
              id: '1-1-1',
              docType: 'Terminal Gate Goods Receipt',
              docNumber: 'GR-2026-089',
              lineItem: '01',
              quantity: 1,
              unit: 'JOB',
              date: '2026-06-10',
              time: '09:15:00',
              status: 'Completed',
              children: [
                {
                  id: '1-1-1-1',
                  docType: 'Vendor Carrier Bill (AP)',
                  docNumber: item.billNumber,
                  lineItem: '10',
                  quantity: 1,
                  unit: 'JOB',
                  refValue: item.totalAmount,
                  currency: 'USD',
                  date: item.billDate,
                  time: '16:45:12',
                  status: item.paymentStatus === 'Paid' ? 'Completed' : 'In Process',
                  children: [
                    {
                      id: '1-1-1-1-1',
                      docType: 'AP Accounting Journal Entry',
                      docNumber: 'JV-AP-2026-401',
                      quantity: 1,
                      unit: 'JOB',
                      refValue: item.totalAmount,
                      currency: 'USD',
                      date: item.billDate,
                      time: '16:50:00',
                      status: 'Cleared',
                    },
                    {
                      id: '1-1-1-1-2',
                      docType: 'Vendor Tax Certificate (PPh 23 Withholding)',
                      docNumber: 'PPH23-2026-11',
                      quantity: 1,
                      unit: 'JOB',
                      refValue: item.taxAmount,
                      currency: 'USD',
                      date: item.billDate,
                      time: '16:50:00',
                      status: 'Cleared',
                    },
                    {
                      id: '1-1-1-1-3',
                      docType: 'Bank Disbursement Payment Voucher',
                      docNumber: 'PAY-DISB-881',
                      quantity: 1,
                      unit: 'JOB',
                      refValue: item.totalAmount,
                      currency: 'USD',
                      date: '2026-06-28',
                      time: '11:20:00',
                      status: item.paymentStatus === 'Paid' ? 'Cleared' : 'Not Cleared',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]

  if (isDocFlowViewActive) {
    return (
      <DocumentFlowView
        docNumber={item.billNumber}
        businessPartner={`${item.vendorCode} (${item.vendorName})`}
        materialOrRef={`Vendor Carrier Expenses (${item.billNumber})`}
        initialNodes={billsDocFlowNodes}
        onBack={() => setIsDocFlowViewActive(false)}
      />
    )
  }

  return (
    <div className='flex flex-col gap-6 animate-fade-in pb-10'>
      {/* Top Header Navigation */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4'>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setSelectedBillId(null)}
            className='h-8 w-8 p-0 border-slate-300 dark:border-slate-700'
          >
            <ArrowLeft className='size-4' />
          </Button>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
                Vendor Bill: {item.billNumber}
              </h1>
              <Badge variant='outline' className='border-slate-300 text-xs font-semibold'>
                {item.paymentStatus}
              </Badge>
            </div>
            <p className='text-xs text-slate-500'>
              Vendor: {item.vendorName} ({item.vendorCode})
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          {isEditable && (
            <Button size='sm' variant='outline' onClick={() => setIsEditDialogOpen(true)} className='border-slate-300 dark:border-slate-700 font-medium'>
              <Edit className='mr-1.5 size-4' />
              Edit Bill
            </Button>
          )}

          <Button size='sm' onClick={() => toast.success('Disbursement scheduled')} className='bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'>
            <CreditCard className='mr-1.5 size-4' />
            Process Payment
          </Button>

          {/* MoreVert Header Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='h-9 w-9 p-0 border-slate-300 dark:border-slate-700'>
                <MoreVertical className='size-4 text-slate-600 dark:text-slate-400' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-52'>
              <DropdownMenuLabel className='text-xs'>Document Operations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDocFlowViewActive(true)} className='gap-2 text-xs font-semibold cursor-pointer'>
                <GitBranch className='size-4 text-slate-700 dark:text-slate-300' />
                Document Flow
              </DropdownMenuItem>
              {!isEditable && (
                <DropdownMenuItem onClick={() => setIsCancelOpen(true)} className='gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300'>
                  <RotateCcw className='size-4 text-slate-500' />
                  Request AP Credit Memo
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => window.print()} className='gap-2 text-xs cursor-pointer'>
                <Printer className='size-4 text-slate-500' />
                Print Voucher
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success('Bill Voucher PDF Downloaded')} className='gap-2 text-xs cursor-pointer'>
                <Download className='size-4 text-slate-500' />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info('Audit Log Exported')} className='gap-2 text-xs cursor-pointer'>
                Export Audit Log
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Subtotal Net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{formatCurrency(item.subtotal)}</div>
            <p className='mt-1 text-xs text-slate-500'>Before taxes</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Tax (PPN/PPH)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{formatCurrency(item.taxAmount)}</div>
            <p className='mt-1 text-xs text-slate-500'>Applicable VAT</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Total Gross Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{formatCurrency(item.totalAmount)}</div>
            <p className='mt-1 text-xs text-slate-500'>Due date: {item.dueDate}</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Approval Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{item.approvalStatus}</div>
            <p className='mt-1 text-xs text-slate-500'>Method: {item.paymentMethod}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Breakdown */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2 border-slate-200 shadow-none dark:border-slate-800'>
          <CardHeader className='border-b border-slate-100 dark:border-slate-800 pb-3'>
            <CardTitle className='text-base font-semibold text-slate-900 dark:text-slate-100'>
              Carrier Charges Line Items
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader className='bg-slate-100/60 dark:bg-slate-800/60'>
                <TableRow className='border-slate-200 dark:border-slate-800'>
                  <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Carrier Expense Item</TableHead>
                  <TableHead className='font-semibold text-slate-700 dark:text-slate-300 text-right'>Subtotal</TableHead>
                  <TableHead className='font-semibold text-slate-700 dark:text-slate-300 text-right'>Tax</TableHead>
                  <TableHead className='font-semibold text-slate-700 dark:text-slate-300 text-right'>Total (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className='border-slate-200 dark:border-slate-800'>
                  <TableCell className='font-medium text-slate-900 dark:text-slate-100'>Freight Charges ({item.shipmentRef})</TableCell>
                  <TableCell className='text-right'>{formatCurrency(item.subtotal)}</TableCell>
                  <TableCell className='text-right'>{formatCurrency(item.taxAmount)}</TableCell>
                  <TableCell className='text-right font-bold'>{formatCurrency(item.totalAmount)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-none dark:border-slate-800'>
          <CardHeader className='border-b border-slate-100 dark:border-slate-800 pb-3'>
            <CardTitle className='text-base font-semibold text-slate-900 dark:text-slate-100'>
              PO Matching & Vendor Info
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 space-y-4 text-xs'>
            <div>
              <span className='text-slate-400 block mb-1'>Vendor Name</span>
              <span className='font-semibold text-sm text-slate-800 dark:text-slate-200'>{item.vendorName}</span>
              <div className='text-slate-500 mt-0.5'>{item.vendorCode}</div>
            </div>

            <div className='border-t border-slate-100 dark:border-slate-800 pt-3'>
              <span className='text-slate-400 block mb-1'>PO & Shipment Matching</span>
              <div className='font-medium text-slate-700 dark:text-slate-300'>{item.poReference} / {item.shipmentRef}</div>
            </div>

            <div className='border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2'>
              <span className='text-slate-400 block mb-1'>Disbursement Log</span>
              <div className='flex items-center justify-between text-slate-600 dark:text-slate-400'>
                <span>Bill Received</span>
                <span>{item.billDate}</span>
              </div>
              <div className='flex items-center justify-between text-slate-600 dark:text-slate-400'>
                <span>Approval Signed</span>
                <span>{item.approvalStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Bill Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-md border-slate-200 dark:border-slate-800'>
          <DialogHeader>
            <DialogTitle className='text-slate-900 dark:text-slate-100'>Edit Vendor Bill</DialogTitle>
            <DialogDescription className='text-slate-500'>
              Update vendor bill details for {item.billNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-3 py-2 text-xs'>
            <div className='space-y-1'>
              <Label className='text-xs font-medium'>Vendor Name</Label>
              <Input value={editVendor} onChange={(e) => setEditVendor(e.target.value)} className='border-slate-300 dark:border-slate-700' />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Label className='text-xs font-medium'>Subtotal (USD)</Label>
                <Input type='number' value={editSubtotal} onChange={(e) => setEditSubtotal(e.target.value)} className='border-slate-300 dark:border-slate-700' />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs font-medium'>Tax Amount (USD)</Label>
                <Input type='number' value={editTax} onChange={(e) => setEditTax(e.target.value)} className='border-slate-300 dark:border-slate-700' />
              </div>
            </div>
            <div className='space-y-1'>
              <Label className='text-xs font-medium'>PO Reference</Label>
              <Input value={editPoRef} onChange={(e) => setEditPoRef(e.target.value)} className='border-slate-300 dark:border-slate-700' />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditDialogOpen(false)} className='border-slate-300'>Cancel</Button>
            <Button onClick={handleSaveEdit} className='bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SAP Credit Memo / Storno Chain Request Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className='sm:max-w-md border-slate-200 dark:border-slate-800'>
          <DialogHeader>
            <DialogTitle className='text-slate-900 dark:text-slate-100 flex items-center gap-2'>
              <ShieldCheck className='size-5 text-slate-600' />
              Request AP Credit Memo / Cancellation Chain
            </DialogTitle>
            <DialogDescription className='text-slate-500 text-xs'>
              This bill ({item.billNumber}) is posted/paid. Reversing requires AP Supervisor approval for credit memo issuance.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-2 py-2 text-xs'>
            <Label className='font-semibold text-slate-800 dark:text-slate-200'>Cancellation Reason & Justification</Label>
            <Input
              placeholder='e.g., Vendor rebate adjustment / Carrier overcharge claim...'
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className='border-slate-300 dark:border-slate-700'
            />
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCancelOpen(false)} className='border-slate-300'>Cancel</Button>
            <Button onClick={handleCancelSubmit} className='bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'>Submit Chain Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
