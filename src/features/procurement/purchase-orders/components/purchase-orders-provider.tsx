import React, { createContext, useContext, useState } from 'react'

export type PurchaseOrdersViewMode = 'table' | 'kanban' | 'report' | 'cards'

interface PurchaseOrdersContextValue {
  viewMode: PurchaseOrdersViewMode
  setViewMode: (mode: PurchaseOrdersViewMode) => void
  selectedPoId: string | null
  setSelectedPoId: (id: string | null) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}

const PurchaseOrdersContext = createContext<PurchaseOrdersContextValue | undefined>(undefined)

export function PurchaseOrdersProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<PurchaseOrdersViewMode>('table')
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <PurchaseOrdersContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedPoId,
        setSelectedPoId,
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </PurchaseOrdersContext.Provider>
  )
}

export function usePurchaseOrders() {
  const context = useContext(PurchaseOrdersContext)
  if (!context) {
    throw new Error('usePurchaseOrders must be used within a PurchaseOrdersProvider')
  }
  return context
}
