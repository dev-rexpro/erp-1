import * as React from 'react'
import {
  X,
  Paperclip,
  SlidersHorizontal,
  ArrowUp,
  Menu,
  Plus,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Search,
  MessageSquare,
  MessageSquareText,
  Mail,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRexProAi } from '@/store/use-rexpro-ai'
import { useLayout } from '@/context/layout-provider'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// Data Imports untuk AI Engine Mockup Query
import { shipments, delayedShipments } from '@/features/shipments/data/shipments'
import { invoices, overdueInvoices, totalOutstandingUSD } from '@/features/client-invoices/data/invoices'
import { nearExpiryQuotations } from '@/features/service-quotations/data/quotations'
import { heldDeclarations } from '@/lib/mock-data/customs-declarations'

type MessageRole = 'user' | 'assistant'

export type ActionCard = {
  id: string
  title: string
  contactName: string
  contactEmail: string
  actionType: 'email_ceisa' | 'email_reminder' | 'email_eta'
  confirmLabel: string
  cancelLabel?: string
  status?: 'pending' | 'confirmed' | 'dismissed'
}

type Message = {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  actionCard?: ActionCard
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
    if (part.startsWith('[') && part.endsWith(']') && /^\d+$/.test(part.slice(1, -1))) {
      const num = part.slice(1, -1)
      return (
        <span
          key={index}
          className='inline-flex items-center justify-center size-3.5 bg-muted text-[8px] text-muted-foreground font-semibold rounded-full mx-0.5 align-middle select-none shrink-0'
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

export function MasbroSidebar() {
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

  // Engine Penjawab Masbro AI
  const processMasbroIntelligence = (query: string): { content: string; actionCard?: ActionCard } => {
    const q = query.toLowerCase().trim()

    // 1. Direct Pattern Match: INVOICE NUMBER (INV-2026-1001, INV-1001, 1001, etc.)
    const invMatch = q.match(/(?:inv-2026-|inv-)(\d{4})|^1\d{3}$/i)
    if (invMatch || (q.includes('inv-') && /\d+/.test(q))) {
      const rawNum = invMatch ? (invMatch[1] || invMatch[0]) : (q.match(/\d+/)?.[0] || '1001')
      const invNo = rawNum.toUpperCase().startsWith('INV-')
        ? rawNum.toUpperCase()
        : `INV-2026-${rawNum}`

      const invData = invoices.find((i) => i.username.toUpperCase() === invNo)
      const clientName = invData ? invData.firstName : 'PT Krakatau Steel (Persero) Tbk'
      const amount = invData ? invData.amount : '$35,800.00'
      const status = invData
        ? invData.status === 'inactive'
          ? 'OVERDUE'
          : invData.status === 'active'
            ? 'PAID'
            : 'DRAFT'
        : 'OVERDUE'

      return {
        content: `Here is the status for Invoice **${invNo}** from Snowflake ERP_CLIENT_INVOICES [1]:

- **Client**: ${clientName}
- **Service**: FCL 40HC Freight (Jakarta → Shanghai)
- **Amount**: **${amount}**
- **Issue Date**: 2026-06-25
- **Due Date**: 2026-07-25
- **Status**: **${status} (11 Days Overdue)**

**Catatan Khusus (Problem Solving):**
Pembayaran terpending melebihi jatuh tempo. Anda dapat meminta **Budi Santoso** (\`budi.s@rexcorp.cloud\`) dari tim AR Finance untuk segera mengirimkan Payment Reminder & Tax Invoice ke pihak Purchasing Client.

Apakah Anda ingin Saya memicu otomatis email Payment Reminder kepadanya sekarang?`,
        actionCard: {
          id: `card-inv-${Date.now()}`,
          title: 'Kirim Payment Reminder Email',
          contactName: 'Budi Santoso',
          contactEmail: 'budi.s@rexcorp.cloud',
          actionType: 'email_reminder',
          confirmLabel: 'Confirm & Send Reminder',
          cancelLabel: 'Later',
          status: 'pending',
        },
      }
    }

    // 2. Direct Pattern Match: CONTAINER / SHIPMENT NUMBER (OOLU..., MSCU..., MSKU..., SHP-2026-...)
    const ctrMatch = q.match(/(?:oolu|mscu|msku)\d+|(?:shp-2026-|shp-)\d{4}/i)
    if (ctrMatch) {
      const target = ctrMatch[0].toUpperCase()
      const activeShp = shipments[0]
      return {
        content: `Real-time tracking for **${target}** via Snowflake & OOCL Fleet System [1]:

- **Shipment Ref**: ${activeShp.username || 'SHP-2026-1001'}
- **Vessel**: ${activeShp._ext?.vesselName || 'OOCL INDONESIA'} (${activeShp._ext?.voyageNo || 'V204E'})
- **Client**: ${activeShp.firstName} (${activeShp.lastName})
- **Route**: ${activeShp._ext?.routeLabel || 'Jakarta → Shanghai'}
- **Current Position**: Strait of Malacca (In Transit) [2]
- **Progress**: **${activeShp._ext?.progress ?? 65}%**
- **ETA**: 2026-08-05 (Delayed 2 Days - Bad Weather)

**Catatan Khusus (Problem Solving):**
Shipment terpending 2 hari akibat cuaca buruk. Anda dapat menghubungi **Hendra Tan** (\`hendra.tan@oocl.com\`) dari OOCL Customer Care untuk memperbarui revisi ETA.

Apakah Anda ingin Saya mengirimkan email inquiry revisi ETA ke pihak OOCL?`,
        actionCard: {
          id: `card-shp-${Date.now()}`,
          title: 'Kirim Email Inquiry Revisi ETA ke OOCL',
          contactName: 'Hendra Tan (OOCL Care)',
          contactEmail: 'hendra.tan@oocl.com',
          actionType: 'email_eta',
          confirmLabel: 'Confirm & Send Inquiry',
          cancelLabel: 'Later',
          status: 'pending',
        },
      }
    }

    // 3. Direct Pattern Match: CEISA PIB / PEB NUMBER (PIB-2026-..., PEB-2026-...)
    const pibMatch = q.match(/(?:pib-2026-|peb-2026-|pib-|peb-)\d{4}/i)
    if (pibMatch) {
      const pibNo = pibMatch[0].toUpperCase()
      const holdItem = heldDeclarations[0]
      return {
        content: `Status dokumen **${pibNo}** di Bea Cukai CEISA 4.0 via Snowflake index [1]:

- **Client**: ${holdItem ? holdItem.clientName : 'PT Krakatau Steel'}
- **Doc Type**: ${pibNo.startsWith('PEB') ? 'PEB (Export)' : 'PIB (Import)'}
- **Status**: **HOLD / UNDER REVIEW**
- **Port**: ${holdItem ? holdItem.portOfEntry : 'Tanjung Priok Port'}
- **Officer Note**: "${holdItem?.officerNote || 'Mismatch HS Code — declared 8471.30 vs tariff 8473.30'}" [2].

**Catatan Khusus (Problem Solving):**
Proses pengeluaran barang terpending di Tanjung Priok. Anda dapat menghubungi **Risa Amelia** (\`risa.amelia@rexcorp.cloud\`) dari tim Dokumen Impor untuk segera mengunggah tindak lanjut Certificate of Origin (eSKA) & penyesuaian Uraian Barang.

Apakah Anda ingin Saya mengirimkan email pemberitahuan resmi terkait hal ini kepadanya sekarang?`,
        actionCard: {
          id: `card-pib-${Date.now()}`,
          title: 'Kirim Email Tindak Lanjut ke Risa Amelia',
          contactName: 'Risa Amelia',
          contactEmail: 'risa.amelia@rexcorp.cloud',
          actionType: 'email_ceisa',
          confirmLabel: 'Confirm & Send Email',
          cancelLabel: 'Later',
          status: 'pending',
        },
      }
    }

    // 4. Invoice prompt tanpa nomor
    if (q === 'check invoice status' || q.includes('check invoice') || q.includes('inspect invoice')) {
      return {
        content: `Sure! Which invoice number or client would you like to inspect?

*(e.g., **INV-2026-1001**, **INV-2026-1002**, or client name like **Krakatau Steel**)*`,
      }
    }

    if (q.includes('invoice') || q.includes('faktur') || q.includes('tagihan') || q.includes('ar')) {
      return {
        content: `Hasil query database Snowflake **ERP_CLIENT_INVOICES** [1]:

- Total Outstanding AR: **$${totalOutstandingUSD.toLocaleString('en-US')}**
- Invoice Overdue Terbesar:
  1. **INV-2026-1002** (Cargill Inc) — $47,200.00 [2]
  2. **INV-2026-1005** (Midea Group) — $35,800.00 [3]
  3. **INV-2026-1011** (Toyota Tsusho) — $28,400.00`,
      }
    }

    // 5. Container prompt tanpa nomor
    if (q === 'track shipment container' || q === 'track shipment' || q === 'track container') {
      return {
        content: `Please provide the container or shipment number you wish to track.

*(e.g., **OOLU2800014** or **SHP-2026-1001**)*`,
      }
    }

    if (q.includes('shipment') || q.includes('track') || q.includes('container') || q.includes('posisi') || q.includes('lacak')) {
      const activeShp = shipments[0]
      return {
        content: `Status pelacakan real-time untuk container **${activeShp._ext?.containerNo || 'OOLU2800014'}** (${activeShp.id}) [1]:

- **Vessel**: ${activeShp._ext?.vesselName || 'OOCL INDONESIA'} (${activeShp._ext?.voyageNo || 'V204E'})
- **Client**: ${activeShp.firstName} (${activeShp.lastName})
- **Rute**: ${activeShp._ext?.routeLabel || 'Jakarta → Shanghai'}
- **Posisi Terakhir**: Selat Malaka (In Transit) [2]
- **Progress**: **${activeShp._ext?.progress ?? 65}%**
- **ETA**: ${activeShp.validUntil} (On Schedule)`,
      }
    }

    // 6. CEISA prompt tanpa nomor
    if (q === 'check ceisa customs status' || q === 'check ceisa status' || q === 'check customs status') {
      return {
        content: `Which PIB/PEB declaration number or shipment reference would you like me to verify with Bea Cukai CEISA 4.0?

*(e.g., **PIB-2026-0400** or **PEB-2026-0200**)*`,
      }
    }

    if (q.includes('ceisa') || q.includes('pib') || q.includes('peb') || q.includes('bea cukai') || q.includes('custom')) {
      const holdItem = heldDeclarations[0]
      return {
        content: `Saya sudah mengecek database Bea Cukai CEISA 4.0 via Snowflake index [1]:

- **PIB ID**: ${holdItem ? holdItem.docNumber : 'PIB-2026-0400'}
- **Client**: ${holdItem ? holdItem.clientName : 'PT Krakatau Steel'}
- **Status**: **${holdItem ? holdItem.status : 'HOLD'}**
- **Pelabuhan**: ${holdItem ? holdItem.portOfEntry : 'Tanjung Priok Port'}
- **Catatan Petugas BC**: "${holdItem?.officerNote || 'Mismatch HS Code — declared 8471.30 vs tariff 8473.30'}" [2].

**Catatan Khusus (Problem Solving):**
Proses pengeluaran barang terpending di Tanjung Priok. Anda dapat menghubungi **Risa Amelia** (\`risa.amelia@rexcorp.cloud\`) dari tim Dokumen Impor untuk segera mengunggah tindak lanjut Certificate of Origin (eSKA) & penyesuaian Uraian Barang.

Apakah Anda ingin Saya mengirimkan email pemberitahuan resmi terkait hal ini kepadanya sekarang?`,
        actionCard: {
          id: `card-pib-${Date.now()}`,
          title: 'Kirim Email Tindak Lanjut ke Risa Amelia',
          contactName: 'Risa Amelia',
          contactEmail: 'risa.amelia@rexcorp.cloud',
          actionType: 'email_ceisa',
          confirmLabel: 'Confirm & Send Email',
          cancelLabel: 'Later',
          status: 'pending',
        },
      }
    }

    // 7. Quotation / Rate
    if (q.includes('quote') || q.includes('quotation') || q.includes('rate') || q.includes('harga') || q.includes('oocl') || q.includes('maersk')) {
      if (q === 'create service quotation' || q === 'create quotation') {
        return {
          content: `I can help you create a new Service Quotation!

Please specify the destination route and container type (e.g., *"Jakarta to Shanghai 40HC"* or *"Surabaya to Singapore 20GP"*).`,
        }
      }

      return {
        content: `Saya sudah cek perbandingan rate terkini (Snowflake ERP_VENDOR_RATES) untuk rute **Jakarta (IDJKT) → Shanghai (CNSHA)** 40HC [1]:

1. **OOCL (Service AEX5)**: **$1,450 / 40HC** (Transit: 10 Hari, Departure: 04 Aug) — *Rekomendasi Utama!*
2. **Maersk (Service AE-1)**: **$1,580 / 40HC** (Transit: 10 Hari, Departure: 03 Aug)
3. **MSC (Service JADE)**: **$1,320 / 40HC** (Transit: 12 Hari, Departure: 06 Aug)`,
      }
    }

    // Morning briefing
    if (q.includes('briefing') || q.includes('pagi') || q.includes('alert') || q.includes('status hari ini')) {
      return {
        content: `Berikut adalah **Daily Morning Briefing** hari ini untuk PT Rexindo Aruna Sedaya:

- **CEISA / Custom Hold**: Ada **${heldDeclarations.length} dokumen** (seperti PIB-2026-0400) yang kena HOLD/Review Bea Cukai [1].
- **Shipment Status**: **${delayedShipments.length} shipment** terpantau mengalami keterlambatan (Delayed) [2].
- **Accounts Receivable**: Total **$${totalOutstandingUSD.toLocaleString('en-US')}** overdue dari **${overdueInvoices.length} invoice** [3].
- **Quotation Expiry**: Ada **${nearExpiryQuotations.length} quotation** yang akan expired minggu ini.

**Catatan Khusus (Problem Solving):**
Terpantau **1 dokumen CEISA HOLD** di Tanjung Priok. Anda dapat menghubungi **Risa Amelia** (\`risa.amelia@rexcorp.cloud\`) untuk mengirimkan dokumen penyesuaian.

Apakah Anda ingin Saya mengirimkan email tindak lanjut kepadanya sekarang?`,
        actionCard: {
          id: `card-brief-${Date.now()}`,
          title: 'Kirim Email Tindak Lanjut ke Risa Amelia',
          contactName: 'Risa Amelia',
          contactEmail: 'risa.amelia@rexcorp.cloud',
          actionType: 'email_ceisa',
          confirmLabel: 'Confirm & Send Email',
          cancelLabel: 'Later',
          status: 'pending',
        },
      }
    }

    return {
      content: `Saya sedang memproses permintaan Anda mengenai "${query}". Sebagai AI Super Agent ERP-ONE, saya dapat membantu query data Snowflake, cek status CEISA Bea Cukai, membandingkan freight rate, dan generate dokumen ERP.`,
    }
  }

  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // Process Masbro Intelligence with live Cortex AI engine
    const startProcess = async () => {
      let { content: fullContent, actionCard } = processMasbroIntelligence(text)

      try {
        const res = await fetch('/api/cortex/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.response && data.success) {
            fullContent = data.response
            const qLower = text.toLowerCase()
            if (!actionCard) {
              if (qLower.includes('invoice') || qLower.includes('cargill') || qLower.includes('krakatau') || qLower.includes('overdue') || qLower.includes('tagihan')) {
                actionCard = {
                  id: `card-inv-${Date.now()}`,
                  title: 'Kirim Payment Reminder Email',
                  contactName: 'Budi Santoso',
                  contactEmail: 'budi.s@rexcorp.cloud',
                  actionType: 'email_reminder',
                  confirmLabel: 'Confirm & Send Reminder',
                  cancelLabel: 'Later',
                  status: 'pending',
                }
              } else if (qLower.includes('shipment') || qLower.includes('container') || qLower.includes('track') || qLower.includes('shanghai') || qLower.includes('lacak')) {
                actionCard = {
                  id: `card-shp-${Date.now()}`,
                  title: 'Kirim Email Inquiry Revisi ETA ke OOCL',
                  contactName: 'Hendra Tan (OOCL Care)',
                  contactEmail: 'hendra.tan@oocl.com',
                  actionType: 'email_eta',
                  confirmLabel: 'Confirm & Send Inquiry',
                  cancelLabel: 'Later',
                  status: 'pending',
                }
              } else if (qLower.includes('ceisa') || qLower.includes('pib') || qLower.includes('peb') || qLower.includes('hold') || qLower.includes('cukai')) {
                actionCard = {
                  id: `card-pib-${Date.now()}`,
                  title: 'Kirim Email Tindak Lanjut ke Risa Amelia',
                  contactName: 'Risa Amelia',
                  contactEmail: 'risa.amelia@rexcorp.cloud',
                  actionType: 'email_ceisa',
                  confirmLabel: 'Confirm & Send Email',
                  cancelLabel: 'Later',
                  status: 'pending',
                }
              }
            }
          }
        }
      } catch (err) {
        console.log('Cortex AI Backend Proxy offline, using local intelligence engine.')
      }

      const aiMsgId = Math.random().toString(36).substring(7)
      const timestamp = new Date()

      // Insert initial AI message placeholder
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: 'assistant',
          content: '',
          timestamp,
          actionCard,
        },
      ])

      let charIndex = 0
      const chunkSize = 3

      const streamInterval = setInterval(() => {
        charIndex += chunkSize
        const currentChunk = fullContent.slice(0, charIndex)

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId ? { ...msg, content: currentChunk } : msg
          )
        )

        if (charIndex >= fullContent.length) {
          clearInterval(streamInterval)
          setIsLoading(false)
        }
      }, 12)
    }

    startProcess()
  }

  const handleActionConfirm = (cardId: string, email: string, name: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.actionCard?.id === cardId) {
          return {
            ...msg,
            actionCard: { ...msg.actionCard, status: 'confirmed' },
          }
        }
        return msg
      })
    )

    setTimeout(() => {
      const confirmMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: `**Email Terkirim!** Saya telah berhasil mengirimkan email tindak lanjut resmi kepada **${name}** (\`${email}\`).

Pemberitahuan telah dicatat pada log aktivitas sistem ERP-ONE & Snowflake audit trail.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, confirmMsg])
    }, 400)
  }

  const handleActionDismiss = (cardId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.actionCard?.id === cardId) {
          return {
            ...msg,
            actionCard: { ...msg.actionCard, status: 'dismissed' },
          }
        }
        return msg
      })
    )
  }

  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'chat' | 'history'>('chat')
  const [historySearch, setHistorySearch] = React.useState('')

  const handleClearSession = () => {
    setMessages([])
    setInput('')
    setViewMode('chat')
  }

  const renderContent = () => (
    <>
      {/* ===== Header ===== */}
      <div className='flex items-center justify-between p-4 h-16 shrink-0 bg-background border-none'>
        <div className='flex items-center gap-2'>
          {viewMode === 'history' ? (
            <Button
              variant='outline'
              size='icon'
              title='Back to Chat'
              className='bg-muted/25 text-foreground hover:bg-accent h-8 w-8 rounded-md shadow-none'
              onClick={() => setViewMode('chat')}
            >
              <ChevronLeft className='size-4' />
            </Button>
          ) : (
            <Button
              variant='outline'
              size='icon'
              title='All chats / History'
              className='bg-muted/25 text-foreground hover:bg-accent h-8 w-8 rounded-md shadow-none'
              onClick={() => setViewMode('history')}
            >
              <Menu className='size-4' />
            </Button>
          )}
          <div className='flex items-center gap-1.5'>
            <span className='text-foreground font-semibold tracking-tight text-sm'>
              {viewMode === 'history' ? 'All chats' : 'masbro'}
            </span>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <Button
            variant='outline'
            size='icon'
            title='New Chat'
            className='bg-muted/25 text-foreground hover:bg-accent h-8 w-8 rounded-md shadow-none'
            onClick={handleClearSession}
          >
            <Plus className='size-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Overlay'}
            className='bg-muted/25 text-foreground hover:bg-accent h-8 w-8 rounded-md shadow-none hidden sm:flex'
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className='size-4' /> : <Maximize2 className='size-4' />}
          </Button>
          <Button
            variant='outline'
            size='icon'
            title='Close Panel'
            className='bg-muted/25 text-foreground hover:bg-accent h-8 w-8 rounded-md shadow-none'
            onClick={() => setIsOpen(false)}
          >
            <X className='size-4' />
          </Button>
        </div>
      </div>

      {/* ===== Chat History View Overlay ===== */}
      {viewMode === 'history' ? (
        <div className='flex-1 flex flex-col p-4 gap-6 bg-background overflow-y-auto'>
          {/* Search Bar */}
          <div className='relative flex items-center rounded-lg border border-sidebar-border bg-background px-3 py-1.5 focus-within:ring-1 focus-within:ring-ring'>
            <Search className='size-4 text-muted-foreground shrink-0 mr-2' />
            <input
              type='text'
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder='Search chats'
              className='w-full bg-transparent outline-none border-none text-xs text-foreground placeholder-muted-foreground'
            />
          </div>

          {/* Chat History List / Empty State */}
          {messages.length === 0 ? (
            <div className='flex-1 flex flex-col items-center justify-center text-center px-4 py-12 gap-4'>
              <div className='size-14 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground border border-border/40'>
                <MessageSquare className='size-7' />
              </div>
              <div className='space-y-1.5 max-w-xs'>
                <h3 className='text-base font-semibold text-foreground/90 tracking-tight'>
                  No chats available
                </h3>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  There are no current chats with messages in your chat history. Send a message to create a new chat.
                </p>
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-2'>
              <span className='text-[11px] font-medium text-muted-foreground px-1'>Active Session</span>
              <button
                onClick={() => setViewMode('chat')}
                className='flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-left group'
              >
                <div className='flex items-center gap-2.5 overflow-hidden'>
                  <MessageSquare className='size-4 text-primary shrink-0' />
                  <span className='text-xs font-medium text-foreground truncate'>
                    {messages.find((m) => m.role === 'user')?.content || 'Active Freight Chat'}
                  </span>
                </div>
                <span className='text-[10px] text-muted-foreground shrink-0 ml-2'>
                  {messages.length} msgs
                </span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ===== Standard Chat Body ===== */}
          <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-6 bg-background'>
            {messages.length === 0 ? (
              <div className='flex-1 flex flex-col justify-center px-4 py-8 gap-8'>
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

                {/* Rotating Greeting Header */}
                <div className='text-center space-y-2'>
                  <h2
                    key={textIndex}
                    className='text-3xl font-medium tracking-tight text-foreground animate-fade-slide-down'
                  >
                    {ROTATING_TEXTS[textIndex]}
                  </h2>
                </div>

                {/* Suggestions list (Simple English Freight Forwarding) */}
                <div className='flex flex-col gap-3 text-left pl-2 pt-2 border-t border-border/30'>
                  <button
                    onClick={() => handleSend('Check invoice status')}
                    className='flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors py-1 group text-left outline-none'
                  >
                    <MessageSquareText className='size-4 text-muted-foreground/75 group-hover:text-primary shrink-0 transition-colors' />
                    <span>Check invoice status</span>
                  </button>
                  <button
                    onClick={() => handleSend('Create a new service quotation for ocean freight')}
                    className='flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors py-1 group text-left outline-none'
                  >
                    <MessageSquareText className='size-4 text-muted-foreground/75 group-hover:text-primary shrink-0 transition-colors' />
                    <span>Create service quotation</span>
                  </button>
                  <button
                    onClick={() => handleSend('Track shipment container OOLU2800014')}
                    className='flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors py-1 group text-left outline-none'
                  >
                    <MessageSquareText className='size-4 text-muted-foreground/75 group-hover:text-primary shrink-0 transition-colors' />
                    <span>Track shipment container</span>
                  </button>
                  <button
                    onClick={() => handleSend('Check CEISA customs hold status')}
                    className='flex items-center gap-3 text-sm text-foreground/80 hover:text-primary transition-colors py-1 group text-left outline-none'
                  >
                    <MessageSquareText className='size-4 text-muted-foreground/75 group-hover:text-primary shrink-0 transition-colors' />
                    <span>Check CEISA customs status</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex flex-col gap-6'>
                {messages.map((msg, idx) => (
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
                        <div className='flex items-center justify-between shrink-0 text-foreground w-full'>
                          <span className='text-xs font-semibold text-primary'>masbro</span>
                          <span className='text-[10px] text-muted-foreground font-normal'>
                            {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                        <div className='pl-0 text-foreground/90 font-sans leading-relaxed flex flex-col gap-1'>
                          {formatMessageContent(msg.content)}
                          {isLoading && idx === messages.length - 1 && (
                            <span className='inline-block size-2 bg-primary animate-pulse rounded-full ml-1 align-middle' />
                          )}

                          {/* Action Confirmation Card Component */}
                          {msg.actionCard && (!isLoading || idx !== messages.length - 1) && (
                            <div className='mt-2.5 p-3 rounded-lg border border-primary/25 bg-primary/5 dark:bg-primary/10 flex flex-col gap-2.5 shadow-xs'>
                              <div className='flex items-center justify-between gap-2'>
                                <div className='text-xs font-semibold text-foreground'>
                                  <span>{msg.actionCard.title}</span>
                                </div>
                                <span className='text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0 font-normal'>
                                  Action Required
                                </span>
                              </div>

                              <div className='text-[11px] text-muted-foreground flex flex-col gap-0.5 pl-0.5'>
                                <span>Penerima: <strong className='text-foreground font-medium'>{msg.actionCard.contactName}</strong> ({msg.actionCard.contactEmail})</span>
                              </div>

                              {msg.actionCard.status === 'pending' && (
                                <div className='flex items-center gap-2 pt-1'>
                                  <Button
                                    size='sm'
                                    className='h-7 text-[11px] bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium px-3 shadow-none'
                                    onClick={() => handleActionConfirm(msg.actionCard!.id, msg.actionCard!.contactEmail, msg.actionCard!.contactName)}
                                  >
                                    <span>{msg.actionCard.confirmLabel}</span>
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    className='h-7 text-[11px] rounded-md font-medium text-muted-foreground hover:text-foreground px-3 shadow-none bg-background'
                                    onClick={() => handleActionDismiss(msg.actionCard!.id)}
                                  >
                                    <span>{msg.actionCard.cancelLabel || 'Later'}</span>
                                  </Button>
                                </div>
                              )}

                              {msg.actionCard.status === 'confirmed' && (
                                <div className='flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-0.5'>
                                  <CheckCircle2 className='size-4' />
                                  <span>Confirmed & Email Dispatched</span>
                                </div>
                              )}

                              {msg.actionCard.status === 'dismissed' && (
                                <div className='text-[11px] font-medium text-muted-foreground italic pt-0.5'>
                                  Aksi ditunda (Deferred).
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Loader */}
                {isLoading && (
                  <div className='flex flex-col gap-2 w-full text-xs text-foreground items-start'>
                    <div className='flex items-center justify-between shrink-0 text-foreground w-full animate-pulse'>
                      <span className='text-xs font-semibold text-primary'>masbro</span>
                      <span className='text-[10px] text-muted-foreground font-normal'>
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
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

          {/* ===== Chat Input / Footer ===== */}
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
                placeholder='Ask masbro'
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
              masbro can make mistakes. <a href='#' className='underline hover:text-foreground'>Learn more</a>
            </span>
          </div>
        </>
      )}
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
      {/* Desktop spacer */}
      <div
        className={cn(
          'relative bg-transparent transition-[width] duration-200 ease-linear hidden md:block shrink-0',
          isOpen && !isFullscreen ? 'w-[360px]' : 'w-0'
        )}
      />

      {/* Desktop sidebar panel container */}
      <div
        className={cn(
          'fixed inset-y-0 end-0 hidden h-svh transition-[width,padding,inset] duration-200 ease-linear md:flex flex-col bg-transparent text-foreground overflow-hidden',
          isOpen
            ? isFullscreen
              ? 'inset-0 z-50 w-full p-0 border-none'
              : 'w-[360px] z-20'
            : 'w-0 pointer-events-none',
          isOpen && !isFullscreen && (variant === 'floating' || variant === 'inset'
            ? 'p-2'
            : 'border-s border-sidebar-border')
        )}
      >
        <div
          className={cn(
            'bg-background flex h-full w-full flex-col shadow-none',
            !isFullscreen && variant === 'floating' && 'border border-sidebar-border rounded-lg overflow-hidden'
          )}
        >
          {renderContent()}
        </div>
      </div>
    </>
  )
}
