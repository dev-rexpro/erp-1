'use client'

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
import { type Quotation } from '../data/schema'

const formSchema = z.object({
  firstName: z.string().min(1, 'Client Account Name is required.'),
  username: z.string().min(1, 'Quotation Number is required.'),
  phoneNumber: z.string().min(1, 'Phone number is required.'),
  email: z.string().email('Valid contact email is required.'),
  role: z.string().min(1, 'Service Type is required.'),
  amount: z.string().min(1, 'Total quotation value is required.'),
  validUntil: z.string().min(1, 'Validity date is required.'),
})

type QuotationForm = z.infer<typeof formSchema>

type QuotationActionDialogProps = {
  currentRow?: Quotation
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultValidUntil = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]

export function QuotationActionDialog({
  currentRow,
  open,
  onOpenChange,
}: QuotationActionDialogProps) {
  const isEdit = !!currentRow

  const form = useForm<QuotationForm>({
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

  const onSubmit = (data: QuotationForm) => {
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
          <DialogTitle>{isEdit ? 'Edit Quotation details' : 'Create Service Quotation'}</DialogTitle>
          <DialogDescription>
            Specify quote reference and booking constraints. Click Save to complete.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quotation No</FormLabel>
                  <FormControl>
                    <Input placeholder='QT-2026-1042' {...field} />
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
                    <FormLabel>Service Cargo Routing</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select Service'
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
                    <FormLabel>Quotation Amount</FormLabel>
                    <FormControl>
                      <Input placeholder='$12,500.00' {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
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
                    <FormLabel>Expiry Close Date</FormLabel>
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
