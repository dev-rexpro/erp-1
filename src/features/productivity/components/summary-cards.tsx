import { Clock3, TrendingUp, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProductivityStore } from '@/stores/productivity-store'

export function SummaryCards() {
  const { activeUserId, tasks, projects, notes } = useProductivityStore()

  // Calculate stats for active user
  const userTodayTasks = tasks.filter((t) => t.userId === activeUserId && t.dateBucket === 'today')
  const completedTodayTasks = userTodayTasks.filter((t) => t.checked).length

  const userProjects = projects.filter((p) => p.userId === activeUserId)
  const avgProjectProgress =
    userProjects.length > 0
      ? Math.round(userProjects.reduce((acc, p) => acc + p.progress, 0) / userProjects.length)
      : 0

  const userNotes = notes.filter((n) => n.userId === activeUserId)

  const cards = [
    {
      title: 'Today Tasks',
      value: `${completedTodayTasks} / ${userTodayTasks.length}`,
      description: `${userTodayTasks.length - completedTodayTasks} pending for today`,
      icon: Clock3,
    },
    {
      title: 'Project Completion',
      value: `${avgProjectProgress}%`,
      description: `${userProjects.length} active initiatives`,
      icon: TrendingUp,
    },
    {
      title: 'My Notes',
      value: `${userNotes.length}`,
      description: `${userNotes.filter((n) => n.isPinned).length} pinned notes`,
      icon: FileText,
    },
  ]

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {cards.map((item) => (
        <Card key={item.title} className='shadow-xs'>
          <CardHeader className='pb-2'>
            <CardTitle>
              <div className='flex items-center gap-2 text-muted-foreground text-xs font-medium'>
                <div className='grid size-7 place-items-center rounded-lg border bg-muted shrink-0'>
                  <item.icon className='size-3.5 text-foreground' />
                </div>
                {item.title}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='flex flex-col gap-1'>
              <div className='text-2xl font-bold leading-none tracking-tight text-foreground'>
                {item.value}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>{item.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
