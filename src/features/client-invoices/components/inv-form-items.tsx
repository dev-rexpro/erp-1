import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

import { getLineAmount, type InvoiceFormValues } from './invoice-form-data'

export function InvFormItems() {
  const { control, register } = useFormContext<InvoiceFormValues>()
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'items',
    keyName: 'fieldKey',
  })
  const items = useWatch({ control, name: 'items' }) ?? []

  function handleAddItem() {
    append({ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 })
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='font-medium tracking-tight'>Invoice Items</h2>
        <Button type='button' variant='ghost' size='sm' onClick={handleAddItem}>
          <Plus className='mr-1.5 size-4' />
          Add Item
        </Button>
      </div>

      <div className='flex flex-col gap-2'>
        <div className='hidden items-center gap-2 px-1 font-medium text-muted-foreground text-xs md:grid md:grid-cols-[24px_minmax(0,1fr)_64px_112px_112px_32px]'>
          <span />
          <span>Description</span>
          <span className='px-2'>Units</span>
          <span className='px-2'>Unit cost</span>
          <span className='text-right'>Line Total</span>
          <span />
        </div>

        <div className='flex flex-col gap-3'>
          {fields.map((field, index) => (
            <div
              key={field.fieldKey}
              className='grid min-w-0 grid-cols-[24px_minmax(0,0.8fr)_minmax(0,1fr)_32px] items-center gap-2 rounded-lg md:grid-cols-[24px_minmax(0,1fr)_64px_112px_112px_32px]'
            >
              <Button
                type='button'
                variant='ghost'
                className='h-6 w-6 -ml-1 cursor-grab text-muted-foreground active:cursor-grabbing'
                aria-label={`Reorder item ${index + 1}`}
              >
                <GripVertical className='size-3.5' />
              </Button>
              <Input
                className='min-w-0 text-sm max-md:col-span-3'
                aria-label={`Item ${index + 1} description`}
                {...register(`items.${index}.description` as const)}
              />
              <Input
                type='number'
                step='1'
                className='text-sm max-md:col-start-2 max-md:row-start-2'
                aria-label={`Item ${index + 1} quantity`}
                {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
              />
              <Input
                type='number'
                step='0.01'
                className='text-sm max-md:col-start-3 max-md:row-start-2'
                aria-label={`Item ${index + 1} unit price`}
                {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
              />
              <div className='min-w-0 text-right font-medium text-sm max-md:col-span-3 max-md:col-start-2 max-md:row-start-3 max-md:flex max-md:items-center max-md:justify-between max-md:text-left'>
                <span className='hidden text-muted-foreground max-md:inline'>Line total</span>
                <span>{formatInvoiceCurrency(getLineAmount(items[index]))}</span>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                className='max-md:col-start-4 max-md:row-start-2'
                aria-label={`Remove item ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function formatInvoiceCurrency(value: number) {
  return formatCurrency(Number.isFinite(value) ? value : 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
