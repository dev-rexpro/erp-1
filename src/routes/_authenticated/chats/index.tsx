import { createFileRoute, Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'

export const Route = createFileRoute('/_authenticated/chats/')({
  component: ChatsPreviewPage,
})

function ChatsPreviewPage() {
  return (
    <>
      <Header>
        <Search />
        <HeaderRight />
      </Header>

      <Main fixed className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border">
          <div className="flex flex-col gap-0.5">
            <h1 className="font-medium text-sm leading-none">Chat preview</h1>
            <p className="text-muted-foreground text-xs">
              This iframe shows the standalone chat screen. Open it in full screen for a better view.
            </p>
          </div>
          <Button asChild variant="ghost" size="icon" className="size-8">
            <Link to="/chat" target="_blank" rel="noreferrer" aria-label="Open chat in new tab">
              <ExternalLink className="size-4" />
            </Link>
          </Button>
        </div>

        <iframe
          src="/chat"
          title="Chat preview"
          className="min-h-0 flex-1 rounded-lg border bg-background w-full"
        />
      </Main>
    </>
  )
}
