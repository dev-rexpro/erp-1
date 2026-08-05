import { useDocumentHub } from './document-hub-provider'
import { DocumentCategory } from '../data/schema'
import { cn } from '@/lib/utils'
import { MetricValue } from '@/components/ui/metric-value'

export function DocumentStats() {
  const { categoryFilter, setCategoryFilter } = useDocumentHub()

  const stats = [
    {
      id: 'all' as const,
      title: 'ALL REPOSITORIES',
      value: '850 Files',
      desc: '48.2 GB / 1 TB repository storage',
    },
    {
      id: 'sales' as DocumentCategory,
      title: 'SALES & MARKETING',
      value: '240 Files',
      desc: 'Commercial quotes & contracts',
    },
    {
      id: 'logistics' as DocumentCategory,
      title: 'LOGISTICS & OPS',
      value: '450 Files',
      desc: 'B/L, packing lists & shipping orders',
    },
    {
      id: 'finance' as DocumentCategory,
      title: 'FINANCE & TAX',
      value: '160 Files',
      desc: 'Invoices, tax returns & receipts',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const isActive = categoryFilter === stat.id

        return (
          <div
            key={stat.id}
            onClick={() => setCategoryFilter(stat.id)}
            className={cn(
              'cursor-pointer rounded-lg border p-3 sm:px-3.5 sm:py-2.5 shadow-none transition-all',
              isActive ? 'border-primary/80 bg-muted/80' : 'border-border/80 bg-muted/60 hover:bg-muted/80'
            )}
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.title}
            </div>
            <MetricValue value={stat.value} />
            <p className="mt-0.5 text-[11px] text-muted-foreground/80 truncate">{stat.desc}</p>
          </div>
        )
      })}
    </div>
  )
}
