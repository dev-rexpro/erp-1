import { useState } from 'react'
import {
  ArrowLeft,
  RefreshCw,
  Edit,
  RotateCcw,
  ShieldCheck,
  MoreVertical,
  GitBranch,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { useAccruals } from './accruals-provider'
import { CostAccrualItem } from '../../data/finance-data'
import { DocumentFlowView, DocumentFlowNode } from '@/components/document-flow-view'
import { toast } from 'sonner'

interface AccrualsDetailViewProps {
  data: CostAccrualItem[]
}

export function AccrualsDetailView({ data }: AccrualsDetailViewProps) {
  const { selectedAccrualId, setSelectedAccrualId } = useAccruals()

  const initialItem = data.find((i) => i.id === selectedAccrualId) || data[0]
  const [item, setItem] = useState<CostAccrualItem>(initialItem)

  // Edit Form State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<CostAccrualItem['category']>(item.category)
  const [editVendor, setEditVendor] = useState(item.vendorName)
  const [editEstAmount, setEditEstAmount] = useState(item.estimatedAmount.toString())
  const [editNotes, setEditNotes] = useState(item.notes)

  // Reversal Request State
  const [isReversalOpen, setIsReversalOpen] = useState(false)
  const [reversalReason, setReversalReason] = useState('')

  // Full Page Document Flow View State
  const [isDocFlowViewActive, setIsDocFlowViewActive] = useState(false)

  const isEditable = item.status !== 'Fully Reconciled' && item.status !== 'Reversed'

  const formatCurrency = (val: number | null) => {
    if (val === null) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleSaveEdit = () => {
    const newEst = parseFloat(editEstAmount) || item.estimatedAmount
    const updated = {
      ...item,
      category: editCategory,
      vendorName: editVendor,
      estimatedAmount: newEst,
      variance: item.actualAmount !== null ? item.actualAmount - newEst : null,
      notes: editNotes,
    }
    setItem(updated)
    setIsEditDialogOpen(false)
    toast.success(`Accrual ${item.id} updated successfully!`)
  }

  const handleReversalSubmit = () => {
    if (!reversalReason) return
    setIsReversalOpen(false)
    toast.success(`Accrual Reversal request for ${item.id} submitted for approval.`)
    setReversalReason('')
  }

  // ERP Interconnected Document Flow Nodes
  const accrualDocFlowNodes: DocumentFlowNode[] = [
    {
      id: '1',
      docType: 'Carrier Master Agreement',
      docNumber: 'VND-AGR-1042',
      lineItem: '01',
      quantity: 2,
      unit: 'FEU',
      refValue: item.estimatedAmount,
      currency: 'USD',
      date: '2026-05-10',
      time: '08:30:00',
      status: 'Completed',
      children: [
        {
          id: '1-1',
          docType: 'Voyage Shipment Booking',
          docNumber: item.shipmentRef,
          lineItem: '01',
          quantity: 2,
          unit: 'FEU',
          date: '2026-06-01',
          time: '11:15:20',
          status: 'Completed',
          children: [
            {
              id: '1-1-1',
              docType: 'House Bill of Lading (HBL)',
              docNumber: item.blNumber,
              lineItem: '01',
              quantity: 2,
              unit: 'FEU',
              date: '2026-06-05',
              time: '14:00:00',
              status: 'Completed',
              children: [
                {
                  id: '1-1-1-1',
                  docType: 'Voyage Cost Accrual Provision',
                  docNumber: item.id,
                  lineItem: '10',
                  quantity: 2,
                  unit: 'FEU',
                  refValue: item.estimatedAmount,
                  currency: 'USD',
                  date: item.accrualDate,
                  time: '14:22:10',
                  status: item.status === 'Fully Reconciled' ? 'Completed' : 'In Process',
                  children: [
                    {
                      id: '1-1-1-1-1',
                      docType: 'Vendor Carrier Invoice (AP Bill)',
                      docNumber: 'VB-2026-4102',
                      lineItem: '01',
                      quantity: 2,
                      unit: 'FEU',
                      refValue: item.actualAmount || item.estimatedAmount,
                      currency: 'USD',
                      date: '2026-06-25',
                      time: '16:00:00',
                      status: item.actualAmount !== null ? 'Cleared' : 'In Process',
                      children: [
                        {
                          id: '1-1-1-1-1-1',
                          docType: 'FI Accrual Reconcile Journal Voucher',
                          docNumber: 'JV-2026-9045',
                          quantity: 2,
                          unit: 'FEU',
                          refValue: item.actualAmount || item.estimatedAmount,
                          currency: 'USD',
                          date: '2026-06-26',
                          time: '09:10:00',
                          status: item.status === 'Fully Reconciled' ? 'Cleared' : 'Not Cleared',
                        },
                        {
                          id: '1-1-1-1-1-2',
                          docType: 'Carrier Bank Disbursement Settlement',
                          docNumber: 'DISB-2026-112',
                          quantity: 2,
                          unit: 'FEU',
                          refValue: item.actualAmount || item.estimatedAmount,
                          currency: 'USD',
                          date: '2026-06-28',
                          time: '11:00:00',
                          status: item.status === 'Fully Reconciled' ? 'Cleared' : 'Not Cleared',
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
        docNumber={item.id}
        businessPartner={item.vendorName}
        materialOrRef={`Voyage Freight Provision (${item.shipmentRef})`}
        initialNodes={accrualDocFlowNodes}
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
            onClick={() => setSelectedAccrualId(null)}
            className='h-8 w-8 p-0 border-slate-300 dark:border-slate-700'
          >
            <ArrowLeft className='size-4' />
          </Button>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
                Cost Accrual: {item.id}
              </h1>
              <Badge variant='outline' className='border-slate-300 text-xs font-semibold'>
                {item.status}
              </Badge>
            </div>
            <p className='text-xs text-slate-500'>
              Category: {item.category} • Carrier: {item.vendorName}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          {isEditable && (
            <Button size='sm' variant='outline' onClick={() => setIsEditDialogOpen(true)} className='border-slate-300 dark:border-slate-700 font-medium'>
              <Edit className='mr-1.5 size-4' />
              Edit Provision
            </Button>
          )}

          <Button size='sm' onClick={() => toast.success('Reconciliation updated')} className='bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'>
            <RefreshCw className='mr-1.5 size-4' />
            Reconcile Vendor Bill
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
                <DropdownMenuItem onClick={() => setIsReversalOpen(true)} className='gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300'>
                  <RotateCcw className='size-4 text-slate-500' />
                  Request Accrual Reversal
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
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Estimated Provision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{formatCurrency(item.estimatedAmount)}</div>
            <p className='mt-1 text-xs text-slate-500'>Provisioned on {item.accrualDate}</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Actual Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{formatCurrency(item.actualAmount)}</div>
            <p className='mt-1 text-xs text-slate-500'>Vendor carrier invoice</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Cost Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {item.variance !== null ? (item.variance > 0 ? `+${formatCurrency(item.variance)}` : formatCurrency(item.variance)) : '—'}
            </div>
            <p className='mt-1 text-xs text-slate-500'>Est vs Actual diff</p>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-none dark:border-slate-800 dark:bg-slate-900/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Accrual Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-slate-100'>{item.status}</div>
            <p className='mt-1 text-xs text-slate-500'>Reconciliation state</p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Breakdown */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2 border-slate-200 shadow-none dark:border-slate-800'>
          <CardHeader className='border-b border-slate-100 dark:border-slate-800 pb-3'>
            <CardTitle className='text-base font-semibold text-slate-900 dark:text-slate-100'>
              Provision & Voyage Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 space-y-4 text-xs'>
            <div className='grid grid-cols-2 gap-2 border-b border-slate-100 dark:border-slate-800 pb-3'>
              <span className='text-slate-500'>Shipment Reference</span>
              <span className='font-semibold text-right text-slate-900 dark:text-slate-100'>{item.shipmentRef}</span>
            </div>
            <div className='grid grid-cols-2 gap-2 border-b border-slate-100 dark:border-slate-800 pb-3'>
              <span className='text-slate-500'>Bill of Lading (BL)</span>
              <span className='font-semibold text-right text-slate-900 dark:text-slate-100'>{item.blNumber}</span>
            </div>
            <div className='grid grid-cols-2 gap-2 border-b border-slate-100 dark:border-slate-800 pb-3'>
              <span className='text-slate-500'>Vendor / Service Provider</span>
              <span className='font-semibold text-right text-slate-900 dark:text-slate-100'>{item.vendorName}</span>
            </div>
            <div className='grid grid-cols-2 gap-2 pb-1'>
              <span className='text-slate-500'>Internal Line Notes</span>
              <span className='text-right text-slate-700 dark:text-slate-300'>{item.notes}</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-none dark:border-slate-800'>
          <CardHeader className='border-b border-slate-100 dark:border-slate-800 pb-3'>
            <CardTitle className='text-base font-semibold text-slate-900 dark:text-slate-100'>
              Reconciliation Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 space-y-3 text-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-slate-500'>Accrual Provision Created</span>
              <span className='font-medium'>{item.accrualDate}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-slate-500'>Carrier Bill Received</span>
              <span className='font-medium'>{item.actualAmount !== null ? '2026-07-22' : 'Pending'}</span>
            </div>
            <div className='flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100'>
              <span>Reconciliation Status</span>
              <span>{item.status}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Provision Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='sm:max-w-md border-slate-200 dark:border-slate-800'>
          <DialogHeader>
            <DialogTitle className='text-slate-900 dark:text-slate-100'>Edit Cost Accrual Provision</DialogTitle>
            <DialogDescription className='text-slate-500'>
              Update operational cost estimation for {item.id}.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-3 py-2 text-xs'>
            <div className='space-y-1'>
              <Label className='text-xs font-medium'>Accrual Category</Label>
              <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value as CostAccrualItem['category'])} className='border-slate-300 dark:border-slate-700' />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs font-medium'>Vendor Name</Label>
              <Input value={editVendor} onChange={(e) => setEditVendor(e.target.value)} className='border-slate-300 dark:border-slate-700' />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs font-medium'>Estimated Provision Amount (USD)</Label>
              <Input type='number' value={editEstAmount} onChange={(e) => setEditEstAmount(e.target.value)} className='border-slate-300 dark:border-slate-700' />
            </div>
            <div className='space-y-1'>
              <Label className='text-xs font-medium'>Internal Notes</Label>
              <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className='border-slate-300 dark:border-slate-700' />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditDialogOpen(false)} className='border-slate-300'>Cancel</Button>
            <Button onClick={handleSaveEdit} className='bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SAP Reversal Request Dialog */}
      <Dialog open={isReversalOpen} onOpenChange={setIsReversalOpen}>
        <DialogContent className='sm:max-w-md border-slate-200 dark:border-slate-800'>
          <DialogHeader>
            <DialogTitle className='text-slate-900 dark:text-slate-100 flex items-center gap-2'>
              <ShieldCheck className='size-5 text-slate-600' />
              Request Accrual Reversal
            </DialogTitle>
            <DialogDescription className='text-slate-500 text-xs'>
              This accrual ({item.id}) is reconciled/finalized. Reversing requires inter-departmental approval to unmatch vendor bills.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-2 py-2 text-xs'>
            <Label className='font-semibold text-slate-800 dark:text-slate-200'>Reversal Reason & Justification</Label>
            <Input
              placeholder='e.g., Voyage cancellation / Duplicate vendor billing adjustment...'
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              className='border-slate-300 dark:border-slate-700'
            />
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsReversalOpen(false)} className='border-slate-300'>Cancel</Button>
            <Button onClick={handleReversalSubmit} className='bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'>Submit Reversal Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
