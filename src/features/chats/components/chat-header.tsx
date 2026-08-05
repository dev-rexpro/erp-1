import { Bell, MessageSquarePlus, Search, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ChatHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center border-b bg-background px-4 py-2">
      <div className="flex h-full w-full items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <h1 className="text-nowrap font-semibold text-sm tracking-tight text-foreground">
            Teams Chat
          </h1>
          <div className="relative flex h-8.5 w-full max-w-sm items-center rounded-lg border border-input bg-background px-3 py-1 text-xs focus-within:ring-1 focus-within:ring-ring">
            <Search className="size-3.5 text-muted-foreground shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-transparent outline-none border-none text-xs text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground rounded-md" aria-label="New conversation">
            <MessageSquarePlus className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground rounded-md" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground rounded-md" aria-label="Settings">
            <Settings className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
