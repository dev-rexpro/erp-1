import { type ColumnDef } from '@tanstack/react-table'
import { MoreVertical, Edit, FileText, Trash2, ShieldCheck } from 'lucide-react'
import { type VendorRateItem } from '../../data/schema'
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
import { useVendorRates } from './vendor-rates-provider'
import { toast } from 'sonner'

const rateStatusBadgeStyles: Record<string, string> = {
  Active: 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'Expiring Soon': 'border-slate-400 bg-slate-200 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100',
  Expired: 'border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400 line-through',
  Negotiating: 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
}

const VendorNameCell = ({ row }: { row: { original: VendorRateItem } }) => {
  const { setSelectedRateId } = useVendorRates()
  return (
    <div onClick={() => setSelectedRateId(row.original.id)} className='cursor-pointer group truncate max-w-[200px]'>
      <span className='font-semibold text-slate-900 dark:text-slate-100 group-hover:underline truncate block text-xs'>
        {row.original.vendorName}
      </span>
    </div>
  )
}

const RouteCell = ({ row }: { row: { original: VendorRateItem } }) => {
  const { setSelectedRateId } = useVendorRates()
  return (
    <div onClick={() => setSelectedRateId(row.original.id)} className='flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:underline'>
      <span>{row.original.origin}</span>
      <span className='text-slate-400'>→</span>
      <span>{row.original.destination}</span>
      <span className='text-muted-foreground font-normal ml-1'>({row.original.transitDays})</span>
    </div>
  )
}

const RowActions = ({ row }: { row: { original: VendorRateItem } }) => {
  const { setSelectedRateId } = useVendorRates()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <MoreVertical className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel className='text-xs'>Tariff Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSelectedRateId(row.original.id)} className='gap-2 text-xs cursor-pointer'>
          <Edit className='size-3.5' /> View & Edit Tariff Sheet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setSelectedRateId(row.original.id); setTimeout(() => window.print(), 500); }} className='gap-2 text-xs cursor-pointer'>
          <FileText className='size-3.5' /> Print Tariff Agreement
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success(`Simulating volume discounts for ${row.original.origin} → ${row.original.destination}`)} className='gap-2 text-xs cursor-pointer'>
          <ShieldCheck className='size-3.5' /> Simulate Volume Discount
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.error('Rate contract termination requires Procurement Director approval.')} className='gap-2 text-xs cursor-pointer text-destructive focus:text-destructive'>
          <Trash2 className='size-3.5' /> Terminate Rate Agreement
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const vendorRatesColumns: ColumnDef<VendorRateItem>[] = [
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
    accessorKey: 'vendorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Carrier Vendor' />
    ),
    cell: ({ row }) => <VendorNameCell row={row} />,
  },
  {
    accessorKey: 'origin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Transport Route' />
    ),
    cell: ({ row }) => <RouteCell row={row} />,
  },
  {
    accessorKey: 'baseRate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Base Rate (USD)' />
    ),
    cell: ({ row }) => (
      <span className='font-semibold text-slate-900 dark:text-slate-100 text-xs block truncate'>
        ${row.original.baseRate.toLocaleString('en-US')} / {row.original.equipmentType}
      </span>
    ),
  },
  {
    accessorKey: 'fuelSurchargePct',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fuel BAF' />
    ),
    cell: ({ row }) => (
      <span className='text-xs font-medium text-slate-700 dark:text-slate-300'>
        +{row.original.fuelSurchargePct}%
      </span>
    ),
  },
  {
    accessorKey: 'validFrom',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contract Validity' />
    ),
    cell: ({ row }) => (
      <span className='text-xs text-muted-foreground block'>
        {row.original.validFrom} to {row.original.validUntil}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      const style = rateStatusBadgeStyles[status] || rateStatusBadgeStyles.Active
      return (
        <Badge variant='outline' className={`px-2 py-0.5 text-[11px] font-medium ${style}`}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActions row={row} />,
  },
]
