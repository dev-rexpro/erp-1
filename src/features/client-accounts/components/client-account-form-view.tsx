import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Building2, MapPin, Landmark, User } from 'lucide-react'
import { toast } from 'sonner'
import { useDbStore } from '@/stores/db-store'
import { type ClientCompany } from '@/lib/mock-data/master-data'
import { clientAccountSchema, type ClientAccountFormValues } from '../data/schema'
import { useClientAccounts } from './client-accounts-provider'

export function ClientAccountFormView() {
  const { isEditOpen, setIsAddOpen, setIsEditOpen, editingClient, setEditingClient } = useClientAccounts()
  const { clients, setClients } = useDbStore()

  const isEditing = isEditOpen && Boolean(editingClient)

  const defaultValues: Partial<ClientAccountFormValues> = {
    id: editingClient?.id || '',
    name: editingClient?.name || '',
    shortName: editingClient?.shortName || '',
    initials: editingClient?.initials || '',
    country: editingClient?.country || 'ID',
    city: editingClient?.city || '',
    address: editingClient?.address || '',
    postalCode: editingClient?.postalCode || '',
    email: editingClient?.email || '',
    phone: editingClient?.phone || '',
    taxId: editingClient?.taxId || '',
    tier: editingClient?.tier || 'Standard',
    industry: editingClient?.industry || '',
    currency: editingClient?.currency || 'USD',
    creditLimit: editingClient?.creditLimit ?? 0,
    arBalance: editingClient?.arBalance ?? 0,
    paymentTerms: editingClient?.paymentTerms || '',
    bankName: editingClient?.bankName || '',
    bankAccountNo: editingClient?.bankAccountNo || '',
    swiftCode: editingClient?.swiftCode || '',
    contactPerson: editingClient?.contactPerson || '',
    contactRole: editingClient?.contactRole || '',
    status: editingClient?.status || 'Active',
  }

  const form = useForm<ClientAccountFormValues>({
    resolver: zodResolver(clientAccountSchema),
    defaultValues,
  })

  useEffect(() => {
    if (isEditing && editingClient) {
      form.reset({
        id: editingClient.id,
        name: editingClient.name,
        shortName: editingClient.shortName,
        initials: editingClient.initials,
        country: editingClient.country,
        city: editingClient.city,
        address: editingClient.address,
        postalCode: editingClient.postalCode || '',
        email: editingClient.email,
        phone: editingClient.phone,
        taxId: editingClient.taxId,
        tier: editingClient.tier,
        industry: editingClient.industry,
        currency: editingClient.currency,
        creditLimit: editingClient.creditLimit ?? 100000,
        arBalance: editingClient.arBalance ?? 0,
        paymentTerms: editingClient.paymentTerms || 'Net 30 Days',
        bankName: editingClient.bankName || 'Bank Mandiri',
        bankAccountNo: editingClient.bankAccountNo || '',
        swiftCode: editingClient.swiftCode || '',
        contactPerson: editingClient.contactPerson || '',
        contactRole: editingClient.contactRole || 'Procurement Manager',
        status: editingClient.status || 'Active',
      })
    }
  }, [isEditing, editingClient])

  const handleBack = () => {
    setIsAddOpen(false)
    setIsEditOpen(false)
    setEditingClient(null)
  }

  const onSubmit = (values: ClientAccountFormValues) => {
    if (isEditing && editingClient) {
      const updated = clients.map((c) => (c.id === editingClient.id ? { ...c, ...values } : c))
      setClients(updated)
      toast.success(`Client account ${values.name} updated successfully!`)
    } else {
      setClients([values as any, ...clients])
      toast.success(`Client account ${values.name} created successfully!`)
    }
    handleBack()
  }

  return (
    <div className='flex flex-col gap-6 w-full pb-12'>
      {/* Top Header Controls */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60'>
        <div className='flex items-center gap-3'>
          <Button variant='outline' size='icon' onClick={handleBack} className='h-9 w-9 shrink-0'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-xl font-bold tracking-tight text-foreground'>
              {isEditing ? `Edit Client Account: ${editingClient?.name}` : 'Create New Client Account'}
            </h1>
            <p className='text-xs text-muted-foreground'>
              {isEditing
                ? 'Update company profile, registered address, and accounting parameters.'
                : 'Enter company details to add a new commercial client account.'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 self-start sm:self-auto'>
          <Button type='button' variant='outline' size='sm' onClick={handleBack} className='h-9 text-xs'>
            Cancel
          </Button>
          <Button type='submit' form='client-account-form' size='sm' className='h-9 text-xs gap-1.5'>
            <Save className='h-3.5 w-3.5' /> {isEditing ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </div>

      {/* Main Form Body */}
      <Form {...form}>
        <form id='client-account-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          
          {/* Card 1: Company Profile */}
          <Card className='border border-border bg-card shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Building2 className='h-4 w-4 text-muted-foreground' /> Company Profile
              </CardTitle>
              <CardDescription>General business identification and tier status</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='lg:col-span-2'>
                      <FormLabel className='text-xs font-medium'>Full Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='PT Samudera Steel Tbk' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='shortName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Short / Display Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='Samudera Steel' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <FormField
                  control={form.control}
                  name='initials'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Initials Code *</FormLabel>
                      <FormControl>
                        <Input placeholder='SS' maxLength={3} className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='industry'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Industry Sector *</FormLabel>
                      <FormControl>
                        <Input placeholder='Steel Manufacturing' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='tier'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Client Tier *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='text-xs'>
                            <SelectValue placeholder='Select tier' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='Priority'>Priority</SelectItem>
                          <SelectItem value='Standard'>Standard</SelectItem>
                          <SelectItem value='Non-priority'>Non-priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Account Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='text-xs'>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='Active'>Active</SelectItem>
                          <SelectItem value='On Hold'>On Hold</SelectItem>
                          <SelectItem value='Inactive'>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Registered Address & Key Contact */}
          <Card className='border border-border bg-card shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-muted-foreground' /> Registered Location & Contact
              </CardTitle>
              <CardDescription>Address details and primary liaison manager</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-medium'>Street Address *</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Building, street, floor...' className='text-xs h-20' {...field} />
                    </FormControl>
                    <FormMessage className='text-[11px]' />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>City *</FormLabel>
                      <FormControl>
                        <Input placeholder='Jakarta' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Country *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='text-xs'>
                            <SelectValue placeholder='Select country' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='ID'>🇮🇩 Indonesia</SelectItem>
                          <SelectItem value='CN'>🇨🇳 China</SelectItem>
                          <SelectItem value='SG'>🇸🇬 Singapore</SelectItem>
                          <SelectItem value='US'>🇺🇸 United States</SelectItem>
                          <SelectItem value='JP'>🇯🇵 Japan</SelectItem>
                          <SelectItem value='AE'>🇦🇪 UAE</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='postalCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder='12910' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2'>
                <FormField
                  control={form.control}
                  name='contactPerson'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Contact Person *</FormLabel>
                      <FormControl>
                        <Input placeholder='Hendra Wijaya' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='contactRole'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Contact Role *</FormLabel>
                      <FormControl>
                        <Input placeholder='Procurement Manager' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Email Address *</FormLabel>
                      <FormControl>
                        <Input placeholder='procurement@company.com' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder='+62-21-555-1234' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Tax & Financial Parameters */}
          <Card className='border border-border bg-card shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Landmark className='h-4 w-4 text-muted-foreground' /> Tax & Banking Parameters
              </CardTitle>
              <CardDescription>Tax registration, credit limits, and billing bank details</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <FormField
                  control={form.control}
                  name='taxId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Tax ID / NPWP *</FormLabel>
                      <FormControl>
                        <Input placeholder='01.002.945.0-011.000' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='currency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Billing Currency *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='text-xs'>
                            <SelectValue placeholder='Select currency' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='USD'>USD ($)</SelectItem>
                          <SelectItem value='IDR'>IDR (Rp)</SelectItem>
                          <SelectItem value='SGD'>SGD ($)</SelectItem>
                          <SelectItem value='CNY'>CNY (¥)</SelectItem>
                          <SelectItem value='EUR'>EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='creditLimit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Credit Limit *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          className='text-xs'
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='paymentTerms'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Payment Terms *</FormLabel>
                      <FormControl>
                        <Input placeholder='Net 30 Days' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2'>
                <FormField
                  control={form.control}
                  name='bankName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Bank Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='Bank Mandiri' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bankAccountNo'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>Bank Account No *</FormLabel>
                      <FormControl>
                        <Input placeholder='116-00-888999' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='swiftCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium'>SWIFT / BIC Code *</FormLabel>
                      <FormControl>
                        <Input placeholder='BMRIIDJA' className='text-xs' {...field} />
                      </FormControl>
                      <FormMessage className='text-[11px]' />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
