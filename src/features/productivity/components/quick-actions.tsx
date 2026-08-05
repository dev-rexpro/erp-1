import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Bell, CheckSquare, FileText, Orbit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateNoteDialog } from './create-note-dialog'
import { CreateTaskDialog } from './create-task-dialog'
import { CreateProjectDialog } from './create-project-dialog'

export function QuickActions() {
  const [noteOpen, setNoteOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)

  return (
    <>
      <section className='flex flex-col gap-2'>
        <h2 className='text-xl tracking-tight font-semibold text-foreground'>Quick Actions</h2>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          <Button
            variant='outline'
            className='justify-start h-10 text-xs font-medium gap-2 hover:bg-muted/50'
            onClick={() => setNoteOpen(true)}
          >
            <FileText className='size-4 text-primary' />
            New Note
          </Button>

          <Button
            variant='outline'
            className='justify-start h-10 text-xs font-medium gap-2 hover:bg-muted/50'
            onClick={() => setTaskOpen(true)}
          >
            <CheckSquare className='size-4 text-primary' />
            New Task
          </Button>

          <Button
            variant='outline'
            className='justify-start h-10 text-xs font-medium gap-2 hover:bg-muted/50'
            onClick={() => setProjectOpen(true)}
          >
            <Orbit className='size-4 text-primary' />
            New Project
          </Button>

          <Button
            variant='outline'
            className='justify-start h-10 text-xs font-medium gap-2 hover:bg-muted/50'
            asChild
          >
            <Link to='/notifications'>
              <Bell className='size-4 text-primary' />
              <span>Your News</span>
            </Link>
          </Button>
        </div>
      </section>

      <CreateNoteDialog open={noteOpen} onOpenChange={setNoteOpen} />
      <CreateTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
      <CreateProjectDialog open={projectOpen} onOpenChange={setProjectOpen} />
    </>
  )
}
