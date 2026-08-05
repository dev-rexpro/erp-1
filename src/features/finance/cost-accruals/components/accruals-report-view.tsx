import React, { useState, useMemo } from 'react'
import { useAccruals } from './accruals-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CostAccrualItem } from '../../data/finance-data'

interface AccrualsReportViewProps {
  data: CostAccrualItem[]
}

const COLUMNS_CONFIG = [
  { id: 'index', label: '#', minWidth: 45 },
  { id: 'id', label: 'Accrual ID', minWidth: 130 },
  { id: 'category', label: 'Category', minWidth: 180 },
  { id: 'shipmentRef', label: 'Shipment / BL', minWidth: 160 },
  { id: 'vendorName', label: 'Vendor Carrier', minWidth: 180 },
  { id: 'estimatedAmount', label: 'Est. Provision', minWidth: 130 },
  { id: 'actualAmount', label: 'Actual Bill', minWidth: 130 },
  { id: 'status', label: 'Status', minWidth: 120 },
]

export function AccrualsReportView({ data }: AccrualsReportViewProps) {
  const { setSelectedAccrualId } = useAccruals()
  const [groupBy, setGroupBy] = useState<string | null>(null)

  const formatCurrency = (val: number | null) => {
    if (val === null) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const groupedData = useMemo(() => {
    if (!groupBy) return null
    const groups: Record<string, CostAccrualItem[]> = {}
    data.forEach((row: any) => {
      const key = row[groupBy] || 'Unspecified'
      if (!groups[key]) groups[key] = []
      groups[key].push(row)
    })
    return groups
  }, [data, groupBy])

  return (
    <div className='flex flex-col flex-1 gap-4 animate-fade-in'>
      {/* Pivot Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50'>
        <div>
          <div className='text-xs font-semibold text-slate-900 dark:text-slate-100'>Cost Accruals Pivot Grid</div>
          <p className='text-xs text-slate-500'>Pivot spreadsheet view for operational voyage provisions and carrier bill matching.</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant={groupBy === 'category' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setGroupBy(groupBy === 'category' ? null : 'category')}
            className='h-7 text-xs border-slate-300'
          >
            Group by Category
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
                      onClick={() => setSelectedAccrualId(row.id)}
                      className='h-10 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer border-slate-200 dark:border-slate-800'
                    >
                      <TableCell className='text-center text-xs text-slate-400 border-r'>{idx + 1}</TableCell>
                      <TableCell className='font-medium text-slate-900 dark:text-slate-100 border-r'>{row.id}</TableCell>
                      <TableCell className='text-slate-800 dark:text-slate-200 border-r'>{row.category}</TableCell>
                      <TableCell className='text-slate-600 dark:text-slate-400 border-r'>{row.shipmentRef} ({row.blNumber})</TableCell>
                      <TableCell className='text-slate-800 dark:text-slate-200 border-r'>{row.vendorName}</TableCell>
                      <TableCell className='text-right font-medium border-r'>{formatCurrency(row.estimatedAmount)}</TableCell>
                      <TableCell className='text-right font-medium border-r'>{formatCurrency(row.actualAmount)}</TableCell>
                      <TableCell>
                        <Badge variant='outline' className='border-slate-300 text-xs'>{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            ) : (
              data.map((row, idx) => (
                <TableRow
                  key={row.id}
                  onClick={() => setSelectedAccrualId(row.id)}
                  className='h-10 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer border-slate-200 dark:border-slate-800'
                >
                  <TableCell className='text-center text-xs text-slate-400 border-r'>{idx + 1}</TableCell>
                  <TableCell className='font-medium text-slate-900 dark:text-slate-100 border-r'>{row.id}</TableCell>
                  <TableCell className='text-slate-800 dark:text-slate-200 border-r'>{row.category}</TableCell>
                  <TableCell className='text-slate-600 dark:text-slate-400 border-r'>{row.shipmentRef} ({row.blNumber})</TableCell>
                  <TableCell className='text-slate-800 dark:text-slate-200 border-r'>{row.vendorName}</TableCell>
                  <TableCell className='text-right font-medium border-r'>{formatCurrency(row.estimatedAmount)}</TableCell>
                  <TableCell className='text-right font-medium border-r'>{formatCurrency(row.actualAmount)}</TableCell>
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
