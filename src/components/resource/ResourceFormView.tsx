import React, { useState, useEffect } from 'react'
import type { ResourceSchema, FieldSchema, ChildTableColumn } from '@/lib/resource-schema'
import { buildZodSchema } from '@/lib/resource-schema'
import { resourceStore, getCurrentSessionUser, type ResourceRecord } from '@/lib/resource-store'
import { getResourceSchema } from '@/resources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, User, Clock, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

interface ResourceFormViewProps {
  schema: ResourceSchema
  recordId?: string | null
  onBack: () => void
  onSaveSuccess: (savedRecord: ResourceRecord) => void
}

export const ResourceFormView: React.FC<ResourceFormViewProps> = ({
  schema,
  recordId,
  onBack,
  onSaveSuccess,
}) => {
  const isEditing = Boolean(recordId && recordId !== 'new')
  const existingRecord = isEditing && recordId ? resourceStore.getById(schema.name, recordId) : null

  // Initialize form state
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const initial: Record<string, any> = {}
    schema.fields.forEach((f) => {
      if (isEditing && existingRecord && existingRecord[f.name] !== undefined) {
        initial[f.name] = existingRecord[f.name]
      } else if (f.type === 'table') {
        initial[f.name] = []
      } else if (f.type === 'boolean') {
        initial[f.name] = false
      } else {
        initial[f.name] = ''
      }
    })
    setFormData(initial)
    setErrors({})
  }, [schema.name, recordId, isEditing])

  const formFields = schema.fields.filter((f) => f.showInForm !== false)

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldName]
        return next
      })
    }
  }

  // Handle child table row addition
  const handleAddTableRow = (fieldName: string, columns?: ChildTableColumn[]) => {
    const currentRows = (formData[fieldName] || []) as Record<string, any>[]
    const newRow: Record<string, any> = {}
    columns?.forEach((col) => {
      newRow[col.name] = col.type === 'number' ? 0 : col.options ? col.options[0] : ''
    })
    setFormData((prev) => ({
      ...prev,
      [fieldName]: [...currentRows, newRow],
    }))
  }

  // Handle child table cell editing
  const handleTableCellChange = (
    fieldName: string,
    rowIndex: number,
    colName: string,
    val: any
  ) => {
    const currentRows = [...((formData[fieldName] || []) as Record<string, any>[])]
    if (currentRows[rowIndex]) {
      currentRows[rowIndex] = { ...currentRows[rowIndex], [colName]: val }
      setFormData((prev) => ({ ...prev, [fieldName]: currentRows }))
    }
  }

  // Remove child table row
  const handleRemoveTableRow = (fieldName: string, rowIndex: number) => {
    const currentRows = [...((formData[fieldName] || []) as Record<string, any>[])]
    currentRows.splice(rowIndex, 1)
    setFormData((prev) => ({ ...prev, [fieldName]: currentRows }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate using zod schema
    const zodSchema = buildZodSchema(schema)
    const result = zodSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path[0]
        if (path) {
          fieldErrors[String(path)] = issue.message
        }
      })
      setErrors(fieldErrors)
      toast.error('Please fix validation errors in the form.')
      return
    }

    const idToSave = existingRecord?.id || formData.id || formData.code || formData.shipmentNo || `ID-${Date.now()}`
    const recordToSave: ResourceRecord = {
      ...formData,
      id: idToSave,
    }

    resourceStore.save(schema.name, recordToSave)
    toast.success(`${schema.label} saved successfully!`)
    onSaveSuccess(recordToSave)
  }

  const renderFieldInput = (field: FieldSchema) => {
    const value = formData[field.name]
    const hasError = Boolean(errors[field.name])

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.name}
            value={value || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className='text-xs'
          />
        )

      case 'number':
      case 'currency':
        return (
          <Input
            id={field.name}
            type='number'
            value={value ?? ''}
            onChange={(e) => handleInputChange(field.name, e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={field.placeholder}
            className='text-xs'
          />
        )

      case 'date':
      case 'datetime':
        return (
          <Input
            id={field.name}
            type='date'
            value={value || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className='text-xs'
          />
        )

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(val) => handleInputChange(field.name, val)}
          >
            <SelectTrigger className='w-full text-xs'>
              <SelectValue placeholder={`Select ${field.label}...`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt} className='text-xs'>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'relation': {
        const targetSchema = field.relationTo ? getResourceSchema(field.relationTo) : null
        const targetRecords = field.relationTo ? resourceStore.getAll(field.relationTo) : []
        return (
          <Select
            value={value || ''}
            onValueChange={(val) => handleInputChange(field.name, val)}
          >
            <SelectTrigger className='w-full text-xs font-medium'>
              <SelectValue placeholder={`Select ${field.label}...`} />
            </SelectTrigger>
            <SelectContent>
              {targetRecords.map((r) => {
                const displayTitle = targetSchema ? r[targetSchema.titleField] || r.name || r.id : r.name || r.id
                return (
                  <SelectItem key={r.id} value={r.id} className='text-xs'>
                    {displayTitle} ({r.code || r.id})
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        )
      }

      case 'boolean':
        return (
          <div className='flex items-center gap-2 pt-1'>
            <input
              type='checkbox'
              id={field.name}
              checked={Boolean(value)}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className='size-4 rounded border-gray-300 text-primary focus:ring-primary'
            />
            <Label htmlFor={field.name} className='text-xs font-normal text-muted-foreground'>
              Enable / Active
            </Label>
          </div>
        )

      case 'table': {
        const rows = (value || []) as Record<string, any>[]
        const cols = field.columns || []
        return (
          <div className='flex flex-col gap-3 rounded-lg border bg-muted/20 p-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-xs font-medium'>{field.label}</Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => handleAddTableRow(field.name, cols)}
                className='h-8 text-xs gap-1'
              >
                <Plus className='size-3.5' /> Add Row
              </Button>
            </div>

            <div className='rounded-md border bg-card overflow-hidden'>
              <Table>
                <TableHeader className='bg-muted/50'>
                  <TableRow>
                    {cols.map((col) => (
                      <TableHead key={col.name} className='text-xs font-medium py-2'>
                        {col.label} {col.required ? '*' : ''}
                      </TableHead>
                    ))}
                    <TableHead className='w-[40px] py-2'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={cols.length + 1} className='text-center text-xs text-muted-foreground py-6'>
                        No item rows added yet. Click &quot;Add Row&quot; above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, rIdx) => (
                      <TableRow key={rIdx}>
                        {cols.map((col) => (
                          <TableCell key={col.name} className='p-2'>
                            {col.type === 'select' ? (
                              <Select
                                value={row[col.name] || ''}
                                onValueChange={(val) =>
                                  handleTableCellChange(field.name, rIdx, col.name, val)
                                }
                              >
                                <SelectTrigger className='w-full h-8 text-xs'>
                                  <SelectValue placeholder='Select...' />
                                </SelectTrigger>
                                <SelectContent>
                                  {col.options?.map((o) => (
                                    <SelectItem key={o} value={o} className='text-xs'>
                                      {o}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type={col.type === 'number' ? 'number' : 'text'}
                                value={row[col.name] ?? ''}
                                onChange={(e) =>
                                  handleTableCellChange(
                                    field.name,
                                    rIdx,
                                    col.name,
                                    col.type === 'number'
                                      ? e.target.value === ''
                                        ? ''
                                        : Number(e.target.value)
                                      : e.target.value
                                  )
                                }
                                className='h-8 text-xs'
                              />
                            )}
                          </TableCell>
                        ))}
                        <TableCell className='p-2 text-center'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => handleRemoveTableRow(field.name, rIdx)}
                            className='size-7 text-muted-foreground hover:text-destructive'
                          >
                            <Trash2 className='size-3.5' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      }

      default:
        return (
          <Input
            id={field.name}
            type='text'
            value={value || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className='text-xs'
          />
        )
    }
  }

  return (
    <div className='flex flex-col gap-6 w-full pb-12'>
      {/* Header bar */}
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Button variant='outline' size='icon' onClick={onBack} className='size-9'>
            <ArrowLeft className='size-4' />
          </Button>
          <div>
            <h1 className='text-xl font-semibold tracking-tight text-foreground'>
              {isEditing ? `Edit ${schema.label}` : `New ${schema.label}`}
            </h1>
            <p className='text-xs text-muted-foreground'>
              {isEditing
                ? `Update information for ${existingRecord?.[schema.titleField] || recordId}`
                : `Fill in details to register a new ${schema.label.toLowerCase()}`}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={onBack} className='h-9 text-xs'>
            Cancel
          </Button>
          <Button type='submit' form='resource-form' size='sm' className='h-9 text-xs gap-1.5'>
            <Save className='size-3.5' /> Save Record
          </Button>
        </div>
      </div>

      {/* Form Card */}
      <form id='resource-form' onSubmit={handleSubmit} className='flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm w-full'>
        <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {formFields.map((field) => {
            if (field.type === 'table') return null // rendered full width below

            return (
              <div
                key={field.name}
                className={field.type === 'textarea' ? 'sm:col-span-2 md:col-span-3 lg:col-span-4 space-y-1.5' : 'space-y-1.5'}
              >
                <div className='flex items-center justify-between'>
                  <Label htmlFor={field.name} className='text-xs font-medium text-foreground'>
                    {field.label} {field.required && <span className='text-destructive'>*</span>}
                  </Label>
                </div>

                {renderFieldInput(field)}

                {errors[field.name] && (
                  <p className='text-[11px] font-medium text-destructive'>{errors[field.name]}</p>
                )}
                {field.description && (
                  <p className='text-[11px] text-muted-foreground'>{field.description}</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Child Table Fields */}
        {formFields
          .filter((f) => f.type === 'table')
          .map((field) => (
            <div key={field.name} className='pt-2'>
              <Separator className='mb-6' />
              {renderFieldInput(field)}
            </div>
          ))}
      </form>
    </div>
  )
}
