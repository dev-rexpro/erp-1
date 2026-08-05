import React, { createContext, useContext, useState } from 'react'

export type VendorRatesViewMode = 'table' | 'kanban' | 'report' | 'cards'

interface VendorRatesContextValue {
  viewMode: VendorRatesViewMode
  setViewMode: (mode: VendorRatesViewMode) => void
  selectedRateId: string | null
  setSelectedRateId: (id: string | null) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}

const VendorRatesContext = createContext<VendorRatesContextValue | undefined>(undefined)

export function VendorRatesProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<VendorRatesViewMode>('table')
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <VendorRatesContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedRateId,
        setSelectedRateId,
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </VendorRatesContext.Provider>
  )
}

export function useVendorRates() {
  const context = useContext(VendorRatesContext)
  if (!context) {
    throw new Error('useVendorRates must be used within a VendorRatesProvider')
  }
  return context
}
