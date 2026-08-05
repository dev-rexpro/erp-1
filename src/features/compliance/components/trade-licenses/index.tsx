import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Plus, Search as SearchIcon, Award, ShieldAlert, CheckCircle2, Clock, FileBadge } from 'lucide-react'
import { mockTradeLicenses, TradeLicenseItem } from '../../data/licenses-data'
import { MetricValue } from '@/components/ui/metric-value'
import { toast } from 'sonner'

export function TradeLicensesView() {
  const [licenses] = useState<TradeLicenseItem[]>(mockTradeLicenses)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLicense, setSelectedLicense] = useState<TradeLicenseItem | null>(null)

  const filteredData = licenses.filter(
    (item) =>
      item.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeCount = licenses.filter((l) => l.status === 'Active').length
  const expiringCount = licenses.filter((l) => l.status === 'Expiring Soon').length

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderRight />
      </Header>

      <Main className="flex flex-1 flex-col gap-5 sm:gap-6">
        {/* Page Title & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Trade Licenses</h1>
            <p className="text-xs text-muted-foreground">
              Corporate Trade Licensing, NIB, Customs Broker Permits (PPJK) & Expiry Tracker.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 gap-1.5 text-xs font-medium"
              onClick={() => toast.success('OSS & BKPM License verification completed!')}
            >
              <Clock size={14} />
              <span>Check Expiry</span>
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 gap-1.5 bg-black hover:bg-black/90 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black font-semibold text-xs shadow-xs transition-colors"
              onClick={() => toast.info('Register new trade license modal ready!')}
            >
              <Plus size={15} />
              <span>Register License</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Active Licenses</div>
            <MetricValue value={`${activeCount} Certified`} />
            <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Verified trade & import permits</p>
          </div>

          <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Expiring Soon (&lt;60 Days)</div>
            <MetricValue value={`${expiringCount} Permits`} />
            <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Requires renewal submission</p>
          </div>

          <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Renewal In Progress</div>
            <MetricValue value={`${licenses.filter((l) => l.status === 'Under Renewal').length} License`} />
            <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Application submitted to ministry</p>
          </div>

          <div className="rounded-lg border border-border/80 bg-muted/60 p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Compliance Score</div>
            <MetricValue value="98.4% A-Grade" />
            <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">Customs audit rating</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 sm:w-80">
            <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search License Number, Title, Issuer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>

        {/* Licenses Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">License Number</TableHead>
                <TableHead className="text-xs">Title & Purpose</TableHead>
                <TableHead className="text-xs">Issuing Authority</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Expiry Date</TableHead>
                <TableHead className="text-xs">Days Remaining</TableHead>
                <TableHead className="text-xs text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => setSelectedLicense(item)}
                >
                  <TableCell className="text-xs font-semibold">{item.licenseNumber}</TableCell>
                  <TableCell className="text-xs font-medium max-w-xs truncate">{item.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.issuer}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px] font-normal">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{item.expiryDate}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-medium ${
                        item.daysRemaining < 30 ? 'text-rose-600 font-bold' : item.daysRemaining < 60 ? 'text-amber-600' : 'text-muted-foreground'
                      }`}
                    >
                      {item.daysRemaining > 0 ? `${item.daysRemaining} days left` : 'Expired'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className={`text-[11px] font-normal ${
                        item.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : item.status === 'Expiring Soon'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* License Detail Sheet */}
        <Sheet open={!!selectedLicense} onOpenChange={() => setSelectedLicense(null)}>
          {selectedLicense && (
            <SheetContent className="w-full sm:max-w-md p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <SheetHeader className="text-left space-y-1">
                  <Badge variant="outline" className="w-fit text-[11px]">
                    {selectedLicense.category}
                  </Badge>
                  <SheetTitle className="text-base font-bold pt-1 leading-snug">
                    {selectedLicense.title}
                  </SheetTitle>
                  <SheetDescription className="text-xs">
                    {selectedLicense.licenseNumber}
                  </SheetDescription>
                </SheetHeader>

                <Separator />

                <div className="space-y-4 text-xs">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">License Details</h4>
                  
                  <div className="space-y-2.5 border rounded-xl p-4 bg-muted/20">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Issuing Authority</span>
                      <span className="font-medium text-xs mt-0.5 block">{selectedLicense.issuer}</span>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Operational Scope</span>
                      <span className="font-medium text-xs mt-0.5 block leading-relaxed">{selectedLicense.scope}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border rounded-xl p-4 bg-muted/20">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Issue Date</span>
                      <span className="font-medium">{selectedLicense.issueDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Expiry Date</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{selectedLicense.expiryDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          )}
        </Sheet>
      </Main>
    </>
  )
}
