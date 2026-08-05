import { useState } from 'react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { FileText, Plus, Pin, Trash2, Calendar, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useProductivityStore, type ProductivityNote } from '@/stores/productivity-store'
import { CreateNoteDialog } from './create-note-dialog'

function formatNoteDate(dateStr: string) {
  try {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function RecentNotesCard() {
  const { activeUserId, notes, togglePinNote, deleteNote } = useProductivityStore()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<ProductivityNote | null>(null)

  // Filter notes for active user
  const userNotes = notes.filter((n) => n.userId === activeUserId)

  return (
    <>
      <Card className='shadow-xs'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between gap-2'>
            <div>
              <CardTitle className='text-sm font-semibold text-foreground'>
                Recent Notes ({userNotes.length})
              </CardTitle>
              <p className='text-xs text-muted-foreground mt-0.5 truncate'>
                Quick workspace notes
              </p>
            </div>
            <CardAction>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsCreateOpen(true)}
                className='h-7 text-xs gap-1'
              >
                <Plus className='size-3.5' />
                New Note
              </Button>
            </CardAction>
          </div>
        </CardHeader>

        <CardContent className='flex flex-col gap-2.5 pt-0'>
          {userNotes.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg bg-muted/20'>
              <FileText className='size-8 text-muted-foreground/60 mb-2' />
              <p className='text-xs font-medium text-foreground'>No notes saved yet</p>
              <p className='text-[11px] text-muted-foreground mt-0.5 mb-3'>
                Write your first note to keep track of tasks & freight strategy.
              </p>
              <Button size='sm' variant='outline' onClick={() => setIsCreateOpen(true)} className='h-7 text-xs'>
                <Plus className='size-3 mr-1' /> Create Note
              </Button>
            </div>
          ) : (
            userNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className='group flex items-start gap-2.5 p-2.5 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors cursor-pointer'
              >
                <FileText className='size-4 text-muted-foreground shrink-0 mt-0.5' />
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center justify-between gap-1.5'>
                    <span className='truncate font-medium text-xs text-foreground leading-tight'>
                      {note.title}
                    </span>
                    <Badge variant='outline' className='text-[9px] px-1.5 py-0 font-normal shrink-0'>
                      {note.category}
                    </Badge>
                  </div>
                  <p className='text-[11px] text-muted-foreground line-clamp-1 mt-1'>
                    {note.content || 'No content...'}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Create Note Modal */}
      <CreateNoteDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {/* Note Detail Modal */}
      {selectedNote && (
        <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
          <DialogContent className='sm:max-w-2xl'>
            <DialogHeader>
              <div className='flex items-center justify-between gap-2 pr-6'>
                <Badge variant='outline' className='text-xs font-normal'>
                  <Tag className='size-3 mr-1 text-muted-foreground' />
                  {selectedNote.category}
                </Badge>
                <span className='text-xs text-muted-foreground flex items-center gap-1'>
                  <Calendar className='size-3' />
                  {formatNoteDate(selectedNote.createdAt)}
                </span>
              </div>
              <DialogTitle className='text-base font-semibold mt-2 text-foreground'>
                {selectedNote.title}
              </DialogTitle>
            </DialogHeader>

            <div className='py-4 border-y border-border/60 my-2 min-h-[140px] text-xs text-foreground whitespace-pre-wrap leading-relaxed bg-muted/20 p-4 rounded-md'>
              {selectedNote.content || 'No details written for this note.'}
            </div>

            <DialogFooter className='flex items-center justify-between gap-2 sm:justify-between'>
              <Button
                variant='ghost'
                size='sm'
                className='text-xs text-destructive hover:text-destructive'
                onClick={() => {
                  deleteNote(selectedNote.id)
                  setSelectedNote(null)
                  toast.success('Note deleted')
                }}
              >
                <Trash2 className='size-3.5 mr-1' /> Delete Note
              </Button>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    togglePinNote(selectedNote.id)
                    setSelectedNote({ ...selectedNote, isPinned: !selectedNote.isPinned })
                    toast.success(selectedNote.isPinned ? 'Unpinned note' : 'Pinned note')
                  }}
                  className='text-xs gap-1'
                >
                  <Pin className='size-3' />
                  {selectedNote.isPinned ? 'Unpin' : 'Pin Note'}
                </Button>
                <Button size='sm' onClick={() => setSelectedNote(null)}>
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
