import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, useWatch, Controller } from 'react-hook-form'
import { Save, Send, Hash, CalendarIcon } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'

const _defaultShipmentETA = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0]

import { StandardDetailView } from '@/components/templates'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { getInitials } from '@/lib/utils'

import { type Shipment } from '../data/schema'
import { useShipments } from './shipments-provider'
import { useDbStore } from '@/stores/db-store'

import { invoiceClients } from '../../client-invoices/components/invoice-form-data'

interface ShipmentDetailViewProps {
  data: Shipment[]
}

interface ShipmentFormValues {
  shipmentNo: string
  eta: string
  clientId: string
  clientName: string
  clientEmail: string
  amount: string
  carrierMode: string
  origin: string
  destination: string
  notes: string
}

function DatePicker({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const date = parseDateValue(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant='outline'
          data-empty={!date}
          className='w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground'
        >
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
          <CalendarIcon className='text-muted-foreground size-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={(selectedDate) => {
            if (!selectedDate) return
            onChange(format(selectedDate, 'yyyy-MM-dd'))
            setOpen(false)
          }}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  )
}

function parseDateValue(value: string) {
  const date = parseISO(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function ShipmentDetailView({ data }: ShipmentDetailViewProps) {
  const { selectedShipmentId, setSelectedShipmentId } = useShipments()
  const shipments = useDbStore((state) => state.shipments)

  const shipment = useMemo(() => {
    if (selectedShipmentId === 'new') return null
    return data.find((s) => s.id === selectedShipmentId) || null
  }, [data, selectedShipmentId])

  const formDefaults: ShipmentFormValues = useMemo(() => {
    if (shipment) {
      const matched = invoiceClients.find(
        (c) => c.name.toLowerCase() === shipment.firstName.toLowerCase()
      )
      
      const carrierMap: Record<string, string> = {
        superadmin: 'Air Freight',
        admin: 'Ocean Freight',
        manager: 'Land Transport',
        cashier: 'Rail Freight',
      }

      return {
        shipmentNo: shipment.username,
        eta: shipment.validUntil,
        clientId: matched?.id || 'bright-enterprises',
        clientName: shipment.firstName,
        clientEmail: shipment.email,
        amount: shipment.amount,
        carrierMode: carrierMap[shipment.role] || 'Air Freight',
        origin: 'CGK Terminal 3, ID',
        destination: 'SIN Cargo Core, SG',
        notes: 'Priority cargo. Handle with care. Refrigerated hold if rail/ocean.',
      }
    }
    return {
      shipmentNo: '',
      eta: '',
      clientId: '',
      clientName: '',
      clientEmail: '',
      amount: '',
      carrierMode: '',
      origin: '',
      destination: '',
      notes: '',
    }
  }, [shipment, shipments.length])

  const form = useForm<ShipmentFormValues>({ defaultValues: formDefaults })
  const w = useWatch({ control: form.control }) as ShipmentFormValues

  useEffect(() => {
    form.reset(formDefaults)
  }, [formDefaults, form])

  const activeClient = useMemo(() => {
    return invoiceClients.find((c) => c.id === w.clientId) || invoiceClients[0]
  }, [w.clientId])

  const handleSubmit = () => {
    toast.success(
      selectedShipmentId === 'new'
        ? `Shipment ${w.shipmentNo} created successfully!`
        : `Shipment ${w.shipmentNo} updated successfully!`
    )
    setSelectedShipmentId(null)
  }

  return (
    <FormProvider {...form}>
      <StandardDetailView
        title={selectedShipmentId === 'new' ? 'Register New Shipment' : 'Shipment Details'}
        subtitle="Fill in the shipment itinerary, assign carrier, set freight charges, and submit."
        isNew={selectedShipmentId === 'new'}
        onBack={() => setSelectedShipmentId(null)}
        hasPreview={false}
        primaryActions={
          <>
            <Button type='button' variant='outline' onClick={() => toast.success('Shipment saved successfully!')}>
              <Save className='mr-1.5 size-4' />
              Save
            </Button>
            <Button type='button' onClick={handleSubmit}>
              <Send className='mr-1.5 size-4' />
              Submit Shipment
            </Button>
          </>
        }
        renderForm={() => (
          <form className='grid gap-6' noValidate onSubmit={(e) => e.preventDefault()}>
            <div className='flex flex-col gap-6'>
              <section className='grid gap-5 md:grid-cols-2'>
                <Field className='gap-1'>
                  <FieldLabel className='text-xs'>Shipment Reference Number</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...form.register('shipmentNo')} />
                    <InputGroupAddon align='inline-end'>
                      <Hash className='size-4 text-muted-foreground' />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>

                <Field className='gap-1'>
                  <FieldLabel className='text-xs'>Carrier / Transport Mode</FieldLabel>
                  <Select value={w.carrierMode} onValueChange={(v) => form.setValue('carrierMode', v)}>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value='Air Freight'>Air Freight</SelectItem>
                        <SelectItem value='Ocean Freight'>Ocean Freight</SelectItem>
                        <SelectItem value='Land Transport'>Land Transport</SelectItem>
                        <SelectItem value='Rail Freight'>Rail Freight</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </section>

              <section className='grid gap-5 md:grid-cols-2'>
                <Field className='gap-1'>
                  <FieldLabel className='text-xs'>Estimated Delivery ETA</FieldLabel>
                  <Controller
                    control={form.control}
                    name='eta'
                    render={({ field }) => (
                      <DatePicker id='shipment-eta' value={field.value} onChange={field.onChange} />
                    )}
                  />
                </Field>

                <Field className='gap-1'>
                  <FieldLabel className='text-xs'>Freight Charge Value</FieldLabel>
                  <Input {...form.register('amount')} />
                </Field>
              </section>

              <Separator />

              <section className='flex flex-col gap-4'>
                <h2 className='font-medium text-md tracking-tight'>Origin & Destination</h2>
                <div className='grid gap-5 md:grid-cols-2'>
                  <Field className='gap-1'>
                    <FieldLabel className='text-xs'>Origin Port / Location</FieldLabel>
                    <Input {...form.register('origin')} placeholder='e.g., CGK Terminal 3, ID' />
                  </Field>
                  <Field className='gap-1'>
                    <FieldLabel className='text-xs'>Destination Port / Location</FieldLabel>
                    <Input {...form.register('destination')} placeholder='e.g., SIN Cargo, SG' />
                  </Field>
                </div>
              </section>

              <Separator />

              <section className='flex flex-col gap-4'>
                <h2 className='font-medium text-md tracking-tight'>Consignee / Client Account</h2>
                <Field className='gap-1'>
                  <FieldLabel className='text-xs'>Select Account</FieldLabel>
                  <Select
                    value={w.clientId}
                    onValueChange={(id) => {
                      const c = invoiceClients.find((x) => x.id === id)
                      if (c) {
                        form.setValue('clientId', c.id)
                        form.setValue('clientName', c.name)
                        form.setValue('clientEmail', c.email)
                      }
                    }}
                  >
                    <SelectTrigger className='w-full data-[size=default]:h-auto'>
                      <SelectValue placeholder='Select client'>
                        <div className='flex items-center gap-2 py-0.5'>
                          <Avatar className='after:rounded-md size-7'>
                            <AvatarFallback className='rounded-md bg-muted text-foreground text-[10px]'>
                              {getInitials(activeClient.name).slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='text-left text-xs'>
                            <div>{activeClient.name}</div>
                            <div className='text-muted-foreground text-[10px]'>{activeClient.email}</div>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent position='popper'>
                      <SelectGroup>
                        {invoiceClients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </section>

              <Separator />

              <section className='flex flex-col gap-4'>
                <h2 className='font-medium text-md tracking-tight'>Handling Notes & Instructions</h2>
                <Field className='gap-1'>
                  <FieldLabel className='text-xs'>Special Instructions</FieldLabel>
                  <Textarea {...form.register('notes')} className='min-h-[120px]' placeholder='Add container seal requirements, cargo temperature details...' />
                </Field>
              </section>
            </div>
          </form>
        )}
      />
    </FormProvider>
  )
}
