import React, { useState, useRef, useMemo, useCallback } from 'react'
import { useShippingInstructions } from './shipping-instructions-provider'
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
import { type ShippingInstruction } from '../data/schema'
import { siStatusBadgeStyles, siStatuses } from '../data/data'
import { cn } from '@/lib/utils'

interface SiReportViewProps {
  data: ShippingInstruction[]
  search: Record<string, unknown>
  navigate: unknown
}

const COLUMNS_CONFIG = [
  { id: 'index', label: '#', minWidth: 45, filterable: false, sortable: false },
  { id: 'siNo', label: 'SI Number', minWidth: 130, filterable: true, sortable: true },
  { id: 'shipperName', label: 'Shipper Account', minWidth: 160, filterable: true, sortable: true },
  { id: 'carrierName', label: 'Carrier Line', minWidth: 140, filterable: true, sortable: true },
  { id: 'vesselVoyage', label: 'Vessel & Voyage', minWidth: 150, filterable: true, sortable: true },
  { id: 'pol', label: 'POL Port', minWidth: 130, filterable: true, sortable: true },
  { id: 'pod', label: 'POD Port', minWidth: 130, filterable: true, sortable: true },
  { id: 'status', label: 'Status', minWidth: 120, filterable: true, sortable: false },
] as const

export function SiReportView({ data }: SiReportViewProps) {
  const { setSelectedSiId } = useShippingInstructions()

  const [colWidths, setColWidths] = useState<Record<string, number>>({
    index: 50,
    siNo: 140,
    shipperName: 180,
    carrierName: 150,
    vesselVoyage: 160,
    pol: 140,
    pod: 140,
    status: 130,
  })

  const [filters, setFilters] = useState<Record<string, string>>({
    siNo: '',
    shipperName: '',
    carrierName: '',
    vesselVoyage: '',
    pol: '',
    pod: '',
    status: 'all',
  })

  const [groupBy, setGroupBy] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [selectedCell, setSelectedCell] = useState<{ rowId: string; colId: string } | null>(null)
  const handleSelectCell = useCallback((cell: { rowId: string; colId: string } | null) => {
    setSelectedCell(cell)
  }, [])
  const [dragOverHeader, setDragOverHeader] = useState(false)

  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})

  const activeResizeCol = useRef<string | null>(null)
  const startResizeX = useRef<number>(0)
  const startWidth = useRef<number>(0)

  const handleMouseDown = (e: React.MouseEvent, colId: string) => {
    e.preventDefault()
    e.stopPropagation()
    activeResizeCol.current = colId
    startResizeX.current = e.clientX
    startWidth.current = colWidths[colId] || 150

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!activeResizeCol.current) return
    const deltaX = e.clientX - startResizeX.current
    const minWidth = COLUMNS_CONFIG.find(c => c.id === activeResizeCol.current)?.minWidth || 50
    const newWidth = Math.max(minWidth, startWidth.current + deltaX)
    setColWidths((prev) => ({
      ...prev,
      [activeResizeCol.current!]: newWidth,
    }))
  }

  const handleMouseUp = () => {
    activeResizeCol.current = null
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  const handleDragStart = (e: React.DragEvent, colId: string) => {
    e.dataTransfer.setData('text/plain', colId)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverHeader(false)
    const colId = e.dataTransfer.getData('text/plain')
    if (colId && ['siNo', 'shipperName', 'carrierName', 'status'].includes(colId)) {
      setGroupBy(colId)
      setCollapsedGroups({})
      toast.success(`Spreadsheet grouped by: ${colId.toUpperCase()}`)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverHeader(true)
  }

  const handleDragLeave = () => {
    setDragOverHeader(false)
  }

  const toggleSort = (colId: string) => {
    if (sortCol === colId) {
      if (sortDir === 'asc') {
        setSortDir('desc')
      } else {
        setSortCol(null)
      }
    } else {
      setSortCol(colId)
      setSortDir('asc')
    }
  }

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }))
  }

  const processedData = useMemo(() => {
    let result = [...data]

    result = result.filter((row) => {
      const matchSiNo = filters.siNo ? row.siNo.toLowerCase().includes(filters.siNo.toLowerCase()) : true
      const matchShipper = filters.shipperName ? row.shipperName.toLowerCase().includes(filters.shipperName.toLowerCase()) : true
      const matchCarrier = filters.carrierName ? row.carrierName.toLowerCase().includes(filters.carrierName.toLowerCase()) : true
      const matchVessel = filters.vesselVoyage ? row.vesselVoyage.toLowerCase().includes(filters.vesselVoyage.toLowerCase()) : true
      const matchPol = filters.pol ? row.pol.toLowerCase().includes(filters.pol.toLowerCase()) : true
      const matchPod = filters.pod ? row.pod.toLowerCase().includes(filters.pod.toLowerCase()) : true
      const matchStatus = filters.status && filters.status !== 'all' ? row.status === filters.status : true

      return matchSiNo && matchShipper && matchCarrier && matchVessel && matchPol && matchPod && matchStatus
    })

    if (sortCol) {
      result.sort((a, b) => {
        const valA = (a[sortCol as keyof ShippingInstruction] as string || '').toLowerCase()
        const valB = (b[sortCol as keyof ShippingInstruction] as string || '').toLowerCase()

        if (valA < valB) return sortDir === 'asc' ? -1 : 1
        if (valA > valB) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, filters, sortCol, sortDir])

  const groupedData = useMemo(() => {
    if (!groupBy) return null

    const groups: Record<string, ShippingInstruction[]> = {}
    processedData.forEach((row) => {
      const key = (row[groupBy as keyof ShippingInstruction] as string) || 'Unassigned'
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(row)
    })

    return groups
  }, [processedData, groupBy])

  const allRowsSelected = processedData.length > 0 && processedData.every(r => selectedRows[r.id])
  const toggleAllRows = () => {
    if (allRowsSelected) {
      setSelectedRows({})
    } else {
      const next: Record<string, boolean> = {}
      processedData.forEach(r => {
        next[r.id] = true
      })
      setSelectedRows(next)
    }
  }

  const toggleRowSelection = useCallback((id: string) => {
    setSelectedRows(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const selectedCount = Object.values(selectedRows).filter(Boolean).length

  return (
    <div className='flex flex-col flex-1 gap-4 animate-fade-in'>
      
      {/* Pivot / Group Panel */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border rounded-lg transition-all duration-150',
          dragOverHeader
            ? 'bg-accent/50 border-primary border-dashed ring-2 ring-primary/15'
            : 'bg-muted/40 border-border hover:bg-muted/50'
        )}
      >
        <div>
          <div className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
            <span>Pivot Column Grouping Mode</span>
          </div>
          <p className='text-[11px] text-muted-foreground mt-0.5'>
            Drag any column header down here to group. Or select a popular preset group from the list.
          </p>
        </div>

        <div className='flex items-center flex-wrap gap-1.5'>
          <Button
            variant={groupBy === 'carrierName' ? 'default' : 'outline'}
            size='sm'
            onClick={() => {
              setGroupBy(groupBy === 'carrierName' ? null : 'carrierName')
              setCollapsedGroups({})
            }}
            className='h-7 text-xs rounded-md'
          >
            Carrier Preset
          </Button>
          <Button
            variant={groupBy === 'status' ? 'default' : 'outline'}
            size='sm'
            onClick={() => {
              setGroupBy(groupBy === 'status' ? null : 'status')
              setCollapsedGroups({})
            }}
            className='h-7 text-xs rounded-md'
          >
            Status Preset
          </Button>

          {groupBy && (
            <div className='flex items-center gap-1.5 pl-2 border-l'>
              <Badge variant='secondary' className='h-6 rounded bg-primary/10 text-primary hover:bg-primary/10 text-xs border-none font-medium gap-1 flex items-center pr-1'>
                <span>Grouped by: {COLUMNS_CONFIG.find(c => c.id === groupBy)?.label}</span>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={(e) => {
                    e.stopPropagation()
                    setGroupBy(null)
                  }}
                  className='h-4 w-4 hover:bg-primary/20 hover:text-primary rounded-full p-0'
                >
                  <X size={10} />
                </Button>
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Spreadsheet grid container */}
      <div className='relative flex flex-col flex-1 border rounded-md bg-background overflow-hidden'>
        
        {selectedCount > 0 && (
          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 bg-popover border text-popover-foreground rounded-full shadow-lg border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-150'>
            <span className='text-xs font-semibold border-r pr-3 border-border'>
              {selectedCount} selected
            </span>
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                className='h-7 px-2.5 text-[11px] hover:bg-accent rounded-full'
                onClick={() => toast.success(`Exported ${selectedCount} Shipping Instructions.`)}
              >
                Print Documents
              </Button>
              <Button
                variant='ghost'
                className='h-7 px-2.5 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full'
                onClick={() => {
                  setSelectedRows({})
                  toast.success('Spreadsheet checkboxes cleared.')
                }}
              >
                Reset Selects
              </Button>
            </div>
          </div>
        )}

        <div className='overflow-x-auto w-full'>
          <table className='w-full border-collapse table-fixed select-none text-sm'>
            <colgroup>
              <col style={{ width: '45px' }} />
              {COLUMNS_CONFIG.map((col) => (
                <col key={col.id} style={{ width: colWidths[col.id] || 150 }} />
              ))}
            </colgroup>

            <TableHeader>
              <TableRow className='bg-muted/40 hover:bg-muted/40 h-10'>
                <TableHead className='p-0 text-center border-r align-middle'>
                  <div className='flex items-center justify-center '>
                    <Checkbox
                      checked={allRowsSelected}
                      onCheckedChange={toggleAllRows}
                      aria-label='Select all'
                      className='translate-y-[1px]'
                    />
                  </div>
                </TableHead>
                
                {COLUMNS_CONFIG.map((col) => (
                  <TableHead
                    key={col.id}
                    className='relative px-3 align-middle border-r text-xs font-medium text-muted-foreground select-none hover:bg-muted/60 transition-colors'
                  >
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, col.id)}
                      className='flex items-center justify-between cursor-grab active:cursor-grabbing h-full'
                    >
                      <span className='truncate'>{col.label}</span>
                      {col.sortable && (
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSort(col.id)
                          }}
                          className='h-5 w-5 hover:bg-accent p-0 cursor-pointer ml-1 text-muted-foreground/50 hover:text-foreground shrink-0'
                        >
                          <ArrowUpDown size={11} className={cn(sortCol === col.id ? 'text-foreground' : '')} />
                        </Button>
                      )}
                    </div>

                    <div
                      onMouseDown={(e) => handleMouseDown(e, col.id)}
                      className='absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors z-10'
                    />
                  </TableHead>
                ))}
              </TableRow>

              {/* SpreadSheet Filtering Row */}
              <TableRow className='bg-[#fafafa] dark:bg-muted/10 hover:bg-muted/10 h-11 border-b'>
                <TableHead className='border-r text-center align-middle'>
                  <Filter size={11} className='mx-auto text-muted-foreground/55' />
                </TableHead>

                {COLUMNS_CONFIG.map((col) => {
                  if (col.id === 'index') {
                    return (
                      <TableHead
                        key='filter-index'
                        className='px-2 border-r text-center text-[10px] font-medium text-muted-foreground/60 align-middle'
                      >
                        DATA
                      </TableHead>
                    )
                  }

                  if (col.id === 'status') {
                    return (
                      <TableHead key='filter-status' className='px-1 py-1.5 border-r align-middle'>
                        <Select
                          value={filters.status}
                          onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                        >
                          <SelectTrigger className='w-full h-7 text-xs px-2 shadow-none focus:ring-0 focus-visible:ring-0 [&_svg]:size-3'>
                            <SelectValue placeholder='All Statuses' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='all' className='text-xs'>All Statuses</SelectItem>
                            {siStatuses.map(s => (
                              <SelectItem key={s.value} value={s.value} className='text-xs'>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableHead>
                    )
                  }

                  return (
                    <TableHead key={`filter-${col.id}`} className='px-1 py-1.5 border-r align-middle relative'>
                      <div className='flex items-center relative'>
                        <Input
                          placeholder={`Filter ${col.label}...`}
                          value={filters[col.id] || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, [col.id]: e.target.value }))}
                          className='w-full h-7 pl-6 pr-5 text-xs bg-background border placeholder:text-muted-foreground/50 rounded-md focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-input'
                        />
                        <Search size={10} className='absolute left-2 text-muted-foreground/40' />
                        {filters[col.id] && (
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, [col.id]: '' }))}
                            className='absolute right-2 p-0.5 hover:bg-accent rounded text-muted-foreground/60'
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>

            <TableBody className='divide-y border-b'>
              {groupBy && groupedData ? (
                Object.keys(groupedData).map((groupKey) => {
                  const groupRows = groupedData[groupKey]
                  const isCollapsed = !!collapsedGroups[groupKey]
                  const count = groupRows.length

                  return (
                    <React.Fragment key={`group-pivot-${groupKey}`}>
                      <TableRow className='bg-muted/30 font-medium h-10 border-y'>
                        <TableCell colSpan={COLUMNS_CONFIG.length + 1} className='px-3 align-middle'>
                          <div
                            onClick={() => toggleGroup(groupKey)}
                            className='flex items-center gap-1.5 cursor-pointer text-xs text-foreground hover:text-foreground/80'
                          >
                            {isCollapsed ? <ChevronRight size={14} className='text-muted-foreground' /> : <ChevronDown size={14} className='text-muted-foreground' />}
                            <span className='text-[9px] bg-background border px-1 py-0.5 rounded mr-1 leading-none text-muted-foreground'>
                              {groupBy.toUpperCase()}
                            </span>
                            <span className='font-semibold'>{groupKey}</span>
                            <Badge variant='outline' className='ml-1.5 h-4 px-1 bg-background text-[10px] text-muted-foreground font-normal border-dashed rounded'>
                              {count}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>

                      {!isCollapsed &&
                        groupRows.map((row, index) => {
                          const isSelected = !!selectedRows[row.id]
                          return (
                            <SpreadsheetRow
                              key={row.id}
                              row={row}
                              index={index + 1}
                              isSelected={isSelected}
                              focusedColId={selectedCell?.rowId === row.id ? selectedCell.colId : null}
                              setSelectedCell={handleSelectCell}
                              setSelectedSiId={setSelectedSiId}
                              toggleRowSelection={toggleRowSelection}
                            />
                          )
                        })}
                    </React.Fragment>
                  )
                })
              ) : processedData.length > 0 ? (
                processedData.map((row, index) => {
                  const isSelected = !!selectedRows[row.id]
                  return (
                    <SpreadsheetRow
                      key={row.id}
                      row={row}
                      index={index + 1}
                      isSelected={isSelected}
                      focusedColId={selectedCell?.rowId === row.id ? selectedCell.colId : null}
                      setSelectedCell={handleSelectCell}
                      setSelectedSiId={setSelectedSiId}
                      toggleRowSelection={toggleRowSelection}
                    />
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={COLUMNS_CONFIG.length + 1} className='py-12 text-center text-muted-foreground'>
                    <div className='flex flex-col items-center justify-center gap-2'>
                      <span className='text-sm'>No shipping instructions found.</span>
                      <Button
                        size='sm'
                        variant='link'
                        onClick={() =>
                          setFilters({
                            siNo: '',
                            shipperName: '',
                            carrierName: '',
                            vesselVoyage: '',
                            pol: '',
                            pod: '',
                            status: 'all',
                          })
                        }
                        className='text-xs text-primary mt-1'
                      >
                        Reset Sheet Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>

        {/* Bottom bar status indicator */}
        <div className='flex items-center justify-between px-4 py-2 border-t bg-muted/20 font-sans text-[11px] text-muted-foreground/75'>
          <div className='flex items-center gap-2.5'>
            <span>CAPACITY: 500 records</span>
            <span className='w-1 h-1 rounded-full bg-border'></span>
            <span>MATCHED: {processedData.length} records</span>
          </div>

          <div className='flex items-center gap-1.5'>
            <Badge variant='outline' className='bg-background text-[10px] text-muted-foreground border-none tracking-tight gap-1 px-1.5 py-0'>
              <span className='h-1.5 w-1.5 rounded-full bg-emerald-500'></span>
              <span>Ledger Synced</span>
            </Badge>
          </div>
        </div>

      </div>
    </div>
  )
}

interface SpreadsheetRowProps {
  row: ShippingInstruction
  index: number
  isSelected: boolean
  focusedColId: string | null
  setSelectedCell: (cell: { rowId: string; colId: string } | null) => void
  setSelectedSiId: (id: string | null) => void
  toggleRowSelection: (id: string) => void
}

const SpreadsheetRow = React.memo(function SpreadsheetRow({
  row,
  index,
  isSelected,
  focusedColId,
  setSelectedCell,
  setSelectedSiId,
  toggleRowSelection,
}: SpreadsheetRowProps) {
  const getCellClasses = (colId: string) => {
    const isFocused = focusedColId === colId
    return cn(
      'px-3 py-2 align-middle border-r text-xs font-sans font-medium transition-all truncate h-10 select-none relative',
      isFocused ? 'ring-2 ring-primary ring-offset-0 z-[2] bg-primary/5' : '',
      isSelected ? 'bg-muted/40' : 'hover:bg-muted/15'
    )
  }

  const selectCell = (colId: string) => {
    setSelectedCell({ rowId: row.id, colId })
  }

  return (
    <TableRow className={cn('h-10 group', isSelected ? 'bg-muted/20' : '')}>
      <TableCell className='relative p-0 text-center align-middle border-r hover:bg-muted/20'>
        <div className='flex items-center justify-center w-full h-full'>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleRowSelection(row.id)}
            aria-label='Select row'
            className='translate-y-[1px]'
          />
        </div>
      </TableCell>

      <TableCell
        onClick={() => selectCell('index')}
        className={cn(getCellClasses('index'), 'text-muted-foreground text-center bg-muted/10')}
      >
        {index}
      </TableCell>

      <TableCell
        onClick={() => {
          selectCell('siNo')
          setSelectedSiId(row.id)
        }}
        className={cn(getCellClasses('siNo'), 'text-foreground cursor-pointer hover:underline')}
      >
        {row.siNo}
      </TableCell>

      <TableCell
        onClick={() => selectCell('shipperName')}
        className={cn(getCellClasses('shipperName'), 'text-foreground')}
      >
        {row.shipperName}
      </TableCell>

      <TableCell
        onClick={() => selectCell('carrierName')}
        className={getCellClasses('carrierName')}
      >
        <span className='truncate'>{row.carrierName}</span>
      </TableCell>

      <TableCell
        onClick={() => selectCell('vesselVoyage')}
        className={cn(getCellClasses('vesselVoyage'), 'text-foreground')}
      >
        {row.vesselVoyage}
      </TableCell>

      <TableCell
        onClick={() => selectCell('pol')}
        className={cn(getCellClasses('pol'), 'text-muted-foreground')}
      >
        {row.pol}
      </TableCell>

      <TableCell
        onClick={() => selectCell('pod')}
        className={cn(getCellClasses('pod'), 'text-muted-foreground')}
      >
        {row.pod}
      </TableCell>

      <TableCell
        onClick={() => selectCell('status')}
        className={getCellClasses('status')}
      >
        <Badge variant='outline' className={cn('text-[10px] py-0.5 px-2 h-5 font-medium rounded-md', siStatusBadgeStyles[row.status] || '')}>
          {row.status}
        </Badge>
      </TableCell>
    </TableRow>
  )
})
