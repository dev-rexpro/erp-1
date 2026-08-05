import { z, type ZodTypeAny } from 'zod'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'relation'
  | 'table'

export interface ChildTableColumn {
  name: string
  label: string
  type: Exclude<FieldType, 'table' | 'relation'>
  required?: boolean
  options?: string[]
}

export interface FieldSchema {
  name: string
  label: string
  type: FieldType
  required?: boolean
  showInList?: boolean
  showInForm?: boolean
  showInDetail?: boolean
  options?: string[]
  relationTo?: string // resource name, e.g., 'company'
  columns?: ChildTableColumn[] // for child table
  placeholder?: string
  defaultValue?: any
  validation?: ZodTypeAny
  description?: string
  badgeVariants?: Record<string, 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info'>
}

export interface ResourceSchema {
  name: string
  label: string
  pluralLabel: string
  module: string // e.g. 'export-import', 'freight'
  description?: string
  iconName?: string
  primaryKey?: string
  titleField: string
  fields: FieldSchema[]
  defaultSort?: {
    field: string
    direction: 'asc' | 'desc'
  }
}

/**
 * Utility function to build a Zod validation schema dynamically from a ResourceSchema
 */
export function buildZodSchema(schema: ResourceSchema): z.ZodObject<any> {
  const shape: Record<string, ZodTypeAny> = {}

  schema.fields.forEach((field) => {
    if (field.validation) {
      shape[field.name] = field.validation
      return
    }

    let fieldZod: ZodTypeAny

    switch (field.type) {
      case 'number':
      case 'currency':
        fieldZod = z.coerce.number()
        break
      case 'boolean':
        fieldZod = z.boolean()
        break
      case 'date':
      case 'datetime':
        fieldZod = z.string()
        break
      case 'multiselect':
        fieldZod = z.array(z.string())
        break
      case 'table':
        fieldZod = z.array(z.record(z.string(), z.any()))
        break
      default:
        fieldZod = z.string()
        break
    }

    if (!field.required) {
      fieldZod = fieldZod.optional().or(z.literal(''))
    } else if (field.type === 'text' || field.type === 'textarea' || field.type === 'select') {
      fieldZod = (fieldZod as z.ZodString).min(1, { message: `${field.label} is required` })
    }

    shape[field.name] = fieldZod
  })

  return z.object(shape)
}
