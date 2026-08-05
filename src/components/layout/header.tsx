import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useLayout } from '@/context/layout-provider'
import { SubNavTabs } from './sub-nav-tabs'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed = true, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const { showSidebarTrigger } = useLayout()

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'z-50 bg-background/95 backdrop-blur-md',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow-xs border-b border-border' : 'border-b border-border/40',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-16 items-center gap-3 px-4 sm:gap-4',
          offset > 10 &&
            fixed &&
            'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
        )}
      >
        {showSidebarTrigger ? (
          <>
            <SidebarTrigger variant='outline' className='max-md:scale-125' />
            <Separator orientation='vertical' className='h-6' />
          </>
        ) : (
          <>
            <SidebarTrigger variant='outline' className='max-md:scale-125 md:hidden' />
            <Separator orientation='vertical' className='h-6 md:hidden' />
          </>
        )}
        {children}
      </div>
      <SubNavTabs />
    </header>
  )
}
