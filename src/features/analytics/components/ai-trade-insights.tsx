import { useState } from 'react'
import { AlertTriangle, ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Check, RefreshCw, ShieldAlert, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { generatePresetAIInsight, type AIInsightResult } from '../data/analytics-data'

export function AITradeInsights() {
  const [insightType, setInsightType] = useState<'leakage' | 'carrier' | 'customs' | 'optimization'>('leakage')
  const [currentInsight, setCurrentInsight] = useState<AIInsightResult>(() => generatePresetAIInsight('leakage'))
  const [hasAnalyzed, setHasAnalyzed] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleSelectPreset = (type: 'leakage' | 'carrier' | 'customs' | 'optimization') => {
    setIsGenerating(true)
    setInsightType(type)
    setHasAnalyzed(true)
    setTimeout(() => {
      setCurrentInsight(generatePresetAIInsight(type))
      setIsGenerating(false)
    }, 400)
  }

  const handleRunAnalysis = () => {
    setIsGenerating(true)
    setHasAnalyzed(true)
    setTimeout(() => {
      setCurrentInsight(generatePresetAIInsight(insightType))
      setIsGenerating(false)
      toast.success('Masbro insight updated!')
    }, 500)
  }

  const handleCopyInsight = () => {
    const textToCopy = `${currentInsight.title}\n\nSummary:\n${currentInsight.summary}\n\nAction Plan:\n${currentInsight.actionPlan.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('AI Insight report copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className='border-border bg-card text-card-foreground shadow-xs'>
      <CardHeader className='pb-3 flex flex-row items-center justify-between'>
        <div className='flex items-center gap-2.5'>
          <div className='flex size-8 items-center justify-center rounded-md bg-muted text-foreground ring-1 ring-border'>
            <img src='/rexpro-ai_logo.svg' alt='masbro' className='size-5' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-sm font-semibold text-foreground'>
                Masbro insight
              </CardTitle>
              <Badge variant='outline' className='text-[10px] uppercase tracking-wider font-normal'>
                Neural Audit
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Automated anomaly detection, demurrage risk auditor & margin yield optimizer
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsExpanded(!isExpanded)}
            className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
          >
            {isExpanded ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
            <span className='sr-only'>Toggle AI Panel</span>
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className='pt-0 flex flex-col gap-4'>
          {/* Preset trigger buttons + Analyze/Reanalyze action button */}
          <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-xs text-muted-foreground font-medium mr-1'>
                Preset Audits:
              </span>
              <Button
                variant={insightType === 'leakage' ? 'default' : 'outline'}
                size='sm'
                onClick={() => handleSelectPreset('leakage')}
                className='h-7 text-xs rounded-md'
              >
                <ShieldAlert className='size-3 mr-1.5' />
                Margin Leakage
              </Button>
              <Button
                variant={insightType === 'carrier' ? 'default' : 'outline'}
                size='sm'
                onClick={() => handleSelectPreset('carrier')}
                className='h-7 text-xs rounded-md'
              >
                <ArrowUpRight className='size-3 mr-1.5' />
                Carrier Reliability
              </Button>
              <Button
                variant={insightType === 'customs' ? 'default' : 'outline'}
                size='sm'
                onClick={() => handleSelectPreset('customs')}
                className='h-7 text-xs rounded-md'
              >
                <AlertTriangle className='size-3 mr-1.5' />
                Customs Red Line
              </Button>
              <Button
                variant={insightType === 'optimization' ? 'default' : 'outline'}
                size='sm'
                onClick={() => handleSelectPreset('optimization')}
                className='h-7 text-xs rounded-md'
              >
                <TrendingUp className='size-3 mr-1.5' />
                Yield Optimization
              </Button>
            </div>

            <Button
              onClick={handleRunAnalysis}
              disabled={isGenerating}
              size='sm'
              className='h-8 text-xs gap-1.5 shrink-0 px-3'
            >
              <RefreshCw className={cn('size-3.5', isGenerating && 'animate-spin')} />
              {hasAnalyzed ? 'Reanalyze' : 'Analyze'}
            </Button>
          </div>

          {/* AI Result Card - Neutral styled box */}
          <div className='rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-3 relative'>
            {isGenerating && (
              <div className='absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center gap-2 rounded-lg z-20 text-xs text-foreground font-medium'>
                <RefreshCw className='size-4 animate-spin text-muted-foreground' />
                Analyzing freight chains, cost accruals, and vessel logs...
              </div>
            )}

            {/* Title & Header */}
            <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5'>
              <div className='flex items-center gap-2'>
                <Badge variant='secondary' className='text-xs font-medium'>
                  {currentInsight.riskLevel} Priority
                </Badge>
                <h3 className='text-sm font-semibold text-foreground'>{currentInsight.title}</h3>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleCopyInsight}
                className='h-7 text-xs text-muted-foreground hover:text-foreground gap-1'
              >
                {copied ? <Check className='size-3.5' /> : <Copy className='size-3.5' />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>

            {/* Summary */}
            <p className='text-xs text-muted-foreground leading-relaxed'>{currentInsight.summary}</p>

            {/* Metrics Row */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 my-1'>
              {currentInsight.metrics.map((m, idx) => (
                <div key={idx} className='rounded-md bg-background border border-border p-2.5 flex flex-col gap-0.5'>
                  <span className='text-[11px] text-muted-foreground font-medium'>{m.label}</span>
                  <div className='flex items-baseline justify-between'>
                    <span className='text-base font-semibold text-foreground tabular-nums'>{m.value}</span>
                    {m.trend && <span className='text-[10px] text-muted-foreground font-medium'>{m.trend}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Root Causes & Action Plan in 2 columns */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-1'>
              {/* Root Causes */}
              <div className='flex flex-col gap-2 rounded-md bg-background p-3 border border-border'>
                <span className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                  <AlertTriangle className='size-3.5 text-muted-foreground' /> Primary Root Causes
                </span>
                <ul className='flex flex-col gap-1.5 text-[11px] text-muted-foreground list-disc list-inside leading-normal'>
                  {currentInsight.rootCauses.map((rc, idx) => (
                    <li key={idx}>
                      <span>{rc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Action Plan */}
              <div className='flex flex-col gap-2 rounded-md bg-background p-3 border border-border'>
                <span className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                  <CheckCircle2 className='size-3.5 text-muted-foreground' /> Recommended Steps
                </span>
                <ul className='flex flex-col gap-1.5 text-[11px] text-foreground list-none'>
                  {currentInsight.actionPlan.map((ap, idx) => (
                    <li key={idx} className='flex items-start gap-1.5'>
                      <CheckCircle2 className='size-3 text-muted-foreground shrink-0 mt-0.5' />
                      <span>{ap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
