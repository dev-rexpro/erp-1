import { Download, Share2, Star, Shield, Tag } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useDocumentHub } from './document-hub-provider'
import { getFileIcon } from './document-grid-view'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'

export function DocumentDetailSheet() {
  const { selectedDocument, detailSheetOpen, setDetailSheetOpen, toggleStar } = useDocumentHub()

  if (!selectedDocument) return null

  const { icon: Icon, color } = getFileIcon(selectedDocument.fileType)

  return (
    <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
      <SheetContent className="w-full sm:max-w-md p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <SheetHeader className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${color}`}>
                <Icon className="size-6" />
              </div>
              <div>
                <Badge variant="outline" className="text-xs">
                  {selectedDocument.department}
                </Badge>
                <SheetTitle className="text-base font-semibold mt-1 leading-snug">
                  {selectedDocument.title}
                </SheetTitle>
              </div>
            </div>
            <SheetDescription className="text-xs text-muted-foreground pt-1">
              {selectedDocument.description}
            </SheetDescription>
          </SheetHeader>

          <Separator />

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              className="flex-1 gap-2"
              onClick={() => toast.success(`Downloading ${selectedDocument.fileName}...`)}
            >
              <Download className="size-4" /> Download File
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => toast.success(`Share link copied!`)}
              title="Copy share link"
            >
              <Share2 className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => toggleStar(selectedDocument.id)}
              title={selectedDocument.isStarred ? 'Unstar' : 'Star Document'}
            >
              <Star className={`size-4 ${selectedDocument.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            </Button>
          </div>

          <Separator />

          {/* File Metadata List */}
          <div className="space-y-4 text-xs">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Document Details</h4>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 border rounded-xl p-4 bg-muted/20">
              <div>
                <span className="text-muted-foreground block text-[11px]">File Name</span>
                <span className="font-medium truncate block">{selectedDocument.fileName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">File Size</span>
                <span className="font-medium">{selectedDocument.fileSize}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Version</span>
                <span className="font-medium">{selectedDocument.version}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Total Downloads</span>
                <span className="font-medium">{selectedDocument.downloadsCount} times</span>
              </div>
            </div>

            {/* Access & Permission */}
            <div className="flex items-center justify-between border rounded-xl p-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                <span>Access Level</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {selectedDocument.accessLevel}
              </Badge>
            </div>

            {/* Uploaded By User */}
            <div className="border rounded-xl p-3 bg-muted/20 space-y-2">
              <span className="text-muted-foreground text-[11px] block">Uploaded By</span>
              <div className="flex items-center gap-2.5">
                <Avatar className="size-7">
                  <AvatarFallback className="text-[10px]">{getInitials(selectedDocument.uploadedBy.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium leading-none">{selectedDocument.uploadedBy.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{selectedDocument.uploadedBy.role}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                <Tag className="size-3" /> Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDocument.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] font-normal">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-[11px] text-muted-foreground">Document ID: {selectedDocument.id}</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
