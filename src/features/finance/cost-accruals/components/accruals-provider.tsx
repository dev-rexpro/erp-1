import { createContext, useContext, useState, ReactNode } from 'react'

export type AccrualsViewMode = 'list' | 'report' | 'kanban'

interface AccrualsContextType {
  viewMode: AccrualsViewMode
  setViewMode: React.Dispatch<React.SetStateAction<AccrualsViewMode>>
  selectedAccrualId: string | null
  setSelectedAccrualId: (id: string | null) => void
}

const AccrualsContext = createContext<AccrualsContextType | undefined>(undefined)

export function AccrualsProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<AccrualsViewMode>('list')
  const [selectedAccrualId, setSelectedAccrualId] = useState<string | null>(null)

  return (
    <AccrualsContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedAccrualId,
        setSelectedAccrualId,
      }}
    >
      {children}
    </AccrualsContext.Provider>
  )
}

export function useAccruals() {
  const context = useContext(AccrualsContext)
  if (!context) {
    throw new Error('useAccruals must be used within an AccrualsProvider')
  }
  return context
}
