import React, { useState, useMemo, useCallback } from 'react'
import { usePartnerDirectory } from './partner-directory-provider'
import {
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { type PartnerDirectoryItem } from '../../data/schema'
import { cn } from '@/lib/utils'

interface PartnerDirectoryReportViewProps {
  data: PartnerDirectoryItem[]
}

const COLUMNS_CONFIG = [
  { id: 'index', label: '#', minWidth: 45, filterable: false, sortable: false },
  { id: 'code', label: 'Code', minWidth: 100, filterable: true, sortable: true },
  { id: 'name', label: 'Vendor Partner', minWidth: 180, filterable: true, sortable: true },
  { id: 'category', label: 'Category', minWidth: 140, filterable: true, sortable: true },
  { id: 'contactPerson', label: 'Contact', minWidth: 150, filterable: true, sortable: true },
  { id: 'email', label: 'Email', minWidth: 160, filterable: true, sortable: true },
  { id: 'country', label: 'Country', minWidth: 110, filterable: true, sortable: true },
  { id: 'slaScore', label: 'SLA Score', minWidth: 120, filterable: true, sortable: true },
  { id: 'status', label: 'Status', minWidth: 110, filterable: true, sortable: false },
] as const

export function PartnerDirectoryReportView({ data }: PartnerDirectoryReportViewProps) {
  const { setSelectedPartnerId } = usePartnerDirectory()

  const [colWidths, setColWidths] = useState<Record<string, number>>({
    index: 45,
    code: 100,
    name: 180,
    category: 140,
    contactPerson: 150,
    email: 160,
    country: 110,
    slaScore: 120,
    status: 110,
  })

  const [resizingCol, setResizingCol] = useState<string | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)

  const [globalSearch, setGlobalSearch] = useState('')
  const [colFilters, setColFilters] = useState<Record<string, string>>({})
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [groupBy, setGroupBy] = useState<'none' | 'category' | 'status'>('category')
  const [sortCol, setSortCol] = useState<string>('code')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const handleMouseDown = useCallback((e: React.MouseEvent, colId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingCol(colId)
    setResizeStartX(e.clientX)
    setResizeStartWidth(colWidths[colId] || 100)
  }, [colWidths])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingCol) return
    const delta = e.clientX - resizeStartX
    const newW = Math.max(40, resizeStartWidth + delta)
    setColWidths((prev) => ({ ...prev, [resizingCol]: newW }))
  }, [resizingCol, resizeStartX, resizeStartWidth])

  const handleMouseUp = useCallback(() => {
    setResizingCol(null)
  }, [])

  React.useEffect(() => {
    if (resizingCol) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [resizingCol, handleMouseMove, handleMouseUp])

  const handleSort = (colId: string) => {
    if (sortCol === colId) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(colId)
      setSortDir('asc')
    }
  }

  const handleSetColFilter = (colId: string, val: string) => {
    setColFilters((prev) => {
      const next = { ...prev }
      if (!val) delete next[colId]
      else next[colId] = val
      return next
    })
  }

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase()
        const match =
          item.code.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.contactPerson.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q)
        if (!match) return false
      }
      for (const [colId, filterVal] of Object.entries(colFilters)) {
        if (!filterVal.trim()) continue
        const f = filterVal.toLowerCase()
        const val = String((item as any)[colId] || '').toLowerCase()
        if (!val.includes(f)) return false
      }
      return true
    })
  }, [data, statusFilter, globalSearch, colFilters])

  const sortedData = useMemo(() => {
    const list = [...filteredData]
    list.sort((a, b) => {
      const va = (a as any)[sortCol] ?? ''
      const vb = (b as any)[sortCol] ?? ''
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va
      }
      const sa = String(va).toLowerCase()
      const sb = String(vb).toLowerCase()
      if (sa < sb) return sortDir === 'asc' ? -1 : 1
      if (sa > sb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [filteredData, sortCol, sortDir])

  const groups = useMemo(() => {
    if (groupBy === 'none') {
      return [{ key: 'All Partners', label: 'All Partners', items: sortedData }]
    }
    const map = new Map<string, PartnerDirectoryItem[]>()
    for (const item of sortedData) {
      const k = String((item as any)[groupBy] || 'Unassigned')
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(item)
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: `${key} (${items.length})`,
      items,
    }))
  }, [sortedData, groupBy])

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(sortedData.map((d) => d.id)))
    }
  }

  const activeFilterCount = Object.keys(colFilters).length + (statusFilter !== 'ALL' ? 1 : 0)

  return (
    <div className='flex flex-col h-full space-y-3 p-1'>
      {/* Pivot Controls Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs'>
        <div className='flex items-center gap-2 flex-wrap'>
          <div className='relative w-56'>
            <Search className='absolute left-2.5 top-2 size-3.5 text-muted-foreground' />
            <Input
              placeholder='Search partner report...'
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className='h-8 pl-8 text-xs'
            />
          </div>

          <div className='flex items-center gap-1.5'>
            <span className='text-muted-foreground font-medium'>Group By:</span>
            <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
              <SelectTrigger className='h-8 w-36 text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>None (Flat)</SelectItem>
                <SelectItem value='category'>Category</SelectItem>
                <SelectItem value='status'>Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-1.5'>
            <span className='text-muted-foreground font-medium'>Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='h-8 w-32 text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Statuses</SelectItem>
                <SelectItem value='Active'>Active</SelectItem>
                <SelectItem value='Under Review'>Under Review</SelectItem>
                <SelectItem value='Inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setColFilters({})
                setStatusFilter('ALL')
                setGlobalSearch('')
              }}
              className='h-8 text-xs text-muted-foreground hover:text-foreground gap-1'
            >
              <X className='size-3' /> Reset Filters
            </Button>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => toast.success(`Exporting ${filteredData.length} partner records to Excel...`)}
            className='h-8 text-xs font-medium'
          >
            Export CSV / XLS
          </Button>
        </div>
      </div>

      {/* Spreadsheet Data Grid */}
      <div className='relative rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-auto max-h-[calc(100vh-280px)]'>
        <table className='w-full border-collapse text-xs text-left'>
          <TableHeader className='bg-slate-100/80 dark:bg-slate-900/80 sticky top-0 z-20 backdrop-blur-xs'>
            <TableRow className='border-b border-slate-200 dark:border-slate-800 hover:bg-transparent'>
              <TableHead className='w-10 p-2 text-center border-r border-slate-200 dark:border-slate-800'>
                <Checkbox
                  checked={selectedRows.size > 0 && selectedRows.size === sortedData.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              {COLUMNS_CONFIG.map((col) => {
                const w = colWidths[col.id] || 100
                return (
                  <TableHead
                    key={col.id}
                    style={{ width: `${w}px`, minWidth: `${w}px` }}
                    className='relative p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 select-none group'
                  >
                    <div className='flex items-center justify-between gap-1'>
                      <span
                        className={cn(col.sortable && 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1')}
                        onClick={() => col.sortable && handleSort(col.id)}
                      >
                        {col.label}
                        {sortCol === col.id && (
                          <ArrowUpDown className='size-3 text-slate-500 inline' />
                        )}
                      </span>
                    </div>

                    {col.filterable && (
                      <div className='mt-1'>
                        <Input
                          placeholder='Filter...'
                          value={colFilters[col.id] || ''}
                          onChange={(e) => handleSetColFilter(col.id, e.target.value)}
                          className='h-6 text-[10px] px-1.5 py-0 bg-white dark:bg-slate-900'
                        />
                      </div>
                    )}

                    {/* Column Resizer Handle */}
                    <div
                      onMouseDown={(e) => handleMouseDown(e, col.id)}
                      className='absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-slate-400/50 dark:hover:bg-slate-600/50 transition-colors z-10'
                    />
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {groups.map((group) => {
              const isCollapsed = collapsedGroups.has(group.key)
              return (
                <React.Fragment key={group.key}>
                  {groupBy !== 'none' && (
                    <TableRow className='bg-slate-100/50 dark:bg-slate-900/50 font-semibold border-b border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'>
                      <TableCell colSpan={COLUMNS_CONFIG.length + 1} className='p-2 cursor-pointer' onClick={() => toggleGroup(group.key)}>
                        <div className='flex items-center gap-2 text-slate-800 dark:text-slate-200'>
                          {isCollapsed ? <ChevronRight className='size-4' /> : <ChevronDown className='size-4' />}
                          <span>{group.label}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {!isCollapsed &&
                    group.items.map((row, idx) => {
                      const isSelected = selectedRows.has(row.id)
                      return (
                        <TableRow
                          key={row.id}
                          className={cn(
                            'border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 cursor-pointer transition-colors',
                            isSelected && 'bg-slate-100/80 dark:bg-slate-800/50'
                          )}
                          onClick={() => setSelectedPartnerId(row.id)}
                        >
                          <TableCell
                            className='p-2 text-center border-r border-slate-100 dark:border-slate-900'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelectRow(row.id)}
                            />
                          </TableCell>
                          <TableCell className='p-2 border-r border-slate-100 dark:border-slate-900 text-slate-500 text-[11px]'>
                            {idx + 1}
                          </TableCell>
                          <TableCell className='p-2 border-r border-slate-100 dark:border-slate-900 font-semibold text-slate-900 dark:text-slate-100 truncate'>
                            {row.code}
                          </TableCell>
                          <TableCell className='p-2 border-r border-slate-100 dark:border-slate-900 font-medium text-slate-900 dark:text-slate-100 truncate max-w-[180px]'>
                            {row.name}
                          </TableCell>
                          <TableCell className='p-2 border-r border-slate-100 dark:border-slate-900 text-slate-700 dark:text-slate-300 truncate'>
                            {row.category}
                          </TableCell>
                          <TableCell className='p-2 border-r border-slate-100 dark:border-slate-900 text-slate-700 dark:text-slate-300 truncate'>
                            {row.contactPerson}
                          </TableCell>
                          <TableCell className='p-2 border-r border-slate-100 dark:border-slate-900 text-slate-600 dark:text-slate-400 truncate'>
                            {row.email}
                          </TableCell>
                          <TableCell className='p-2 border-r border-slate-100 dark:border-slate-900 text-slate-700 dark:text-slate-300 truncate'>
                            {row.country}
                          </TableCell>
                          <TableCell className='p-2 border-r border-slate-100 dark:border-slate-900 text-slate-900 dark:text-slate-100 font-semibold truncate'>
                            {row.slaScore} ({row.rating.toFixed(1)} ★)
                          </TableCell>
                          <TableCell className='p-2 border-r border-slate-100 dark:border-slate-900'>
                            <Badge variant='outline' className='text-[10px] px-1.5 py-0 font-medium'>
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </React.Fragment>
              )
            })}
          </TableBody>
        </table>
      </div>
    </div>
  )
}
