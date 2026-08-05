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
import { type PackingList } from '../data/schema'

const formSchema = z.object({
  firstName: z.string().min(1, 'Client Account Name is required.'),
  username: z.string().min(1, 'Packing List Reference is required.'),
  phoneNumber: z.string().min(1, 'Phone number is required.'),
  email: z.string().email('Valid contact email is required.'),
  role: z.string().min(1, 'Packaging Format is required.'),
  amount: z.string().min(1, 'Package capacity detail is required.'),
  validUntil: z.string().min(1, 'Packing date is required.'),
})

type PackingListForm = z.infer<typeof formSchema>

type PackingListActionDialogProps = {
  currentRow?: PackingList
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultPackingDate = new Date().toISOString().split('T')[0]

export function PackingListActionDialog({
  currentRow,
  open,
  onOpenChange,
}: PackingListActionDialogProps) {
  const isEdit = !!currentRow

  const form = useForm<PackingListForm>({
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

  const onSubmit = (data: PackingListForm) => {
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
          <DialogTitle>{isEdit ? 'Edit Packing List Details' : 'Create Packing List Manifest'}</DialogTitle>
          <DialogDescription>
            Specify packing list reference and volume values. Click Save to complete.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Packing List No</FormLabel>
                  <FormControl>
                    <Input placeholder='PL-2026-1042' {...field} />
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
                    <FormLabel>Packaging Format</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select Format'
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
                    <FormLabel>Quantity Capacity</FormLabel>
                    <FormControl>
                      <Input placeholder='24 Cartons' {...field} />
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
                  <FormLabel>Contact Email</FormLabel>
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
                    <FormLabel>Date Packed</FormLabel>
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
