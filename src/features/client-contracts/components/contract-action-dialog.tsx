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
import { type Contract } from '../data/schema'

const formSchema = z.object({
  firstName: z.string().min(1, 'Contracting client name is required.'),
  username: z.string().min(1, 'Contract Code is required.'),
  phoneNumber: z.string().min(1, 'Office phone number is required.'),
  email: z.string().email('Office contact email is required.'),
  role: z.string().min(1, 'Agreement structure is required.'),
  amount: z.string().min(1, 'Contract value is required.'),
  validUntil: z.string().min(1, 'Expiration date is required.'),
})

type ContractForm = z.infer<typeof formSchema>

type ContractActionDialogProps = {
  currentRow?: Contract
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultValidUntil = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]

export function ContractActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ContractActionDialogProps) {
  const isEdit = !!currentRow

  const form = useForm<ContractForm>({
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

  const onSubmit = (data: ContractForm) => {
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
          <DialogTitle>{isEdit ? 'Edit Contract Profile' : 'Register New Contract'}</DialogTitle>
          <DialogDescription>
            Specify legal reference details and binding parameters. Click Save to execute.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Code Reference</FormLabel>
                  <FormControl>
                    <Input placeholder='CTR-2026-1045' {...field} />
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
                  <FormLabel>Contracting Corporate Client</FormLabel>
                  <FormControl>
                    <Input placeholder='Delta Sourcing Corp' {...field} />
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
                    <FormLabel>Agreement Classification</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select framework'
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
                    <FormLabel>SLA Total Valuation</FormLabel>
                    <FormControl>
                      <Input placeholder='$150,000.00' {...field} />
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
                  <FormLabel>Corporate Legal Email</FormLabel>
                  <FormControl>
                    <Input placeholder='legal@delta.com' {...field} />
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
                    <FormLabel>Officer Contacts</FormLabel>
                    <FormControl>
                      <Input placeholder='+44 20 1234 5678' {...field} />
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
                    <FormLabel>Expiration Sign End</FormLabel>
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
