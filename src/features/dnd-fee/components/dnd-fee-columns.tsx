import { type ColumnDef } from '@tanstack/react-table'
import { MoreVertical, Edit, FileText, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'

import { type DndFeeItem } from '../data/schema'
import { dndStatusBadgeStyles, dndTypeBadgeStyles } from '../data/data'
import { useDndFee } from './dnd-fee-provider'

const ContainerNoCell = ({ row }: { row: { original: DndFeeItem } }) => {
  const { setSelectedDndId } = useDndFee()
  return (
    <span
      onClick={() => setSelectedDndId(row.original.id)}
      className='cursor-pointer hover:underline font-semibold text-foreground truncate block'
    >
      {row.original.containerNo}
    </span>
  )
}

const RowActions = ({ row }: { row: { original: DndFeeItem } }) => {
  const { setSelectedDndId, setOpenDialog, setActiveItem } = useDndFee()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <MoreVertical className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-44'>
        <DropdownMenuLabel className='text-xs'>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSelectedDndId(row.original.id)} className='gap-2 text-xs cursor-pointer'>
          <Edit className='size-3.5' /> Edit & Statement
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.print()} className='gap-2 text-xs cursor-pointer'>
          <FileText className='size-3.5' /> Print D&D Statement
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setActiveItem(row.original)
            setOpenDialog('delete')
          }}
          className='gap-2 text-xs cursor-pointer text-destructive focus:text-destructive'
        >
          <Trash2 className='size-3.5' /> Delete Record
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

export const dndFeeColumns: ColumnDef<DndFeeItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'containerNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Container Number' />
    ),
    cell: ({ row }) => <ContainerNoCell row={row} />,
    meta: { title: 'Container Number' },
    enableHiding: false,
  },
  {
    accessorKey: 'blNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='BL & Carrier' />
    ),
    cell: ({ row }) => (
      <span className='font-medium text-foreground text-xs truncate block'>{row.original.blNumber} • {row.original.carrierName}</span>
    ),
    meta: { title: 'BL & Carrier' },
    enableHiding: true,
  },
  {
    accessorKey: 'terminalName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Terminal & Equipment' />
    ),
    cell: ({ row }) => (
      <span className='text-xs font-medium text-foreground truncate block'>{row.original.terminalName}</span>
    ),
    meta: { title: 'Terminal & Equipment' },
    enableHiding: true,
  },
  {
    accessorKey: 'dwellDays',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Free Time vs Dwell' />
    ),
    cell: ({ row }) => (
      <span className='text-xs text-foreground truncate block'>{row.original.freeTimeDays} Free / {row.original.dwellDays} Dwell</span>
    ),
    meta: { title: 'Free Time vs Dwell' },
    enableHiding: true,
  },
  {
    accessorKey: 'overdueDays',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Overdue Days' />
    ),
    cell: ({ row }) => {
      const days = row.original.overdueDays
      return (
        <span className='text-xs font-semibold truncate block'>
          {days > 0 ? `+${days} Days` : 'Within Free Time'}
        </span>
      )
    },
    meta: { title: 'Overdue Days' },
    enableHiding: true,
  },
  {
    accessorKey: 'totalFee',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Calculated D&D Fee' />
    ),
    cell: ({ row }) => {
      const fee = row.original.totalFee
      return (
        <span className='font-bold text-foreground text-xs truncate block'>
          {fee > 0 ? formatCurrency(fee) : '$0.00'}
        </span>
      )
    },
    meta: { title: 'Calculated D&D Fee' },
    enableHiding: true,
  },
  {
    accessorKey: 'feeType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fee Type' />
    ),
    cell: ({ row }) => {
      const type = row.original.feeType
      return (
        <Badge variant='outline' className={dndTypeBadgeStyles[type] || ''}>
          {type}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    meta: { title: 'Fee Type' },
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge variant='outline' className={dndStatusBadgeStyles[status] || ''}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    meta: { title: 'Status' },
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActions row={row} />,
  },
]
