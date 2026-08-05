import React, { useState } from 'react'
import {
  getDocumentFlowChain,
  cancelDocumentChain,
  reviseDocumentChain,
  generateNextDocument,
  DOCUMENT_CHAIN_ORDER,
  type ChainFlowSummary,
  type FlowStepNode,
} from '@/lib/document-flow'
import { getCurrentSessionUser } from '@/lib/resource-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  GitCommit,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RotateCcw,
  Ban,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  User,
  Clock,
  Layers,
} from 'lucide-react'
import { toast } from 'sonner'

interface DocumentFlowStepperProps {
  resourceName: string
  recordId: string
  record: any
  onNavigateToRecord: (resourceName: string, recordId: string) => void
  onRefresh: () => void
}

export const DocumentFlowStepper: React.FC<DocumentFlowStepperProps> = ({
  resourceName,
  recordId,
  record,
  onNavigateToRecord,
  onRefresh,
}) => {
  const [cancelReason, setCancelReason] = useState('')
  const [revisionNotes, setRevisionNotes] = useState('')
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isReviseDialogOpen, setIsReviseDialogOpen] = useState(false)

  const chainSummary: ChainFlowSummary = getDocumentFlowChain(resourceName, recordId)
  const currentUser = getCurrentSessionUser()

  const handleCancelChain = () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a mandatory cancellation reason.')
      return
    }

    const result = cancelDocumentChain(resourceName, recordId, cancelReason, currentUser)
    toast.success(`Cancelled document chain! ${result.updatedCount} records updated.`)
    setIsCancelDialogOpen(false)
    setCancelReason('')
    onRefresh()
  }

  const handleReviseChain = () => {
    if (!revisionNotes.trim()) {
      toast.error('Please describe the revision notes.')
      return
    }

    const result = reviseDocumentChain(resourceName, recordId, revisionNotes, currentUser)
    toast.success(`Document revised and ${result.updatedCount} linked records updated.`)
    setIsReviseDialogOpen(false)
    setRevisionNotes('')
    onRefresh()
  }

  const handleCreateNext = (targetResource: string) => {
    const newDoc = generateNextDocument(resourceName, recordId, targetResource, currentUser)
    if (newDoc) {
      toast.success(`Auto-generated new linked ${targetResource} record #${newDoc.id}`)
      onNavigateToRecord(targetResource, newDoc.id)
    } else {
      toast.error(`Failed to auto-generate ${targetResource}`)
    }
  }

  return (
    <div className='flex flex-col gap-5 rounded-xl border bg-card p-5 shadow-sm w-full'>
      {/* Header & Quick Action Toolbar */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b pb-4'>
        <div className='flex items-center gap-2.5'>
          <div className='p-2 rounded-lg bg-primary/10 text-primary'>
            <GitCommit className='size-5' />
          </div>
          <div>
            <h3 className='text-sm font-semibold tracking-tight text-foreground flex items-center gap-2'>
              Document Chain Flow Lifecycle
              <Badge variant='outline' className='text-[10px] font-mono px-2 py-0.5 bg-muted'>
                Rexcorp ERP Chain Engine
              </Badge>
            </h3>
            <p className='text-xs text-muted-foreground'>
              Linked document pipeline across Commercial, Operational Forwarding, Customs, & Finance
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {/* Revise Button */}
          <Dialog open={isReviseDialogOpen} onOpenChange={setIsReviseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant='outline' size='sm' className='h-8 text-xs gap-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'>
                <RotateCcw className='size-3.5' /> Revise Document
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[480px]'>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2 text-base font-semibold'>
                  <RotateCcw className='size-5 text-amber-500' />
                  Revise Document Chain
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground'>
                  Revising this document will set its status to Draft/Revision and update revision notes across all linked documents in the flow.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-3 py-2'>
                <Label htmlFor='revNotes' className='text-xs font-medium'>
                  Revision Instructions & Notes <span className='text-destructive'>*</span>
                </Label>
                <Textarea
                  id='revNotes'
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder='e.g., Updated vessel voyage to MSC MAYA v.025W and revised gross weight to 21,000 KG...'
                  className='min-h-[100px] text-xs'
                />
              </div>
              <DialogFooter className='gap-2 sm:gap-0'>
                <Button variant='outline' size='sm' onClick={() => setIsReviseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button size='sm' onClick={handleReviseChain} className='bg-amber-600 hover:bg-amber-700 text-white'>
                  Apply Document Revision
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Cancel Chain Button */}
          <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <DialogTrigger asChild>
              <Button variant='outline' size='sm' className='h-8 text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10'>
                <Ban className='size-3.5' /> Cancel Flow Chain
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[480px]'>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2 text-base font-semibold text-destructive'>
                  <Ban className='size-5 text-destructive' />
                  Cancel Document & Cascade Chain
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground'>
                  Cancelling this document will cascade status updates to ALL related linked documents (Invoices, Shipments, Bills, AR records) to maintain ledger integrity.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-3 py-2'>
                <Label htmlFor='cancReason' className='text-xs font-medium'>
                  Mandatory Cancellation Reason <span className='text-destructive'>*</span>
                </Label>
                <Textarea
                  id='cancReason'
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder='e.g., Shipper cancelled order due to export license delay / Rate offer expired...'
                  className='min-h-[100px] text-xs'
                />
              </div>
              <DialogFooter className='gap-2 sm:gap-0'>
                <Button variant='outline' size='sm' onClick={() => setIsCancelDialogOpen(false)}>
                  Back
                </Button>
                <Button variant='destructive' size='sm' onClick={handleCancelChain}>
                  Confirm Cancellation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Visual Stepper Pipeline */}
      <div className='relative overflow-x-auto pb-2'>
        <div className='flex items-center min-w-[760px] gap-2 py-1'>
          {chainSummary.nodes.map((node, index) => {
            const isLast = index === chainSummary.nodes.length - 1

            return (
              <React.Fragment key={node.resourceName}>
                <div
                  className={`flex flex-col gap-1.5 p-2.5 rounded-lg border text-left min-w-[145px] transition-all ${
                    node.isCurrent
                      ? 'bg-primary/5 border-primary ring-1 ring-primary/20 shadow-sm'
                      : node.recordId
                      ? 'bg-card border-border hover:border-primary/40'
                      : 'bg-muted/30 border-dashed border-muted-foreground/30'
                  }`}
                >
                  <div className='flex items-center justify-between gap-1'>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate'>
                      {node.label}
                    </span>
                    {node.isCurrent && (
                      <span className='size-2 rounded-full bg-primary animate-pulse' title='Current view' />
                    )}
                  </div>

                  {node.recordId ? (
                    <div className='flex flex-col gap-1 mt-0.5'>
                      <button
                        onClick={() => onNavigateToRecord(node.resourceName, node.recordId!)}
                        className='group text-xs font-semibold text-foreground hover:text-primary transition-colors flex items-center justify-between text-left truncate'
                      >
                        <span className='truncate'>{node.title || node.recordId}</span>
                        <ExternalLink className='size-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1' />
                      </button>

                      {node.status && (
                        <Badge variant={node.badgeVariant as any} className='text-[10px] py-0 px-1.5 w-fit font-normal'>
                          {node.status}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className='flex flex-col gap-1.5 mt-0.5'>
                      <span className='text-[11px] text-muted-foreground italic'>Not Created</span>
                      {node.canCreateNext && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleCreateNext(node.resourceName)}
                          className='h-6 px-1.5 text-[10px] font-medium text-primary hover:text-primary hover:bg-primary/10 gap-1 justify-start'
                        >
                          <PlusCircle className='size-3' /> Generate
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {!isLast && (
                  <ArrowRight className='size-4 text-muted-foreground/40 shrink-0 mx-0.5' />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Document Audit Metadata Bar */}
      <div className='flex flex-wrap items-center justify-between gap-4 pt-3 border-t text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg'>
        <div className='flex items-center gap-4 flex-wrap'>
          <div className='flex items-center gap-1.5'>
            <User className='size-3.5 text-primary' />
            <span className='font-medium text-foreground'>Created By:</span>
            <span>{record.createdBy || 'System Admin'}</span>
            {record.createdAt && (
              <span className='text-[11px] text-muted-foreground'>({record.createdAt})</span>
            )}
          </div>

          <div className='flex items-center gap-1.5 border-l pl-4'>
            <Clock className='size-3.5 text-amber-500' />
            <span className='font-medium text-foreground'>Last Edited By:</span>
            <span>{record.updatedBy || record.createdBy || currentUser}</span>
            {record.updatedAt && (
              <span className='text-[11px] text-muted-foreground'>({record.updatedAt})</span>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <ShieldCheck className='size-3.5 text-emerald-500' />
          <span className='text-[11px] font-mono'>Active Operator: {currentUser}</span>
        </div>
      </div>
    </div>
  )
}
