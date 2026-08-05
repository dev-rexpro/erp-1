import { Star, Download, Share2, MoreVertical, Eye, Lock, Globe, Shield } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useDocumentHub } from './document-hub-provider'
import { getFileIcon } from './document-grid-view'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function DocumentTableView() {
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

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 text-xs">
            <TableHead className="w-10 text-center"></TableHead>
            <TableHead className="min-w-[280px]">Name & Document Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Access Level</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Edited By</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocs.map((doc) => {
            const { icon: Icon, color } = getFileIcon(doc.fileType)

            return (
              <TableRow
                key={doc.id}
                className="group cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => {
                  setSelectedDocument(doc)
                  setDetailSheetOpen(true)
                }}
              >
                {/* Star Button */}
                <TableCell className="text-center p-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-amber-500 rounded-md"
                    onClick={() => toggleStar(doc.id)}
                  >
                    <Star className={cn('size-4', doc.isStarred && 'fill-amber-400 text-amber-400')} />
                  </Button>
                </TableCell>

                {/* Name & Title */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg border shrink-0', color)}>
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs leading-none group-hover:text-primary transition-colors truncate">
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate mt-1">{doc.fileName}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Department */}
                <TableCell>
                  <Badge variant="outline" className="text-[11px] font-normal">
                    {doc.department}
                  </Badge>
                </TableCell>

                {/* Access Level */}
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {doc.accessLevel === 'Public (All Depts)' ? (
                      <Globe className="size-3.5 text-emerald-500" />
                    ) : doc.accessLevel === 'Confidential' ? (
                      <Lock className="size-3.5 text-destructive" />
                    ) : (
                      <Shield className="size-3.5 text-blue-500" />
                    )}
                    <span>{doc.accessLevel}</span>
                  </div>
                </TableCell>

                {/* Version */}
                <TableCell className="text-xs">{doc.version}</TableCell>

                {/* Size */}
                <TableCell className="text-xs text-muted-foreground">{doc.fileSize}</TableCell>

                {/* Created By */}
                <TableCell className="text-xs">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{doc.createdBy || doc.uploadedBy.name}</span>
                    <span className="text-[10px] text-muted-foreground">{doc.uploadedBy.role}</span>
                  </div>
                </TableCell>

                {/* Edited By */}
                <TableCell className="text-xs">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{doc.editedBy || doc.uploadedBy.name}</span>
                    <span className="text-[10px] text-muted-foreground">{doc.updatedAt}</span>
                  </div>
                </TableCell>

                {/* Last Updated */}
                <TableCell className="text-xs text-muted-foreground">{doc.updatedAt}</TableCell>

                {/* Actions */}
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
