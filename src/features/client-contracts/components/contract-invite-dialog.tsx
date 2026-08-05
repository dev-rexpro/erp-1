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

export function ContractInviteDialog({
  open,
  onOpenChange,
}: InviteDialogProps) {
  const handleSend = () => {
    onOpenChange(false)
    toast.success('Sign secure link dispatched via email & SMS!')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px] rounded-xl'>
        <DialogHeader>
          <DialogTitle>Send Counter-Sign Invitation</DialogTitle>
          <DialogDescription>
            Dispatch this legal contract framework to contracting parties for review & electronic signature.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4 text-sm'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='co-emails'>Legal Countersign Recipient Emails</Label>
            <Textarea
              id='co-emails'
              placeholder='counsel@client.com, chief.logistics@client.com'
              className='min-h-[60px]'
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='co-desc'>Additional Instructions</Label>
            <Textarea
              id='co-desc'
              defaultValue='Please access the hyperlink to safely complete your electronic signature.'
              className='min-h-[80px]'
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSend} className='bg-primary text-primary-foreground hover:bg-primary/95'>
            Dispatch Invites
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
