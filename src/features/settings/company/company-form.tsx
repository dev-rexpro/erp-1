import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getCompanySettings, saveCompanySettings, type CompanySettingsValues } from '@/lib/company-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

export function CompanyForm() {
  const defaultValues = getCompanySettings()
  const form = useForm<CompanySettingsValues>({
    defaultValues,
  })

  const [logoPreview, setLogoPreview] = useState<string>(defaultValues.logoUrl || '')
  const [stampPreview, setStampPreview] = useState<string>(defaultValues.stampUrl || '')

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setLogoPreview(base64)
        form.setValue('logoUrl', base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setStampPreview(base64)
        form.setValue('stampUrl', base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = (data: CompanySettingsValues) => {
    saveCompanySettings(data)
    toast.success('Company settings updated successfully!')
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 w-full pb-10'>
      <div>
        <h3 className='text-lg font-medium'>General Profile</h3>
        <p className='text-sm text-muted-foreground'>
          Update your company legal name, contact details, and address coordinates.
        </p>
      </div>
      <Separator />

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-semibold' htmlFor='name'>Company Name</label>
          <Input id='name' {...form.register('name', { required: true })} placeholder='e.g., PT REXINDO ARUNA SEDAYA' />
        </div>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-semibold' htmlFor='website'>Website URL</label>
          <Input id='website' {...form.register('website')} placeholder='e.g., rexindo-aruna.com' />
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-semibold' htmlFor='email'>Company Email</label>
          <Input id='email' type='email' {...form.register('email')} placeholder='e.g., info@rexindo.com' />
        </div>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-semibold' htmlFor='phone'>Phone Number</label>
          <Input id='phone' {...form.register('phone')} placeholder='e.g., +62-21-5555-0184' />
        </div>
      </div>

      <div className='flex flex-col gap-1.5'>
        <label className='text-xs font-semibold' htmlFor='address'>Company Address</label>
        <Textarea id='address' {...form.register('address')} placeholder='Main Office St., Jakarta, Indonesia' />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-semibold' htmlFor='npwp'>NPWP (Tax ID)</label>
          <Input id='npwp' {...form.register('npwp')} placeholder='e.g., 01.234.567.8-901.000' />
        </div>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-semibold' htmlFor='nib'>NIB (Nomor Induk Berusaha)</label>
          <Input id='nib' {...form.register('nib')} placeholder='e.g., 9120001234567' />
        </div>
      </div>

      <div className='pt-4'>
        <h3 className='text-lg font-medium'>Bank Account & Billing</h3>
        <p className='text-sm text-muted-foreground'>
          Specify the default bank details displayed on invoices for client payments.
        </p>
      </div>
      <Separator />

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-semibold' htmlFor='bankName'>Bank Name</label>
          <Input id='bankName' {...form.register('bankName')} placeholder='e.g., MANDIRI' />
        </div>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-semibold' htmlFor='bankAccount'>Account Number</label>
          <Input id='bankAccount' {...form.register('bankAccount')} placeholder='e.g., 123-456-7890' />
        </div>
        <div className='flex flex-col gap-1.5'>
          <label className='text-xs font-semibold' htmlFor='bankAccountName'>Account Holder (A/N)</label>
          <Input id='bankAccountName' {...form.register('bankAccountName')} placeholder='e.g., PT REXINDO ARUNA SEDAYA' />
        </div>
      </div>

      <div className='pt-4'>
        <h3 className='text-lg font-medium'>Visual Assets & Branding</h3>
        <p className='text-sm text-muted-foreground'>
          Upload official visual elements to display on generated invoice and manifest documents.
        </p>
      </div>
      <Separator />

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='flex flex-col gap-2 p-4 border rounded-lg bg-stone-50 dark:bg-stone-900'>
          <label className='text-xs font-semibold' htmlFor='logo-file'>Company Logo</label>
          <Input id='logo-file' type='file' accept='image/*' onChange={handleLogoChange} />
          {logoPreview ? (
            <div className='mt-2 flex flex-col items-center justify-center p-2 border rounded bg-white dark:bg-black h-28 w-28 mx-auto overflow-hidden'>
              <img src={logoPreview} alt='Logo Preview' className='max-h-full max-w-full object-contain' />
              <Button type='button' variant='ghost' size='xs' className='mt-1 text-destructive text-[10px] h-4' onClick={() => { setLogoPreview(''); form.setValue('logoUrl', ''); }}>Remove Logo</Button>
            </div>
          ) : (
            <div className='mt-2 border-2 border-dashed border-stone-300 rounded flex items-center justify-center h-28 text-muted-foreground text-xs bg-white dark:bg-black'>
              No Logo Uploaded
            </div>
          )}
        </div>

        <div className='flex flex-col gap-2 p-4 border rounded-lg bg-stone-50 dark:bg-stone-900'>
          <label className='text-xs font-semibold' htmlFor='stamp-file'>Company Stamp & Signature</label>
          <Input id='stamp-file' type='file' accept='image/*' onChange={handleStampChange} />
          {stampPreview ? (
            <div className='mt-2 flex flex-col items-center justify-center p-2 border rounded bg-white dark:bg-black h-28 w-44 mx-auto overflow-hidden'>
              <img src={stampPreview} alt='Stamp Preview' className='max-h-full max-w-full object-contain' />
              <Button type='button' variant='ghost' size='xs' className='mt-1 text-destructive text-[10px] h-4' onClick={() => { setStampPreview(''); form.setValue('stampUrl', ''); }}>Remove Stamp</Button>
            </div>
          ) : (
            <div className='mt-2 border-2 border-dashed border-stone-300 rounded flex items-center justify-center h-28 text-muted-foreground text-xs bg-white dark:bg-black'>
              No Stamp Uploaded
            </div>
          )}
        </div>
      </div>

      <div className='pt-4'>
        <Button type='submit' size='sm' className='px-6'>Save Settings</Button>
      </div>
    </form>
  )
}
