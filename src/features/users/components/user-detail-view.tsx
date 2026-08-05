import { useMemo, useEffect } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { ArrowLeft, Save, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

import { type User } from '../data/schema'
import { useUsers } from './users-provider'
import { invoiceClients } from '../../client-invoices/components/invoice-form-data'

interface UserDetailViewProps {
  data: User[]
}

interface UserFormValues {
  firstName: string
  lastName: string
  customerType: string
  customerGroup: string
  fromLead: string
  fromOpportunity: string
  fromProspect: string
  accountManager: string
  billingCurrency: string
  bankAccount: string
  priceList: string
  isInternal: boolean
  marketSegment: string
  industry: string
  website: string
  printLanguage: string
  customerDetails: string
  primaryAddress: string
  primaryContact: string
  mobileNo: string
  loyaltyProgram: string
}

export function UserDetailView({ data }: UserDetailViewProps) {
  const { selectedUserId, setSelectedUserId } = useUsers()

  const user = useMemo(() => {
    if (!selectedUserId) return null
    return data.find((u) => u.id === selectedUserId) || null
  }, [data, selectedUserId])

  const formDefaults: UserFormValues = useMemo(() => {
    if (user) {
      const matched = invoiceClients.find(
        (c) => c.name.toLowerCase() === user.firstName.toLowerCase()
      )
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        customerType: 'Company',
        customerGroup: 'Individual',
        fromLead: matched?.id || 'CRM-LEAD-2023-00029',
        fromOpportunity: '',
        fromProspect: '',
        accountManager: '',
        billingCurrency: 'INR',
        bankAccount: '',
        priceList: 'Standard Selling',
        isInternal: false,
        marketSegment: 'Middle Income',
        industry: 'Computer',
        website: '',
        printLanguage: 'English',
        customerDetails: '',
        primaryAddress: '',
        primaryContact: '',
        mobileNo: user.phoneNumber || '',
        loyaltyProgram: 'Non Profit Program',
      }
    }
    return {
      firstName: '',
      lastName: '',
      customerType: 'Company',
      customerGroup: 'Individual',
      fromLead: 'CRM-LEAD-2023-00029',
      fromOpportunity: '',
      fromProspect: '',
      accountManager: '',
      billingCurrency: 'INR',
      bankAccount: '',
      priceList: 'Standard Selling',
      isInternal: false,
      marketSegment: 'Middle Income',
      industry: 'Computer',
      website: '',
      printLanguage: 'English',
      customerDetails: '',
      primaryAddress: '',
      primaryContact: '',
      mobileNo: '',
      loyaltyProgram: 'Non Profit Program',
    }
  }, [user])

  const form = useForm<UserFormValues>({ defaultValues: formDefaults })
  const w = useWatch({ control: form.control }) as UserFormValues

  useEffect(() => {
    form.reset(formDefaults)
  }, [formDefaults, form])

  const handleSave = () => {
    toast.success('Customer saved successfully!', {
      description: `${w.firstName} ${w.lastName} is now up to date.`,
    })
  }

  const fullName = `${w.firstName} ${w.lastName}`.trim()

  return (
    <FormProvider {...form}>
      <div className='flex flex-col gap-6'>
        {/* Header */}
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='flex flex-col gap-1'>
            <h1 className='font-medium text-3xl leading-none tracking-tight'>
              {selectedUserId === 'new' ? 'Create New Customer' : fullName || 'Customer Details'}
            </h1>
            <p className='text-muted-foreground text-sm'>
              Manage customer profile, contacts, and account settings.
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <Button type='button' variant='outline' size='sm' onClick={() => setSelectedUserId(null)} className='h-9 px-3 gap-1.5'>
              <ArrowLeft className='size-4' />
              Back
            </Button>
            <Button type='button' variant='outline' onClick={handleSave} className='h-9 px-3.5 gap-1.5'>
              <Save className='size-4' />
              Save Customer
            </Button>
          </div>
        </div>

        <form className='grid gap-5' noValidate onSubmit={(e) => e.preventDefault()}>
          <div className='flex flex-col gap-4'>
            <Tabs defaultValue='details' className='w-full overflow-hidden'>
              <TabsList className='w-full overflow-x-auto no-scrollbar justify-start flex shrink-0'>
                <TabsTrigger value='details' className='shrink-0'>Details</TabsTrigger>
                <TabsTrigger value='address' className='shrink-0'>Address & Contact</TabsTrigger>
                <TabsTrigger value='accounting' className='shrink-0'>Accounting</TabsTrigger>
                <TabsTrigger value='settings' className='shrink-0'>Settings</TabsTrigger>
              </TabsList>

              <div className='mt-6 flex flex-col gap-6'>
                <TabsContent value='details' className='mt-0 space-y-6'>
              <section className='flex flex-col gap-3'>
                <FieldGroup>
                  <div className='grid gap-5 md:grid-cols-2'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>First Name</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...form.register('firstName')} />
                      </InputGroup>
                    </Field>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Last Name</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...form.register('lastName')} />
                      </InputGroup>
                    </Field>
                  </div>
                  <div className='grid gap-5 md:grid-cols-2'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Customer Type</FieldLabel>
                      <Select value={w.customerType} onValueChange={(v) => form.setValue('customerType', v)}>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='Company'>Company</SelectItem>
                            <SelectItem value='Individual'>Individual</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Customer Group</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...form.register('customerGroup')} />
                      </InputGroup>
                    </Field>
                  </div>
                </FieldGroup>
              </section>

              <Separator />

              <section className='flex flex-col gap-4'>
                <h2 className='font-medium tracking-tight'>Source</h2>
                <FieldGroup>
                  <div className='grid gap-5 md:grid-cols-2'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>From Lead</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...form.register('fromLead')} />
                      </InputGroup>
                    </Field>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Account Manager</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...form.register('accountManager')} />
                      </InputGroup>
                    </Field>
                  </div>
                  <div className='grid gap-5 md:grid-cols-2'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>From Opportunity</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...form.register('fromOpportunity')} />
                      </InputGroup>
                    </Field>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>From Prospect</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...form.register('fromProspect')} />
                      </InputGroup>
                    </Field>
                  </div>
                </FieldGroup>
              </section>

              <Separator />

              <section className='flex flex-col gap-4'>
                <h2 className='font-medium tracking-tight'>Defaults</h2>
                <FieldGroup>
                  <div className='grid gap-5 md:grid-cols-2'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Billing Currency</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...form.register('billingCurrency')} />
                      </InputGroup>
                    </Field>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Default Price List</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...form.register('priceList')} />
                      </InputGroup>
                    </Field>
                  </div>
                  <div className='grid gap-5 md:grid-cols-2'>
                    <Field className='gap-1'>
                      <FieldLabel className='text-xs'>Default Company Bank Account</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...form.register('bankAccount')} />
                      </InputGroup>
                    </Field>
                    <div />
                  </div>
                </FieldGroup>
              </section>

              <Separator />

              <Collapsible open={true} className='border rounded-lg bg-background overflow-hidden'>
                <CollapsibleTrigger className='w-full px-5 py-3.5 flex items-center justify-between font-semibold text-xs text-muted-foreground uppercase tracking-wider bg-muted/10 border-b'>
                  <span>More Information</span>
                  <ChevronUp className='h-3.5 w-3.5' />
                </CollapsibleTrigger>
                <CollapsibleContent className='p-5'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <div className='flex flex-col gap-4'>
                      <Field className='gap-1.5'>
                        <FieldLabel className='text-xs'>Market Segment</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...form.register('marketSegment')} />
                        </InputGroup>
                      </Field>
                      <Field className='gap-1.5'>
                        <FieldLabel className='text-xs'>Industry</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...form.register('industry')} />
                        </InputGroup>
                      </Field>
                      <Field className='gap-1.5'>
                        <FieldLabel className='text-xs'>Website</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...form.register('website')} />
                        </InputGroup>
                      </Field>
                      <Field className='gap-1.5'>
                        <FieldLabel className='text-xs'>Print Language</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...form.register('printLanguage')} />
                        </InputGroup>
                      </Field>
                    </div>

                    <div className='flex flex-col gap-4'>
                      <Field className='gap-1.5'>
                        <FieldLabel className='text-xs'>Customer Details</FieldLabel>
                        <Textarea
                          {...form.register('customerDetails')}
                          className='min-h-[170px] resize-y'
                        />
                      </Field>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </TabsContent>

            <TabsContent value='address' className='mt-4 space-y-6'>
              <section className='flex flex-col gap-4'>
                <h2 className='font-medium tracking-tight'>Address and Contact</h2>
                <FieldGroup>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <div className='flex flex-col gap-4'>
                      <Field className='gap-1.5'>
                        <FieldLabel className='text-xs'>Primary Address</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...form.register('primaryAddress')} />
                        </InputGroup>
                      </Field>
                    </div>
                    <div className='flex flex-col gap-4'>
                      <Field className='gap-1.5'>
                        <FieldLabel className='text-xs'>Primary Contact</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...form.register('primaryContact')} />
                        </InputGroup>
                      </Field>
                      <Field className='gap-1.5'>
                        <FieldLabel className='text-xs'>Mobile No</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...form.register('mobileNo')} />
                        </InputGroup>
                      </Field>
                    </div>
                  </div>
                </FieldGroup>
              </section>
            </TabsContent>

            <TabsContent value='accounting' className='mt-4 space-y-6'>
              <section className='flex flex-col gap-4'>
                <h2 className='font-medium tracking-tight'>Credit Limit and Payment Terms</h2>
                <Field className='gap-1.5 max-w-sm'>
                  <FieldLabel className='text-xs'>Default Payment Terms Template</FieldLabel>
                  <InputGroup>
                    <InputGroupInput placeholder='Select Payment Terms Template...' disabled />
                  </InputGroup>
                </Field>

                <div className='flex flex-col gap-2'>
                  <span className='text-xs font-semibold text-foreground'>Credit Limit</span>
                  <div className='border rounded-md overflow-hidden'>
                    <Table>
                      <TableHeader>
                        <TableRow className='h-9 bg-muted/30'>
                          <TableHead className='w-10 text-center border-r'><Checkbox checked={false} disabled /></TableHead>
                          <TableHead className='w-12 text-center border-r'>No.</TableHead>
                          <TableHead className='border-r'>Company</TableHead>
                          <TableHead className='border-r'>Credit Limit</TableHead>
                          <TableHead className='border-r'>Bypass Credit Limit Check at Sales Order</TableHead>
                          <TableHead className='w-10 text-center'>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={6} className='p-0 align-middle'>
                            <div className='flex flex-col items-center justify-center py-10 text-muted-foreground/60'>
                              <div className='w-12 h-12 mb-2 rounded border border-dashed flex items-center justify-center bg-muted/10'>
                                <svg className="w-6 h-6 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 0 01-2 2z" />
                                </svg>
                              </div>
                              <p className='text-xs font-medium'>No Data</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <Button variant='outline' size='sm' className='self-start text-[11px] h-7 border shadow-none bg-background mt-1.5 font-medium'>
                    Add Row
                  </Button>
                </div>

                <Separator />

                <div className='flex flex-col gap-3'>
                  <span className='text-xs font-semibold text-foreground'>Accounts</span>
                  <p className='text-xs text-muted-foreground -mt-1.5 mb-2'>
                    Mention if non-standard Receivable account
                  </p>

                  <div className='border rounded-md overflow-hidden'>
                    <Table>
                      <TableHeader>
                        <TableRow className='h-9 bg-muted/30'>
                          <TableHead className='w-10 text-center border-r'><Checkbox checked={false} disabled /></TableHead>
                          <TableHead className='w-12 text-center border-r'>No.</TableHead>
                          <TableHead className='border-r'>Company *</TableHead>
                          <TableHead className='border-r'>Default Account</TableHead>
                          <TableHead className='w-10 text-center'>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={5} className='p-0 align-middle'>
                            <div className='flex flex-col items-center justify-center py-10 text-muted-foreground/60'>
                              <div className='w-12 h-12 mb-2 rounded border border-dashed flex items-center justify-center bg-muted/10'>
                                <svg className="w-6 h-6 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 0 01-2-2V5a2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 0 01-2 2z" />
                                </svg>
                              </div>
                              <p className='text-xs font-medium'>No Data</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <Button variant='outline' size='sm' className='self-start text-[11px] h-7 border shadow-none bg-background mt-1.5 font-medium'>
                    Add Row
                  </Button>
                </div>

                <Collapsible open={true} className='border rounded-lg bg-background overflow-hidden'>
                  <CollapsibleTrigger className='w-full px-5 py-3.5 flex items-center justify-between font-semibold text-xs text-muted-foreground uppercase tracking-wider bg-muted/10 border-b'>
                    <span>Loyalty Points</span>
                    <ChevronUp className='h-3.5 w-3.5' />
                  </CollapsibleTrigger>
                  <CollapsibleContent className='p-5'>
                    <div className='max-w-md flex flex-col gap-1.5'>
                      <FieldLabel className='text-xs'>Loyalty Program</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...form.register('loyaltyProgram')} />
                      </InputGroup>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </section>
            </TabsContent>

            <TabsContent value='settings' className='mt-4 space-y-6'>
              <section className='flex flex-col gap-4'>
                <h2 className='font-medium tracking-tight'>Portal Settings</h2>
                <FieldGroup>
                  <Field className='gap-1.5'>
                    <FieldLabel className='text-xs'>Portal Users</FieldLabel>
                    <div className='border rounded-lg bg-background p-8 text-center text-muted-foreground'>
                      <p className='text-xs font-medium'>User credentials, associated contacts, and access permissions for the client portal.</p>
                    </div>
                  </Field>
                </FieldGroup>
              </section>
            </TabsContent>
              </div>
            </Tabs>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
