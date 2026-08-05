import React, { createContext, useContext, useState } from 'react'
import { type ClientCompany } from '@/lib/mock-data/master-data'

type ViewMode = 'table' | 'kanban' | 'report'

interface ClientAccountsContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  selectedClientId: string | null
  setSelectedClientId: (id: string | null) => void
  isAddOpen: boolean
  setIsAddOpen: (open: boolean) => void
  isEditOpen: boolean
  setIsEditOpen: (open: boolean) => void
  editingClient: ClientCompany | null
  setEditingClient: (client: ClientCompany | null) => void
}

const ClientAccountsContext = createContext<ClientAccountsContextType | undefined>(undefined)

export function ClientAccountsProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientCompany | null>(null)

  return (
    <ClientAccountsContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedClientId,
        setSelectedClientId,
        isAddOpen,
        setIsAddOpen,
        isEditOpen,
        setIsEditOpen,
        editingClient,
        setEditingClient,
      }}
    >
      {children}
    </ClientAccountsContext.Provider>
  )
}

export function useClientAccounts() {
  const context = useContext(ClientAccountsContext)
  if (!context) {
    throw new Error('useClientAccounts must be used within ClientAccountsProvider')
  }
  return context
}
