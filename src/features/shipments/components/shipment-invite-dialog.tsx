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

export function ShipmentInviteDialog({
  open,
  onOpenChange,
}: InviteDialogProps) {
  const handleSend = () => {
    onOpenChange(false)
    toast.success('Tracking notification dispatch initiated!')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px] rounded-xl'>
        <DialogHeader>
          <DialogTitle>Send Shipment Notifications</DialogTitle>
          <DialogDescription>
            Send real-time logistics tracking link and transit summaries to client emails.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4 text-sm'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='emails'>Consignee Email Addresses</Label>
            <Textarea
              id='emails'
              placeholder='import.manager@client.com, broker@agency.com'
              className='min-h-[60px]'
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='desc'>Custom Transit Note</Label>
            <Textarea
              id='desc'
              defaultValue='Dear Consignee, your shipment is scheduled and tracking indicators are online.'
              className='min-h-[80px]'
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSend} className='bg-primary text-primary-foreground hover:bg-primary/95'>
            Dispatch Notification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
