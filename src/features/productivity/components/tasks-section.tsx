import { useState } from 'react'
import { Calendar1, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useProductivityStore } from '@/stores/productivity-store'
import { CreateTaskDialog } from './create-task-dialog'

export function TasksSection() {
  const { activeUserId, users, tasks, toggleTask, deleteTask } = useProductivityStore()
  const activeUser = users.find((u) => u.id === activeUserId) || users[0]

  const [dateBucketFilter, setDateBucketFilter] = useState<'today' | 'tomorrow' | 'this-week'>('today')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Filter tasks for active user & timeframe
  const userTasks = tasks.filter(
    (t) => t.userId === activeUserId && t.dateBucket === dateBucketFilter
  )

  const completedCount = userTasks.filter((t) => t.checked).length

  return (
    <>
      <section className='flex flex-col gap-2'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <h2 className='text-xl tracking-tight font-semibold text-foreground flex items-center gap-2'>
              Tasks
              <span className='text-xs font-normal text-muted-foreground'>
                ({completedCount}/{userTasks.length} done)
              </span>
            </h2>
            <p className='text-xs text-muted-foreground'>
              Your daily action items & focus list
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Select
              value={dateBucketFilter}
              onValueChange={(val: any) => setDateBucketFilter(val)}
            >
              <SelectTrigger className='w-32 h-8 text-xs'>
                <SelectValue placeholder='Today' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='today'>Today</SelectItem>
                  <SelectItem value='tomorrow'>Tomorrow</SelectItem>
                  <SelectItem value='this-week'>This Week</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button size='sm' onClick={() => setIsCreateOpen(true)} className='h-8 text-xs gap-1.5'>
              <Plus className='size-3.5' />
              New Task
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-xl border bg-background shadow-xs'>
          {userTasks.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-8 text-center'>
              <CheckCircle2 className='size-8 text-muted-foreground/60 mb-2' />
              <p className='text-xs font-medium text-foreground'>No tasks in this timeframe</p>
              <p className='text-[11px] text-muted-foreground mt-0.5 mb-3'>
                Add a new task to organize today&apos;s freight workflow.
              </p>
              <Button size='sm' variant='outline' onClick={() => setIsCreateOpen(true)} className='h-7 text-xs'>
                <Plus className='size-3 mr-1' /> Add Task
              </Button>
            </div>
          ) : (
            <div className='divide-y'>
              {userTasks.map((task) => (
                <div key={task.id} className='group flex items-center gap-3 p-3.5 hover:bg-muted/30 transition-colors'>
                  <Checkbox
                    checked={task.checked}
                    aria-label={task.title}
                    onCheckedChange={() => {
                      toggleTask(task.id)
                      toast.success(task.checked ? 'Task marked incomplete' : 'Task completed!')
                    }}
                  />
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
                      <div className='flex min-w-0 flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-3'>
                        <span
                          className={`truncate text-xs ${
                            task.checked ? 'line-through text-muted-foreground' : 'text-foreground font-medium'
                          }`}
                        >
                          {task.title}
                        </span>
                        <Badge variant='outline' className='px-2 py-0 text-[10px] font-normal w-fit'>
                          {task.tag}
                        </Badge>
                      </div>

                      <div className='flex shrink-0 items-center gap-3 text-muted-foreground text-xs'>
                        <span>{task.time}</span>
                        <Calendar1 className='size-3.5' />
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            deleteTask(task.id)
                            toast.success('Task removed')
                          }}
                          className='h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <Trash2 className='size-3.5' />
                          <span className='sr-only'>Delete Task</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CreateTaskDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  )
}
