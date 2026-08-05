import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'
import { LAUNCHPAD_TILES, LAUNCHPAD_GROUPS, LaunchpadTile } from './data/launchpad-data'
import { LaunchpadHeader } from './components/launchpad-header'
import { LaunchpadGrid } from './components/launchpad-grid'

const FAVORITES_STORAGE_KEY = 'erp_one_launchpad_favorites'

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshedAt, setLastRefreshedAt] = useState('Just now')

  // Load favorites from localStorage or default
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // Ignore localStorage errors
    }
    return LAUNCHPAD_TILES.filter((t) => t.isFavoriteDefault).map((t) => t.id)
  })

  // Save favorites to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      // Ignore localStorage errors
    }
  }, [favorites])

  // Toggle favorite tile
  const handleToggleFavorite = (tileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => {
      const exists = prev.includes(tileId)
      const updated = exists ? prev.filter((id) => id !== tileId) : [...prev, tileId]
      const tile = LAUNCHPAD_TILES.find((t) => t.id === tileId)
      if (tile) {
        if (exists) {
          toast.info(`Removed "${tile.title}" from favorites`)
        } else {
          toast.success(`Pinned "${tile.title}" to favorites`)
        }
      }
      return updated
    })
  }

  // Refresh live metrics handler
  const handleRefreshData = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastRefreshedAt('Just now')
      toast.success('Launchpad operational metrics synced live!')
    }, 600)
  }

  // Filter tiles based on search, group selection, and favorites
  const filteredTiles = useMemo(() => {
    return LAUNCHPAD_TILES.filter((tile) => {
      // Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesTitle = tile.title.toLowerCase().includes(query)
        const matchesSubtitle = tile.subtitle.toLowerCase().includes(query)
        const matchesGroupName = tile.groupName.toLowerCase().includes(query)
        const matchesTags = tile.tags.some((tag) => tag.toLowerCase().includes(query))
        if (!matchesTitle && !matchesSubtitle && !matchesGroupName && !matchesTags) {
          return false
        }
      }

      // Favorites Only Filter
      if (showFavoritesOnly) {
        return favorites.includes(tile.id)
      }

      // Selected Group Filter
      if (selectedGroup !== 'all' && tile.groupId !== selectedGroup) {
        return false
      }

      return true
    })
  }, [searchQuery, selectedGroup, showFavoritesOnly, favorites])

  const handleClearSearch = () => {
    setSearchQuery('')
    setSelectedGroup('all')
    setShowFavoritesOnly(false)
  }

  return (
    <>
      {/* ===== Top Heading Header ===== */}
      <Header>
        <Search />
        <HeaderRight />
      </Header>

      {/* ===== Main Content Area ===== */}
      <Main className='flex flex-col gap-6 pb-12'>
        {/* Launchpad Top Controls Header */}
        <LaunchpadHeader
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesOnly={() => {
            setShowFavoritesOnly((prev) => !prev)
            if (selectedGroup !== 'all') setSelectedGroup('all')
          }}
          favoritesCount={favorites.length}
          isRefreshing={isRefreshing}
          onRefreshData={handleRefreshData}
        />

        {/* Launchpad Tiles Grid */}
        <LaunchpadGrid
          tiles={filteredTiles}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          selectedGroup={selectedGroup}
          searchQuery={searchQuery}
          showFavoritesOnly={showFavoritesOnly}
          onClearSearch={handleClearSearch}
          lastRefreshedAt={lastRefreshedAt}
        />
      </Main>
    </>
  )
}
