'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Quotation } from '../data/schema'

type DeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Quotation
}

export function QuotationDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: DeleteDialogProps) {
  const [value, setValue] = useState('')

  const handleDelete = () => {
    if (value.trim() !== currentRow.username) {
      toast.error(`Please type "${currentRow.username}" to confirm.`)
      return
    }

    onOpenChange(false)
    toast.promise(sleep(1000), {
      loading: 'Deleting quotation...',
      success: () => `Quotation ${currentRow.username} has been deleted.`,
      error: 'Error deleting quotation',
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username}
      title={
        <span className='text-destructive gap-1 flex items-center'>
          <AlertTriangle className='stroke-destructive mr-1' size={18} />
          Delete Quotation {currentRow.username}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Are you sure you want to delete quotation <span className='font-bold'>{currentRow.username}</span>?
            This action cannot be undone.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>Confirm by typing the quotation reference:</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={currentRow.username}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              All active logistics proposals related to this index will be marked as obsolete.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
