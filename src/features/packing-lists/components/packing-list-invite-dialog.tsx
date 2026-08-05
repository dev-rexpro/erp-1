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

export function PackingListInviteDialog({
  open,
  onOpenChange,
}: InviteDialogProps) {
  const handleSend = () => {
    onOpenChange(false)
    toast.success('Manifest link dispatched successfully!')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px] rounded-xl'>
        <DialogHeader>
          <DialogTitle>Send Packing Manifest Link</DialogTitle>
          <DialogDescription>
            Dispatch this packing manifest and loading list to a customer or custom warehouse agency.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4 text-sm'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='emails'>Recipient Emails</Label>
            <Textarea
              id='emails'
              placeholder='import.broker@client.com, receiver@warehouse.com'
              className='min-h-[60px]'
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='desc'>Custom Message</Label>
            <Textarea
              id='desc'
              defaultValue='Dear Receiver, please review our packing list manifest for the upcoming freight route.'
              className='min-h-[80px]'
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSend} className='bg-primary text-primary-foreground hover:bg-primary/95'>
            Send Manifest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
