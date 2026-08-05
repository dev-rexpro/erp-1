import React, { useState } from 'react'
import type { ResourceSchema, FieldSchema } from '@/lib/resource-schema'
import { resourceStore } from '@/lib/resource-store'
import { getResourceSchema } from '@/resources'
import { DocumentFlowStepper } from './DocumentFlowStepper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Pencil, Trash2, Building2, Ship, Boxes, User, ShieldCheck, FileCheck, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { UserPermissionsTab } from '@/features/admin-settings/components/user-permissions-tab'

interface ResourceDetailViewProps {
  schema: ResourceSchema
  recordId: string
  onBack: () => void
  onEdit: () => void
  onDeleteSuccess: () => void
  onNavigateToRecord?: (resourceName: string, recordId: string) => void
}

export const ResourceDetailView: React.FC<ResourceDetailViewProps> = ({
  schema,
  recordId,
  onBack,
  onEdit,
  onDeleteSuccess,
  onNavigateToRecord,
}) => {
  const [, setTick] = useState(0)
  const record = resourceStore.getById(schema.name, recordId)

  const handleRefresh = () => {
    setTick((t) => t + 1)
  }

  if (!record) {
    return (
      <div className='flex flex-col items-center justify-center p-12 text-center gap-4 bg-card rounded-xl border'>
        <p className='text-sm text-muted-foreground'>Record not found for ID: {recordId}</p>
        <Button size='sm' onClick={onBack}>
          Back to List
        </Button>
      </div>
    )
  }

  const detailFields = schema.fields.filter((f) => f.showInDetail !== false)
  const titleVal = record[schema.titleField] || record.name || record.id
  const statusField = schema.fields.find((f) => f.name === 'status' || f.name === 'partnerType')
  const statusVal = statusField ? record[statusField.name] : null

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${titleVal}?`)) {
      resourceStore.delete(schema.name, recordId)
      toast.success(`${schema.label} deleted successfully`)
      onDeleteSuccess()
    }
  }

  const renderFieldValue = (field: FieldSchema) => {
    const rawVal = record[field.name]

    if (rawVal === null || rawVal === undefined || rawVal === '') {
      return <span className='text-muted-foreground text-xs'>—</span>
    }

    if (field.type === 'relation' && field.relationTo) {
      const targetSchema = getResourceSchema(field.relationTo)
      const targetRecord = resourceStore.getById(field.relationTo, String(rawVal))
      if (targetRecord && targetSchema) {
        return (
          <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-foreground text-xs font-medium'>
            <span>{targetRecord[targetSchema.titleField] || targetRecord.name || rawVal}</span>
            <span className='text-[10px] text-muted-foreground'>({rawVal})</span>
          </div>
        )
      }
      return <span className='text-xs font-medium'>{String(rawVal)}</span>
    }

    if (field.type === 'select' && field.badgeVariants && field.badgeVariants[String(rawVal)]) {
      const variant = field.badgeVariants[String(rawVal)]
      return (
        <Badge variant={variant === 'success' || variant === 'warning' || variant === 'info' ? 'secondary' : variant as any} className='text-xs font-normal'>
          {String(rawVal)}
        </Badge>
      )
    }

    if (field.type === 'currency') {
      const num = Number(rawVal) || 0
      return (
        <span className='text-sm font-semibold text-foreground'>
          ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    }

    if (field.type === 'textarea') {
      return (
        <div className='p-3 rounded-lg bg-muted/40 text-xs text-foreground leading-relaxed whitespace-pre-wrap border'>
          {String(rawVal)}
        </div>
      )
    }

    if (field.type === 'table') {
      const rows = (rawVal || []) as Record<string, any>[]
      const cols = field.columns || []
      return (
        <div className='rounded-lg border bg-card overflow-hidden mt-1'>
          <Table>
            <TableHeader className='bg-muted/50'>
              <TableRow>
                {cols.map((col) => (
                  <TableHead key={col.name} className='text-xs font-medium py-2'>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={cols.length} className='text-center text-xs text-muted-foreground py-4'>
                    No cargo items attached to this consignment.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, idx) => (
                  <TableRow key={idx}>
                    {cols.map((col) => (
                      <TableCell key={col.name} className='py-2 text-xs'>
                        {col.type === 'number' && typeof r[col.name] === 'number'
                          ? r[col.name].toLocaleString()
                          : r[col.name] || '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )
    }

    return <span className='text-xs font-medium text-foreground'>{String(rawVal)}</span>
  }

  const IconComponent = schema.name === 'company' ? Building2 : schema.name === 'shipment' ? Ship : Boxes

  return (
    <div className='flex flex-col gap-6 w-full pb-12'>
      {/* Header bar */}
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Button variant='outline' size='icon' onClick={onBack} className='size-9'>
            <ArrowLeft className='size-4' />
          </Button>
          <div className='flex items-center gap-2'>
            <div className='p-2 rounded-lg bg-primary/10 text-primary'>
              <IconComponent className='size-5' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-xl font-semibold tracking-tight text-foreground'>
                  {titleVal}
                </h1>
                {statusVal && statusField?.badgeVariants && (
                  <Badge variant={statusField.badgeVariants[String(statusVal)] as any} className='text-xs font-normal'>
                    {String(statusVal)}
                  </Badge>
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                {schema.label} • Record ID: <span>{record.id}</span>
              </p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={handleDelete} className='h-9 text-xs text-destructive hover:text-destructive gap-1.5'>
            <Trash2 className='size-3.5' /> Delete
          </Button>
          <Button size='sm' onClick={onEdit} className='h-9 text-xs gap-1.5'>
            <Pencil className='size-3.5' /> Edit {schema.label}
          </Button>
        </div>
      </div>

      {/* Document Flow Chain Stepper & Lifecycle Map */}
      {schema.name !== 'userAccount' && schema.name !== 'role' && schema.name !== 'moduleControl' && schema.name !== 'auditLog' && (
        <DocumentFlowStepper
          resourceName={schema.name}
          recordId={recordId}
          record={record}
          onNavigateToRecord={(rName, rId) => {
            if (onNavigateToRecord) {
              onNavigateToRecord(rName, rId)
            } else {
              toast.info(`Target linked document: ${rName} #${rId}`)
            }
          }}
          onRefresh={handleRefresh}
        />
      )}

      {/* Main Content: Render Tabs if userAccount, otherwise render standard detail card */}
      {schema.name === 'userAccount' ? (
        <Tabs defaultValue='profile' className='w-full space-y-6'>
          <div className='flex items-center justify-between border-b pb-3'>
            <TabsList className='bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl h-10'>
              <TabsTrigger value='profile' className='text-xs font-medium px-4 py-1.5 gap-2 rounded-lg data-[state=active]:bg-background shadow-none'>
                <User className='size-3.5' />
                <span>Account Profile & Details</span>
              </TabsTrigger>
              <TabsTrigger value='permissions' className='text-xs font-medium px-4 py-1.5 gap-2 rounded-lg data-[state=active]:bg-background shadow-none'>
                <ShieldCheck className='size-3.5 text-primary' />
                <span>Role & Permissions</span>
                {record.customOverrides && Object.keys(record.customOverrides).length > 0 && (
                  <Badge variant='secondary' className='text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium'>
                    {Object.keys(record.customOverrides).length} Custom
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='profile' className='m-0'>
            <div className='flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm w-full'>
              <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {detailFields
                  .filter((f) => f.type !== 'table')
                  .map((field) => (
                    <div
                      key={field.name}
                      className={field.type === 'textarea' ? 'sm:col-span-2 md:col-span-3 lg:col-span-4 space-y-1' : 'space-y-1'}
                    >
                      <div className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider'>
                        {field.label}
                      </div>
                      <div>{renderFieldValue(field)}</div>
                    </div>
                  ))}
              </div>

              {/* Child Table Fields */}
              {detailFields
                .filter((f) => f.type === 'table')
                .map((field) => (
                  <div key={field.name} className='pt-2 space-y-2'>
                    <Separator className='mb-4' />
                    <div className='text-xs font-semibold text-foreground uppercase tracking-wider'>
                      {field.label}
                    </div>
                    {renderFieldValue(field)}
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value='permissions' className='m-0'>
            <UserPermissionsTab userRecord={record} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className='flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm w-full'>
          <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {detailFields
              .filter((f) => f.type !== 'table')
              .map((field) => (
                <div
                  key={field.name}
                  className={field.type === 'textarea' ? 'sm:col-span-2 md:col-span-3 lg:col-span-4 space-y-1' : 'space-y-1'}
                >
                  <div className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider'>
                    {field.label}
                  </div>
                  <div>{renderFieldValue(field)}</div>
                </div>
              ))}
          </div>

          {/* Child Table Fields */}
          {detailFields
            .filter((f) => f.type === 'table')
            .map((field) => (
              <div key={field.name} className='pt-2 space-y-2'>
                <Separator className='mb-4' />
                <div className='text-xs font-semibold text-foreground uppercase tracking-wider'>
                  {field.label}
                </div>
                {renderFieldValue(field)}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
