import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useProductivityStore, type ProductivityNote } from '@/stores/productivity-store'

interface CreateNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type NoteCategory = ProductivityNote['category']

export function CreateNoteDialog({ open, onOpenChange }: CreateNoteDialogProps) {
  const { activeUserId, users, addNote } = useProductivityStore()
  const activeUser = users.find((u) => u.id === activeUserId) || users[0]

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<NoteCategory>('Work')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Note title is required')
      return
    }

    addNote({
      userId: activeUserId,
      title: title.trim(),
      content: content.trim(),
      category,
      isPinned: false,
    })

    toast.success(`Note saved for ${activeUser.name}`)
    setTitle('')
    setContent('')
    setCategory('Work')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold'>Create New Note</DialogTitle>
          <p className='text-xs text-muted-foreground'>
            Note will be saved to your productivity workspace store.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4 py-2'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='note-title' className='text-xs font-medium'>
              Title
            </Label>
            <Input
              id='note-title'
              placeholder='e.g. Tg. Priok Freight Rate Review'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='h-9 text-xs'
              autoFocus
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='note-category' className='text-xs font-medium'>
              Category
            </Label>
            <Select value={category} onValueChange={(val: NoteCategory) => setCategory(val)}>
              <SelectTrigger id='note-category' className='h-9 text-xs'>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Work'>Work</SelectItem>
                <SelectItem value='Export/Import'>Export / Import</SelectItem>
                <SelectItem value='Meeting'>Meeting</SelectItem>
                <SelectItem value='Ideas'>Ideas & Strategy</SelectItem>
                <SelectItem value='Personal'>Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='note-content' className='text-xs font-medium'>
              Content / Details
            </Label>
            <Textarea
              id='note-content'
              placeholder='Write your note details here...'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className='text-xs resize-none'
            />
          </div>

          <DialogFooter className='pt-2'>
            <Button type='button' variant='outline' size='sm' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' size='sm'>
              Save Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
