'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type InviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuotationInviteDialog({
  open,
  onOpenChange,
}: InviteDialogProps) {
  const handleSend = () => {
    onOpenChange(false)
    toast.success('Proposal link dispatched successfully!')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px] rounded-xl'>
        <DialogHeader>
          <DialogTitle>Send Quotation Link</DialogTitle>
          <DialogDescription>
            Dispatch this service catalog and rate matrix to a customer.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4 text-sm'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='emails'>Customer Recipient Emails</Label>
            <Textarea
              id='emails'
              placeholder='logistics.manager@client.com, executive@client.com'
              className='min-h-[60px]'
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='desc'>Custom Message</Label>
            <Textarea
              id='desc'
              defaultValue='Dear Client, please review our proposed rates for shipping and freight routes.'
              className='min-h-[80px]'
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSend} className='bg-primary text-primary-foreground hover:bg-primary/95'>
            Send Proposal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
