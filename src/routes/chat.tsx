import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ChatHeader } from '@/features/chats/components/chat-header'
import { ChatSidebar } from '@/features/chats/components/chat-sidebar'
import { Chats } from '@/features/chats'

export const Route = createFileRoute('/chat')({
  component: () => (
    <div className="relative flex h-svh w-screen flex-col overflow-hidden bg-background text-foreground">
      <ChatHeader />
      <div className="flex flex-1 min-h-0 w-full overflow-hidden relative">
        <SidebarProvider defaultOpen={true} className="h-full min-h-0 w-full flex flex-1">
          <ChatSidebar />
          <div className="size-full min-w-0 overflow-hidden flex-1">
            <Chats />
          </div>
        </SidebarProvider>
      </div>
    </div>
  ),
})
