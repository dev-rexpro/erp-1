import React, { createContext, useContext, useState, useEffect } from 'react'
import { DocumentItem, DocumentCategory, FileType } from '../data/schema'
import { useDbStore } from '@/stores/db-store'

interface DocumentHubContextType {
  documents: DocumentItem[]
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>
  viewMode: 'grid' | 'table'
  setViewMode: (mode: 'grid' | 'table') => void
  categoryFilter: DocumentCategory | 'all'
  setCategoryFilter: (category: DocumentCategory | 'all') => void
  fileTypeFilter: FileType | 'all'
  setFileTypeFilter: (type: FileType | 'all') => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedDocument: DocumentItem | null
  setSelectedDocument: (doc: DocumentItem | null) => void
  uploadDialogOpen: boolean
  setUploadDialogOpen: (open: boolean) => void
  detailSheetOpen: boolean
  setDetailSheetOpen: (open: boolean) => void
  toggleStar: (id: string) => void
  addDocument: (doc: DocumentItem) => void
}

const DocumentHubContext = createContext<DocumentHubContextType | undefined>(undefined)

export function DocumentHubProvider({ children }: { children: React.ReactNode }) {
  const storeDocuments = useDbStore((state) => state.documents)
  const setStoreDocuments = useDbStore((state) => state.setDocuments)
  const [documents, setDocuments] = useState<DocumentItem[]>(storeDocuments)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all')
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)

  useEffect(() => {
    setDocuments(storeDocuments)
  }, [storeDocuments])

  const toggleStar = (id: string) => {
    const updated = documents.map((doc) => (doc.id === id ? { ...doc, isStarred: !doc.isStarred } : doc))
    setDocuments(updated)
    setStoreDocuments(updated)
  }

  const addDocument = (newDoc: DocumentItem) => {
    const updated = [newDoc, ...documents]
    setDocuments(updated)
    setStoreDocuments(updated)
  }

  return (
    <DocumentHubContext.Provider
      value={{
        documents,
        setDocuments,
        viewMode,
        setViewMode,
        categoryFilter,
        setCategoryFilter,
        fileTypeFilter,
        setFileTypeFilter,
        searchQuery,
        setSearchQuery,
        selectedDocument,
        setSelectedDocument,
        uploadDialogOpen,
        setUploadDialogOpen,
        detailSheetOpen,
        setDetailSheetOpen,
        toggleStar,
        addDocument,
      }}
    >
      {children}
    </DocumentHubContext.Provider>
  )
}

export function useDocumentHub() {
  const context = useContext(DocumentHubContext)
  if (!context) {
    throw new Error('useDocumentHub must be used within a DocumentHubProvider')
  }
  return context
}
