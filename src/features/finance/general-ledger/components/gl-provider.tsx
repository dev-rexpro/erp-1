import { createContext, useContext, useState, ReactNode } from 'react'

export type GLViewMode = 'list' | 'report' | 'kanban'

interface GLContextType {
  viewMode: GLViewMode
  setViewMode: React.Dispatch<React.SetStateAction<GLViewMode>>
  selectedVoucherId: string | null
  setSelectedVoucherId: (id: string | null) => void
}

const GLContext = createContext<GLContextType | undefined>(undefined)

export function GLProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<GLViewMode>('list')
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null)

  return (
    <GLContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedVoucherId,
        setSelectedVoucherId,
      }}
    >
      {children}
    </GLContext.Provider>
  )
}

export function useGL() {
  const context = useContext(GLContext)
  if (!context) {
    throw new Error('useGL must be used within a GLProvider')
  }
  return context
}
