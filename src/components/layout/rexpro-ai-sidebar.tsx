import * as React from 'react'
import { X, Paperclip, SlidersHorizontal, ArrowUp, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRexProAi } from '@/store/use-rexpro-ai'
import { useLayout } from '@/context/layout-provider'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const ROTATING_TEXTS = [
  'Find Information',
  'Add Task',
  'System Knowledge',
  'Data Analytics',
]

// Simple inline parser for **bold** text and [1] citation pills
function parseMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\[\d+\])/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className='font-semibold text-foreground'>
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('[') && part.endsWith(']')) {
      const num = part.slice(1, -1)
      return (
        <span
          key={index}
          className='inline-flex items-center justify-center size-3.5 bg-muted text-[8px] text-muted-foreground font-semibold rounded-full mx-0.5 align-middle select-none'
        >
          {num}
        </span>
      )
    }
    return part
  })
}

// Splits content lines and renders clean bullet points or default rows
function formatMessageContent(text: string) {
  const lines = text.split('\n')
  return lines.map((line, idx) => {
    const trimmed = line.trim()
    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ')
    const isNumbered = /^\d+\.\s/.test(trimmed)

    if (isBullet) {
      const content = trimmed.substring(2)
      return (
        <div key={idx} className='pl-3 py-0.5 flex items-start gap-2'>
          <span className='text-muted-foreground shrink-0 mt-1 select-none'>•</span>
          <span>{parseMarkdown(content)}</span>
        </div>
      )
    }

    if (isNumbered) {
      const dotIndex = trimmed.indexOf('.')
      const number = trimmed.substring(0, dotIndex + 1)
      const content = trimmed.substring(dotIndex + 1).trim()
      return (
        <div key={idx} className='pl-3 py-0.5 flex items-start gap-1.5'>
          <span className='text-muted-foreground shrink-0 font-medium select-none'>{number}</span>
          <span>{parseMarkdown(content)}</span>
        </div>
      )
    }

    return <div key={idx} className='py-0.5'>{parseMarkdown(line)}</div>
  })
}

export function RexProAiSidebar() {
  const { isOpen, setIsOpen } = useRexProAi()
  const { variant } = useLayout()
  const isMobile = useIsMobile()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  // Rotating text state
  const [textIndex, setTextIndex] = React.useState(0)

  // Rotate text every 3 seconds
  React.useEffect(() => {
    if (messages.length > 0) return
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [messages.length])

  // Scroll to bottom of chat
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // Simulate AI response with domain-specific logistics data
    setTimeout(() => {
      let aiContent = "I'm processing your request. Could you please specify a shipment contract number or cargo detail?"
      const query = text.toLowerCase()

      if (query.includes('cnsha') || query.includes('nlrtm') || query.includes('track')) {
        aiContent = `Container **MSKU9284719** is currently on vessel **MAERSK MC-KINNEY MOLLER** in the Red Sea.
Current ETA to Port of Rotterdam (NLRTM) is **July 12, 2026** [1]. No customs delays reported [2].`
      } else if (query.includes('invoice') || query.includes('outstanding')) {
        aiContent = `There are currently **3 outstanding invoices** totaling **$48,600** for client billing [1]:
1. **INV-2026-004**: $18,200 (Due in 5 days)
2. **INV-2026-008**: $22,400 (Overdue by 2 days)
3. **INV-2026-012**: $8,000 (Due in 14 days)`
      } else if (query.includes('custom') || query.includes('delay')) {
        aiContent = `Current average customs delay is **4.2 hrs** [1].
Peak delay is reported at Port of Rotterdam (NLRTM) due to manual inspection of agricultural cargo [2]. Average clear rate remains stable at **98.4%**.`
      } else if (query.includes('transit') || query.includes('efficiency')) {
        aiContent = `Average transit time for Q2 is **14.2 Days**, which is **5.6% faster** than the target baseline of 15.0 Days [1].
Road transport / trucking remains the most efficient carriage mode with a **98%** on-time delivery rate [2].`
      }

      const aiMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMsg])
      setIsLoading(false)
    }, 1000)
  }

  const renderContent = () => (
    <>
      {/* ===== Header ===== */}
      <div className='flex items-center justify-between p-4 h-16 shrink-0 bg-background'>
        <div className='flex items-center gap-2.5'>
          <Button
            variant='outline'
            size='icon'
            className='bg-muted/25 text-foreground hover:bg-accent h-8 w-8 rounded-md shadow-none'
          >
            <Menu className='size-4' />
          </Button>
          <div className='flex items-center gap-1.5'>
            <span className='text-foreground font-semibold tracking-tight text-sm'>
              rexpro-ai
            </span>
          </div>
        </div>
        <Button
          variant='outline'
          size='icon'
          className='bg-muted/25 text-foreground hover:bg-accent h-8 w-8 rounded-md shadow-none'
          onClick={() => setIsOpen(false)}
        >
          <X className='size-4' />
        </Button>
      </div>

      {/* ===== Chat Area / Body ===== */}
      <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-6 bg-background'>
        {messages.length === 0 ? (
          <div className='flex-1 flex flex-col justify-center py-8 gap-6'>
            {/* Inline CSS injection for fade and slide down transition */}
            <style>{`
              @keyframes fadeSlideDown {
                from {
                  opacity: 0;
                  transform: translateY(-16px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fade-slide-down {
                animation: fadeSlideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
            `}</style>
            {/* Greeting */}
            <div className='text-center space-y-2'>
              <h2
                key={textIndex}
                className='text-3xl font-medium tracking-tight text-foreground animate-fade-slide-down'
              >
                {ROTATING_TEXTS[textIndex]}
              </h2>
            </div>
          </div>
        ) : (
          <div className='flex flex-col gap-6'>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex w-full leading-relaxed',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'user' ? (
                  /* User message: Styled with min-h-8 and rounded-md to match X button, no avatar */
                  <div className='rounded-md px-3 py-1 min-h-8 flex items-center text-xs bg-sidebar-accent/80 text-foreground border border-sidebar-border max-w-[85%] shadow-xs'>
                    {msg.content}
                  </div>
                ) : (
                  /* AI message: Label and timestamp, text directly below */
                  <div className='flex flex-col gap-2 w-full text-xs text-foreground'>
                    <div className='flex items-center shrink-0 text-primary'>
                      <span className='text-xs'>rexpro-ai</span><span className='text-[10px] text-primary/70 mx-0.5'>|</span><span className='text-[10px]'>{new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                    <div className='pl-0 text-foreground/90 font-sans leading-relaxed flex flex-col gap-1'>
                      {formatMessageContent(msg.content)}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Loader */}
            {isLoading && (
              <div className='flex flex-col gap-2 w-full text-xs text-foreground items-start'>
                <div className='flex items-center shrink-0 text-primary animate-pulse'>
                  <span className='text-xs'>rexpro-ai</span><span className='text-[10px] text-primary/70 mx-0.5'>|</span><span className='text-[10px]'>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                </div>
                <div className='flex gap-1 items-center pl-1 py-1'>
                  <span className='size-1.5 bg-muted-foreground/50 rounded-full animate-bounce delay-75' />
                  <span className='size-1.5 bg-muted-foreground/50 rounded-full animate-bounce delay-150' />
                  <span className='size-1.5 bg-muted-foreground/50 rounded-full animate-bounce delay-300' />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* ===== Chat Input / Footer (Reduced bottom padding for disclaimer) ===== */}
      <div className='px-4 pt-4 pb-2 border-t-0 flex flex-col gap-2 bg-background shrink-0'>
        <div className='relative rounded-xl border border-sidebar-border bg-background flex flex-col p-2.5 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring'>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(input)
              }
            }}
            placeholder='Ask rexpro-ai'
            className='w-full min-h-[36px] max-h-32 resize-none bg-transparent outline-none border-none text-xs text-foreground placeholder-muted-foreground'
            rows={1}
          />
          <div className='flex items-center justify-between pt-2'>
            <div className='flex items-center gap-1'>
              <Button variant='ghost' size='icon' className='size-7 text-muted-foreground rounded-md'>
                <Paperclip className='size-4' />
              </Button>
              <Button variant='ghost' size='icon' className='size-7 text-muted-foreground rounded-md'>
                <SlidersHorizontal className='size-4' />
              </Button>
            </div>
            <Button
              size='icon'
              className={cn(
                'size-7 rounded-md transition-all shadow-none',
                input.trim() ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground cursor-not-allowed'
              )}
              disabled={!input.trim() || isLoading}
              onClick={() => handleSend(input)}
            >
              <ArrowUp className='size-4' />
            </Button>
          </div>
        </div>
        <span className='text-[10px] text-center text-muted-foreground leading-normal'>
          rexpro-ai can make mistakes. <a href='#' className='underline hover:text-foreground'>Learn more</a>
        </span>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side='right'
          className='bg-background text-foreground !w-full !max-w-full sm:!w-[380px] sm:!max-w-[380px] p-0 [&>button]:hidden overflow-hidden'
        >
          <div className='flex h-full w-full flex-col overflow-hidden'>{renderContent()}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <>
      {/* Desktop spacer to push main content when sidebar is expanded */}
      <div
        className={cn(
          'relative bg-transparent transition-[width] duration-200 ease-linear hidden md:block shrink-0',
          isOpen ? 'w-[360px]' : 'w-0'
        )}
      />

       {/* Desktop sidebar panel container */}
      <div
        className={cn(
          'fixed inset-y-0 end-0 z-10 hidden h-svh transition-[width,padding] duration-200 ease-linear md:flex flex-col bg-transparent text-foreground overflow-hidden',
          isOpen ? 'w-[360px]' : 'w-0 pointer-events-none',
          isOpen && (variant === 'floating' || variant === 'inset'
            ? 'p-2'
            : 'border-s border-sidebar-border')
        )}
      >
        <div
          className={cn(
            'bg-background flex h-full w-full flex-col',
            variant === 'floating' && 'border border-sidebar-border rounded-lg shadow-sm overflow-hidden'
          )}
        >
          {renderContent()}
        </div>
      </div>
    </>
  )
}
