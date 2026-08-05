import { createFileRoute, Link } from '@tanstack/react-router'
import {
  CheckCheck,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { HeaderRight } from '@/components/layout/header-right'
import { Input } from '@/components/ui/input'
import { Main } from '@/components/layout/main'
import { Search as SearchHeader } from '@/components/search'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNotificationsStore } from '@/store/use-notifications-store'

export const Route = createFileRoute('/_authenticated/notifications')({
  component: NotificationsPage,
})

export function NotificationsPage() {
  const {
    notifications: items,
    markAllAsRead,
    toggleRead,
    deleteNotification,
    clearAll,
  } = useNotificationsStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const unreadCount = items.filter((item) => !item.isRead).length

  const handleMarkAllRead = () => {
    markAllAsRead()
    toast.success('All marked as read')
  }

  const handleItemClick = (id: string, isRead: boolean) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      if (!isRead) {
        toggleRead(id)
      }
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.refNumber && item.refNumber.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter

    const matchesRead =
      readFilter === 'all' ||
      (readFilter === 'unread' && !item.isRead) ||
      (readFilter === 'read' && item.isRead)

    return matchesSearch && matchesCategory && matchesRead
  })

  return (
    <>
      <Header>
        <SearchHeader />
        <HeaderRight />
      </Header>

      <Main className='flex flex-col gap-3 w-full pb-8 px-4'>
        {/* Header Compact */}
        <div className='flex items-center justify-between border-b pb-3 pt-1'>
          <div className='flex items-center gap-2.5'>
            <h1 className='text-lg font-semibold tracking-tight'>Notifications</h1>
            {unreadCount > 0 ? (
              <span className='bg-red-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full'>
                {unreadCount} unread
              </span>
            ) : (
              <span className='text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full'>
                All read
              </span>
            )}
          </div>

          <div className='flex items-center gap-2'>
            {unreadCount > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={handleMarkAllRead}
                className='h-7 text-xs px-2.5 gap-1'
              >
                <CheckCheck className='size-3.5' />
                Mark all read
              </Button>
            )}
            {items.length > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={clearAll}
                className='h-7 text-xs px-2 text-muted-foreground hover:text-destructive gap-1'
              >
                <Trash2 className='size-3.5' />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filters & Search */}
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
            <TabsList className='h-8 p-0.5 bg-muted/60'>
              <TabsTrigger value='all' className='text-xs h-7 px-2.5'>
                All ({items.length})
              </TabsTrigger>
              <TabsTrigger value='shipment' className='text-xs h-7 px-2.5'>
                Shipments
              </TabsTrigger>
              <TabsTrigger value='compliance' className='text-xs h-7 px-2.5'>
                Compliance
              </TabsTrigger>
              <TabsTrigger value='finance' className='text-xs h-7 px-2.5'>
                Finance
              </TabsTrigger>
              <TabsTrigger value='system' className='text-xs h-7 px-2.5'>
                System
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className='flex items-center gap-2'>
            <div className='relative w-48 sm:w-56'>
              <Search className='absolute left-2.5 top-2 size-3.5 text-muted-foreground' />
              <Input
                placeholder='Search...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='h-7 text-xs pl-8 pr-2'
              />
            </div>

            <div className='flex rounded-md border p-0.5 bg-muted/40 text-[11px] font-medium'>
              <button
                onClick={() => setReadFilter('all')}
                className={`px-2 py-0.5 rounded-sm transition-colors ${
                  readFilter === 'all' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setReadFilter('unread')}
                className={`px-2 py-0.5 rounded-sm transition-colors ${
                  readFilter === 'unread' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
                }`}
              >
                Unread
              </button>
            </div>
          </div>
        </div>

        {/* Compact List View with Expandable Click */}
        <div className='divide-y border rounded-lg bg-card overflow-hidden shadow-2xs'>
          {filteredItems.length === 0 ? (
            <div className='p-8 text-center text-xs text-muted-foreground'>
              No notifications to display.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isUrgent = item.priority === 'urgent'
              const isExpanded = expandedId === item.id

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id, item.isRead)}
                  className={`group relative flex flex-col p-3 gap-2 text-xs transition-colors cursor-pointer hover:bg-muted/40 ${
                    isUrgent
                      ? 'bg-red-500/10 border-l-3 border-l-red-500 dark:bg-red-950/20'
                      : !item.isRead
                      ? 'bg-accent/40 font-medium'
                      : isExpanded
                      ? 'bg-muted/20'
                      : ''
                  }`}
                >
                  {/* Top Row Header */}
                  <div className='flex items-start sm:items-center justify-between gap-2 min-w-0'>
                    <div className='flex items-center gap-2 min-w-0 flex-1 flex-wrap'>
                      {!item.isRead && (
                        <span className='size-2 rounded-full bg-red-500 shrink-0' />
                      )}

                      <span className={`font-semibold ${isUrgent ? 'text-red-700 dark:text-red-400' : 'text-foreground'}`}>
                        {item.title}
                      </span>

                      {item.refNumber && (
                        <Badge variant='outline' className='text-[10px] py-0 h-4 px-1 font-normal opacity-80'>
                          {item.refNumber}
                        </Badge>
                      )}

                      <span className='text-[10px] uppercase tracking-wider font-medium text-muted-foreground bg-muted px-1.5 py-0.2 rounded'>
                        {item.category}
                      </span>

                      {isUrgent && (
                        <span className='text-[10px] uppercase tracking-wider font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-1.5 py-0.2 rounded'>
                          Urgent
                        </span>
                      )}
                    </div>

                    <div className='flex items-center gap-2 shrink-0 text-muted-foreground'>
                      <span className='text-[11px] whitespace-nowrap opacity-75'>
                        {item.date}, {item.time}
                      </span>

                      {isExpanded ? (
                        <ChevronUp className='size-4 text-muted-foreground/70' />
                      ) : (
                        <ChevronDown className='size-4 text-muted-foreground/70' />
                      )}
                    </div>
                  </div>

                  {/* Body Description - Compact vs Expanded */}
                  <div className='text-muted-foreground leading-relaxed pl-0 sm:pl-4'>
                    <p className={isExpanded ? '' : 'line-clamp-1'}>
                      {item.description}
                    </p>

                    {/* Extended Controls when expanded */}
                    {isExpanded && (
                      <div className='flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border/40'>
                        <div className='flex items-center gap-2'>
                          {item.actionUrl && (
                            <Button
                              asChild
                              variant='default'
                              size='sm'
                              className='h-7 text-xs px-3 gap-1.5'
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link to={item.actionUrl}>
                                <span>{item.actionLabel || 'View Action'}</span>
                                <ExternalLink className='size-3' />
                              </Link>
                            </Button>
                          )}
                        </div>

                        <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => toggleRead(item.id)}
                            className='h-7 text-xs px-2 gap-1'
                            title={item.isRead ? 'Mark unread' : 'Mark read'}
                          >
                            {item.isRead ? (
                              <>
                                <X className='size-3' /> Mark Unread
                              </>
                            ) : (
                              <>
                                <Check className='size-3 text-emerald-600' /> Mark Read
                              </>
                            )}
                          </Button>

                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => deleteNotification(item.id)}
                            className='h-7 text-xs px-2 hover:text-destructive gap-1'
                            title='Delete'
                          >
                            <Trash2 className='size-3.5' /> Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Main>
    </>
  )
}

