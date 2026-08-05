import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Laptop,
  Moon,
  Sun,
  Truck,
  Receipt,
  FileSpreadsheet,
  Briefcase,
  Compass,
  Boxes,
  ShoppingCart,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Users,
  Folder,
  FileText,
} from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import { useTheme } from '@/context/theme-provider'
import { useDbStore } from '@/stores/db-store'
import { customsDeclarations } from '@/lib/mock-data/customs-declarations'
import { Badge } from '@/components/ui/badge'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { sidebarData } from './layout/data/sidebar-data'

type SearchItem = {
  id: string
  group: string
  label: string
  sublabel?: string
  badge?: string
  url: string
  searchParams?: Record<string, unknown>
  icon?: React.ElementType
  searchValue: string
  disabled?: boolean
  newTab?: boolean
}

const sidebarGroupLabels = new Set(
  sidebarData.navGroups.flatMap((group) => (group.title ? [group.title] : []))
)

function getSubItemGroup(groupLabel: string | undefined, itemTitle: string) {
  return sidebarGroupLabels.has(itemTitle) ? (groupLabel ?? 'Navigation') : itemTitle
}

const navigationSearchItems: SearchItem[] = sidebarData.navGroups.flatMap((group) =>
  group.items.flatMap((item) => {
    if (item.items) {
      return item.items.map((sub) => ({
        id: `nav-${sub.url || sub.title}`,
        group: getSubItemGroup(group.title, item.title),
        label: sub.title,
        url: sub.url || '',
        icon: sub.icon || item.icon,
        searchValue: `${getSubItemGroup(group.title, item.title)} ${sub.title} ${sub.url || ''}`.toLowerCase(),
        disabled: false,
        newTab: false,
      }))
    }
    return [
      {
        id: `nav-${item.url || item.title}`,
        group: group.title ?? 'Navigation',
        label: item.title,
        url: item.url || '',
        icon: item.icon,
        searchValue: `${group.title ?? 'Navigation'} ${item.title} ${item.url || ''}`.toLowerCase(),
        disabled: false,
        newTab: false,
      },
    ]
  })
).filter((item) => item.url)

export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()
  const [query, setQuery] = React.useState('')

  // Access DB store data for real-time app-wide search
  const shipments = useDbStore((state) => state.shipments)
  const clientInvoices = useDbStore((state) => state.clientInvoices)
  const quotations = useDbStore((state) => state.quotations)
  const contracts = useDbStore((state) => state.contracts)
  const shippingInstructions = useDbStore((state) => state.shippingInstructions)
  const packingLists = useDbStore((state) => state.packingLists)
  const purchaseOrders = useDbStore((state) => state.purchaseOrders)
  const dndFees = useDbStore((state) => state.dndFees)
  const clients = useDbStore((state) => state.clients)
  const vendors = useDbStore((state) => state.vendors)
  const dbUsers = useDbStore((state) => state.users)
  const documents = useDbStore((state) => state.documents)

  const allItems = React.useMemo<SearchItem[]>(() => {
    const list: SearchItem[] = [...navigationSearchItems]

    // 1. Shipments
    shipments.forEach((s) => {
      const code = s.username || s.id
      const clientName = s.firstName || s.clientName || ''
      const details = `${clientName} ${s.lastName ? `(${s.lastName})` : ''} ${s.amount || ''} ${s.status || ''}`.trim()
      list.push({
        id: `shp-${s.id || code}`,
        group: 'Shipments & Logistics',
        label: code,
        sublabel: details,
        badge: s.status || 'Shipment',
        url: '/logistics/shipments',
        searchParams: { username: code },
        icon: Truck,
        searchValue: `shipment shipments ${code} ${clientName} ${s.lastName || ''} ${s.amount || ''} ${s.status || ''} ${s.email || ''} ${s.phoneNumber || ''}`.toLowerCase(),
      })
    })

    // 2. Client Invoices
    clientInvoices.forEach((inv) => {
      const code = inv.username || inv.id
      const clientName = inv.firstName || ''
      const details = `${clientName} ${inv.amount ? `• ${inv.amount}` : ''} ${inv.status ? `• ${inv.status}` : ''}`
      list.push({
        id: `inv-${inv.id || code}`,
        group: 'Invoices & Billing',
        label: code,
        sublabel: details,
        badge: inv.status || 'Invoice',
        url: '/finance/client-invoicing',
        searchParams: { username: code },
        icon: Receipt,
        searchValue: `invoice client invoices ${code} ${clientName} ${inv.lastName || ''} ${inv.amount || ''} ${inv.status || ''}`.toLowerCase(),
      })
    })

    // 3. Service Quotations
    quotations.forEach((q) => {
      const code = q.username || q.id
      const clientName = q.firstName || ''
      const details = `${clientName} ${q.amount ? `• ${q.amount}` : ''} ${q.status ? `• ${q.status}` : ''}`
      list.push({
        id: `quo-${q.id || code}`,
        group: 'Service Quotations',
        label: code,
        sublabel: details,
        badge: q.status || 'Quotation',
        url: '/commercial/service-quotations',
        searchParams: { username: code },
        icon: FileSpreadsheet,
        searchValue: `quotation service quotations ${code} ${clientName} ${q.lastName || ''} ${q.amount || ''} ${q.status || ''}`.toLowerCase(),
      })
    })

    // 4. Client Contracts
    contracts.forEach((c) => {
      const code = c.username || c.id
      const clientName = c.firstName || ''
      const details = `${clientName} ${c.amount ? `• ${c.amount}` : ''} ${c.status ? `• ${c.status}` : ''}`
      list.push({
        id: `ctr-${c.id || code}`,
        group: 'Client Contracts',
        label: code,
        sublabel: details,
        badge: c.status || 'Contract',
        url: '/commercial/client-contracts',
        searchParams: { username: code },
        icon: Briefcase,
        searchValue: `contract client contracts ${code} ${clientName} ${c.lastName || ''} ${c.amount || ''} ${c.status || ''}`.toLowerCase(),
      })
    })

    // 5. Shipping Instructions
    shippingInstructions.forEach((si) => {
      const code = si.username || si.siNo || si.id
      const clientName = si.firstName || ''
      const details = `${clientName} ${si.amount ? `• ${si.amount}` : ''}`
      list.push({
        id: `si-${si.id || code}`,
        group: 'Shipping Instructions',
        label: code,
        sublabel: details,
        badge: 'SI',
        url: '/logistics/shipping-instructions',
        searchParams: { siNo: code, username: code },
        icon: Compass,
        searchValue: `shipping instruction si ${code} ${clientName} ${si.lastName || ''} ${si.amount || ''}`.toLowerCase(),
      })
    })

    // 6. Packing Lists
    packingLists.forEach((pl) => {
      const code = pl.username || pl.packingListNo || pl.id
      const clientName = pl.firstName || ''
      const details = `${clientName} ${pl.amount ? `• ${pl.amount}` : ''}`
      list.push({
        id: `pkl-${pl.id || code}`,
        group: 'Packing Lists',
        label: code,
        sublabel: details,
        badge: 'Packing List',
        url: '/logistics/packing-list',
        searchParams: { username: code },
        icon: Boxes,
        searchValue: `packing list pkl ${code} ${clientName} ${pl.lastName || ''} ${pl.amount || ''}`.toLowerCase(),
      })
    })

    // 7. Purchase Orders
    purchaseOrders.forEach((po) => {
      const code = po.username || po.poNumber || po.id
      const vendorName = po.firstName || po.vendorName || ''
      const details = `${vendorName} ${po.amount ? `• ${po.amount}` : ''}`
      list.push({
        id: `po-${po.id || code}`,
        group: 'Purchase Orders',
        label: code,
        sublabel: details,
        badge: 'Purchase Order',
        url: '/procurement/purchase-orders',
        searchParams: { poNumber: code, username: code },
        icon: ShoppingCart,
        searchValue: `purchase order po ${code} ${vendorName} ${po.lastName || ''} ${po.amount || ''}`.toLowerCase(),
      })
    })

    // 8. D&D Fees
    dndFees.forEach((d) => {
      const code = d.username || d.containerNo || d.id
      const clientName = d.firstName || ''
      const details = `${clientName} ${d.amount ? `• ${d.amount}` : ''}`
      list.push({
        id: `dnd-${d.id || code}`,
        group: 'D&D Fees',
        label: code,
        sublabel: details,
        badge: 'D&D Fee',
        url: '/logistics/dnd-fee',
        searchParams: { containerNo: d.containerNo || code, username: code },
        icon: AlertTriangle,
        searchValue: `demurrage detention dnd fee ${code} ${d.containerNo || ''} ${clientName}`.toLowerCase(),
      })
    })

    // 9. Customs Declarations
    customsDeclarations.forEach((cust) => {
      const code = cust.docNumber || cust.id
      const details = `${cust.clientName || ''} • ${cust.docType} • ${cust.status}`
      list.push({
        id: `cust-${cust.id || code}`,
        group: 'Customs & Compliance',
        label: code,
        sublabel: details,
        badge: cust.docType,
        url: '/compliance/customs-declarations',
        searchParams: { username: code, search: code },
        icon: ShieldCheck,
        searchValue: `customs declaration pib peb ${code} ${cust.clientName || ''} ${cust.docType} ${cust.status} ${cust.hsCode || ''} ${cust.commodity || ''}`.toLowerCase(),
      })
    })

    // 10. Companies & Business Partners
    const allPartners = [...clients, ...vendors]
    allPartners.forEach((cp, idx) => {
      const name = cp.name || cp.firstName || cp.companyName
      if (!name) return
      const sub = `${cp.country || ''} ${cp.city ? `, ${cp.city}` : ''} ${cp.taxId ? `• NPWP: ${cp.taxId}` : ''}`.trim()
      list.push({
        id: `partner-${cp.id || idx}-${name}`,
        group: 'Companies & Partners',
        label: name,
        sublabel: sub,
        badge: cp.tier || cp.category || cp.partnerType || 'Partner',
        url: '/procurement/partner-directory',
        searchParams: { name, search: name },
        icon: Building2,
        searchValue: `company partner client vendor ${name} ${cp.shortName || ''} ${cp.taxId || ''} ${cp.country || ''} ${cp.city || ''} ${cp.email || ''}`.toLowerCase(),
      })
    })

    // 11. Users & Staff
    dbUsers.forEach((u) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username
      list.push({
        id: `user-${u.id || u.username}`,
        group: 'Users & Team',
        label: fullName,
        sublabel: `${u.role || 'Staff'} • ${u.email || ''}`,
        badge: u.role || 'User',
        url: '/admin-settings/users',
        searchParams: { username: u.username || u.firstName, search: fullName },
        icon: Users,
        searchValue: `user staff employee ${fullName} ${u.username || ''} ${u.email || ''} ${u.role || ''}`.toLowerCase(),
      })
    })

    // 12. Document Hub
    documents.forEach((doc) => {
      const title = doc.title || doc.name || doc.id
      list.push({
        id: `doc-${doc.id || title}`,
        group: 'Document Hub',
        label: title,
        sublabel: `${doc.category || doc.type || 'File'} • ${doc.fileType || ''}`,
        badge: doc.category || 'Document',
        url: '/document-hub',
        searchParams: { search: title },
        icon: Folder,
        searchValue: `document file hub ${title} ${doc.category || ''} ${doc.type || ''}`.toLowerCase(),
      })
    })

    return list
  }, [
    shipments,
    clientInvoices,
    quotations,
    contracts,
    shippingInstructions,
    packingLists,
    purchaseOrders,
    dndFees,
    clients,
    vendors,
    dbUsers,
    documents,
  ])

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) setQuery('')
  }

  const handleSelect = (item: SearchItem) => {
    if (item.disabled) return
    runCommand(() => {
      if (item.newTab) {
        window.open(item.url, '_blank', 'noopener,noreferrer')
      } else if (item.searchParams) {
        navigate({ to: item.url as any, search: item.searchParams as any })
      } else {
        navigate({ to: item.url as any })
      }
    })
  }

  // Group items by category
  const groupByCategory = (items: SearchItem[]) => {
    const groups = [...new Set(items.map((item) => item.group))]
    return groups.map((group) => ({
      group,
      items: items.filter((item) => item.group === group),
    }))
  }

  // Recommendations shown when search query is empty
  const defaultRecommendations = React.useMemo(() => {
    const topNav = navigationSearchItems.slice(0, 6)
    const topShipments = allItems.filter((i) => i.group === 'Shipments & Logistics').slice(0, 3)
    const topInvoices = allItems.filter((i) => i.group === 'Invoices & Billing').slice(0, 3)
    return [...topNav, ...topShipments, ...topInvoices]
  }, [allItems])

  const renderGroups = (items: SearchItem[]) =>
    groupByCategory(items).map(({ group, items: groupItems }, index) => (
      <React.Fragment key={group}>
        {index > 0 && <CommandSeparator />}
        <CommandGroup heading={group}>
          {groupItems.map((item) => (
            <CommandItem
              key={item.id}
              value={item.searchValue}
              onSelect={() => handleSelect(item)}
              className="flex items-center justify-between py-2 px-3 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.icon &&
                  React.createElement(item.icon, {
                    className: 'h-4 w-4 shrink-0 text-muted-foreground',
                  })}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0 bg-muted/50"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.sublabel && (
                    <span className="text-xs text-muted-foreground truncate">{item.sublabel}</span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground/70 shrink-0 ml-3 font-medium uppercase tracking-wider">
                {item.group}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </React.Fragment>
    ))

  return (
    <CommandDialog modal open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder="Search shipments, invoices, quotations, companies, customs, or pages (e.g. SHP-2026-1011)…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[360px]">
        <CommandEmpty>No results found.</CommandEmpty>
        {query ? renderGroups(allItems) : renderGroups(defaultRecommendations)}

        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem value="theme light mode" onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" /> <span>Light</span>
          </CommandItem>
          <CommandItem value="theme dark mode" onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4 scale-90" />
            <span>Dark</span>
          </CommandItem>
          <CommandItem value="theme system default" onSelect={() => runCommand(() => setTheme('system'))}>
            <Laptop className="mr-2 h-4 w-4" />
            <span>System</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
