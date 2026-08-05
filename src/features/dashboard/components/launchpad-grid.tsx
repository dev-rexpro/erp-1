import React, { useState } from 'react'
import { Star, SearchX, ChevronDown, ChevronUp } from 'lucide-react'
import { LaunchpadTile as TileType, LAUNCHPAD_GROUPS } from '../data/launchpad-data'
import { LaunchpadTile } from './launchpad-tile'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LaunchpadGridProps {
  tiles: TileType[]
  favorites: string[]
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
  selectedGroup: string
  searchQuery: string
  showFavoritesOnly: boolean
  onClearSearch: () => void
  lastRefreshedAt: string
}

export function LaunchpadGrid({
  tiles,
  favorites,
  onToggleFavorite,
  selectedGroup,
  searchQuery,
  showFavoritesOnly,
  onClearSearch,
  lastRefreshedAt,
}: LaunchpadGridProps) {
  // Track collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  // Favorites list
  const favoriteTiles = tiles.filter((t) => favorites.includes(t.id))

  // If no tiles found after search/filter
  if (tiles.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center my-6'>
        <div className='flex size-12 items-center justify-center rounded-2xl border bg-muted/60 text-muted-foreground'>
          <SearchX className='size-6' />
        </div>
        <h3 className='text-base font-semibold text-foreground'>
          No shortcut tiles found
        </h3>
        <p className='text-sm text-muted-foreground max-w-sm'>
          {showFavoritesOnly
            ? 'You have not favorited any tiles yet. Click the star icon on any tile to pin it to your favorites.'
            : `We could not find any modules matching "${searchQuery}".`}
        </p>
        <Button variant='outline' size='sm' onClick={onClearSearch} className='mt-2 h-9 px-4'>
          Clear Filters & Search
        </Button>
      </div>
    )
  }

  // If filtering by Favorites Only
  if (showFavoritesOnly) {
    return (
      <div className='flex flex-col gap-4 my-2'>
        <div className='flex items-center justify-between border-b pb-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500'>
              <Star className='size-4 fill-amber-500' />
            </div>
            <div>
              <h2 className='text-base font-bold text-foreground'>Pinned Favorites</h2>
              <p className='text-xs text-muted-foreground'>Quick launch shortcuts pinned by you</p>
            </div>
          </div>
          <Badge variant='secondary' className='font-semibold'>
            {favoriteTiles.length} Pinned
          </Badge>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4'>
          {favoriteTiles.map((tile) => (
            <LaunchpadTile
              key={tile.id}
              tile={tile}
              isFavorite={favorites.includes(tile.id)}
              onToggleFavorite={onToggleFavorite}
              lastRefreshedAt={lastRefreshedAt}
            />
          ))}
        </div>
      </div>
    )
  }

  // Group tiles by group
  const groupedMap = new Map<string, TileType[]>()
  tiles.forEach((tile) => {
    const list = groupedMap.get(tile.groupId) || []
    list.push(tile)
    groupedMap.set(tile.groupId, list)
  })

  // Filter groups to display
  const groupsToDisplay = LAUNCHPAD_GROUPS.filter((g) => {
    if (selectedGroup !== 'all' && g.id !== selectedGroup) return false
    return groupedMap.has(g.id) && (groupedMap.get(g.id)?.length || 0) > 0
  })

  return (
    <div className='flex flex-col gap-6 my-2'>
      {/* Pinned Favorites Section if on "All Modules" and favorites exist */}
      {selectedGroup === 'all' && !searchQuery && favoriteTiles.length > 0 && (
        <div className='flex flex-col gap-3.5'>
          <div
            onClick={() => toggleGroupCollapse('my-shortcuts')}
            className='flex items-center justify-between cursor-pointer select-none group/hdr'
          >
            <div className='flex items-center gap-2'>
              <h2 className='text-base font-bold tracking-tight text-foreground group-hover/hdr:text-primary transition-colors'>
                My Shortcuts
              </h2>
              <span className='text-xs text-muted-foreground font-normal'>
                ({favoriteTiles.length})
              </span>
            </div>

            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted'
              onClick={(e) => {
                e.stopPropagation()
                toggleGroupCollapse('my-shortcuts')
              }}
              title={collapsedGroups['my-shortcuts'] ? 'Expand section' : 'Collapse section'}
            >
              {collapsedGroups['my-shortcuts'] ? (
                <ChevronDown className='size-4' />
              ) : (
                <ChevronUp className='size-4' />
              )}
            </Button>
          </div>

          {!collapsedGroups['my-shortcuts'] && (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4'>
              {favoriteTiles.map((tile) => (
                <LaunchpadTile
                  key={`fav-${tile.id}`}
                  tile={tile}
                  isFavorite={favorites.includes(tile.id)}
                  onToggleFavorite={onToggleFavorite}
                  lastRefreshedAt={lastRefreshedAt}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Render Groups */}
      {groupsToDisplay.map((group) => {
        const groupTiles = groupedMap.get(group.id) || []
        const isCollapsed = !!collapsedGroups[group.id]

        return (
          <div key={group.id} className='flex flex-col gap-3.5'>
            {/* Simple Group Header with Expand / Collapse Chevron (No bottom border) */}
            <div
              onClick={() => toggleGroupCollapse(group.id)}
              className='flex items-center justify-between cursor-pointer select-none group/hdr'
            >
              <div className='flex items-center gap-2'>
                <h2 className='text-base font-bold tracking-tight text-foreground group-hover/hdr:text-primary transition-colors'>
                  {group.title}
                </h2>
                <span className='text-xs text-muted-foreground font-normal'>
                  ({groupTiles.length})
                </span>
              </div>

              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted'
                onClick={(e) => {
                  e.stopPropagation()
                  toggleGroupCollapse(group.id)
                }}
                title={isCollapsed ? 'Expand section' : 'Collapse section'}
              >
                {isCollapsed ? (
                  <ChevronDown className='size-4' />
                ) : (
                  <ChevronUp className='size-4' />
                )}
              </Button>
            </div>

            {/* Group Tiles Grid */}
            {!isCollapsed && (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4'>
                {groupTiles.map((tile) => (
                  <LaunchpadTile
                    key={tile.id}
                    tile={tile}
                    isFavorite={favorites.includes(tile.id)}
                    onToggleFavorite={onToggleFavorite}
                    lastRefreshedAt={lastRefreshedAt}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
