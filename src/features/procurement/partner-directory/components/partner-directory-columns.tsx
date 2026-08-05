import { type ColumnDef } from '@tanstack/react-table'
import { MoreVertical, Edit, FileText, Trash2, ExternalLink } from 'lucide-react'
import { type PartnerDirectoryItem } from '../../data/schema'
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
import { usePartnerDirectory } from './partner-directory-provider'
import { toast } from 'sonner'

const partnerStatusBadgeStyles: Record<string, string> = {
  Active: 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'Under Review': 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  Inactive: 'border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400 line-through',
}

const PartnerCodeCell = ({ row }: { row: { original: PartnerDirectoryItem } }) => {
  const { setSelectedPartnerId } = usePartnerDirectory()
  return (
    <span
      onClick={() => setSelectedPartnerId(row.original.id)}
      className='cursor-pointer hover:underline text-xs font-semibold text-slate-900 dark:text-slate-100 truncate block'
    >
      {row.original.code}
    </span>
  )
}

const PartnerNameCell = ({ row }: { row: { original: PartnerDirectoryItem } }) => {
  const { setSelectedPartnerId } = usePartnerDirectory()
  return (
    <div onClick={() => setSelectedPartnerId(row.original.id)} className='cursor-pointer group truncate max-w-[220px]'>
      <span className='font-semibold text-slate-900 dark:text-slate-100 group-hover:underline truncate block text-xs'>
        {row.original.name}
      </span>
    </div>
  )
}

const RowActions = ({ row }: { row: { original: PartnerDirectoryItem } }) => {
  const { setSelectedPartnerId } = usePartnerDirectory()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <MoreVertical className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel className='text-xs'>Vendor Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSelectedPartnerId(row.original.id)} className='gap-2 text-xs cursor-pointer'>
          <Edit className='size-3.5' /> View / Edit Profile & Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setSelectedPartnerId(row.original.id); setTimeout(() => window.print(), 500); }} className='gap-2 text-xs cursor-pointer'>
          <FileText className='size-3.5' /> Print Vendor Sheet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(`mailto:${row.original.email}`)} className='gap-2 text-xs cursor-pointer'>
          <ExternalLink className='size-3.5' /> Contact Vendor via Email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.error('Partner account suspension requires Level 3 management approval.')} className='gap-2 text-xs cursor-pointer text-destructive focus:text-destructive'>
          <Trash2 className='size-3.5' /> Suspend Partner Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const partnerDirectoryColumns: ColumnDef<PartnerDirectoryItem>[] = [
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
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Partner Code' />
    ),
    cell: ({ row }) => <PartnerCodeCell row={row} />,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendor Partner & Service' />
    ),
    cell: ({ row }) => <PartnerNameCell row={row} />,
  },
  {
    accessorKey: 'contactPerson',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contact Person' />
    ),
    cell: ({ row }) => (
      <span className='truncate block text-xs font-medium text-slate-800 dark:text-slate-200'>
        {row.original.contactPerson} ({row.original.email})
      </span>
    ),
  },
  {
    accessorKey: 'slaScore',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SLA & Rating' />
    ),
    cell: ({ row }) => {
      const scoreStr = row.original.slaScore
      const rating = row.original.rating
      return (
        <span className='truncate block text-xs font-semibold text-slate-900 dark:text-slate-100'>
          {scoreStr} • {rating.toFixed(1)} ★
        </span>
      )
    },
  },
  {
    accessorKey: 'taxId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tax ID & Banking' />
    ),
    cell: ({ row }) => (
      <span className='truncate block text-xs font-medium text-slate-700 dark:text-slate-300'>
        NPWP: {row.original.taxId} ({row.original.paymentTerms})
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
      const style = partnerStatusBadgeStyles[status] || partnerStatusBadgeStyles.Active
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
