import { Link } from '@tanstack/react-router'
import { Bell, Mail, MessageSquare, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRexProAi } from '@/store/use-rexpro-ai'
import { useNotificationsStore } from '@/store/use-notifications-store'
import { mails } from '@/features/mail/components/data'

export function AddShortcutButton() {
  return (
    <Button
      variant='outline'
      size='icon'
      onClick={() => toast.info('Shortcut management coming soon!')}
      title='Add Shortcut'
      className={cn(
        'bg-muted/25 text-foreground hover:bg-accent h-8 w-8 rounded-md shadow-none'
      )}
    >
      <Plus className='size-4' />
    </Button>
  )
}

export function HeaderRight() {
  const toggleAi = useRexProAi((state) => state.toggle)
  const notifications = useNotificationsStore((state) => state.notifications)
  const hasUnreadNotif = notifications.some((n) => !n.isRead)

  // Unread inbox mail count
  const unreadMailCount = mails.filter((m) => m.folder === 'inbox' && !m.isRead).length

  return (
    <div className='ms-auto flex items-center gap-2'>
      {/* Chat button with top-right border dot */}
      <Button
        variant='outline'
        asChild
        size='sm'
        className={cn(
          'bg-muted/25 text-foreground hover:bg-accent relative h-8 rounded-md shadow-none text-sm font-normal max-sm:w-8 max-sm:px-0 sm:gap-1.5 sm:px-3'
        )}
      >
        <Link to='/chats' title='Chat'>
          <MessageSquare className='size-4' />
          <span className='hidden sm:inline'>Chat</span>
          <span className='bg-red-500 absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full ring-2 ring-background' />
        </Link>
      </Button>

      {/* Mail button with top-right border number count badge */}
      <Button
        variant='outline'
        asChild
        size='sm'
        className={cn(
          'bg-muted/25 text-foreground hover:bg-accent relative h-8 rounded-md shadow-none text-sm font-normal max-sm:w-8 max-sm:px-0 sm:gap-1.5 sm:px-3'
        )}
      >
        <Link to='/mail' title='Mail'>
          <Mail className='size-4' />
          <span className='hidden sm:inline'>Mail</span>
          {unreadMailCount > 0 && (
            <span className='bg-red-500 text-white absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ring-2 ring-background shadow-sm'>
              {unreadMailCount}
            </span>
          )}
        </Link>
      </Button>

      {/* Notification button: ICON ONLY, top-right border dot if unread */}
      <Button
        variant='outline'
        asChild
        size='icon'
        className={cn(
          'bg-muted/25 text-foreground hover:bg-accent relative h-8 w-8 rounded-md shadow-none'
        )}
      >
        <Link to='/notifications' title='Notifications'>
          <Bell className='size-4' />
          {hasUnreadNotif && (
            <span className='bg-red-500 absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full ring-2 ring-background' />
          )}
        </Link>
      </Button>

      {/* AI Assistant */}
      <Button
        variant='outline'
        size='icon'
        onClick={toggleAi}
        title='masbro'
        className={cn(
          'bg-muted/25 text-foreground hover:bg-accent h-8 w-8 rounded-md shadow-none'
        )}
      >
        <img src='/rexpro-ai_logo.svg' alt='masbro' className='size-5' />
      </Button>

      {/* Add Shortcut */}
      <AddShortcutButton />
    </div>
  )
}
