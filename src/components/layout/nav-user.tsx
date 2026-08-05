import { Link } from '@tanstack/react-router'
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  User,
  Settings,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { useRbacStore } from '@/stores/rbac-store'
import { toast } from 'sonner'

type NavUserProps = {
  user?: {
    name: string
    email: string
    avatar: string
  }
}

export function NavUser({ user: _user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()
  
  const {
    users,
    roles,
    activeUserId,
    setActiveUserId,
    getActiveUser,
    getActiveRole,
    canAccessAdminSettings,
  } = useRbacStore()

  const activeUser = getActiveUser()
  const activeRole = getActiveRole()
  const isAdmin = canAccessAdminSettings()

  const initials = activeUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={activeUser.avatar} alt={activeUser.name} />
                  <AvatarFallback className='rounded-lg text-xs font-semibold bg-primary/10 text-primary'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold text-xs'>{activeUser.name}</span>
                  <span className='truncate text-[10px] text-muted-foreground'>{activeRole?.name || activeUser.email}</span>
                </div>
                <ChevronsUpDown className='ms-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-2 font-normal'>
                <div className='flex items-center gap-2 text-start text-xs'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={activeUser.avatar} alt={activeUser.name} />
                    <AvatarFallback className='rounded-lg text-xs font-semibold bg-primary/10 text-primary'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 leading-tight'>
                    <div className='flex items-center gap-1.5'>
                      <span className='font-semibold text-foreground'>{activeUser.name}</span>
                      <Badge variant='outline' className='text-[9px] py-0 h-3.5 px-1 bg-muted'>
                        {activeRole?.name.split(' ')[0] || 'Role'}
                      </Badge>
                    </div>
                    <span className='text-[10px] text-muted-foreground'>{activeUser.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                {/* User Switcher for RBAC Testing */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className='text-xs'>
                    <UserCheck className='size-3.5 mr-1.5 text-primary' />
                    <span>Switch Profile (Test RBAC)</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className='min-w-56'>
                    <DropdownMenuLabel className='text-[10px] text-muted-foreground uppercase tracking-wider font-semibold'>
                      Select Active User Role
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {users.map((u) => {
                      const uRole = roles.find((r) => r.id === u.roleId)
                      const isCurrent = u.id === activeUserId
                      return (
                        <DropdownMenuItem
                          key={u.id}
                          className={`text-xs flex flex-col items-start gap-0.5 cursor-pointer ${
                            isCurrent ? 'bg-accent text-accent-foreground font-semibold' : ''
                          }`}
                          onClick={() => {
                            setActiveUserId(u.id)
                            toast.info(`Switched active profile to ${u.name} (${uRole?.name || 'User'})`)
                          }}
                        >
                          <div className='flex items-center justify-between w-full'>
                            <span className='font-medium'>{u.name}</span>
                            {isCurrent && <span className='text-[10px] text-primary'>Active</span>}
                          </div>
                          <span className='text-[10px] text-muted-foreground'>{uRole?.name || u.position}</span>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {isAdmin && (
                  <DropdownMenuItem asChild className='text-xs'>
                    <Link to='/admin-settings/users'>
                      <ShieldAlert className='size-3.5 text-primary' />
                      <span>Admin Control Center</span>
                      <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild className='text-xs'>
                  <Link to='/settings'>
                    <User className='size-3.5' />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className='text-xs'>
                  <Link to='/settings/account'>
                    <BadgeCheck className='size-3.5' />
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className='text-xs'>
                  <Link to='/settings'>
                    <Settings className='size-3.5' />
                    <span>Preferences</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant='destructive'
                className='text-xs'
                onClick={() => setOpen(true)}
              >
                <LogOut className='size-3.5' />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}

