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

import { type ShippingInstruction } from '../data/schema'
import { siStatusBadgeStyles } from '../data/data'
import { useShippingInstructions } from './shipping-instructions-provider'

const SiNoCell = ({ row }: { row: { original: ShippingInstruction } }) => {
  const { setSelectedSiId } = useShippingInstructions()
  return (
    <span
      onClick={() => setSelectedSiId(row.original.id)}
      className='cursor-pointer hover:underline font-semibold text-foreground truncate block'
    >
      {row.original.siNo}
    </span>
  )
}

const RowActions = ({ row }: { row: { original: ShippingInstruction } }) => {
  const { setSelectedSiId, setOpenDialog, setActiveItem } = useShippingInstructions()

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
        <DropdownMenuItem onClick={() => setSelectedSiId(row.original.id)} className='gap-2 text-xs cursor-pointer'>
          <Edit className='size-3.5' /> Edit & Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.print()} className='gap-2 text-xs cursor-pointer'>
          <FileText className='size-3.5' /> Print SI Document
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

export const shippingInstructionsColumns: ColumnDef<ShippingInstruction>[] = [
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
    accessorKey: 'siNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SI Number' />
    ),
    cell: ({ row }) => <SiNoCell row={row} />,
    meta: { title: 'SI Number' },
    enableHiding: false,
  },
  {
    accessorKey: 'shipperName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shipper Account' />
    ),
    cell: ({ row }) => (
      <span className='font-medium text-foreground truncate block'>{row.original.shipperName}</span>
    ),
    meta: { title: 'Shipper Account' },
    enableHiding: true,
  },
  {
    accessorKey: 'carrierName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Carrier Line' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-foreground truncate block'>{row.original.carrierName}</span>
    ),
    meta: { title: 'Carrier Line' },
    enableHiding: true,
  },
  {
    accessorKey: 'vesselVoyage',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vessel & Voyage' />
    ),
    cell: ({ row }) => (
      <span className='text-xs font-medium text-foreground truncate block'>{row.original.vesselVoyage}</span>
    ),
    meta: { title: 'Vessel & Voyage' },
    enableHiding: true,
  },
  {
    accessorKey: 'pol',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='POL ➔ POD Route' />
    ),
    cell: ({ row }) => (
      <span className='text-xs text-foreground truncate block'>{row.original.pol} ➔ {row.original.pod}</span>
    ),
    meta: { title: 'POL ➔ POD Route' },
    enableHiding: true,
  },
  {
    accessorKey: 'grossWeight',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cargo Weight & Volume' />
    ),
    cell: ({ row }) => (
      <span className='text-xs text-foreground truncate block'>{row.original.grossWeight} ({row.original.packagesCount})</span>
    ),
    meta: { title: 'Cargo Weight & Volume' },
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
        <Badge variant='outline' className={siStatusBadgeStyles[status] || ''}>
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
