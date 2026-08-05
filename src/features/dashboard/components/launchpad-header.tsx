import React from 'react'
import { Star, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface LaunchpadHeaderProps {
  showFavoritesOnly: boolean
  onToggleFavoritesOnly: () => void
  favoritesCount: number
  isRefreshing: boolean
  onRefreshData: () => void
}

export function LaunchpadHeader({
  showFavoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
  isRefreshing,
  onRefreshData,
}: LaunchpadHeaderProps) {
  return (
    <div className='flex items-center justify-between gap-2 pt-1 pb-2'>
      <div>
        <h1 className='text-xl font-bold tracking-tight text-foreground'>
          Dashboard
        </h1>
      </div>

      {/* Action Controls */}
      <div className='flex items-center gap-2 shrink-0'>
        <Button
          type='button'
          variant={showFavoritesOnly ? 'default' : 'outline'}
          size='sm'
          onClick={onToggleFavoritesOnly}
          className={cn('h-9 px-3.5 gap-1.5 text-xs font-medium rounded-xl', showFavoritesOnly && 'bg-amber-500 text-white hover:bg-amber-600')}
        >
          <Star className={cn('size-3.5', showFavoritesOnly && 'fill-white')} />
          <span>Favorites</span>
          <Badge variant='secondary' className='ml-0.5 h-4 px-1 text-[10px] font-bold'>
            {favoritesCount}
          </Badge>
        </Button>

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onRefreshData}
          disabled={isRefreshing}
          className='h-9 px-3.5 gap-1.5 text-xs font-medium rounded-xl'
        >
          <RefreshCw className={cn('size-3.5 text-muted-foreground', isRefreshing && 'animate-spin text-primary')} />
          <span className='hidden sm:inline'>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
      </div>
    </div>
  )
}
