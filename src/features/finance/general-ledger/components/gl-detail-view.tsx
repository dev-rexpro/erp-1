import { useState } from 'react'
import {
  ArrowLeft,
  Edit,
  RotateCcw,
  FileText,
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
import { useGL } from './gl-provider'
import { GeneralLedgerEntry } from '../../data/finance-data'
import { DocumentFlowView, DocumentFlowNode } from '@/components/document-flow-view'
import { toast } from 'sonner'

interface GLDetailViewProps {
  data: GeneralLedgerEntry[]
}

export function GLDetailView({ data }: GLDetailViewProps) {
  const { selectedVoucherId, setSelectedVoucherId } = useGL()

  const initialItem = data.find((i) => i.id === selectedVoucherId) || data[0]
  const [item, setItem] = useState<GeneralLedgerEntry>(initialItem)

  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editAccountName, setEditAccountName] = useState(item.accountName)
  const [editAccountCode, setEditAccountCode] = useState(item.accountCode)
  const [editDebit, setEditDebit] = useState(item.debit.toString())
  const [editCredit, setEditCredit] = useState(item.credit.toString())
  const [editMemo, setEditMemo] = useState(item.memo)

  // SAP Storno Reversal State
  const [isStornoOpen, setIsStornoOpen] = useState(false)
  const [stornoReason, setStornoReason] = useState('')

  // Full Page Document Flow View State
  const [isDocFlowViewActive, setIsDocFlowViewActive] = useState(false)

  const isEditable = (item.status as string) !== 'Posted'

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleSaveEdit = () => {
    const dVal = parseFloat(editDebit) || 0
    const cVal = parseFloat(editCredit) || 0

    const updated = {
      ...item,
      accountName: editAccountName,
      accountCode: editAccountCode,
      debit: dVal,
      credit: cVal,
      memo: editMemo,
    }
    setItem(updated)
    setIsEditDialogOpen(false)
    toast.success(`Journal Voucher ${item.voucherNo} updated successfully!`)
  }

  const handleStornoSubmit = () => {
    if (!stornoReason) return
    setIsStornoOpen(false)
    toast.success(`Reversing Voucher for ${item.voucherNo} generated in General Ledger.`)
    setStornoReason('')
  }

  // ERP Interconnected Document Flow Nodes
  const glDocFlowNodes: DocumentFlowNode[] = [
    {
      id: '1',
      docType: 'Logistics Service Contract',
      docNumber: 'CT-2026-8812',
      lineItem: '01',
      quantity: 1,
      unit: 'JOB',
      refValue: item.debit > 0 ? item.debit : item.credit,
      currency: 'USD',
      date: '2026-05-15',
      time: '09:00:00',
      status: 'Completed',
      children: [
        {
          id: '1-1',
          docType: 'Operation Booking Reference',
          docNumber: item.reference,
          lineItem: '01',
          quantity: 1,
          unit: 'JOB',
          date: '2026-06-01',
          time: '11:00:00',
          status: 'Completed',
          children: [
            {
              id: '1-1-1',
              docType: 'Sub-Ledger Commercial Billing',
              docNumber: 'INV-2026-0941',
              lineItem: '10',
              quantity: 1,
              unit: 'JOB',
              refValue: item.debit > 0 ? item.debit : item.credit,
              currency: 'USD',
              date: item.postingDate,
              time: '08:15:00',
              status: 'Completed',
              children: [
                {
                  id: '1-1-1-1',
                  docType: 'General Ledger Journal Voucher',
                  docNumber: item.voucherNo,
                  lineItem: '01',
                  quantity: 1,
                  unit: 'JOB',
                  refValue: item.debit > 0 ? item.debit : item.credit,
                  currency: 'USD',
                  date: item.postingDate,
                  time: '08:30:00',
                  status: item.status === 'Posted' ? 'Completed' : 'In Process',
                  children: [
                    {
                      id: '1-1-1-1-1',
                      docType: 'Chart of Accounts Ledger Line',
                      docNumber: `${item.accountCode} (${item.accountName})`,
                      quantity: 1,
                      unit: 'JOB',
                      refValue: item.debit > 0 ? item.debit : item.credit,
                      currency: 'USD',
                      date: item.postingDate,
                      time: '08:30:00',
                      status: 'Cleared',
                    },
                    {
                      id: '1-1-1-1-2',
                      docType: 'Fiscal Period Trial Balance Audit',
                      docNumber: `TB-${item.period}-AUDIT`,
                      quantity: 1,
                      unit: 'JOB',
                      date: item.postingDate,
                      time: '08:30:00',
                      status: 'Cleared',
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
        docNumber={item.voucherNo}
        businessPartner='PT Global Nusantara Trade'
        materialOrRef={`Journal Entry Allocation (${item.voucherNo})`}
        initialNodes={glDocFlowNodes}
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
            onClick={() => setSelectedVoucherId(null)}
            className='h-8 w-8 p-0 border-slate-300 dark:border-slate-700'
          >
            <ArrowLeft className='size-4' />
          </Button>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
                Journal Voucher: {item.voucherNo}
              </h1>
              <Badge variant='outline' className='border-slate-300 text-xs font-semibold'>
                {item.status}
              </Badge>
            </div>
            <p className='text-xs text-slate-500'>
              Posting Date: {item.postingDate} • Period: {item.period}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          {isEditable && (
            <Button size='sm' variant='outline' onClick={() => setIsEditDialogOpen(true)} className='border-slate-300 dark:border-slate-700 font-medium'>
              <Edit className='mr-1.5 size-4' />
              Edit Voucher Line
            </Button>
          )}

          <Button size='sm' onClick={() => window.print()} className='bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'>
            <FileText className='mr-1.5 size-4' />
            Print Ledger Entry
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
                <DropdownMenuItem onClick={() => setIsStornoOpen(true)} className='gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300'>
                  <RotateCcw className='size-4 text-slate-500' />
                  Post Reversing Voucher
                </DropdownMenuItem>
              )}
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
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Account Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-xl font-bold text-slate-900 dark:text-slate-100'>{item.accountCode}</div>
            <p className='mt-1 text-xs text-slate-500'>{item.accountType} Category</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Debit Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{item.debit > 0 ? formatCurrency(item.debit) : '—'}</div>
            <p className='mt-1 text-xs text-slate-500'>Debit entry line</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Credit Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{item.credit > 0 ? formatCurrency(item.credit) : '—'}</div>
            <p className='mt-1 text-xs text-slate-500'>Credit entry line</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Posting User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-xl font-bold text-slate-900 dark:text-slate-100'>{item.createdBy}</div>
            <p className='mt-1 text-xs text-slate-500'>Authorized poster</p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Breakdown */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2 border-slate-200 shadow-none dark:border-slate-800'>
          <CardHeader className='border-b border-slate-100 dark:border-slate-800 pb-3'>
            <CardTitle className='text-base font-semibold text-slate-900 dark:text-slate-100'>
              Journal Entry Postings & Double-Entry Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader className='bg-slate-100/60 dark:bg-slate-800/60'>
                <TableRow className='border-slate-200 dark:border-slate-800'>
                  <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Account Code & Title</TableHead>
                  <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Line Memo / Ref</TableHead>
                  <TableHead className='font-semibold text-slate-700 dark:text-slate-300 text-right'>Debit (USD)</TableHead>
                  <TableHead className='font-semibold text-slate-700 dark:text-slate-300 text-right'>Credit (USD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className='border-slate-200 dark:border-slate-800'>
                  <TableCell className='font-medium text-slate-900 dark:text-slate-100'>{item.accountCode} - {item.accountName}</TableCell>
                  <TableCell className='text-slate-600 dark:text-slate-400'>{item.memo}</TableCell>
                  <TableCell className='text-right font-bold'>{item.debit > 0 ? formatCurrency(item.debit) : '—'}</TableCell>
                  <TableCell className='text-right font-bold'>{item.credit > 0 ? formatCurrency(item.credit) : '—'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-none dark:border-slate-800'>
          <CardHeader className='border-b border-slate-100 dark:border-slate-800 pb-3'>
            <CardTitle className='text-base font-semibold text-slate-900 dark:text-slate-100'>
              Voucher Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 space-y-4 text-xs'>
            <div>
              <span className='text-slate-400 block mb-1'>Reference ID</span>
              <span className='font-semibold text-sm text-slate-800 dark:text-slate-200'>{item.reference}</span>
            </div>

            <div className='border-t border-slate-100 dark:border-slate-800 pt-3'>
              <span className='text-slate-400 block mb-1'>Posting Period</span>
              <div className='font-medium text-slate-700 dark:text-slate-300'>Fiscal Window {item.period} ({item.postingDate})</div>
            </div>

            <div className='border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2'>
              <span className='text-slate-400 block mb-1'>Audit History</span>
              <div className='flex items-center justify-between text-slate-600 dark:text-slate-400'>
                <span>Journal Created</span>
                <span>{item.postingDate}</span>
              </div>
              <div className='flex items-center justify-between text-slate-600 dark:text-slate-400'>
                <span>Trial Balance Verified</span>
                <span>Balanced ($0 Diff)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Voucher Line Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-md border-slate-200 dark:border-slate-800'>
          <DialogHeader>
            <DialogTitle className='text-slate-900 dark:text-slate-100'>Edit Unposted Journal Line</DialogTitle>
            <DialogDescription className='text-slate-500'>
              Modify voucher entry line for {item.voucherNo}.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-3 py-2 text-xs'>
            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Label className='text-xs font-medium'>Account Code</Label>
                <Input value={editAccountCode} onChange={(e) => setEditAccountCode(e.target.value)} className='border-slate-300 dark:border-slate-700' />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs font-medium'>Account Title</Label>
                <Input value={editAccountName} onChange={(e) => setEditAccountName(e.target.value)} className='border-slate-300 dark:border-slate-700' />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Label className='text-xs font-medium'>Debit Amount (USD)</Label>
                <Input type='number' value={editDebit} onChange={(e) => setEditDebit(e.target.value)} className='border-slate-300 dark:border-slate-700' />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs font-medium'>Credit Amount (USD)</Label>
                <Input type='number' value={editCredit} onChange={(e) => setEditCredit(e.target.value)} className='border-slate-300 dark:border-slate-700' />
              </div>
            </div>
            <div className='space-y-1'>
              <Label className='text-xs font-medium'>Line Memo</Label>
              <Input value={editMemo} onChange={(e) => setEditMemo(e.target.value)} className='border-slate-300 dark:border-slate-700' />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditDialogOpen(false)} className='border-slate-300'>Cancel</Button>
            <Button onClick={handleSaveEdit} className='bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SAP Storno Reversal Dialog */}
      <Dialog open={isStornoOpen} onOpenChange={setIsStornoOpen}>
        <DialogContent className='sm:max-w-md border-slate-200 dark:border-slate-800'>
          <DialogHeader>
            <DialogTitle className='text-slate-900 dark:text-slate-100 flex items-center gap-2'>
              <ShieldCheck className='size-5 text-slate-600' />
              Post Reversing Voucher (Storno)
            </DialogTitle>
            <DialogDescription className='text-slate-500 text-xs'>
              Under double-entry audit rules, posted General Ledger entries cannot be edited. A reversing Storno voucher will be generated in period {item.period}.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-2 py-2 text-xs'>
            <Label className='font-semibold text-slate-800 dark:text-slate-200'>Storno Reversal Reason</Label>
            <Input
              placeholder='e.g., Fiscal period adjustment / Double-entry allocation correction...'
              value={stornoReason}
              onChange={(e) => setStornoReason(e.target.value)}
              className='border-slate-300 dark:border-slate-700'
            />
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsStornoOpen(false)} className='border-slate-300'>Cancel</Button>
            <Button onClick={handleStornoSubmit} className='bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'>Generate Storno Voucher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
