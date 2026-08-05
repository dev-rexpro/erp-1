import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { MailSidebar } from '@/features/mail/components/mail-sidebar'
import { Mail } from '@/features/mail'

export const Route = createFileRoute('/mail-standalone')({
  component: () => (
    <div className="relative h-svh w-screen overflow-hidden">
      <SidebarProvider className="h-full min-h-0">
        <MailSidebar />
        <div className="size-full min-w-0 overflow-hidden">
          <Mail />
        </div>
      </SidebarProvider>
    </div>
  ),
})
