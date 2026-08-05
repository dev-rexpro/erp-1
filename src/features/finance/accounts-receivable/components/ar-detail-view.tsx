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
import { useAR } from './ar-provider'
import { AccountsReceivableItem } from '../../data/finance-data'
import { DocumentFlowView, DocumentFlowNode } from '@/components/document-flow-view'
import { toast } from 'sonner'

interface ARDetailViewProps {
  data: AccountsReceivableItem[]
}

export function ARDetailView({ data }: ARDetailViewProps) {
  const { selectedArId, setSelectedArId } = useAR()

  const initialItem = data.find((i) => i.id === selectedArId) || data[0]
  const [item, setItem] = useState<AccountsReceivableItem>(initialItem)

  // Edit Form Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState(item.customerName)
  const [editAmount, setEditAmount] = useState(item.amount.toString())
  const [editTerms, setEditTerms] = useState(item.paymentTerms)
  const [editDueDate, setEditDueDate] = useState(item.dueDate)

  // Cancellation Chain Dialog State
  const [isCancelChainOpen, setIsCancelChainOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Full Page Document Flow View State
  const [isDocFlowViewActive, setIsDocFlowViewActive] = useState(false)

  const isEditable = item.status !== 'Paid'

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleSaveEdit = () => {
    const newAmt = parseFloat(editAmount) || item.amount
    const updated = {
      ...item,
      customerName: editCustomer,
      amount: newAmt,
      balanceDue: Math.max(0, newAmt - item.paidAmount),
      paymentTerms: editTerms,
      dueDate: editDueDate,
    }
    setItem(updated)
    setIsEditDialogOpen(false)
    toast.success(`AR Record ${item.invoiceNumber} updated successfully!`)
  }

  const handleInitiateCancellationChain = () => {
    if (!cancelReason) return
    setIsCancelChainOpen(false)
    toast.success(`Cancellation Chain initiated for ${item.invoiceNumber}. Approval request sent to Finance Manager.`)
    setCancelReason('')
  }

  // ERP Interconnected Document Flow Nodes
  const arDocFlowNodes: DocumentFlowNode[] = [
    {
      id: '1',
      docType: 'Logistics Service Contract',
      docNumber: 'CT-2026-8812',
      lineItem: '01',
      quantity: 2,
      unit: 'FEU',
      refValue: item.amount,
      currency: 'USD',
      date: '2026-05-15',
      time: '09:00:00',
      status: 'Completed',
      children: [
        {
          id: '1-1',
          docType: 'Ocean Freight Quotation',
          docNumber: 'QT-2026-402',
          lineItem: '01',
          quantity: 2,
          unit: 'FEU',
          date: '2026-05-20',
          time: '11:15:00',
          status: 'Completed',
          children: [
            {
              id: '1-1-1',
              docType: 'Packing List & Cargo Manifest',
              docNumber: 'PL-2026-0941',
              lineItem: '01',
              quantity: 2,
              unit: 'FEU',
              date: '2026-06-01',
              time: '14:20:00',
              status: 'Completed',
              children: [
                {
                  id: '1-1-1-1',
                  docType: 'House Bill of Lading (HBL)',
                  docNumber: 'BL-9041-JKT',
                  lineItem: '01',
                  quantity: 2,
                  unit: 'FEU',
                  refValue: item.amount,
                  currency: 'USD',
                  date: '2026-06-05',
                  time: '16:45:00',
                  status: 'Completed',
                  children: [
                    {
                      id: '1-1-1-1-1',
                      docType: 'Goods Issue & Terminal Dispatch',
                      docNumber: 'THC-2026-301',
                      lineItem: '01',
                      quantity: 2,
                      unit: 'FEU',
                      date: '2026-06-10',
                      time: '08:30:00',
                      status: 'Completed',
                    },
                    {
                      id: '1-1-1-1-2',
                      docType: 'Commercial Sales Invoice',
                      docNumber: item.invoiceNumber,
                      lineItem: '10',
                      quantity: 2,
                      unit: 'FEU',
                      refValue: item.amount,
                      currency: 'USD',
                      date: item.issueDate,
                      time: '10:00:00',
                      status: item.status === 'Paid' ? 'Completed' : 'In Process',
                      children: [
                        {
                          id: '1-1-1-1-2-1',
                          docType: 'AR Accounting Journal Entry',
                          docNumber: 'JV-2026-0941',
                          quantity: 2,
                          unit: 'FEU',
                          refValue: item.amount,
                          currency: 'USD',
                          date: item.issueDate,
                          time: '10:05:00',
                          status: item.status === 'Paid' ? 'Cleared' : 'Not Cleared',
                        },
                        {
                          id: '1-1-1-1-2-2',
                          docType: 'Tax Invoice Certificate (e-Faktur PPN 11%)',
                          docNumber: 'FPT-2026-8812',
                          quantity: 2,
                          unit: 'FEU',
                          date: item.issueDate,
                          time: '10:05:00',
                          status: 'Cleared',
                        },
                        {
                          id: '1-1-1-1-2-3',
                          docType: 'Customer Bank Collection Receipt',
                          docNumber: 'PAY-2026-901',
                          quantity: 2,
                          unit: 'FEU',
                          refValue: item.paidAmount,
                          currency: 'USD',
                          date: '2026-07-15',
                          time: '14:30:00',
                          status: item.status === 'Paid' ? 'Cleared' : 'Not Cleared',
                        },
                      ],
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
        docNumber={item.invoiceNumber}
        businessPartner={`${item.customerCode} (${item.customerName})`}
        materialOrRef={`Ocean Freight Service (${item.invoiceNumber})`}
        initialNodes={arDocFlowNodes}
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
            onClick={() => setSelectedArId(null)}
            className='h-8 w-8 p-0 border-slate-300 dark:border-slate-700'
          >
            <ArrowLeft className='size-4' />
          </Button>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
                AR Statement: {item.invoiceNumber}
              </h1>
              <Badge variant='outline' className='border-slate-300 text-xs font-semibold'>
                {item.status}
              </Badge>
            </div>
            <p className='text-xs text-slate-500'>
              Customer Account: {item.customerName} ({item.customerCode})
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          {isEditable && (
            <Button size='sm' variant='outline' onClick={() => setIsEditDialogOpen(true)} className='border-slate-300 dark:border-slate-700 font-medium'>
              <Edit className='mr-1.5 size-4' />
              Edit Record
            </Button>
          )}

          <Button size='sm' onClick={() => toast.success('Collection Notice Sent')} className='bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'>
            <CreditCard className='mr-1.5 size-4' />
            Send Notice
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
                <DropdownMenuItem onClick={() => setIsCancelChainOpen(true)} className='gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300'>
                  <RotateCcw className='size-4 text-slate-500' />
                  Request Cancellation Chain
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => window.print()} className='gap-2 text-xs cursor-pointer'>
                <Printer className='size-4 text-slate-500' />
                Print Statement
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success('Statement PDF Downloaded')} className='gap-2 text-xs cursor-pointer'>
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
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Original Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{formatCurrency(item.amount)}</div>
            <p className='mt-1 text-xs text-slate-500'>Issued on {item.issueDate}</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Paid to Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{formatCurrency(item.paidAmount)}</div>
            <p className='mt-1 text-xs text-slate-500'>Cleared collections</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Balance Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{formatCurrency(item.balanceDue)}</div>
            <p className='mt-1 text-xs text-slate-500'>Payment due by {item.dueDate}</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Aging Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{item.agingCategory}</div>
            <p className='mt-1 text-xs text-slate-500'>Terms: {item.paymentTerms}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Breakdown */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2 border-slate-200 shadow-none dark:border-slate-800'>
          <CardHeader className='border-b border-slate-100 dark:border-slate-800 pb-3'>
            <CardTitle className='text-base font-semibold text-slate-900 dark:text-slate-100'>
              Invoice Breakdown & Line Items
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader className='bg-slate-100/60 dark:bg-slate-800/60'>
                <TableRow className='border-slate-200 dark:border-slate-800'>
                  <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Service Description</TableHead>
                  <TableHead className='font-semibold text-slate-700 dark:text-slate-300 text-right'>Qty / Units</TableHead>
                  <TableHead className='font-semibold text-slate-700 dark:text-slate-300 text-right'>Rate</TableHead>
                  <TableHead className='font-semibold text-slate-700 dark:text-slate-300 text-right'>Amount (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className='border-slate-200 dark:border-slate-800'>
                  <TableCell className='font-medium text-slate-900 dark:text-slate-100'>Ocean Freight & Handling Charges</TableCell>
                  <TableCell className='text-right'>2 FEU</TableCell>
                  <TableCell className='text-right'>$15,000</TableCell>
                  <TableCell className='text-right font-medium'>$30,000</TableCell>
                </TableRow>
                <TableRow className='border-slate-200 dark:border-slate-800'>
                  <TableCell className='font-medium text-slate-900 dark:text-slate-100'>Terminal Handling Fee (THC)</TableCell>
                  <TableCell className='text-right'>2 FEU</TableCell>
                  <TableCell className='text-right'>$2,500</TableCell>
                  <TableCell className='text-right font-medium'>$5,000</TableCell>
                </TableRow>
                <TableRow className='border-slate-200 dark:border-slate-800'>
                  <TableCell className='font-medium text-slate-900 dark:text-slate-100'>Customs Clearance & Documentation</TableCell>
                  <TableCell className='text-right'>1 Job</TableCell>
                  <TableCell className='text-right'>$10,000</TableCell>
                  <TableCell className='text-right font-medium'>$10,000</TableCell>
                </TableRow>
                <TableRow className='border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 font-bold'>
                  <TableCell colSpan={3} className='text-right text-slate-900 dark:text-slate-100'>Total Invoiced Amount</TableCell>
                  <TableCell className='text-right text-slate-900 dark:text-slate-100'>{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-none dark:border-slate-800'>
          <CardHeader className='border-b border-slate-100 dark:border-slate-800 pb-3'>
            <CardTitle className='text-base font-semibold text-slate-900 dark:text-slate-100'>
              Account Info & History
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 space-y-4 text-xs'>
            <div>
              <span className='text-slate-400 block mb-1'>Customer Account</span>
              <span className='font-semibold text-sm text-slate-800 dark:text-slate-200'>{item.customerName}</span>
              <div className='text-slate-500 mt-0.5'>{item.customerCode} • Assigned: {item.salesPerson}</div>
            </div>

            <div className='border-t border-slate-100 dark:border-slate-800 pt-3'>
              <span className='text-slate-400 block mb-1'>Credit Terms & Limit</span>
              <div className='font-medium text-slate-700 dark:text-slate-300'>{item.paymentTerms} (Max Credit: $250,000)</div>
            </div>

            <div className='border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2'>
              <span className='text-slate-400 block mb-1'>Collection Log</span>
              <div className='flex items-center justify-between text-slate-600 dark:text-slate-400'>
                <span>Invoice Generated</span>
                <span>{item.issueDate}</span>
              </div>
              <div className='flex items-center justify-between text-slate-600 dark:text-slate-400'>
                <span>Reminder Notice Sent</span>
                <span>2026-07-10</span>
              </div>
              <div className='flex items-center justify-between font-medium text-slate-900 dark:text-slate-100'>
                <span>Partial Collection</span>
                <span>{formatCurrency(item.paidAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-md border-slate-200 dark:border-slate-800'>
          <DialogHeader>
            <DialogTitle className='text-slate-900 dark:text-slate-100'>Edit AR Document</DialogTitle>
            <DialogDescription className='text-slate-500'>
              Modify open Accounts Receivable parameters for {item.invoiceNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-3 py-2 text-xs'>
            <div className='space-y-1'>
              <Label className='text-xs font-medium'>Customer Name</Label>
              <Input value={editCustomer} onChange={(e) => setEditCustomer(e.target.value)} className='border-slate-300 dark:border-slate-700' />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs font-medium'>Total Amount (USD)</Label>
              <Input type='number' value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className='border-slate-300 dark:border-slate-700' />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Label className='text-xs font-medium'>Payment Terms</Label>
                <Input value={editTerms} onChange={(e) => setEditTerms(e.target.value)} className='border-slate-300 dark:border-slate-700' />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs font-medium'>Due Date</Label>
                <Input type='date' value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className='border-slate-300 dark:border-slate-700' />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditDialogOpen(false)} className='border-slate-300'>Cancel</Button>
            <Button onClick={handleSaveEdit} className='bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SAP Cancellation Chain Request Dialog */}
      <Dialog open={isCancelChainOpen} onOpenChange={setIsCancelChainOpen}>
        <DialogContent className='sm:max-w-md border-slate-200 dark:border-slate-800'>
          <DialogHeader>
            <DialogTitle className='text-slate-900 dark:text-slate-100 flex items-center gap-2'>
              <ShieldCheck className='size-5 text-slate-600' />
              Initiate Cancellation Chain
            </DialogTitle>
            <DialogDescription className='text-slate-500 text-xs'>
              This document ({item.invoiceNumber}) is locked. Reversing requires inter-departmental approval to trigger credit note posting.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-2 py-2 text-xs'>
            <Label className='font-semibold text-slate-800 dark:text-slate-200'>Cancellation Reason & Justification</Label>
            <Input
              placeholder='e.g., Client dispute settlement / Billing error adjustment...'
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className='border-slate-300 dark:border-slate-700'
            />
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCancelChainOpen(false)} className='border-slate-300'>Cancel</Button>
            <Button onClick={handleInitiateCancellationChain} className='bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'>Submit Chain Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
