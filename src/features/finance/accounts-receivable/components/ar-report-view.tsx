import React, { useState, useMemo } from 'react'
import { useAR } from './ar-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AccountsReceivableItem } from '../../data/finance-data'

interface ARReportViewProps {
  data: AccountsReceivableItem[]
}

const COLUMNS_CONFIG = [
  { id: 'index', label: '#', minWidth: 45 },
  { id: 'invoiceNumber', label: 'Invoice No', minWidth: 130 },
  { id: 'customerName', label: 'Customer Name', minWidth: 180 },
  { id: 'dueDate', label: 'Due Date', minWidth: 120 },
  { id: 'amount', label: 'Total Amount', minWidth: 130 },
  { id: 'balanceDue', label: 'Balance Due', minWidth: 130 },
  { id: 'agingCategory', label: 'Aging Bucket', minWidth: 130 },
  { id: 'status', label: 'Status', minWidth: 120 },
]

export function ARReportView({ data }: ARReportViewProps) {
  const { setSelectedArId } = useAR()
  const [filters] = useState<Record<string, string>>({})
  const [groupBy, setGroupBy] = useState<string | null>(null)
  const [sortCol] = useState<string | null>(null)
  const [sortDir] = useState<'asc' | 'desc'>('asc')

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const processedData = useMemo(() => {
    let result = [...data]

    result = result.filter((row) => {
      const matchInvoice = filters.invoiceNumber
        ? row.invoiceNumber.toLowerCase().includes(filters.invoiceNumber.toLowerCase())
        : true
      const matchCustomer = filters.customerName
        ? row.customerName.toLowerCase().includes(filters.customerName.toLowerCase())
        : true
      const matchAging = filters.agingCategory && filters.agingCategory !== 'all'
        ? row.agingCategory === filters.agingCategory
        : true
      const matchStatus = filters.status && filters.status !== 'all'
        ? row.status.toLowerCase() === filters.status.toLowerCase()
        : true

      return matchInvoice && matchCustomer && matchAging && matchStatus
    })

    if (sortCol) {
      result.sort((a: any, b: any) => {
        const valA = a[sortCol] || ''
        const valB = b[sortCol] || ''
        if (valA < valB) return sortDir === 'asc' ? -1 : 1
        if (valA > valB) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, filters, sortCol, sortDir])

  const groupedData = useMemo(() => {
    if (!groupBy) return null
    const groups: Record<string, AccountsReceivableItem[]> = {}
    processedData.forEach((row: any) => {
      const key = row[groupBy] || 'Unspecified'
      if (!groups[key]) groups[key] = []
      groups[key].push(row)
    })
    return groups
  }, [processedData, groupBy])

  return (
    <div className='flex flex-col flex-1 gap-4 animate-fade-in'>
      {/* Pivot Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50'>
        <div>
          <div className='text-xs font-semibold text-slate-900 dark:text-slate-100'>AR Spreadsheet & Pivot Mode</div>
          <p className='text-xs text-slate-500'>Group Accounts Receivable records by Aging, Customer, or Payment Status.</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant={groupBy === 'agingCategory' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setGroupBy(groupBy === 'agingCategory' ? null : 'agingCategory')}
            className='h-7 text-xs border-slate-300'
          >
            Group by Aging
          </Button>
          <Button
            variant={groupBy === 'status' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setGroupBy(groupBy === 'status' ? null : 'status')}
            className='h-7 text-xs border-slate-300'
          >
            Group by Status
          </Button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className='relative flex flex-col flex-1 border border-slate-200 dark:border-slate-800 rounded-md bg-background overflow-x-auto'>
        <table className='w-full border-collapse select-none text-sm'>
          <TableHeader className='bg-slate-100/70 dark:bg-slate-800/70'>
            <TableRow className='h-10 border-slate-200 dark:border-slate-800'>
              <TableHead className='w-10 border-r text-center'>#</TableHead>
              {COLUMNS_CONFIG.slice(1).map((col) => (
                <TableHead key={col.id} className='px-3 border-r font-semibold text-slate-700 dark:text-slate-300'>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y border-b border-slate-200 dark:border-slate-800'>
            {groupBy && groupedData ? (
              Object.keys(groupedData).map((groupKey) => (
                <React.Fragment key={groupKey}>
                  <TableRow className='bg-slate-100/50 font-semibold h-9 dark:bg-slate-800/50'>
                    <TableCell colSpan={COLUMNS_CONFIG.length} className='px-3'>
                      <span className='text-xs uppercase text-slate-500 mr-2'>{groupBy}:</span>
                      <span className='text-slate-900 dark:text-slate-100'>{groupKey}</span>
                      <Badge variant='outline' className='ml-2 text-xs border-slate-300'>
                        {groupedData[groupKey].length} records
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {groupedData[groupKey].map((row, idx) => (
                    <TableRow
                      key={row.id}
                      onClick={() => setSelectedArId(row.id)}
                      className='h-10 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer border-slate-200 dark:border-slate-800'
                    >
                      <TableCell className='text-center text-xs text-slate-400 border-r'>{idx + 1}</TableCell>
                      <TableCell className='font-medium text-slate-900 dark:text-slate-100 border-r'>{row.invoiceNumber}</TableCell>
                      <TableCell className='text-slate-800 dark:text-slate-200 border-r'>{row.customerName}</TableCell>
                      <TableCell className='text-slate-600 dark:text-slate-400 border-r'>{row.dueDate}</TableCell>
                      <TableCell className='text-right font-medium border-r'>{formatCurrency(row.amount)}</TableCell>
                      <TableCell className='text-right font-bold text-slate-900 dark:text-slate-100 border-r'>{formatCurrency(row.balanceDue)}</TableCell>
                      <TableCell className='border-r'>
                        <Badge variant='outline' className='border-slate-300 text-xs'>{row.agingCategory}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' className='border-slate-300 text-xs'>{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            ) : (
              processedData.map((row, idx) => (
                <TableRow
                  key={row.id}
                  onClick={() => setSelectedArId(row.id)}
                  className='h-10 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer border-slate-200 dark:border-slate-800'
                >
                  <TableCell className='text-center text-xs text-slate-400 border-r'>{idx + 1}</TableCell>
                  <TableCell className='font-medium text-slate-900 dark:text-slate-100 border-r'>{row.invoiceNumber}</TableCell>
                  <TableCell className='text-slate-800 dark:text-slate-200 border-r'>{row.customerName}</TableCell>
                  <TableCell className='text-slate-600 dark:text-slate-400 border-r'>{row.dueDate}</TableCell>
                  <TableCell className='text-right font-medium border-r'>{formatCurrency(row.amount)}</TableCell>
                  <TableCell className='text-right font-bold text-slate-900 dark:text-slate-100 border-r'>{formatCurrency(row.balanceDue)}</TableCell>
                  <TableCell className='border-r'>
                    <Badge variant='outline' className='border-slate-300 text-xs'>{row.agingCategory}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline' className='border-slate-300 text-xs'>{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
      </div>
    </div>
  )
}
