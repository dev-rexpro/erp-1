import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  User,
  CreditCard,
  FileText,
  DollarSign,
  Landmark,
  ShieldCheck,
  Edit,
  X,
  Globe2,
  Calendar,
  FileCheck2,
  Truck,
} from 'lucide-react'
import { useDbStore } from '@/stores/db-store'
import { useClientAccounts } from './client-accounts-provider'

function CountryFlag({ code }: { code: string }) {
  const flags: Record<string, string> = {
    ID: '🇮🇩 Indonesia',
    CN: '🇨🇳 China',
    SG: '🇸🇬 Singapore',
    US: '🇺🇸 United States',
    JP: '🇯🇵 Japan',
    AE: '🇦🇪 UAE / Dubai',
  }
  return <span>{flags[code] || code}</span>
}

export function ClientAccountDetailView({ clientId }: { clientId: string }) {
  const { clients, contracts, clientInvoices, shipments } = useDbStore()
  const { setSelectedClientId, setEditingClient, setIsEditOpen } = useClientAccounts()

  const client = clients.find((c) => c.id === clientId) || clients[0]

  if (!client) {
    return (
      <div className='flex items-center justify-center p-8 text-muted-foreground'>
        Client account not found.
      </div>
    )
  }

  // Filter related records
  const clientContracts = contracts?.filter((c) => c.clientId === client.id || c.clientName?.includes(client.shortName)) || []
  const clientInvoicesList = clientInvoices?.filter((inv) => inv.clientId === client.id || inv.clientName?.includes(client.shortName)) || []
  const clientShipmentsList = shipments?.filter((s) => s.clientId === client.id || s.exporterName?.includes(client.shortName) || s.importerName?.includes(client.shortName)) || []

  return (
    <div className='flex flex-col gap-6 pb-12'>
      {/* Top Banner / Header (Uncarded, clean layout without bottom border) */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex items-start gap-4'>
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted border border-border font-bold text-base text-foreground'>
            {client.initials}
          </div>
          <div className='space-y-1'>
            <div className='flex items-center gap-2 flex-wrap'>
              <h2 className='text-xl font-bold tracking-tight text-foreground'>
                {client.name}
              </h2>
              <Badge variant='outline' className='text-xs font-normal'>
                {client.id}
              </Badge>
              <Badge
                variant={
                  client.status === 'Active'
                    ? 'outline'
                    : client.status === 'On Hold'
                    ? 'secondary'
                    : 'destructive'
                }
                className={
                  client.status === 'Active'
                    ? 'rounded-full text-xs px-2.5 font-normal bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300/60'
                    : client.status === 'On Hold'
                    ? 'rounded-full text-xs px-2.5 font-normal bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300/60'
                    : 'rounded-full text-xs px-2.5 font-normal'
                }
              >
                {client.status || 'Active'}
              </Badge>
              <Badge
                variant={client.tier === 'Priority' ? 'default' : 'secondary'}
                className='rounded-full text-xs px-2.5 font-normal'
              >
                {client.tier} Tier
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground flex items-center gap-2'>
              <Building2 className='h-3.5 w-3.5 text-muted-foreground' />
              {client.industry} • <CountryFlag code={client.country} />
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 self-start md:self-auto'>
          <Button
            variant='outline'
            size='sm'
            className='h-8 text-xs'
            onClick={() => {
              setEditingClient(client)
              setIsEditOpen(true)
            }}
          >
            <Edit className='mr-1.5 h-3.5 w-3.5 text-muted-foreground' /> Edit Details
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => setSelectedClientId(null)}
          >
            <X className='h-4 w-4 text-muted-foreground' />
          </Button>
        </div>
      </div>

      {/* Accounting & Financial Summary Stat Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='p-4 rounded-xl border border-border bg-card shadow-none'>
          <div className='flex items-center justify-between text-muted-foreground text-xs font-medium mb-1'>
            <span>Credit Limit</span>
            <CreditCard className='h-4 w-4 text-muted-foreground' />
          </div>
          <div className='text-lg font-bold text-foreground'>
            {client.currency || 'USD'} {client.creditLimit?.toLocaleString('en-US') || '0'}
          </div>
          <p className='text-[11px] text-muted-foreground mt-1'>
            Approved Credit Ceiling
          </p>
        </div>

        <div className='p-4 rounded-xl border border-border bg-card shadow-none'>
          <div className='flex items-center justify-between text-muted-foreground text-xs font-medium mb-1'>
            <span>AR Outstanding</span>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </div>
          <div className='text-lg font-bold text-foreground'>
            {client.currency || 'USD'} {client.arBalance?.toLocaleString('en-US') || '0'}
          </div>
          <p className='text-[11px] text-muted-foreground mt-1'>
            Current Accounts Receivable Balance
          </p>
        </div>

        <div className='p-4 rounded-xl border border-border bg-card shadow-none'>
          <div className='flex items-center justify-between text-muted-foreground text-xs font-medium mb-1'>
            <span>Payment Terms</span>
            <ShieldCheck className='h-4 w-4 text-muted-foreground' />
          </div>
          <div className='text-lg font-bold text-foreground'>
            {client.paymentTerms || 'Net 30 Days'}
          </div>
          <p className='text-[11px] text-muted-foreground mt-1'>
            Standard Commercial Terms
          </p>
        </div>

        <div className='p-4 rounded-xl border border-border bg-card shadow-none'>
          <div className='flex items-center justify-between text-muted-foreground text-xs font-medium mb-1'>
            <span>Tax ID / NPWP</span>
            <Landmark className='h-4 w-4 text-muted-foreground' />
          </div>
          <div className='text-sm font-semibold text-foreground truncate' title={client.taxId}>
            {client.taxId || 'N/A'}
          </div>
          <p className='text-[11px] text-muted-foreground mt-1'>
            Tax Registration Identifier
          </p>
        </div>
      </div>

      {/* Main Tabs Details */}
      <Tabs defaultValue='details' className='w-full space-y-4'>
        <TabsList className='inline-flex h-auto p-1 bg-muted rounded-lg border border-border/40 gap-1 flex-wrap sm:flex-nowrap'>
          <TabsTrigger value='details' className='text-xs px-3 py-1.5 font-medium'>General & Address</TabsTrigger>
          <TabsTrigger value='accounting' className='text-xs px-3 py-1.5 font-medium'>Accounting Data</TabsTrigger>
          <TabsTrigger value='contracts' className='text-xs px-3 py-1.5 font-medium'>Contracts ({clientContracts.length})</TabsTrigger>
          <TabsTrigger value='invoices' className='text-xs px-3 py-1.5 font-medium'>Invoices ({clientInvoicesList.length})</TabsTrigger>
        </TabsList>

        {/* TAB 1: General & Address Details */}
        <TabsContent value='details' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Address & Office Details */}
            <Card className='border border-border bg-card shadow-none'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <MapPin className='h-4 w-4 text-muted-foreground' /> Registered Office & Address
                </CardTitle>
                <CardDescription>Official business location and postal details</CardDescription>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Street Address:</span>
                  <span className='col-span-2 font-medium text-foreground'>{client.address}</span>
                </div>
                <Separator />
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>City / Regency:</span>
                  <span className='col-span-2 font-medium text-foreground'>{client.city}</span>
                </div>
                <Separator />
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Country / Region:</span>
                  <span className='col-span-2 font-medium text-foreground flex items-center gap-1.5'>
                    <CountryFlag code={client.country} />
                  </span>
                </div>
                <Separator />
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Postal Code:</span>
                  <span className='col-span-2 font-medium text-foreground'>{client.postalCode || '-'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Primary Contact Details */}
            <Card className='border border-border bg-card shadow-none'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <User className='h-4 w-4 text-muted-foreground' /> Key Contact & Management
                </CardTitle>
                <CardDescription>Primary liaison officer for shipments and billing</CardDescription>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Contact Person:</span>
                  <span className='col-span-2 font-medium text-foreground'>{client.contactPerson}</span>
                </div>
                <Separator />
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Designation:</span>
                  <span className='col-span-2 font-medium text-foreground'>{client.contactRole || 'Manager'}</span>
                </div>
                <Separator />
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Email Address:</span>
                  <a href={`mailto:${client.email}`} className='col-span-2 font-medium text-primary hover:underline flex items-center gap-1.5'>
                    <Mail className='h-3.5 w-3.5 text-muted-foreground' /> {client.email}
                  </a>
                </div>
                <Separator />
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Phone Number:</span>
                  <a href={`tel:${client.phone}`} className='col-span-2 font-medium text-foreground flex items-center gap-1.5'>
                    <Phone className='h-3.5 w-3.5 text-muted-foreground' /> {client.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: Accounting Data */}
        <TabsContent value='accounting' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Tax & Financial Configuration */}
            <Card className='border border-border bg-card shadow-none'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <Landmark className='h-4 w-4 text-muted-foreground' /> Tax & Commercial Parameters
                </CardTitle>
                <CardDescription>Legal tax registration and billing profile</CardDescription>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Tax ID / NPWP:</span>
                  <span className='col-span-2 font-semibold text-foreground'>{client.taxId}</span>
                </div>
                <Separator />
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Billing Currency:</span>
                  <span className='col-span-2 font-medium text-foreground'>{client.currency || 'USD'}</span>
                </div>
                <Separator />
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Credit Limit:</span>
                  <span className='col-span-2 font-semibold text-foreground'>
                    {client.currency || 'USD'} {client.creditLimit?.toLocaleString('en-US') || '0'}
                  </span>
                </div>
                <Separator />
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Payment Terms:</span>
                  <span className='col-span-2 font-medium text-foreground'>{client.paymentTerms || 'Net 30 Days'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card className='border border-border bg-card shadow-none'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base flex items-center gap-2'>
                  <CreditCard className='h-4 w-4 text-muted-foreground' /> Banking Details
                </CardTitle>
                <CardDescription>Client bank account for payment remittances</CardDescription>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Bank Name:</span>
                  <span className='col-span-2 font-medium text-foreground'>{client.bankName}</span>
                </div>
                <Separator />
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>Account Number:</span>
                  <span className='col-span-2 font-medium text-foreground'>{client.bankAccountNo}</span>
                </div>
                <Separator />
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>SWIFT / BIC:</span>
                  <span className='col-span-2 font-medium text-foreground'>{client.swiftCode}</span>
                </div>
                <Separator />
                <div className='grid grid-cols-3 text-muted-foreground'>
                  <span>AR Balance:</span>
                  <span className='col-span-2 font-bold text-foreground'>
                    {client.currency || 'USD'} {client.arBalance?.toLocaleString('en-US') || '0'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: Active Contracts */}
        <TabsContent value='contracts' className='space-y-4'>
          <Card className='border border-border bg-card shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <FileCheck2 className='h-4 w-4 text-muted-foreground' /> Commercial Client Contracts
              </CardTitle>
              <CardDescription>Service level agreements and pricing contracts</CardDescription>
            </CardHeader>
            <CardContent>
              {clientContracts.length === 0 ? (
                <div className='text-center py-6 text-xs text-muted-foreground'>
                  No active contracts linked to this account.
                </div>
              ) : (
                <div className='divide-y divide-border/60 text-xs'>
                  {clientContracts.map((cnt: Record<string, unknown>) => (
                    <div key={String(cnt.id)} className='py-3 flex items-center justify-between gap-4'>
                      <div>
                        <div className='font-semibold text-foreground flex items-center gap-2'>
                          <span>{String(cnt.id)}</span>
                          <Badge variant='outline' className='text-[10px] font-normal'>{String(cnt.serviceType || 'Freight Services')}</Badge>
                        </div>
                        <p className='text-muted-foreground text-[11px] mt-0.5'>
                          Valid: {String(cnt.startDate || '2026-01-01')} to {String(cnt.endDate || '2026-12-31')}
                        </p>
                      </div>
                      <div className='text-right'>
                        <div className='font-bold text-foreground'>
                          USD {Number(cnt.value || 150000).toLocaleString('en-US')}
                        </div>
                        <Badge variant='outline' className='text-[10px] mt-0.5 font-normal bg-emerald-500/15 text-emerald-700 border-emerald-300'>Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: Invoices */}
        <TabsContent value='invoices' className='space-y-4'>
          <Card className='border border-border bg-card shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <FileText className='h-4 w-4 text-muted-foreground' /> Invoicing History
              </CardTitle>
              <CardDescription>Client billing invoices and payment statuses</CardDescription>
            </CardHeader>
            <CardContent>
              {clientInvoicesList.length === 0 ? (
                <div className='text-center py-6 text-xs text-muted-foreground'>
                  No invoice records found for this account.
                </div>
              ) : (
                <div className='divide-y divide-border/60 text-xs'>
                  {clientInvoicesList.map((inv: Record<string, unknown>) => (
                    <div key={String(inv.id)} className='py-3 flex items-center justify-between gap-4'>
                      <div>
                        <div className='font-semibold text-foreground flex items-center gap-2'>
                          <span>{String(inv.id)}</span>
                          <span className='text-muted-foreground font-normal'>• {String(inv.date || '2026-07-15')}</span>
                        </div>
                        <p className='text-muted-foreground text-[11px] mt-0.5'>
                          Due Date: {String(inv.dueDate || '2026-08-15')}
                        </p>
                      </div>
                      <div className='text-right'>
                        <div className='font-bold text-foreground'>
                          {String(inv.currency || 'USD')} {Number(inv.totalAmount || 12500).toLocaleString('en-US')}
                        </div>
                        <Badge
                          variant={inv.status === 'Paid' ? 'outline' : 'secondary'}
                          className={
                            inv.status === 'Paid'
                              ? 'text-[10px] mt-0.5 font-normal bg-emerald-500/15 text-emerald-700 border-emerald-300'
                              : 'text-[10px] mt-0.5 font-normal bg-amber-500/15 text-amber-700 border-amber-300'
                          }
                        >
                          {String(inv.status || 'Unpaid')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
