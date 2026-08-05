import { FileText, FileSpreadsheet, FileCode, FileArchive, Star, Download, Share2, MoreVertical, Eye } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useDocumentHub } from './document-hub-provider'
import { FileType } from '../data/schema'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function getFileIcon(type: FileType) {
  switch (type) {
    case 'pdf':
      return { icon: FileText, color: 'text-foreground bg-muted border-border' }
    case 'spreadsheet':
      return { icon: FileSpreadsheet, color: 'text-foreground bg-muted border-border' }
    case 'doc':
      return { icon: FileText, color: 'text-foreground bg-muted border-border' }
    case 'archive':
      return { icon: FileArchive, color: 'text-foreground bg-muted border-border' }
    default:
      return { icon: FileCode, color: 'text-foreground bg-muted border-border' }
  }
}

export function DocumentGridView() {
  const { documents, categoryFilter, fileTypeFilter, searchQuery, setSelectedDocument, setDetailSheetOpen, toggleStar } = useDocumentHub()

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      categoryFilter === 'all'
        ? true
        : categoryFilter === 'starred'
        ? doc.isStarred
        : doc.category === categoryFilter

    const matchesFileType = fileTypeFilter === 'all' ? true : doc.fileType === fileTypeFilter

    const matchesSearch =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesFileType && matchesSearch
  })

  if (filteredDocs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl text-center">
        <FileText className="size-10 text-muted-foreground mb-3 opacity-40" />
        <h3 className="font-semibold text-sm">No documents found</h3>
        <p className="text-muted-foreground text-xs mt-1">Try adjusting your category filter or search terms.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredDocs.map((doc) => {
        const { icon: Icon, color } = getFileIcon(doc.fileType)

        return (
          <Card
            key={doc.id}
            className="group relative overflow-hidden border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between py-0 gap-0"
          >
            <CardContent className="p-4 space-y-3">
              {/* Header: File Icon & Action Menu */}
              <div className="flex items-start justify-between gap-2">
                <div className={cn('p-2.5 rounded-xl border shrink-0', color)}>
                  <Icon className="size-5" />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-amber-500 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleStar(doc.id)
                    }}
                  >
                    <Star className={cn('size-4', doc.isStarred && 'fill-amber-400 text-amber-400')} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7 text-muted-foreground rounded-md">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedDocument(doc)
                          setDetailSheetOpen(true)
                        }}
                      >
                        <Eye className="size-4 mr-2" /> Preview Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(`Downloading ${doc.fileName}...`)}>
                        <Download className="size-4 mr-2" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(`Share link copied to clipboard!`)}>
                        <Share2 className="size-4 mr-2" /> Share Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggleStar(doc.id)}>
                        <Star className="size-4 mr-2" /> {doc.isStarred ? 'Unstar' : 'Star Document'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Title & File Info */}
              <div
                className="cursor-pointer space-y-1"
                onClick={() => {
                  setSelectedDocument(doc)
                  setDetailSheetOpen(true)
                }}
              >
                <h4 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {doc.title}
                </h4>
                <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>
              </div>

              {/* Tags & Department Badge */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Badge variant="outline" className="text-[10px] font-normal px-2 py-0">
                  {doc.department}
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0">
                  {doc.version}
                </Badge>
              </div>
            </CardContent>

            {/* Footer Metadata */}
            <CardFooter className="px-4 py-2.5 bg-muted/30 border-t flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{doc.fileSize}</span>
              <span>Updated {doc.updatedAt}</span>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
