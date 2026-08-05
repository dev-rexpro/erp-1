import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { roles } from '../data/data'
import { type Shipment } from '../data/schema'

const formSchema = z.object({
  firstName: z.string().min(1, 'Client Account Name is required.'),
  username: z.string().min(1, 'Shipment Number is required.'),
  phoneNumber: z.string().min(1, 'Phone number is required.'),
  email: z.string().email('Valid contact email is required.'),
  role: z.string().min(1, 'Carrier / Transport Mode is required.'),
  amount: z.string().min(1, 'Freight Value is required.'),
  validUntil: z.string().min(1, 'Delivery ETA date is required.'),
})

type ShipmentForm = z.infer<typeof formSchema>

type ShipmentActionDialogProps = {
  currentRow?: Shipment
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultETA = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]

export function ShipmentActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ShipmentActionDialogProps) {
  const isEdit = !!currentRow

  const form = useForm<ShipmentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          firstName: currentRow.firstName,
          username: currentRow.username,
          phoneNumber: currentRow.phoneNumber,
          email: currentRow.email,
          role: currentRow.role,
          amount: currentRow.amount,
          validUntil: currentRow.validUntil,
        }
      : {
          firstName: '',
          username: '',
          phoneNumber: '',
          email: '',
          role: '',
          amount: '',
          validUntil: '',
        },
  })

  const onSubmit = (data: ShipmentForm) => {
    onOpenChange(false)
    form.reset()
    showSubmittedData(data)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          form.reset()
        }
      }}
    >
      <DialogContent className='sm:max-w-[500px] rounded-xl'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Shipment Details' : 'Register New Shipment'}</DialogTitle>
          <DialogDescription>
            Specify shipment reference and cargo constraints. Click Save to complete.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipment No</FormLabel>
                  <FormControl>
                    <Input placeholder='SH-2026-1042' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Acme Corp' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrier Mode</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select Carrier Mode'
                      items={roles.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Freight Charge Value</FormLabel>
                    <FormControl>
                      <Input placeholder='$4,500.00' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consignee Email</FormLabel>
                  <FormControl>
                    <Input placeholder='logistics@client.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder='+31 6 12345678' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='validUntil'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ETA / Delivery Date</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className='gap-2 sm:gap-0 pt-2'>
              <Button type='submit' className='bg-primary text-primary-foreground hover:bg-primary/95'>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
