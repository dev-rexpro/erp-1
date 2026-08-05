import React, { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRexProAi } from '@/store/use-rexpro-ai'
import {
  Database,
  Cpu,
  Terminal,
  Bot,
  Copy,
  RefreshCw,
  Code2,
  Sparkles,
  Play,
} from 'lucide-react'
import { toast } from 'sonner'

// Mock data drivers
import { shipments } from '@/features/shipments/data/shipments'
import { invoices } from '@/features/client-invoices/data/invoices'
import { heldDeclarations } from '@/lib/mock-data/customs-declarations'

type SystemStatus = {
  snowflake: 'connected' | 'connecting' | 'disconnected'
  cortex: 'active' | 'busy' | 'offline'
  cocoCli: 'online' | 'syncing' | 'idle'
  masbroAgent: 'ready' | 'processing'
}

export function SystemIntelligence() {
  const { setIsOpen: setMasbroOpen } = useRexProAi()

  // System status
  const [status] = useState<SystemStatus>({
    snowflake: 'connected',
    cortex: 'active',
    cocoCli: 'online',
    masbroAgent: 'ready',
  })

  // Cortex AI Playground State
  const [selectedModel, setSelectedModel] = useState('mistral-7b')
  const [nlQuery, setNlQuery] = useState('Tampilkan invoice overdue dari Cargill Inc dan Krakatau Steel beserta action plan-nya')
  const [isExecuting, setIsExecuting] = useState(false)
  const [cortexOutput, setCortexOutput] = useState<{
    sql: string
    response: string
    rows: Array<Record<string, string | number>>
  } | null>({
    sql: `SELECT INVOICE_NUMBER, CLIENT_NAME, AMOUNT_USD, DUE_DATE, DATEDIFF('day', DUE_DATE, CURRENT_DATE()) AS DAYS_OVERDUE 
FROM ERP_ONE_DB.REXINDO_PROD.ERP_CLIENT_INVOICES 
WHERE STATUS = 'inactive' AND CLIENT_NAME IN ('Cargill Inc', 'PT Krakatau Steel (Persero) Tbk');`,
    response: `Berdasarkan query database Snowflake ERP_CLIENT_INVOICES, ditemukan 2 invoice yang overdue:
1. INV-2026-1002 (Cargill Inc) — $47,200.00 (Overdue 11 hari).
2. INV-2026-1001 (PT Krakatau Steel) — $35,800.00 (Overdue 11 hari).

Rekomendasi Action Plan:
Pemicuan otomatis Payment Reminder & Tax Invoice via CoCo CLI trigger email ke PIC AR Finance.`,
    rows: [
      { INVOICE_NUMBER: 'INV-2026-1002', CLIENT_NAME: 'Cargill Inc', AMOUNT_USD: '$47,200.00', DUE_DATE: '2026-07-25', DAYS_OVERDUE: 11 },
      { INVOICE_NUMBER: 'INV-2026-1001', CLIENT_NAME: 'PT Krakatau Steel (Persero) Tbk', AMOUNT_USD: '$35,800.00', DUE_DATE: '2026-07-25', DAYS_OVERDUE: 11 },
    ],
  })

  // CoCo CLI Terminal State
  const [terminalInput, setTerminalInput] = useState('')
  const [terminalLogs, setTerminalLogs] = useState<Array<{ type: 'info' | 'success' | 'warn' | 'cmd'; text: string; time: string }>>([
    { type: 'info', text: 'CoCo CLI v2.4.1 initialized.', time: '10:30:00' },
    { type: 'info', text: 'Authenticated with Snowflake account: DTQUWJG-GD17674', time: '10:30:01' },
    { type: 'success', text: 'Connected to Database: ERP_ONE_DB | Schema: REXINDO_PROD', time: '10:30:02' },
    { type: 'success', text: 'Snowflake Cortex AI Engine: ONLINE', time: '10:30:02' },
    { type: 'info', text: 'Masbro Intelligence daemon listening on port 8080...', time: '10:30:03' },
  ])

  // Active Snowflake Table View selection
  const [selectedTable, setSelectedTable] = useState('ERP_SHIPMENTS')

  const handleRunCortexQuery = async () => {
    if (!nlQuery.trim()) return
    setIsExecuting(true)

    try {
      const res = await fetch('http://localhost:8080/api/cortex/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: nlQuery, model: selectedModel }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.source === 'snowflake_cortex_live') {
          setCortexOutput({
            sql: data.sql,
            response: data.response,
            rows: data.rows || [],
          })
          setIsExecuting(false)
          toast.success(`Cortex AI (${data.model}) live query executed.`)
          return
        }
      }
    } catch (e) {
      console.log('Backend proxy offline, using local emulation.')
    }

    // Fallback emulation
    setTimeout(() => {
      const q = nlQuery.toLowerCase()
      if (q.includes('ceisa') || q.includes('pib') || q.includes('hold')) {
        setCortexOutput({
          sql: `SELECT DOC_NUMBER, CLIENT_NAME, COMMODITY, STATUS, HOLD_REASON \nFROM ERP_ONE_DB.REXINDO_PROD.ERP_CUSTOMS_DECLARATIONS \nWHERE STATUS IN ('HOLD', 'UNDER REVIEW');`,
          response: `Ditemukan 1 dokumen CEISA Impor berstatus HOLD di Tanjung Priok:\n- Doc No: PIB-2026-0400 (PT Krakatau Steel)\n- Problem: Mismatch HS Code (Declared 8471.30 vs Tariff 8473.30)\n- Action: Send notification to Customs Team.`,
          rows: heldDeclarations.slice(0, 3).map((d) => ({
            DOC_NUMBER: d.docNumber,
            CLIENT_NAME: d.clientName,
            COMMODITY: d.commodity,
            STATUS: d.status,
            HOLD_REASON: d.holdReason || 'Inspection Required',
          })),
        })
      } else if (q.includes('rate') || q.includes('harga') || q.includes('shanghai') || q.includes('oocl')) {
        setCortexOutput({
          sql: `SELECT CARRIER, SERVICE_NAME, ORIGIN_LOCODE, DEST_LOCODE, CONTAINER_TYPE, RATE_USD, TRANSIT_DAYS \nFROM ERP_ONE_DB.REXINDO_PROD.ERP_VENDOR_RATES \nWHERE ORIGIN_LOCODE = 'IDJKT' AND DEST_LOCODE = 'CNSHA' AND CONTAINER_TYPE = '40HC' \nORDER BY RATE_USD ASC;`,
          response: `Freight rate comparison Jakarta (IDJKT) -> Shanghai (CNSHA) 40HC:\n1. OOCL (AEX5): $1,450.00 (Transit 10 days) — Lowest Rate\n2. Maersk (AE-1): $1,580.00 (Transit 10 days)`,
          rows: [
            { CARRIER: 'OOCL', SERVICE_NAME: 'AEX5', ORIGIN: 'IDJKT', DEST: 'CNSHA', TYPE: '40HC', RATE_USD: '$1,450.00', TRANSIT: '10 Days' },
            { CARRIER: 'Maersk', SERVICE_NAME: 'AE-1', ORIGIN: 'IDJKT', DEST: 'CNSHA', TYPE: '40HC', RATE_USD: '$1,580.00', TRANSIT: '10 Days' },
          ],
        })
      } else {
        setCortexOutput({
          sql: `SELECT SHIPMENT_NUMBER, CLIENT_NAME, COMMODITY, ROUTE_LABEL, STATUS_LABEL \nFROM ERP_ONE_DB.REXINDO_PROD.ERP_SHIPMENTS \nWHERE STATUS_LABEL = 'In Transit' \nLIMIT 5;`,
          response: `Retrieved ${shipments.length} active freight consignments from Snowflake Data Cloud.`,
          rows: shipments.slice(0, 3).map((s) => ({
            SHIPMENT_NUMBER: s.username || 'SHP-2026-1001',
            CLIENT_NAME: `${s.firstName} ${s.lastName}`,
            COMMODITY: (s as any)._ext?.commodity || 'Machinery Parts',
            ROUTE: (s as any)._ext?.routeLabel || 'Jakarta -> Shanghai',
            STATUS: (s as any)._ext?.statusLabel || 'In Transit',
          })),
        })
      }
      setIsExecuting(false)
      toast.success(`Cortex AI (${selectedModel}) query completed.`)
    }, 500)
  }

  const handleRunTerminalCmd = (cmd: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    const newLogs = [...terminalLogs, { type: 'cmd' as const, text: `$ ${cmd}`, time }]

    if (cmd.includes('coco status')) {
      newLogs.push({
        type: 'info',
        text: 'Database: ERP_ONE_DB | Warehouse: COMPUTE_WH | Role: ACCOUNTADMIN',
        time,
      })
      newLogs.push({
        type: 'success',
        text: 'Cortex AI Engine: Active | Search Indexing: Active',
        time,
      })
    } else if (cmd.includes('coco sync')) {
      newLogs.push({ type: 'info', text: 'Initiating CDC sync to Snowflake Data Cloud...', time })
      newLogs.push({ type: 'success', text: 'Synced 142 records to ERP_CLIENT_INVOICES & ERP_SHIPMENTS.', time })
    } else if (cmd.includes('coco agent run') || cmd.includes('masbro')) {
      newLogs.push({ type: 'info', text: 'Running Masbro Autonomous Scan...', time })
      newLogs.push({ type: 'warn', text: 'Detected 1 Customs Hold (PIB-2026-0400) & 2 Overdue Invoices.', time })
      newLogs.push({ type: 'success', text: 'Generated 2 Action Cards.', time })
    } else {
      newLogs.push({ type: 'info', text: `Command executed: "${cmd}"`, time })
    }

    setTerminalLogs(newLogs)
    setTerminalInput('')
  }

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderRight />
      </Header>

      <Main className='flex flex-col gap-6 pb-12'>
        {/* Clean Header */}
        <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b pb-4'>
          <div>
            <div className='flex items-center gap-2.5'>
              <h1 className='text-2xl font-bold tracking-tight text-foreground'>
                System Intelligence
              </h1>
              <Badge variant='outline' className='text-xs font-normal text-muted-foreground bg-muted/40'>
                Snowflake Cortex AI &bull; CoCo CLI
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Data Cloud integration, Text-to-SQL engine, and agent runner control center.
            </p>
          </div>

          <div className='flex items-center gap-2 mt-2 sm:mt-0'>
            <Button
              variant='outline'
              size='sm'
              className='gap-2 text-xs font-medium'
              onClick={() => setMasbroOpen(true)}
            >
              <Bot className='size-3.5 text-muted-foreground' />
              Launch AI Agent
            </Button>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Snowflake Data Cloud */}
          <div className='rounded-lg border bg-card p-4 shadow-none flex flex-col justify-between gap-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                Snowflake Data Cloud
              </span>
              <Database className='size-4 text-muted-foreground' />
            </div>
            <div>
              <div className='flex items-center justify-between'>
                <span className='text-lg font-bold text-foreground tracking-tight'>ERP_ONE_DB</span>
                <Badge variant='secondary' className='text-[10px] font-medium'>
                  Connected
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Schema: <code className='text-foreground font-mono'>REXINDO_PROD</code>
              </p>
            </div>
          </div>

          {/* Snowflake Cortex AI */}
          <div className='rounded-lg border bg-card p-4 shadow-none flex flex-col justify-between gap-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                Cortex AI Engine
              </span>
              <Cpu className='size-4 text-muted-foreground' />
            </div>
            <div>
              <div className='flex items-center justify-between'>
                <span className='text-lg font-bold text-foreground tracking-tight'>Mistral-7B</span>
                <Badge variant='secondary' className='text-[10px] font-medium'>
                  Active
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Text-to-SQL Reasoning Engine
              </p>
            </div>
          </div>

          {/* CoCo CLI Runner */}
          <div className='rounded-lg border bg-card p-4 shadow-none flex flex-col justify-between gap-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                CoCo CLI Runner
              </span>
              <Terminal className='size-4 text-muted-foreground' />
            </div>
            <div>
              <div className='flex items-center justify-between'>
                <span className='text-lg font-bold text-foreground tracking-tight'>v2.4.1 Daemon</span>
                <Badge variant='secondary' className='text-[10px] font-medium'>
                  Online
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Agent Task & Trigger Executor
              </p>
            </div>
          </div>

          {/* Masbro AI Agent */}
          <div className='rounded-lg border bg-card p-4 shadow-none flex flex-col justify-between gap-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                Masbro AI Agent
              </span>
              <Bot className='size-4 text-muted-foreground' />
            </div>
            <div>
              <div className='flex items-center justify-between'>
                <span className='text-lg font-bold text-foreground tracking-tight'>Super Agent</span>
                <Badge variant='outline' className='text-[10px] font-medium text-muted-foreground'>
                  Standby
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Action Card Automation
              </p>
            </div>
          </div>
        </div>

        {/* Clean Shadcn Tabs */}
        <Tabs defaultValue='cortex' className='w-full flex flex-col gap-6'>
          <TabsList className='grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/60 rounded-lg'>
            <TabsTrigger value='cortex' className='text-xs font-medium py-2'>
              Cortex AI Playground
            </TabsTrigger>
            <TabsTrigger value='snowflake' className='text-xs font-medium py-2'>
              Schema Inspector
            </TabsTrigger>
            <TabsTrigger value='architecture' className='text-xs font-medium py-2'>
              Architecture Overview
            </TabsTrigger>
            <TabsTrigger value='cococli' className='text-xs font-medium py-2'>
              CoCo CLI Terminal
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CORTEX AI PLAYGROUND */}
          <TabsContent value='cortex' className='flex flex-col gap-4 mt-0'>
            <Card className='border bg-card shadow-none'>
              <CardHeader className='pb-4 border-b'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <div>
                    <CardTitle className='text-base font-semibold text-foreground'>
                      Snowflake Cortex AI Text-to-SQL
                    </CardTitle>
                    <CardDescription className='text-xs mt-0.5'>
                      Test natural language questions using <code className='text-foreground font-mono'>SNOWFLAKE.CORTEX.COMPLETE()</code>.
                    </CardDescription>
                  </div>

                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-muted-foreground font-medium'>LLM Model:</span>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className='w-[140px] h-8 text-xs bg-background'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='mistral-7b'>Mistral-7B</SelectItem>
                        <SelectItem value='llama3-70b'>Llama3-70B</SelectItem>
                        <SelectItem value='snowflake-arctic'>Snowflake Arctic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-4 space-y-4'>
                {/* Input Prompt Area */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-xs font-medium text-foreground'>
                    <span>Natural Language Question:</span>
                  </div>
                  <div className='flex flex-col sm:flex-row items-stretch gap-2'>
                    <Textarea
                      value={nlQuery}
                      onChange={(e) => setNlQuery(e.target.value)}
                      placeholder='Ask a freight forwarding business question...'
                      className='text-xs min-h-[64px] bg-background resize-y'
                    />
                    <Button
                      className='h-auto sm:w-[130px] text-xs gap-2 shrink-0 self-stretch'
                      onClick={handleRunCortexQuery}
                      disabled={isExecuting}
                    >
                      {isExecuting ? <RefreshCw className='size-3.5 animate-spin' /> : <Play className='size-3.5 fill-current' />}
                      Run Query
                    </Button>
                  </div>
                </div>

                {/* Presets */}
                <div className='flex flex-wrap items-center gap-2 pt-1'>
                  <span className='text-xs text-muted-foreground font-medium'>Sample Presets:</span>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-xs h-7 px-3 bg-muted/30 font-normal'
                    onClick={() => setNlQuery('Cek status dokumen CEISA yang kena hold')}
                  >
                    CEISA Customs Hold
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-xs h-7 px-3 bg-muted/30 font-normal'
                    onClick={() => setNlQuery('Bandingkan ocean freight rate Jakarta ke Shanghai 40HC')}
                  >
                    Freight Rates
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-xs h-7 px-3 bg-muted/30 font-normal'
                    onClick={() => setNlQuery('Tampilkan invoice overdue dari Cargill Inc dan Krakatau Steel')}
                  >
                    Overdue Invoices
                  </Button>
                </div>

                {/* Cortex Output */}
                {cortexOutput && (
                  <div className='space-y-4 pt-4 border-t'>
                    {/* Generated SQL */}
                    <div className='rounded-lg bg-sidebar text-sidebar-foreground p-3 font-mono text-xs space-y-2 border border-sidebar-border'>
                      <div className='flex items-center justify-between text-sidebar-foreground/70 text-[11px] uppercase font-medium border-b border-sidebar-border pb-2'>
                        <span>Generated Snowflake SQL Query</span>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='size-6 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                          onClick={() => {
                            navigator.clipboard.writeText(cortexOutput.sql)
                            toast.success('SQL copied to clipboard!')
                          }}
                        >
                          <Copy className='size-3' />
                        </Button>
                      </div>
                      <pre className='text-sidebar-foreground whitespace-pre-wrap leading-relaxed overflow-x-auto text-[11px] font-mono'>
                        {cortexOutput.sql}
                      </pre>
                    </div>

                    {/* AI Response Card */}
                    <div className='rounded-lg border bg-muted/30 p-3.5 space-y-1.5'>
                      <div className='text-xs font-semibold text-foreground flex items-center gap-2'>
                        <Bot className='size-3.5 text-muted-foreground' />
                        <span>Cortex AI Response:</span>
                      </div>
                      <p className='text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed'>
                        {cortexOutput.response}
                      </p>
                    </div>

                    {/* Result Table */}
                    {cortexOutput.rows.length > 0 && (
                      <div className='rounded-md border overflow-hidden'>
                        <Table>
                          <TableHeader className='bg-muted/40'>
                            <TableRow>
                              {Object.keys(cortexOutput.rows[0]).map((k) => (
                                <TableHead key={k} className='text-xs font-semibold font-mono uppercase text-muted-foreground'>
                                  {k}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cortexOutput.rows.map((row, idx) => (
                              <TableRow key={idx}>
                                {Object.values(row).map((val, vIdx) => (
                                  <TableCell key={vIdx} className='text-xs font-mono'>
                                    {String(val)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: SNOWFLAKE SCHEMA INSPECTOR */}
          <TabsContent value='snowflake' className='flex flex-col gap-4 mt-0'>
            <Card className='border bg-card shadow-none'>
              <CardHeader className='pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b'>
                <div>
                  <CardTitle className='text-base font-semibold text-foreground'>
                    Schema Inspector
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5'>
                    Data tables & analytical views defined in <code className='text-foreground font-mono'>snowflake-schema.sql</code>.
                  </CardDescription>
                </div>
                <Badge variant='outline' className='text-xs font-mono w-fit bg-muted/30'>
                  ERP_ONE_DB.REXINDO_PROD
                </Badge>
              </CardHeader>
              <CardContent className='pt-4 space-y-4'>
                {/* Table selector bar */}
                <div className='flex flex-wrap items-center gap-1.5'>
                  {[
                    'ERP_SHIPMENTS',
                    'ERP_CLIENT_INVOICES',
                    'ERP_CUSTOMS_DECLARATIONS',
                    'ERP_VENDOR_RATES',
                    'ERP_CLIENTS',
                    'V_OVERDUE_SHIPMENTS',
                    'V_AR_AGING',
                  ].map((tbl) => (
                    <Button
                      key={tbl}
                      variant={selectedTable === tbl ? 'default' : 'outline'}
                      size='sm'
                      className='text-xs h-7 font-mono px-3'
                      onClick={() => setSelectedTable(tbl)}
                    >
                      {tbl}
                    </Button>
                  ))}
                </div>

                {/* Table Preview */}
                <div className='rounded-md border overflow-hidden'>
                  <Table>
                    <TableHeader className='bg-muted/40'>
                      {selectedTable === 'ERP_SHIPMENTS' && (
                        <TableRow>
                          <TableHead className='text-xs font-semibold'>SHIPMENT_ID</TableHead>
                          <TableHead className='text-xs font-semibold'>CLIENT_NAME</TableHead>
                          <TableHead className='text-xs font-semibold'>ROUTE_LABEL</TableHead>
                          <TableHead className='text-xs font-semibold'>VESSEL_NAME</TableHead>
                          <TableHead className='text-xs font-semibold'>STATUS_LABEL</TableHead>
                        </TableRow>
                      )}
                      {selectedTable === 'ERP_CLIENT_INVOICES' && (
                        <TableRow>
                          <TableHead className='text-xs font-semibold'>INVOICE_ID</TableHead>
                          <TableHead className='text-xs font-semibold'>CLIENT_NAME</TableHead>
                          <TableHead className='text-xs font-semibold'>AMOUNT_USD</TableHead>
                          <TableHead className='text-xs font-semibold'>DUE_DATE</TableHead>
                          <TableHead className='text-xs font-semibold'>STATUS_LABEL</TableHead>
                        </TableRow>
                      )}
                      {selectedTable === 'ERP_CUSTOMS_DECLARATIONS' && (
                        <TableRow>
                          <TableHead className='text-xs font-semibold'>DOC_NUMBER</TableHead>
                          <TableHead className='text-xs font-semibold'>DOC_TYPE</TableHead>
                          <TableHead className='text-xs font-semibold'>CLIENT_NAME</TableHead>
                          <TableHead className='text-xs font-semibold'>HS_CODE</TableHead>
                          <TableHead className='text-xs font-semibold'>STATUS</TableHead>
                        </TableRow>
                      )}
                      {selectedTable === 'ERP_VENDOR_RATES' && (
                        <TableRow>
                          <TableHead className='text-xs font-semibold'>RATE_ID</TableHead>
                          <TableHead className='text-xs font-semibold'>CARRIER</TableHead>
                          <TableHead className='text-xs font-semibold'>ROUTE</TableHead>
                          <TableHead className='text-xs font-semibold'>CONTAINER</TableHead>
                          <TableHead className='text-xs font-semibold'>RATE_USD</TableHead>
                          <TableHead className='text-xs font-semibold'>TRANSIT_DAYS</TableHead>
                        </TableRow>
                      )}
                      {selectedTable !== 'ERP_SHIPMENTS' &&
                        selectedTable !== 'ERP_CLIENT_INVOICES' &&
                        selectedTable !== 'ERP_CUSTOMS_DECLARATIONS' &&
                        selectedTable !== 'ERP_VENDOR_RATES' && (
                          <TableRow>
                            <TableHead className='text-xs font-semibold'>FIELD</TableHead>
                            <TableHead className='text-xs font-semibold'>TYPE</TableHead>
                            <TableHead className='text-xs font-semibold'>DESCRIPTION</TableHead>
                          </TableRow>
                        )}
                    </TableHeader>
                    <TableBody>
                      {selectedTable === 'ERP_SHIPMENTS' &&
                        shipments.slice(0, 4).map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className='text-xs font-mono font-medium'>{s.username || 'SHP-2026-1001'}</TableCell>
                            <TableCell className='text-xs'>{s.firstName} {s.lastName}</TableCell>
                            <TableCell className='text-xs'>{(s as any)._ext?.routeLabel || 'Jakarta -> Shanghai'}</TableCell>
                            <TableCell className='text-xs'>{(s as any)._ext?.vesselName || 'OOCL INDONESIA'}</TableCell>
                            <TableCell className='text-xs'>
                              <Badge variant='outline' className='text-[10px] font-normal'>
                                {(s as any)._ext?.statusLabel || 'In Transit'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}

                      {selectedTable === 'ERP_CLIENT_INVOICES' &&
                        invoices.slice(0, 4).map((i) => (
                          <TableRow key={i.id}>
                            <TableCell className='text-xs font-mono font-medium'>{i.username}</TableCell>
                            <TableCell className='text-xs'>{i.firstName}</TableCell>
                            <TableCell className='text-xs font-medium'>{i.amount}</TableCell>
                            <TableCell className='text-xs font-mono text-muted-foreground'>2026-07-25</TableCell>
                            <TableCell className='text-xs'>
                              <Badge variant={i.status === 'inactive' ? 'outline' : 'secondary'} className='text-[10px] font-normal'>
                                {i.status === 'inactive' ? 'OVERDUE' : 'PAID'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}

                      {selectedTable === 'ERP_CUSTOMS_DECLARATIONS' &&
                        heldDeclarations.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className='text-xs font-mono font-medium'>{d.docNumber}</TableCell>
                            <TableCell className='text-xs font-medium'>{d.docType}</TableCell>
                            <TableCell className='text-xs'>{d.clientName}</TableCell>
                            <TableCell className='text-xs font-mono'>{d.hsCode}</TableCell>
                            <TableCell className='text-xs'>
                              <Badge variant='outline' className='text-[10px] font-normal'>
                                {d.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}

                      {selectedTable === 'ERP_VENDOR_RATES' && (
                        <>
                          <TableRow>
                            <TableCell className='text-xs font-mono'>RT-001</TableCell>
                            <TableCell className='text-xs font-medium'>OOCL</TableCell>
                            <TableCell className='text-xs'>IDJKT → CNSHA</TableCell>
                            <TableCell className='text-xs font-mono'>40HC</TableCell>
                            <TableCell className='text-xs font-semibold'>$1,450.00</TableCell>
                            <TableCell className='text-xs'>10 Days</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className='text-xs font-mono'>RT-002</TableCell>
                            <TableCell className='text-xs font-medium'>Maersk</TableCell>
                            <TableCell className='text-xs'>IDJKT → CNSHA</TableCell>
                            <TableCell className='text-xs font-mono'>40HC</TableCell>
                            <TableCell className='text-xs font-medium'>$1,580.00</TableCell>
                            <TableCell className='text-xs'>10 Days</TableCell>
                          </TableRow>
                        </>
                      )}

                      {selectedTable !== 'ERP_SHIPMENTS' &&
                        selectedTable !== 'ERP_CLIENT_INVOICES' &&
                        selectedTable !== 'ERP_CUSTOMS_DECLARATIONS' &&
                        selectedTable !== 'ERP_VENDOR_RATES' && (
                          <TableRow>
                            <TableCell className='text-xs font-mono'>CLIENT_ID</TableCell>
                            <TableCell className='text-xs font-mono text-muted-foreground'>VARCHAR(10) PRIMARY KEY</TableCell>
                            <TableCell className='text-xs text-muted-foreground'>Primary key for client company</TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: ARCHITECTURE OVERVIEW */}
          <TabsContent value='architecture' className='flex flex-col gap-4 mt-0'>
            <Card className='border bg-card shadow-none'>
              <CardHeader className='pb-4 border-b'>
                <CardTitle className='text-base font-semibold text-foreground'>
                  System Architecture Overview
                </CardTitle>
                <CardDescription className='text-xs mt-0.5'>
                  Integration pipeline connecting ERP One UI, CoCo CLI runner, Snowflake Cortex AI, and Snowflake Data Cloud.
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-4 space-y-6'>
                {/* Clean Flow Grid */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                  <div className='p-4 rounded-lg border bg-muted/20 space-y-2'>
                    <div className='text-xs font-mono font-bold text-muted-foreground'>01</div>
                    <h4 className='text-xs font-semibold text-foreground'>Frontend & Masbro UI</h4>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      User submits natural language prompts via Masbro sidebar or Cortex playground.
                    </p>
                  </div>

                  <div className='p-4 rounded-lg border bg-muted/20 space-y-2'>
                    <div className='text-xs font-mono font-bold text-muted-foreground'>02</div>
                    <h4 className='text-xs font-semibold text-foreground'>CoCo CLI Runner</h4>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      CoCo CLI daemon manages session auth and proxies requests to Cortex AI.
                    </p>
                  </div>

                  <div className='p-4 rounded-lg border bg-muted/20 space-y-2'>
                    <div className='text-xs font-mono font-bold text-muted-foreground'>03</div>
                    <h4 className='text-xs font-semibold text-foreground'>Snowflake Cortex AI</h4>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      Translates prompts into Snowflake SQL via <code className='text-foreground font-mono'>CORTEX.COMPLETE()</code>.
                    </p>
                  </div>

                  <div className='p-4 rounded-lg border bg-muted/20 space-y-2'>
                    <div className='text-xs font-mono font-bold text-muted-foreground'>04</div>
                    <h4 className='text-xs font-semibold text-foreground'>Snowflake Data Cloud</h4>
                    <p className='text-xs text-muted-foreground leading-relaxed'>
                      Executes SQL against <code className='text-foreground font-mono'>ERP_ONE_DB.REXINDO_PROD</code> tables and views.
                    </p>
                  </div>
                </div>

                {/* Specs List */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-2'>
                  <div className='p-4 rounded-lg border bg-card space-y-2'>
                    <h4 className='text-xs font-semibold text-foreground'>Data Cloud Layer</h4>
                    <ul className='text-xs text-muted-foreground space-y-1.5 list-disc pl-4'>
                      <li>Database: <code className='text-foreground font-mono'>ERP_ONE_DB</code></li>
                      <li>Schema: <code className='text-foreground font-mono'>REXINDO_PROD</code></li>
                      <li>Master Tables: Clients, Shipments, Invoices, Customs, Vendor Rates</li>
                    </ul>
                  </div>

                  <div className='p-4 rounded-lg border bg-card space-y-2'>
                    <h4 className='text-xs font-semibold text-foreground'>Cortex Capabilities</h4>
                    <ul className='text-xs text-muted-foreground space-y-1.5 list-disc pl-4'>
                      <li>LLM Models: Mistral-7B, Llama3-70B, Snowflake Arctic</li>
                      <li>Native Text-to-SQL generation</li>
                      <li>Internal processing within Snowflake security boundary</li>
                    </ul>
                  </div>

                  <div className='p-4 rounded-lg border bg-card space-y-2'>
                    <h4 className='text-xs font-semibold text-foreground'>CoCo CLI Automation</h4>
                    <ul className='text-xs text-muted-foreground space-y-1.5 list-disc pl-4'>
                      <li>CLI Agent execution environment</li>
                      <li>Action Cards confirmation for trigger workflows</li>
                      <li>Background CDC synchronization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: COCO CLI TERMINAL */}
          <TabsContent value='cococli' className='flex flex-col gap-4 mt-0'>
            <Card className='border border-sidebar-border bg-sidebar text-sidebar-foreground font-mono shadow-none rounded-lg'>
              <CardHeader className='py-2.5 px-3 border-b border-sidebar-border flex flex-row items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Terminal className='size-3.5 text-sidebar-foreground/70' />
                  <CardTitle className='text-xs font-semibold text-sidebar-foreground tracking-wider uppercase'>
                    CoCo CLI Terminal
                  </CardTitle>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='size-2 rounded-full bg-emerald-500' />
                  <span className='text-[10px] text-sidebar-foreground/70 font-sans uppercase font-medium'>Daemon Active</span>
                </div>
              </CardHeader>
              <CardContent className='p-3 space-y-3'>
                {/* Terminal Output */}
                <div className='h-44 overflow-y-auto space-y-1 text-xs font-mono leading-relaxed pr-1'>
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className='flex items-start gap-2 text-[11px]'>
                      <span className='text-sidebar-foreground/50 shrink-0 select-none text-[10px]'>[{log.time}]</span>
                      {log.type === 'cmd' && <span className='text-sidebar-foreground font-semibold'>{log.text}</span>}
                      {log.type === 'info' && <span className='text-sidebar-foreground/80'>{log.text}</span>}
                      {log.type === 'success' && <span className='text-emerald-600 dark:text-emerald-400 font-medium'>{log.text}</span>}
                      {log.type === 'warn' && <span className='text-amber-600 dark:text-amber-400 font-medium'>{log.text}</span>}
                    </div>
                  ))}
                </div>

                {/* Command Bar */}
                <div className='flex flex-wrap items-center gap-1.5 pt-2 border-t border-sidebar-border font-sans'>
                  <span className='text-[10px] text-sidebar-foreground/60 font-medium uppercase'>Quick Run:</span>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-6 text-[10px] bg-background text-foreground border-sidebar-border font-mono px-2'
                    onClick={() => handleRunTerminalCmd('coco status')}
                  >
                    coco status
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-6 text-[10px] bg-background text-foreground border-sidebar-border font-mono px-2'
                    onClick={() => handleRunTerminalCmd('coco sync --target=snowflake')}
                  >
                    coco sync
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-6 text-[10px] bg-background text-foreground border-sidebar-border font-mono px-2'
                    onClick={() => handleRunTerminalCmd('coco agent run --name=masbro')}
                  >
                    coco agent run
                  </Button>
                </div>

                {/* Prompt Input */}
                <div className='flex items-center gap-2 pt-1 border-t border-sidebar-border/60'>
                  <span className='text-sidebar-foreground/70 font-bold text-xs'>$</span>
                  <input
                    type='text'
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && terminalInput.trim()) {
                        handleRunTerminalCmd(terminalInput)
                      }
                    }}
                    placeholder='Type command (e.g. coco status)...'
                    className='w-full bg-transparent outline-none border-none text-xs text-sidebar-foreground placeholder-sidebar-foreground/40 font-mono'
                  />
                  <Button
                    size='sm'
                    className='h-6 text-[11px] px-2.5 shrink-0 font-sans'
                    onClick={() => terminalInput.trim() && handleRunTerminalCmd(terminalInput)}
                  >
                    Run
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

export default SystemIntelligence
