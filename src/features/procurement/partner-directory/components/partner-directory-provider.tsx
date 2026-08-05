import React, { createContext, useContext, useState } from 'react'

export type PartnerDirectoryViewMode = 'table' | 'kanban' | 'report' | 'cards'

interface PartnerDirectoryContextValue {
  viewMode: PartnerDirectoryViewMode
  setViewMode: (mode: PartnerDirectoryViewMode) => void
  selectedPartnerId: string | null
  setSelectedPartnerId: (id: string | null) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: string | null
  setSelectedCategory: (category: string | null) => void
}

const PartnerDirectoryContext = createContext<PartnerDirectoryContextValue | undefined>(undefined)

export function PartnerDirectoryProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<PartnerDirectoryViewMode>('table')
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <PartnerDirectoryContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedPartnerId,
        setSelectedPartnerId,
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </PartnerDirectoryContext.Provider>
  )
}

export function usePartnerDirectory() {
  const context = useContext(PartnerDirectoryContext)
  if (!context) {
    throw new Error('usePartnerDirectory must be used within a PartnerDirectoryProvider')
  }
  return context
}
