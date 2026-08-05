import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Building2, MapPin, CreditCard, DollarSign } from 'lucide-react'
import { type ClientCompany } from '@/lib/mock-data/master-data'
import { useClientAccounts } from './client-accounts-provider'

function CellActions({ client }: { client: ClientCompany }) {
  const { setSelectedClientId, setEditingClient, setIsEditOpen } = useClientAccounts()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setSelectedClientId(client.id)}>
          <Eye className='mr-2 h-4 w-4' /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setEditingClient(client)
            setIsEditOpen(true)
          }}
        >
          <Edit className='mr-2 h-4 w-4' /> Edit Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-destructive'
          onClick={() => {
            // Delete handle
          }}
        >
          Delete Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CountryFlag({ code }: { code: string }) {
  const flags: Record<string, string> = {
    ID: '🇮🇩',
    CN: '🇨🇳',
    SG: '🇸🇬',
    US: '🇺🇸',
    JP: '🇯🇵',
    AE: '🇦🇪',
  }
  return <span className='mr-1 text-base'>{flags[code] || '🌐'}</span>
}

export const clientAccountsColumns: ColumnDef<ClientCompany>[] = [
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
    accessorKey: 'id',
    header: 'Account ID',
    cell: ({ row }) => {
      const { setSelectedClientId } = useClientAccounts()
      return (
        <button
          onClick={() => setSelectedClientId(row.original.id)}
          className='text-xs font-medium hover:underline text-primary'
        >
          {row.getValue('id')}
        </button>
      )
    },
  },
  {
    accessorKey: 'name',
    header: 'Company Name',
    cell: ({ row }) => {
      const client = row.original
      const { setSelectedClientId } = useClientAccounts()
      return (
        <div className='flex items-center gap-2 max-w-[280px]'>
          <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-[11px] font-semibold text-foreground'>
            {client.initials}
          </div>
          <button
            onClick={() => setSelectedClientId(client.id)}
            className='text-left font-medium text-xs hover:underline truncate text-foreground'
          >
            {client.name}
          </button>
        </div>
      )
    },
  },
  {
    accessorKey: 'country',
    header: 'Location',
    cell: ({ row }) => {
      const client = row.original
      return (
        <div className='flex items-center gap-1.5 text-xs text-foreground truncate'>
          <CountryFlag code={client.country} />
          <span className='truncate'>{client.city}, {client.country}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'taxId',
    header: 'Tax ID / NPWP',
    cell: ({ row }) => {
      return (
        <span className='text-xs text-muted-foreground'>
          {(row.getValue('taxId') as string) || '-'}
        </span>
      )
    },
  },
  {
    accessorKey: 'contactPerson',
    header: 'Primary Contact',
    cell: ({ row }) => {
      const client = row.original
      return (
        <span className='text-xs text-foreground truncate'>
          {client.contactPerson || '-'}
        </span>
      )
    },
  },
  {
    accessorKey: 'creditLimit',
    header: 'Credit Limit',
    cell: ({ row }) => {
      const client = row.original
      const curr = client.currency || 'USD'
      const limit = client.creditLimit?.toLocaleString('en-US') || '0'

      return (
        <span className='text-xs font-medium text-foreground whitespace-nowrap'>
          {curr} {limit}
        </span>
      )
    },
  },
  {
    accessorKey: 'tier',
    header: 'Tier',
    cell: ({ row }) => {
      const tier = row.getValue('tier') as string
      return (
        <Badge
          variant={
            tier === 'Priority'
              ? 'default'
              : tier === 'Standard'
              ? 'secondary'
              : 'outline'
          }
          className='text-[10px] px-2 py-0.5 rounded-full font-normal'
        >
          {tier}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={
            status === 'Active'
              ? 'outline'
              : status === 'On Hold'
              ? 'secondary'
              : 'destructive'
          }
          className={
            status === 'Active'
              ? 'text-[10px] px-2 py-0.5 rounded-full font-normal bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300/60'
              : status === 'On Hold'
              ? 'text-[10px] px-2 py-0.5 rounded-full font-normal bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300/60'
              : 'text-[10px] px-2 py-0.5 rounded-full font-normal'
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellActions client={row.original} />,
  },
]
