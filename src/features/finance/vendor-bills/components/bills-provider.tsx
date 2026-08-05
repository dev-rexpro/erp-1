import { createContext, useContext, useState, ReactNode } from 'react'

export type BillsViewMode = 'list' | 'report' | 'kanban'

interface BillsContextType {
  viewMode: BillsViewMode
  setViewMode: React.Dispatch<React.SetStateAction<BillsViewMode>>
  selectedBillId: string | null
  setSelectedBillId: (id: string | null) => void
}

const BillsContext = createContext<BillsContextType | undefined>(undefined)

export function BillsProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<BillsViewMode>('list')
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null)

  return (
    <BillsContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedBillId,
        setSelectedBillId,
      }}
    >
      {children}
    </BillsContext.Provider>
  )
}

export function useBills() {
  const context = useContext(BillsContext)
  if (!context) {
    throw new Error('useBills must be used within a BillsProvider')
  }
  return context
}
