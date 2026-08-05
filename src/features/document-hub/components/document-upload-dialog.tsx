import { useState } from 'react'
import { UploadCloud, File, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDocumentHub } from './document-hub-provider'
import { DocumentDepartment, FileType } from '../data/schema'
import { toast } from 'sonner'

export function DocumentUploadDialog() {
  const { uploadDialogOpen, setUploadDialogOpen, addDocument } = useDocumentHub()

  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState<DocumentDepartment>('Sales & Marketing')
  const [accessLevel, setAccessLevel] = useState<'Public (All Depts)' | 'Department Only' | 'Confidential'>('Public (All Depts)')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      if (!title) {
        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title) {
      toast.error('Please enter a document title.')
      return
    }

    const fileExt = selectedFile ? selectedFile.name.split('.').pop()?.toLowerCase() : 'pdf'
    let fileType: FileType = 'pdf'
    if (fileExt?.includes('xls') || fileExt?.includes('csv')) fileType = 'spreadsheet'
    if (fileExt?.includes('doc')) fileType = 'doc'
    if (fileExt?.includes('zip') || fileExt?.includes('rar')) fileType = 'archive'

    const catMap: Record<DocumentDepartment, 'sales' | 'logistics' | 'finance' | 'shared'> = {
      'Sales & Marketing': 'sales',
      'Logistics & Operation': 'logistics',
      'Finance & Accounting': 'finance',
      'Executive & Legal': 'shared',
    }

    addDocument({
      id: `DOC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title,
      fileName: selectedFile ? selectedFile.name : `${title.toLowerCase().replace(/\s+/g, '_')}.${fileExt}`,
      department,
      category: catMap[department],
      fileType,
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '3.2 MB',
      version: 'v1.0',
      uploadedBy: {
        name: 'Fadhlur Rahman',
        email: 'fdrahman@rexcorp.id',
        role: 'Current User',
      },
      updatedAt: new Date().toISOString().split('T')[0],
      isStarred: false,
      accessLevel,
      downloadsCount: 0,
      tags: tags ? tags.split(',').map((t) => t.trim()) : ['General'],
      description: description || 'Uploaded via Document Hub.',
    })

    toast.success(`Document "${title}" uploaded successfully!`)
    setUploadDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setTags('')
    setSelectedFile(null)
  }

  return (
    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Upload New Document</DialogTitle>
          <DialogDescription className="text-xs">
            Upload files to share with Sales, Logistics, or Finance departments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* File Upload Zone */}
          <div className="border-2 border-dashed rounded-xl p-4 text-center hover:bg-muted/30 transition-colors relative cursor-pointer">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
              <UploadCloud className="size-8 text-primary" />
              {selectedFile ? (
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <File className="size-4" />
                  <span>{selectedFile.name}</span>
                </div>
              ) : (
                <>
                  <p className="font-medium text-xs">Click or drag file here to upload</p>
                  <p className="text-[11px] text-muted-foreground">PDF, XLSX, DOCX, ZIP up to 50MB</p>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Document Title</Label>
            <Input
              placeholder="e.g. Q3 Freight Rate Schedule"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8.5 text-xs"
            />
          </div>

          {/* Department & Access Level */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Target Department</Label>
              <Select value={department} onValueChange={(val) => setDepartment(val as DocumentDepartment)}>
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales & Marketing">Sales & Marketing</SelectItem>
                  <SelectItem value="Logistics & Operation">Logistics & Operation</SelectItem>
                  <SelectItem value="Finance & Accounting">Finance & Accounting</SelectItem>
                  <SelectItem value="Executive & Legal">Executive & Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Access Permission</Label>
              <Select value={accessLevel} onValueChange={(val) => setAccessLevel(val as typeof accessLevel)}>
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public (All Depts)">Public (All Depts)</SelectItem>
                  <SelectItem value="Department Only">Department Only</SelectItem>
                  <SelectItem value="Confidential">Confidential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description / Notes</Label>
            <Textarea
              placeholder="Add brief details about this document..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs min-h-16"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Tags (comma separated)</Label>
            <Input
              placeholder="Tariff, Q3, Tariff Schedule"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="h-8.5 text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <Check className="size-4" /> Upload Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
