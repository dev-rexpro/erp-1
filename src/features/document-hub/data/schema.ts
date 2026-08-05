export type DocumentCategory = 'sales' | 'logistics' | 'finance' | 'shared' | 'starred'

export type DocumentDepartment = 
  | 'Sales & Marketing'
  | 'Logistics & Operation'
  | 'Finance & Accounting'
  | 'Executive & Legal'

export type FileType = 'pdf' | 'spreadsheet' | 'doc' | 'image' | 'archive'

export interface DocumentItem {
  id: string
  title: string
  fileName: string
  department: DocumentDepartment
  category: DocumentCategory
  fileType: FileType
  fileSize: string
  version: string
  uploadedBy: {
    name: string
    email: string
    avatar?: string
    role: string
  }
  createdBy?: string
  editedBy?: string
  updatedAt: string
  isStarred: boolean
  accessLevel: 'Public (All Depts)' | 'Department Only' | 'Confidential'
  downloadsCount: number
  tags: string[]
  description: string
  downloadUrl?: string
}
