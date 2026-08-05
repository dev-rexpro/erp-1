import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderRight } from '@/components/layout/header-right'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, LayoutGrid, List, Search as SearchIcon, Star, Filter, FolderPlus } from 'lucide-react'

import { DocumentHubProvider, useDocumentHub } from './components/document-hub-provider'
import { DocumentStats } from './components/document-stats'
import { DocumentGridView } from './components/document-grid-view'
import { DocumentTableView } from './components/document-table-view'
import { DocumentDetailSheet } from './components/document-detail-sheet'
import { DocumentUploadDialog } from './components/document-upload-dialog'
import { DocumentCategory, FileType } from './data/schema'
import { cn } from '@/lib/utils'

function DocumentHubContent() {
  const {
    viewMode,
    setViewMode,
    categoryFilter,
    setCategoryFilter,
    fileTypeFilter,
    setFileTypeFilter,
    searchQuery,
    setSearchQuery,
    setUploadDialogOpen,
  } = useDocumentHub()

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderRight />
      </Header>

      <Main className="flex flex-1 flex-col gap-5 sm:gap-6">
        {/* Page Title & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Document Hub</h1>
            <p className="text-xs text-muted-foreground">
              Centralized cloud repository for cross-departmental documents (Sales, Operations, Finance).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 gap-1.5 text-xs font-medium"
              onClick={() => setUploadDialogOpen(true)}
            >
              <FolderPlus size={15} />
              <span>New Folder</span>
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 gap-1.5 bg-black hover:bg-black/90 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black font-semibold text-xs shadow-xs transition-colors"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Plus size={15} />
              <span>Upload Document</span>
            </Button>
          </div>
        </div>

        {/* Category Stats Overview */}
        <DocumentStats />

        {/* Filter Toolbar & View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Department Category Tabs */}
          <Tabs
            value={categoryFilter}
            onValueChange={(val) => setCategoryFilter(val as DocumentCategory | 'all')}
            className="w-full md:w-auto max-w-full overflow-hidden"
          >
            <TabsList className="h-9 w-full md:w-auto justify-start border overflow-x-auto max-w-full flex-nowrap shrink-0 scrollbar-none">
              <TabsTrigger value="all" className="text-xs px-3 shrink-0 whitespace-nowrap">
                All Files
              </TabsTrigger>
              <TabsTrigger value="sales" className="text-xs px-3 shrink-0 whitespace-nowrap">
                Sales & Marketing
              </TabsTrigger>
              <TabsTrigger value="logistics" className="text-xs px-3 shrink-0 whitespace-nowrap">
                Logistics & Ops
              </TabsTrigger>
              <TabsTrigger value="finance" className="text-xs px-3 shrink-0 whitespace-nowrap">
                Finance & Tax
              </TabsTrigger>
              <TabsTrigger value="starred" className="text-xs px-3 gap-1 shrink-0 whitespace-nowrap">
                <Star className="size-3 text-amber-400 fill-amber-400" /> Starred
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search, File Type Filter, and Grid/Table Switcher */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-60">
              <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documents or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            {/* File Type Dropdown Filter */}
            <Select
              value={fileTypeFilter}
              onValueChange={(val) => setFileTypeFilter(val as FileType | 'all')}
            >
              <SelectTrigger className="w-32 h-9 text-xs">
                <Filter className="size-3 mr-1 text-muted-foreground" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF Documents</SelectItem>
                <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
                <SelectItem value="doc">Word Files</SelectItem>
                <SelectItem value="archive">Archives (ZIP)</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Switcher: Grid vs Table */}
            <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon-sm"
                className={cn('size-8 rounded-md', viewMode === 'grid' && 'shadow-xs')}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon-sm"
                className={cn('size-8 rounded-md', viewMode === 'table' && 'shadow-xs')}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Document Content View (Grid or Table) */}
        <div className="flex-1 min-h-0 pt-1">
          {viewMode === 'grid' ? <DocumentGridView /> : <DocumentTableView />}
        </div>

        {/* Dialogs & Sheets */}
        <DocumentDetailSheet />
        <DocumentUploadDialog />
      </Main>
    </>
  )
}

export function DocumentHub() {
  return (
    <DocumentHubProvider>
      <DocumentHubContent />
    </DocumentHubProvider>
  )
}
