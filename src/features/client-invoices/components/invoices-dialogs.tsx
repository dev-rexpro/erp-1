import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInvoices } from './invoices-provider'
import { toast } from 'sonner'
import { useDbStore } from '@/stores/db-store'
import { useRbacStore } from '@/stores/rbac-store'

export function InvoicesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useInvoices()
  const invoices = useDbStore((state) => state.clientInvoices)
  const { canAccessModule, getActiveRole } = useRbacStore()

  const canWrite = canAccessModule('finance', 'write')
  const activeRole = getActiveRole()

  const selectedInvoice = useMemo(() => {
    return invoices.find((inv) => inv.id === currentRow?.id) || null
  }, [invoices, currentRow])
  
  // Form states
  const [clientName, setClientName] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive' | 'invited' | 'suspended'>('invited')
  const [type, setType] = useState<'superadmin' | 'admin' | 'manager' | 'cashier'>('superadmin')

  useEffect(() => {
    if (currentRow) {
      setClientName(currentRow.firstName)
      setInvoiceNumber(currentRow.username)
      setAmount(currentRow.amount)
      setStatus(currentRow.status)
      setType(currentRow.role)
    } else {
      setClientName('')
      setInvoiceNumber('')
      setAmount('')
      setStatus('invited')
      setType('superadmin')
    }
  }, [currentRow, open, invoices.length])

  const handleSave = () => {
    if (!canWrite) {
      toast.error(`Akses Ditolak: Peran ${activeRole?.name || 'User'} tidak memiliki izin Tulis (Write) pada Finance.`)
      setOpen(null)
      setCurrentRow(null)
      return
    }
    if (open === 'add') {
      const newInvoice = {
        id: Math.random().toString(),
        firstName: clientName,
        lastName: '',
        username: invoiceNumber,
        email: `billing@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`,
        phoneNumber: '+62 812-3456-7890',
        status,
        role: type,
        amount,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      useDbStore.getState().setClientInvoices([newInvoice, ...invoices])
      toast.success(`Invoice ${invoiceNumber} created successfully!`)
    } else if (open === 'edit' && currentRow) {
      const index = invoices.findIndex((inv) => inv.id === currentRow.id)
      if (index !== -1) {
        const updated = [...invoices]
        updated[index] = {
          ...updated[index],
          firstName: clientName,
          username: invoiceNumber,
          amount,
          status,
          role: type,
        }
        useDbStore.getState().setClientInvoices(updated)
        toast.success(`Invoice ${invoiceNumber} updated successfully!`)
      }
    }
    setOpen(null)
    setCurrentRow(null)
  }

  const handleDelete = () => {
    if (!canWrite) {
      toast.error(`Akses Ditolak: Peran ${activeRole?.name || 'User'} tidak memiliki izin Hapus pada Finance.`)
      setOpen(null)
      setCurrentRow(null)
      return
    }
    if (currentRow) {
      const index = invoices.findIndex((inv) => inv.id === currentRow.id)
      if (index !== -1) {
        const updated = [...invoices]
        updated.splice(index, 1)
        useDbStore.getState().setClientInvoices(updated)
        toast.success(`Invoice ${currentRow.username} deleted successfully!`)
      }
    }
    setOpen(null)
    setCurrentRow(null)
  }

  return (
    <>
      {/* Add / Edit Dialog */}
      <Dialog open={open === 'add' || open === 'edit'} onOpenChange={(v) => { if (!v) { setOpen(null); setCurrentRow(null); } }}>
        <DialogContent className='sm:max-w-[425px] rounded-2xl'>
          <DialogHeader>
            <DialogTitle>{open === 'add' ? 'Add Client Invoice' : 'Edit Invoice Details'}</DialogTitle>
            <DialogDescription>
              Provide the details of the invoice below. Click save when you are finished.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='client-name' className='text-right'>Client</Label>
              <Input id='client-name' value={clientName} onChange={(e) => setClientName(e.target.value)} className='col-span-3' />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='invoice-number' className='text-right'>Invoice #</Label>
              <Input id='invoice-number' value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className='col-span-3' />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='amount' className='text-right'>Total Amount</Label>
              <Input id='amount' value={amount} onChange={(e) => setAmount(e.target.value)} className='col-span-3' />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='status' className='text-right'>Status</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger className='col-span-3'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='rounded-xl'>
                  <SelectItem value='active'>Paid</SelectItem>
                  <SelectItem value='invited'>Draft</SelectItem>
                  <SelectItem value='inactive'>Overdue</SelectItem>
                  <SelectItem value='suspended'>Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='type' className='text-right'>Invoice Type</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger className='col-span-3'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='rounded-xl'>
                  <SelectItem value='superadmin'>Commercial Invoice</SelectItem>
                  <SelectItem value='admin'>Proforma Invoice</SelectItem>
                  <SelectItem value='manager'>Tax Invoice</SelectItem>
                  <SelectItem value='cashier'>Credit Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => { setOpen(null); setCurrentRow(null); }}>Cancel</Button>
            <Button onClick={handleSave} className='bg-black hover:bg-black/90 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black'>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={open === 'delete'} onOpenChange={(v) => { if (!v) { setOpen(null); setCurrentRow(null); } }}>
        <DialogContent className='sm:max-w-[425px] rounded-2xl'>
          <DialogHeader>
            <DialogTitle className='text-red-600'>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice {currentRow?.username}? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' onClick={() => { setOpen(null); setCurrentRow(null); }}>Cancel</Button>
            <Button variant='destructive' onClick={handleDelete}>Delete Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
