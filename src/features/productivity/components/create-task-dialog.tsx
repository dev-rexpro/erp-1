import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useProductivityStore, type ProductivityTask } from '@/stores/productivity-store'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type TaskTag = ProductivityTask['tag']
type DateBucket = ProductivityTask['dateBucket']
type Priority = 'Low' | 'Medium' | 'High'

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const { activeUserId, users, addTask } = useProductivityStore()
  const activeUser = users.find((u) => u.id === activeUserId) || users[0]

  const [title, setTitle] = useState('')
  const [tag, setTag] = useState<TaskTag>('Work')
  const [time, setTime] = useState('10:00 AM')
  const [dateBucket, setDateBucket] = useState<DateBucket>('today')
  const [priority, setPriority] = useState<Priority>('Medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Task title is required')
      return
    }

    addTask({
      userId: activeUserId,
      title: title.trim(),
      tag,
      time,
      dateBucket,
      checked: false,
      priority,
    })

    toast.success(`Task created for ${activeUser.name}`)
    setTitle('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold'>Create New Task</DialogTitle>
          <p className='text-xs text-muted-foreground'>
            Task will be added to your daily action list.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4 py-2'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='task-title' className='text-xs font-medium'>
              Task Name
            </Label>
            <Input
              id='task-title'
              placeholder='e.g. Confirm container allocation with Maersk'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='h-9 text-xs'
              autoFocus
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='task-tag' className='text-xs font-medium'>
                Category / Tag
              </Label>
              <Select value={tag} onValueChange={(val: TaskTag) => setTag(val)}>
                <SelectTrigger id='task-tag' className='h-9 text-xs'>
                  <SelectValue placeholder='Tag' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Work'>Work</SelectItem>
                  <SelectItem value='Freight'>Freight</SelectItem>
                  <SelectItem value='Customs'>Customs</SelectItem>
                  <SelectItem value='Admin'>Admin</SelectItem>
                  <SelectItem value='Planning'>Planning</SelectItem>
                  <SelectItem value='Design'>Design</SelectItem>
                  <SelectItem value='Content'>Content</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='task-bucket' className='text-xs font-medium'>
                Due Frame
              </Label>
              <Select value={dateBucket} onValueChange={(val: DateBucket) => setDateBucket(val)}>
                <SelectTrigger id='task-bucket' className='h-9 text-xs'>
                  <SelectValue placeholder='Timeframe' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='today'>Today</SelectItem>
                  <SelectItem value='tomorrow'>Tomorrow</SelectItem>
                  <SelectItem value='this-week'>This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='task-time' className='text-xs font-medium'>
                Time
              </Label>
              <Input
                id='task-time'
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder='e.g. 11:30 AM'
                className='h-9 text-xs'
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='task-priority' className='text-xs font-medium'>
                Priority
              </Label>
              <Select value={priority} onValueChange={(val: Priority) => setPriority(val)}>
                <SelectTrigger id='task-priority' className='h-9 text-xs'>
                  <SelectValue placeholder='Priority' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Low'>Low</SelectItem>
                  <SelectItem value='Medium'>Medium</SelectItem>
                  <SelectItem value='High'>High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className='pt-2'>
            <Button type='button' variant='outline' size='sm' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' size='sm'>
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
