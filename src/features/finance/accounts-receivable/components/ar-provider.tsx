import { createContext, useContext, useState, ReactNode } from 'react'

export type ARViewMode = 'list' | 'report' | 'kanban'

interface ARContextType {
  viewMode: ARViewMode
  setViewMode: React.Dispatch<React.SetStateAction<ARViewMode>>
  selectedArId: string | null
  setSelectedArId: (id: string | null) => void
}

const ARContext = createContext<ARContextType | undefined>(undefined)

export function ARProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ARViewMode>('list')
  const [selectedArId, setSelectedArId] = useState<string | null>(null)

  return (
    <ARContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedArId,
        setSelectedArId,
      }}
    >
      {children}
    </ARContext.Provider>
  )
}

export function useAR() {
  const context = useContext(ARContext)
  if (!context) {
    throw new Error('useAR must be used within an ARProvider')
  }
  return context
}
