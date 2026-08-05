import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { useProductivityStore, type ProductivityProject } from '@/stores/productivity-store'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ProjectStatus = ProductivityProject['status']

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { activeUserId, users, addProject } = useProductivityStore()
  const activeUser = users.find((u) => u.id === activeUserId) || users[0]

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('In Progress')
  const [progress, setProgress] = useState(25)
  const [dueDate, setDueDate] = useState('Aug 30')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Project title is required')
      return
    }

    addProject({
      userId: activeUserId,
      title: title.trim(),
      description: description.trim() || 'No description provided.',
      status,
      progress: Number(progress) || 0,
      dueDate: dueDate.trim() || 'TBD',
      iconName: 'Orbit',
    })

    toast.success(`Project created for ${activeUser.name}`)
    setTitle('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold'>Create New Project</DialogTitle>
          <p className='text-xs text-muted-foreground'>
            Add a new strategic project initiative.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4 py-2'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='proj-title' className='text-xs font-medium'>
              Project Title
            </Label>
            <Input
              id='proj-title'
              placeholder='e.g. Export Freight Automation Engine'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='h-9 text-xs'
              autoFocus
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='proj-desc' className='text-xs font-medium'>
              Description / Objective
            </Label>
            <Textarea
              id='proj-desc'
              placeholder='Brief summary of the project goals...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className='text-xs resize-none'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='proj-status' className='text-xs font-medium'>
                Status
              </Label>
              <Select value={status} onValueChange={(val: ProjectStatus) => setStatus(val)}>
                <SelectTrigger id='proj-status' className='h-9 text-xs'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='In Progress'>In Progress</SelectItem>
                  <SelectItem value='Planning'>Planning</SelectItem>
                  <SelectItem value='Completed'>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='proj-due' className='text-xs font-medium'>
                Due Date
              </Label>
              <Input
                id='proj-due'
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder='e.g. Aug 30'
                className='h-9 text-xs'
              />
            </div>
          </div>

          <div className='flex flex-col gap-2.5 pt-1'>
            <div className='flex justify-between items-center text-xs font-medium'>
              <Label htmlFor='proj-progress'>Initial Progress</Label>
              <span className='font-semibold'>{progress}%</span>
            </div>
            <Slider
              id='proj-progress'
              value={[progress]}
              onValueChange={(vals) => setProgress(vals[0])}
              min={0}
              max={100}
              step={1}
              className='py-1'
            />
          </div>

          <DialogFooter className='pt-2'>
            <Button type='button' variant='outline' size='sm' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' size='sm'>
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
