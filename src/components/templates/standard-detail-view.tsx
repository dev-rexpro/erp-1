import { useState } from 'react'
import { ArrowLeft, FileSearch, Printer, Download, Pencil, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

export interface StandardDetailViewProps {
  title: string
  subtitle?: string
  isNew?: boolean
  isEditing?: boolean
  onEditingChange?: (editing: boolean) => void
  onBack: () => void
  primaryActions?: React.ReactNode

  // Form Area
  renderForm: (opts?: { isEditing: boolean }) => React.ReactNode

  // Preview Area
  hasPreview?: boolean
  renderPreview?: () => React.ReactNode

  // Action Handlers
  onPrint?: () => void
  onDownload?: () => void
}

export function StandardDetailView({
  title,
  subtitle,
  isNew = false,
  isEditing: externalIsEditing,
  onEditingChange,
  onBack,
  primaryActions,
  renderForm,
  hasPreview = false,
  renderPreview,
  onPrint = () => window.print(),
  onDownload,
}: StandardDetailViewProps) {
  // Clean double "Edit" or "Create" or "Details" prefixes/suffixes from title
  const cleanTitle = title
    .replace(/^Edit\s+/i, '')
    .replace(/^Create\s+New\s+/i, '')
    .replace(/^Create\s+/i, '')
    .replace(/\s+Details$/i, '')
    .trim()

  // Internal editing state if not controlled externally
  const [internalIsEditing, setInternalIsEditing] = useState(isNew)
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing

  const setIsEditing = (val: boolean) => {
    setInternalIsEditing(val)
    onEditingChange?.(val)
  }

  // Confirmation dialog state for leaving without saving
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<'back' | 'cancel' | null>(null)

  const handleBackClick = () => {
    if (isEditing || isNew) {
      setPendingAction('back')
      setShowConfirmDialog(true)
    } else {
      onBack()
    }
  }

  const handleCancelEditClick = () => {
    if (isEditing) {
      setPendingAction('cancel')
      setShowConfirmDialog(true)
    } else {
      setIsEditing(false)
    }
  }

  const handleConfirmLeave = () => {
    setShowConfirmDialog(false)
    if (pendingAction === 'back') {
      onBack()
    } else if (pendingAction === 'cancel') {
      setIsEditing(false)
    }
    setPendingAction(null)
  }

  // Preview panel HIDDEN BY DEFAULT as explicitly requested
  const [showPreview, setShowPreview] = useState(false)

  // Full View (Open Document Preview in New Tab)
  const handleFullView = () => {
    const printEl = document.querySelector('[data-print-paper]')
    if (!printEl) {
      onPrint()
      return
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('\n')

    const win = window.open('', '_blank')
    if (!win) return

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${cleanTitle} - Full View Document Preview</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${styles}
          <style>
            body {
              background-color: #e5e7eb;
              margin: 0;
              padding: 2.5rem 1rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              min-height: 100vh;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .fullview-toolbar {
              position: fixed;
              top: 1rem;
              right: 1.5rem;
              z-index: 99999;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              background: #ffffff;
              padding: 0.5rem 0.85rem;
              border-radius: 0.5rem;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
              border: 1px solid #d1d5db;
            }
            .fullview-btn {
              padding: 0.4rem 0.9rem;
              font-size: 0.85rem;
              font-weight: 600;
              border-radius: 0.375rem;
              border: 1px solid #000;
              cursor: pointer;
              background: #000;
              color: #fff;
              display: inline-flex;
              align-items: center;
              gap: 0.375rem;
              transition: all 0.2s;
            }
            .fullview-btn:hover {
              opacity: 0.85;
            }
            .fullview-btn.secondary {
              background: #ffffff;
              color: #111827;
              border-color: #d1d5db;
            }
            @media print {
              .fullview-toolbar { display: none !important; }
              body { background: #ffffff !important; padding: 0 !important; }
            }
          </style>
        </head>
        <body>
          <div class="fullview-toolbar">
            <span style="font-weight:600; font-size: 0.85rem; color: #374151; margin-right: 0.5rem;">${cleanTitle} Preview</span>
            <button class="fullview-btn" onclick="window.print()">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Document
            </button>
            <button class="fullview-btn secondary" onclick="window.close()">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Close
            </button>
          </div>
          <div style="display: inline-block;">
            ${printEl.outerHTML}
          </div>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Leave Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Without Saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes or active edits. If you leave or cancel now, your changes will not be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLeave}
              className='bg-red-600 text-white hover:bg-red-700'
            >
              Discard & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='font-semibold text-2xl sm:text-3xl leading-none tracking-tight'>
            {isNew
              ? `Create ${cleanTitle}`
              : isEditing
              ? `Edit ${cleanTitle}`
              : `${cleanTitle} Details`}
          </h1>
          {subtitle && (
            <p className='text-muted-foreground text-xs sm:text-sm'>
              {subtitle}
            </p>
          )}
        </div>
        <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
          <Button variant='outline' size='sm' onClick={handleBackClick} className='h-9 px-3 gap-1.5'>
            <ArrowLeft className='size-4' />
            Back
          </Button>

          {hasPreview && (
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={() => setShowPreview(!showPreview)}
              className={cn('h-9 w-9', showPreview && 'bg-accent text-accent-foreground')}
              title={showPreview ? 'Hide Document Preview' : 'Show Document Preview'}
            >
              <FileSearch className='size-4' />
            </Button>
          )}

          {!isNew && !isEditing && (
            <Button
              type='button'
              variant='default'
              size='sm'
              onClick={() => setIsEditing(true)}
              className='h-9 px-3.5 gap-1.5 shadow-sm'
            >
              <Pencil className='size-4' />
              Edit
            </Button>
          )}

          {!isNew && isEditing && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleCancelEditClick}
              className='h-9 px-3 gap-1.5'
            >
              <X className='size-4' />
              Cancel Edit
            </Button>
          )}

          {(isNew || isEditing) && primaryActions}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={cn('grid gap-5', showPreview ? 'xl:grid-cols-2' : 'grid-cols-1')}>
        {/* Left Side: Form */}
        <div className='flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5 shadow-sm transition-all'>
          <div
            className={cn(
              'contents group',
              !isEditing &&
                'select-text [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none [&_button:not([role="tab"]):not([data-slot="tabs-trigger"])]:pointer-events-none [&_input]:bg-muted/15 [&_select]:bg-muted/15 [&_textarea]:bg-muted/15 [&_button[role="combobox"]]:bg-muted/15 [&_input]:cursor-default [&_select]:cursor-default [&_textarea]:cursor-default'
            )}
          >
            {renderForm({ isEditing })}
          </div>
        </div>

        {/* Right Side: Preview */}
        {showPreview && renderPreview && (
          <div className='flex flex-col rounded-xl border bg-card animate-fade-in shadow-sm'>
            <div className='flex items-center justify-between px-4 py-3 border-b'>
              <h2 className='font-medium text-base'>Document Preview</h2>
              <div className='flex items-center gap-1.5'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={handleFullView}
                  className='h-8 w-8'
                  title='Full View (Open in new tab)'
                >
                  <ExternalLink className='size-3.5' />
                  <span className='sr-only'>Full View</span>
                </Button>
                <Button type='button' variant='outline' size='sm' onClick={onPrint} className='h-8 text-xs'>
                  <Printer className='mr-1.5 size-3.5' />
                  Print
                </Button>
                {onDownload && (
                  <Button type='button' variant='outline' size='sm' onClick={onDownload} className='h-8 text-xs'>
                    <Download className='mr-1.5 size-3.5' />
                    Download PDF
                  </Button>
                )}
              </div>
            </div>

            <div className='relative min-h-[calc(100svh-15rem)] flex-1 rounded-b-xl bg-stone-200 p-4 dark:bg-stone-800 overflow-hidden'>
              {renderPreview()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


