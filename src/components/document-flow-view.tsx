import { useState, useRef } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  Truck,
  GitBranch,
  DollarSign,
  FileCheck2,
  Search,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { navigateToRecord } from '@/lib/document-flow'

export interface DocumentFlowNode {
  id: string
  docType: string
  docNumber: string
  lineItem?: string
  quantity?: number
  unit?: string
  refValue?: number
  currency?: string
  date: string
  time: string
  status: 'Completed' | 'Cleared' | 'Not Cleared' | 'In Process' | 'Active'
  createdBy?: string
  editedBy?: string
  children?: DocumentFlowNode[]
}

interface DocumentFlowViewProps {
  docNumber: string
  businessPartner: string
  materialOrRef: string
  initialNodes: DocumentFlowNode[]
  onBack: () => void
  onSelectDoc?: (docNumber: string, docType: string) => void
}

export function DocumentFlowView({
  docNumber,
  businessPartner,
  materialOrRef,
  initialNodes,
  onBack,
  onSelectDoc,
}: DocumentFlowViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'root-1': true,
    'root-1-1': true,
    'root-1-1-1': true,
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Resizable Columns Width State (in px)
  const [columnWidths, setColumnWidths] = useState({
    docChain: 380,
    qty: 80,
    unit: 80,
    refValue: 150,
    dateTime: 180,
    createdBy: 140,
    editedBy: 140,
    status: 130,
    action: 130,
  })

  const [activeResizing, setActiveResizing] = useState<string | null>(null)
  const isResizingRef = useRef<string | null>(null)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)

  const handleMouseDown = (colKey: keyof typeof columnWidths, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isResizingRef.current = colKey
    setActiveResizing(colKey)
    startXRef.current = e.clientX
    startWidthRef.current = columnWidths[colKey]

    // Lock global cursor during drag
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return
      const deltaX = moveEvent.clientX - startXRef.current
      const newWidth = Math.max(80, startWidthRef.current + deltaX)
      const targetCol = isResizingRef.current as keyof typeof columnWidths

      setColumnWidths((prev) => ({
        ...prev,
        [targetCol]: newWidth,
      }))
    }

    const handleMouseUp = () => {
      isResizingRef.current = null
      setActiveResizing(null)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }))
  }

  const formatCurrency = (val?: number, curr = 'USD') => {
    if (val === undefined || val === null) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleDocumentClick = (node: DocumentFlowNode) => {
    toast.success(`Navigating to linked document: ${node.docType} (${node.docNumber})`)
    if (onSelectDoc) {
      onSelectDoc(node.docNumber, node.docType)
    }
    navigateToRecord(node.docType, node.docNumber)
  }

  // Calculate total table min-width
  const totalTableWidth = Object.values(columnWidths).reduce((acc, curr) => acc + curr, 0)

  // Flatten tree into direct <TableRow> elements with HTML table-layout fixed
  const getFlatTreeRows = (nodes: DocumentFlowNode[], depth = 0, parentId = 'root'): React.ReactElement[] => {
    const rows: React.ReactElement[] = []

    nodes.forEach((node, idx) => {
      const nodeId = `${parentId}-${idx + 1}`
      const hasChildren = node.children && node.children.length > 0
      const isExpanded = expandedNodes[nodeId] ?? true
      const isCurrentDoc = node.docNumber.includes(docNumber)

      if (
        searchTerm &&
        !node.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !node.docType.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        if (!hasChildren) return
      }

      rows.push(
        <TableRow
          key={nodeId}
          className={`h-12 border-b border-slate-200 dark:border-slate-800 text-sm transition-colors ${
            isCurrentDoc
              ? 'bg-slate-100/90 font-semibold dark:bg-slate-800/90 text-slate-900 dark:text-slate-100'
              : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
          }`}
        >
          {/* Document Item with Indentation & Clickable Link */}
          <TableCell className='py-2.5 pl-4 pr-3 border-r border-slate-200 dark:border-slate-800 overflow-hidden'>
            <div className='flex items-center gap-2 min-w-0' style={{ paddingLeft: `${depth * 28}px` }}>
              {hasChildren ? (
                <button
                  onClick={() => toggleNode(nodeId)}
                  className='p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors shrink-0'
                >
                  {isExpanded ? (
                    <ChevronDown className='size-4' />
                  ) : (
                    <ChevronRight className='size-4' />
                  )}
                </button>
              ) : (
                <span className='w-6 shrink-0' />
              )}

              <div className='flex items-center gap-2 min-w-0 overflow-hidden'>
                {node.docType.includes('Order') || node.docType.includes('Quote') ? (
                  <FileText className='size-4 text-slate-500 shrink-0' />
                ) : node.docType.includes('Delivery') || node.docType.includes('Goods') ? (
                  <Truck className='size-4 text-slate-500 shrink-0' />
                ) : node.docType.includes('Invoice') || node.docType.includes('Bill') ? (
                  <DollarSign className='size-4 text-slate-500 shrink-0' />
                ) : (
                  <FileCheck2 className='size-4 text-slate-500 shrink-0' />
                )}

                {/* Clickable Document Link */}
                <button
                  onClick={() => handleDocumentClick(node)}
                  className='font-semibold text-slate-900 dark:text-slate-100 hover:underline hover:text-slate-700 dark:hover:text-slate-300 text-left flex items-center gap-1.5 group truncate min-w-0'
                >
                  <span className='truncate'>{node.docType} {node.docNumber}</span>
                  <ExternalLink className='size-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0' />
                </button>
              </div>
            </div>
          </TableCell>

          {/* Quantity */}
          <TableCell className='py-2.5 px-4 text-right border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium overflow-hidden'>
            {node.quantity !== undefined ? node.quantity : '—'}
          </TableCell>

          {/* Unit */}
          <TableCell className='py-2.5 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-500 overflow-hidden'>
            {node.unit || '—'}
          </TableCell>

          {/* Reference Amount */}
          <TableCell className='py-2.5 px-4 text-right font-medium border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden'>
            {node.refValue !== undefined ? formatCurrency(node.refValue, node.currency) : '—'}
          </TableCell>

          {/* Date & Time */}
          <TableCell className='py-2.5 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs sm:text-sm overflow-hidden'>
            {node.date} <span className='text-slate-400 text-xs ml-1'>({node.time})</span>
          </TableCell>

          {/* Created By */}
          <TableCell className='py-2.5 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs truncate overflow-hidden'>
            {node.createdBy || 'Bambang Sugianto'}
          </TableCell>

          {/* Edited By */}
          <TableCell className='py-2.5 px-4 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs truncate overflow-hidden'>
            {node.editedBy || node.createdBy || 'Rizky Pratama'}
          </TableCell>

          {/* Status */}
          <TableCell className='py-2.5 px-4 border-r border-slate-200 dark:border-slate-800 overflow-hidden'>
            {node.status === 'Completed' && (
              <Badge variant='outline' className='border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-normal'>
                Completed
              </Badge>
            )}
            {node.status === 'Cleared' && (
              <Badge variant='outline' className='border-slate-300 bg-slate-200/50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-normal'>
                Cleared
              </Badge>
            )}
            {node.status === 'Not Cleared' && (
              <Badge variant='outline' className='border-slate-400 bg-slate-200 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 font-semibold'>
                Not Cleared
              </Badge>
            )}
            {node.status === 'In Process' && (
              <Badge variant='outline' className='border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 font-normal'>
                In Process
              </Badge>
            )}
            {node.status === 'Active' && (
              <Badge variant='outline' className='border-slate-900 bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 font-bold'>
                Active
              </Badge>
            )}
          </TableCell>

          {/* Action Link Button */}
          <TableCell className='py-2.5 px-4 text-center overflow-hidden'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleDocumentClick(node)}
              className='h-7 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            >
              Open Document
            </Button>
          </TableCell>
        </TableRow>
      )

      if (hasChildren && isExpanded) {
        rows.push(...getFlatTreeRows(node.children!, depth + 1, nodeId))
      }
    })

    return rows
  }

  return (
    <div className='flex flex-col flex-1 gap-6 animate-fade-in pb-12 w-full'>
      {/* Top Header Navigation */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4'>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='sm'
            onClick={onBack}
            className='h-9 w-9 p-0 border-slate-300 dark:border-slate-700'
          >
            <ArrowLeft className='size-4' />
          </Button>
          <div>
            <div className='flex items-center gap-2.5'>
              <GitBranch className='size-5 text-slate-700 dark:text-slate-300' />
              <h1 className='text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
                Document Flow — {docNumber}
              </h1>
            </div>
            <p className='text-xs text-slate-500 mt-0.5'>
              Partner Account: <span className='font-semibold text-slate-800 dark:text-slate-200'>{businessPartner}</span> • Reference: {materialOrRef}
            </p>
          </div>
        </div>

        {/* Filter Input */}
        <div className='flex items-center gap-3 shrink-0'>
          <div className='relative w-72'>
            <Search className='absolute left-3 top-2.5 size-4 text-slate-400' />
            <Input
              placeholder='Filter document number or stage...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='h-9 pl-9 text-xs border-slate-300 dark:border-slate-700'
            />
          </div>
        </div>
      </div>

      {/* Fully Resizable Table Container */}
      <div className='relative flex flex-col flex-1 border border-slate-200 dark:border-slate-800 rounded-lg bg-background overflow-x-auto shadow-sm'>
        <Table className='w-full border-collapse table-fixed text-sm' style={{ width: `${totalTableWidth}px` }}>
          {/* HTML Colgroup enforces exact column width syncing between Th and Td */}
          <colgroup>
            <col style={{ width: `${columnWidths.docChain}px` }} />
            <col style={{ width: `${columnWidths.qty}px` }} />
            <col style={{ width: `${columnWidths.unit}px` }} />
            <col style={{ width: `${columnWidths.refValue}px` }} />
            <col style={{ width: `${columnWidths.dateTime}px` }} />
            <col style={{ width: `${columnWidths.createdBy}px` }} />
            <col style={{ width: `${columnWidths.editedBy}px` }} />
            <col style={{ width: `${columnWidths.status}px` }} />
            <col style={{ width: `${columnWidths.action}px` }} />
          </colgroup>

          <TableHeader className='bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 select-none'>
            <TableRow className='h-11 border-slate-200 dark:border-slate-800'>
              {/* Document Chain Header */}
              <TableHead className='font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 pl-4 relative group'>
                <span className='truncate block'>Document Chain & Related Items</span>
                <div
                  onMouseDown={(e) => handleMouseDown('docChain', e)}
                  className={`absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-30 flex items-center justify-center group/handle ${
                    activeResizing === 'docChain' ? 'bg-blue-500/20' : ''
                  }`}
                  title='Click and drag to resize column'
                >
                  <div className={`w-0.5 h-full transition-colors ${
                    activeResizing === 'docChain' ? 'bg-blue-600' : 'bg-transparent group-hover/handle:bg-blue-500'
                  }`} />
                </div>
              </TableHead>

              {/* Qty Header */}
              <TableHead className='font-bold text-slate-700 dark:text-slate-300 text-right border-r border-slate-200 dark:border-slate-800 relative group pr-4'>
                <span className='truncate block'>Qty</span>
                <div
                  onMouseDown={(e) => handleMouseDown('qty', e)}
                  className={`absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-30 flex items-center justify-center group/handle ${
                    activeResizing === 'qty' ? 'bg-blue-500/20' : ''
                  }`}
                  title='Click and drag to resize column'
                >
                  <div className={`w-0.5 h-full transition-colors ${
                    activeResizing === 'qty' ? 'bg-blue-600' : 'bg-transparent group-hover/handle:bg-blue-500'
                  }`} />
                </div>
              </TableHead>

              {/* Unit Header */}
              <TableHead className='font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 pl-4 relative group'>
                <span className='truncate block'>Unit</span>
                <div
                  onMouseDown={(e) => handleMouseDown('unit', e)}
                  className={`absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-30 flex items-center justify-center group/handle ${
                    activeResizing === 'unit' ? 'bg-blue-500/20' : ''
                  }`}
                  title='Click and drag to resize column'
                >
                  <div className={`w-0.5 h-full transition-colors ${
                    activeResizing === 'unit' ? 'bg-blue-600' : 'bg-transparent group-hover/handle:bg-blue-500'
                  }`} />
                </div>
              </TableHead>

              {/* Reference Amount Header */}
              <TableHead className='font-bold text-slate-700 dark:text-slate-300 text-right border-r border-slate-200 dark:border-slate-800 pr-4 relative group'>
                <span className='truncate block'>Reference Amount</span>
                <div
                  onMouseDown={(e) => handleMouseDown('refValue', e)}
                  className={`absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-30 flex items-center justify-center group/handle ${
                    activeResizing === 'refValue' ? 'bg-blue-500/20' : ''
                  }`}
                  title='Click and drag to resize column'
                >
                  <div className={`w-0.5 h-full transition-colors ${
                    activeResizing === 'refValue' ? 'bg-blue-600' : 'bg-transparent group-hover/handle:bg-blue-500'
                  }`} />
                </div>
              </TableHead>

              {/* Date & Time Header */}
              <TableHead className='font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 pl-4 relative group'>
                <span className='truncate block'>Date & Time</span>
                <div
                  onMouseDown={(e) => handleMouseDown('dateTime', e)}
                  className={`absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-30 flex items-center justify-center group/handle ${
                    activeResizing === 'dateTime' ? 'bg-blue-500/20' : ''
                  }`}
                  title='Click and drag to resize column'
                >
                  <div className={`w-0.5 h-full transition-colors ${
                    activeResizing === 'dateTime' ? 'bg-blue-600' : 'bg-transparent group-hover/handle:bg-blue-500'
                  }`} />
                </div>
              </TableHead>

              {/* Created By Header */}
              <TableHead className='font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 pl-4 relative group'>
                <span className='truncate block'>Created By</span>
                <div
                  onMouseDown={(e) => handleMouseDown('createdBy', e)}
                  className={`absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-30 flex items-center justify-center group/handle ${
                    activeResizing === 'createdBy' ? 'bg-blue-500/20' : ''
                  }`}
                  title='Click and drag to resize column'
                >
                  <div className={`w-0.5 h-full transition-colors ${
                    activeResizing === 'createdBy' ? 'bg-blue-600' : 'bg-transparent group-hover/handle:bg-blue-500'
                  }`} />
                </div>
              </TableHead>

              {/* Edited By Header */}
              <TableHead className='font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 pl-4 relative group'>
                <span className='truncate block'>Edited By</span>
                <div
                  onMouseDown={(e) => handleMouseDown('editedBy', e)}
                  className={`absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-30 flex items-center justify-center group/handle ${
                    activeResizing === 'editedBy' ? 'bg-blue-500/20' : ''
                  }`}
                  title='Click and drag to resize column'
                >
                  <div className={`w-0.5 h-full transition-colors ${
                    activeResizing === 'editedBy' ? 'bg-blue-600' : 'bg-transparent group-hover/handle:bg-blue-500'
                  }`} />
                </div>
              </TableHead>

              {/* Status Header */}
              <TableHead className='font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 pl-4 relative group'>
                <span className='truncate block'>Status</span>
                <div
                  onMouseDown={(e) => handleMouseDown('status', e)}
                  className={`absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize z-30 flex items-center justify-center group/handle ${
                    activeResizing === 'status' ? 'bg-blue-500/20' : ''
                  }`}
                  title='Click and drag to resize column'
                >
                  <div className={`w-0.5 h-full transition-colors ${
                    activeResizing === 'status' ? 'bg-blue-600' : 'bg-transparent group-hover/handle:bg-blue-500'
                  }`} />
                </div>
              </TableHead>

              {/* Action Link Header */}
              <TableHead className='font-bold text-slate-700 dark:text-slate-300 text-center'>
                Link Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y border-b border-slate-200 dark:border-slate-800'>
            {getFlatTreeRows(initialNodes)}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
