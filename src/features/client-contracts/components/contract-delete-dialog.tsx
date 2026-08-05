'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Contract } from '../data/schema'

type DeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Contract
}

export function ContractDeleteDialog({
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
      loading: 'Deleting contract registry...',
      success: () => `Contract ${currentRow.username} has been purged.`,
      error: 'Error deleting contract profile',
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
          Purge Contract Registry {currentRow.username}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Are you sure you want to completely delete contract profile <span className='font-bold'>{currentRow.username}</span>?
            This will void active SLA metrics in tracking pipelines.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>Confirm by typing the contract code:</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={currentRow.username}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Danger Action!</AlertTitle>
            <AlertDescription>
              Clearing this registry record will immediately unbind billing and insurance links.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Purge Registry'
      destructive
    />
  )
}
