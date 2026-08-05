import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Star, ArrowUpRight, Plus, RefreshCw } from 'lucide-react'
import { LaunchpadTile as TileType } from '../data/launchpad-data'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface LaunchpadTileProps {
  tile: TileType
  isFavorite: boolean
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
  lastRefreshedAt?: string
}

export function LaunchpadTile({
  tile,
  isFavorite,
  onToggleFavorite,
  lastRefreshedAt = '5 min ago',
}: LaunchpadTileProps) {
  const navigate = useNavigate()

  const handleTileClick = (e: React.MouseEvent) => {
    // Prevent navigation if user clicked on the favorite star button
    if ((e.target as HTMLElement).closest('.favorite-btn')) return
    navigate({ to: tile.url })
  }

  const isActionTile = tile.type === 'action'

  return (
    <div
      onClick={handleTileClick}
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border p-4 shadow-xs transition-all duration-200 cursor-pointer select-none min-h-[140px]',
        isActionTile
          ? 'border-dashed border-primary/40 bg-primary/[0.02] hover:bg-primary/[0.06] hover:border-primary'
          : 'border-border/80 bg-card hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5'
      )}
    >
      {/* Top Header Row */}
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0 flex-1'>
          <h3 className='truncate text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors'>
            {tile.title}
          </h3>
        </div>

        {/* Favorite Star Button */}
        <button
          type='button'
          onClick={(e) => onToggleFavorite(tile.id, e)}
          className={cn(
            'favorite-btn flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/60 transition-all hover:scale-110 hover:text-amber-500 focus:outline-none',
            isFavorite ? 'text-amber-500 fill-amber-500' : 'opacity-0 group-hover:opacity-100 hover:bg-accent'
          )}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={cn('size-3.5', isFavorite && 'fill-amber-500')} />
        </button>
      </div>

      {/* Middle Content Row */}
      <div className='my-3 flex items-baseline justify-between gap-2'>
        {isActionTile ? (
          <div className='flex w-full items-center justify-between gap-2 rounded-lg border border-primary/20 bg-background/80 px-3 py-2 text-xs font-semibold text-primary shadow-2xs transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
            <span className='flex items-center gap-1.5'>
              <Plus className='size-3.5' />
              {tile.actionLabel || 'Create New'}
            </span>
            <ArrowUpRight className='size-3.5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform' />
          </div>
        ) : (
          <>
            <div className='flex items-baseline gap-1.5'>
              <span className='text-2xl font-semibold tracking-tight text-foreground'>
                {tile.kpiValue}
              </span>
              {tile.kpiUnit && (
                <span className='text-xs font-medium text-muted-foreground'>
                  {tile.kpiUnit}
                </span>
              )}
            </div>

            {tile.kpiTrend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  tile.kpiTrend.positive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                )}
              >
                {tile.kpiTrend.value}
              </span>
            )}
          </>
        )}
      </div>

      {/* Bottom Footer Row */}
      <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
        <div className='truncate font-medium text-muted-foreground/80 max-w-[65%]'>
          {tile.kpiSubtitle || tile.groupName}
        </div>

        {tile.statusBadge ? (
          <Badge
            variant={
              tile.statusBadge.variant === 'destructive'
                ? 'destructive'
                : tile.statusBadge.variant === 'warning'
                ? 'secondary'
                : tile.statusBadge.variant === 'success'
                ? 'default'
                : 'outline'
            }
            className='h-5 px-2 rounded-full text-[10px] font-medium'
          >
            {tile.statusBadge.label}
          </Badge>
        ) : (
          <div className='flex items-center gap-1 text-[10px] text-muted-foreground/60 shrink-0'>
            <RefreshCw className='size-2.5' />
            <span>{lastRefreshedAt}</span>
          </div>
        )}
      </div>
    </div>
  )
}
