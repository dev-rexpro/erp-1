import React, { useState } from 'react'
import type { ResourceSchema } from '@/lib/resource-schema'
import { useResourceData } from '@/lib/resource-store'
import { StandardPageLayout, type ViewMode } from '@/components/templates'
import { ResourceListView } from './ResourceListView'
import { ResourceFormView } from './ResourceFormView'
import { ResourceDetailView } from './ResourceDetailView'
import { Button } from '@/components/ui/button'
import { Plus, RotateCw, Download, Upload, List, FileText, Kanban, ChevronsUpDown, Check, MoreHorizontal, Lock } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useRbacStore } from '@/stores/rbac-store'

interface ResourcePageProps {
  schema: ResourceSchema
}

export const ResourcePage: React.FC<ResourcePageProps> = ({ schema }) => {
  const [activeView, setActiveView] = useState<'list' | 'view' | 'edit' | 'new'>('list')
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'report'>('table')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const data = useResourceData(schema.name)
  const { canAccessModule, getActiveRole } = useRbacStore()

  const canWrite = canAccessModule(schema.module || schema.name, 'write')
  const activeRole = getActiveRole()

  const handleSelectRecord = (id: string, mode: 'view' | 'edit' = 'view') => {
    if (mode === 'edit' && !canWrite) {
      toast.error(`Akses Ditolak: Peran ${activeRole?.name || 'User'} tidak memiliki izin Edit.`)
      setSelectedId(id)
      setActiveView('view')
      return
    }
    setSelectedId(id)
    setActiveView(mode)
  }

  const handleCreateNew = () => {
    if (!canWrite) {
      toast.error(`Akses Ditolak: Peran ${activeRole?.name || 'User'} hanya memiliki akses Baca (Read-Only) untuk ${schema.label}.`)
      return
    }
    setSelectedId('new')
    setActiveView('new')
  }

  const handleBackToList = () => {
    setActiveView('list')
    setSelectedId(null)
  }

  const handleRefresh = () => {
    if (refreshing) return
    setRefreshing(true)
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 600)).then(() => setRefreshing(false)),
      {
        loading: `Refreshing ${schema.pluralLabel.toLowerCase()}...`,
        success: `${schema.pluralLabel} updated.`,
        error: 'Failed to refresh.',
      }
    )
  }

  const layoutViewMode = activeView === 'view' ? 'detail' : (viewMode === 'table' ? 'list' : (viewMode as ViewMode))

  const primaryActions = (
    <div className='flex items-center gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='h-8 px-3 gap-1.5 rounded-lg'>
            {viewMode === 'table' && <List size={15} />}
            {viewMode === 'report' && <FileText size={15} />}
            {viewMode === 'kanban' && <Kanban size={15} />}
            <span className='text-xs font-medium'>
              {viewMode === 'table' && 'List View'}
              {viewMode === 'report' && 'Report View'}
              {viewMode === 'kanban' && 'Kanban View'}
            </span>
            <ChevronsUpDown size={12} className='text-muted-foreground ml-0.5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px] rounded-xl'>
          <DropdownMenuItem onClick={() => setViewMode('table')} className='flex items-center gap-2 cursor-pointer'>
            <List size={16} className='text-muted-foreground' />
            <span>List View</span>
            {viewMode === 'table' && <Check size={14} className='ml-auto' />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewMode('report')} className='flex items-center gap-2 cursor-pointer'>
            <FileText size={16} className='text-muted-foreground' />
            <span>Report View</span>
            {viewMode === 'report' && <Check size={14} className='ml-auto' />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewMode('kanban')} className='flex items-center gap-2 cursor-pointer'>
            <Kanban size={16} className='text-muted-foreground' />
            <span>Kanban View</span>
            {viewMode === 'kanban' && <Check size={14} className='ml-auto' />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant='outline' size='sm' className='h-8 w-8 p-0 rounded-lg' onClick={handleRefresh}>
        <RotateCw size={15} className={refreshing ? 'animate-spin' : ''} />
        <span className='sr-only'>Refresh</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='h-8 w-8 p-0 rounded-lg'>
            <MoreHorizontal size={15} />
            <span className='sr-only'>More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px] rounded-xl'>
          <DropdownMenuItem onClick={() => toast.success('CSV Export initiated.')} className='gap-2 cursor-pointer'>
            <Download size={16} className='text-muted-foreground' />
            <span>Export CSV</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.success('CSV Import initiated.')} className='gap-2 cursor-pointer'>
            <Upload size={16} className='text-muted-foreground' />
            <span>Import CSV</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        onClick={handleCreateNew}
        size='sm'
        disabled={!canWrite}
        title={!canWrite ? `Akses Read-Only (${activeRole?.name})` : `Add ${schema.label}`}
        className={`h-8 px-3 gap-1.5 font-semibold shadow-xs rounded-lg transition-colors ${
          canWrite
            ? 'bg-black hover:bg-black/90 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black'
            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
        }`}
      >
        {canWrite ? <Plus size={15} /> : <Lock size={14} />}
        <span className='text-xs'>Add {schema.label}</span>
      </Button>
    </div>
  )

  if (activeView === 'new' || activeView === 'edit') {
    return (
      <StandardPageLayout
        title={`${activeView === 'new' ? 'Add New' : 'Edit'} ${schema.label}`}
        description={`Fill in the information to ${activeView === 'new' ? 'create' : 'update'} ${schema.label.toLowerCase()} details.`}
        viewMode='list'
        selectedItemId={null}
      >
        <ResourceFormView
          schema={schema}
          recordId={selectedId}
          onBack={handleBackToList}
          onSaveSuccess={(record) => {
            setSelectedId(record.id)
            setActiveView('view')
          }}
        />
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout
      title={schema.pluralLabel}
      description={schema.description || `Manage your ${schema.pluralLabel.toLowerCase()} here.`}
      viewMode={layoutViewMode}
      selectedItemId={activeView === 'view' ? selectedId : null}
      primaryActions={primaryActions}
      renderTable={() => (
        <ResourceListView
          schema={schema}
          data={data}
          viewMode={viewMode}
          setViewMode={setViewMode}
          hideTopHeader
          onSelectRecord={handleSelectRecord}
          onCreateNew={handleCreateNew}
        />
      )}
      renderKanban={() => (
        <ResourceListView
          schema={schema}
          data={data}
          viewMode='kanban'
          setViewMode={setViewMode}
          hideTopHeader
          onSelectRecord={handleSelectRecord}
          onCreateNew={handleCreateNew}
        />
      )}
      renderReport={() => (
        <ResourceListView
          schema={schema}
          data={data}
          viewMode='report'
          setViewMode={setViewMode}
          hideTopHeader
          onSelectRecord={handleSelectRecord}
          onCreateNew={handleCreateNew}
        />
      )}
      renderDetail={() => (
        <ResourceDetailView
          schema={schema}
          recordId={selectedId!}
          onBack={handleBackToList}
          onEdit={() => setActiveView('edit')}
          onDeleteSuccess={handleBackToList}
        />
      )}
    />
  )
}
