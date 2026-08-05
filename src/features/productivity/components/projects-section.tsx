import { useState } from 'react'
import { Orbit, Globe, ClipboardCheck, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useProductivityStore } from '@/stores/productivity-store'
import { CreateProjectDialog } from './create-project-dialog'

const ICON_MAP: Record<string, any> = {
  Orbit,
  Globe,
  ClipboardCheck,
}

export function ProjectsSection() {
  const { activeUserId, users, projects, deleteProject } = useProductivityStore()
  const activeUser = users.find((u) => u.id === activeUserId) || users[0]

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'planning' | 'completed'>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Filter projects for active user
  const userProjects = projects.filter((p) => {
    if (p.userId !== activeUserId) return false
    if (statusFilter === 'active') return p.status === 'In Progress'
    if (statusFilter === 'planning') return p.status === 'Planning'
    if (statusFilter === 'completed') return p.status === 'Completed'
    return true
  })

  return (
    <>
      <section className='flex flex-col gap-3.5'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <h2 className='text-xl tracking-tight font-semibold text-foreground flex items-center gap-2'>
              Projects
              <span className='text-xs font-normal text-muted-foreground'>
                ({userProjects.length} active)
              </span>
            </h2>
            <p className='text-xs text-muted-foreground'>
              Your strategic initiatives & progress
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Select
              value={statusFilter}
              onValueChange={(val: any) => setStatusFilter(val)}
            >
              <SelectTrigger className='w-28 h-8 text-xs'>
                <SelectValue placeholder='All' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='active'>In Progress</SelectItem>
                  <SelectItem value='planning'>Planning</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button variant='outline' size='sm' onClick={() => setIsCreateOpen(true)} className='h-8 text-xs gap-1.5'>
              <Plus className='size-3.5' />
              New Project
            </Button>
          </div>
        </div>

        {userProjects.length === 0 ? (
          <div className='flex flex-col items-center justify-center p-8 text-center rounded-xl border bg-background shadow-xs'>
            <Orbit className='size-8 text-muted-foreground/60 mb-2' />
            <p className='text-xs font-medium text-foreground'>No projects found</p>
            <p className='text-[11px] text-muted-foreground mt-0.5 mb-3'>
              Start a new initiative to drive freight & productivity goals.
            </p>
            <Button size='sm' variant='outline' onClick={() => setIsCreateOpen(true)} className='h-7 text-xs'>
              <Plus className='size-3 mr-1' /> Create Project
            </Button>
          </div>
        ) : (
          <div className='grid gap-4 md:grid-cols-3'>
            {userProjects.map((project) => {
              const IconComp = ICON_MAP[project.iconName || 'Orbit'] || Orbit
              return (
                <Card key={project.id} className='shadow-xs relative group flex flex-col justify-between py-0 gap-0'>
                  <CardHeader className='p-4 pb-2'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex items-center gap-2 min-w-0 text-foreground'>
                        <IconComp className='size-4 text-muted-foreground shrink-0' />
                        <span className='truncate text-sm font-semibold' title={project.title}>
                          {project.title}
                        </span>
                      </div>
                      <Badge variant='outline' className='text-[10px] font-normal shrink-0'>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className='px-4 pb-3 flex-1 flex flex-col justify-between'>
                    <div className='flex flex-col gap-3'>
                      <div className='text-xs leading-relaxed text-muted-foreground line-clamp-2 min-h-[32px]'>
                        {project.description}
                      </div>
                      <div className='flex items-center gap-3'>
                        <Progress value={project.progress} className='h-2 flex-1' />
                        <span className='shrink-0 text-xs font-semibold text-foreground'>
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className='px-4 py-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground'>
                    <span>Due {project.dueDate}</span>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        deleteProject(project.id)
                        toast.success('Project deleted')
                      }}
                      className='h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <Trash2 className='size-3.5' />
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <CreateProjectDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  )
}
