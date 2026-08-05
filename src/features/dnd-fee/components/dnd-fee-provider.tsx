import { createContext, useContext, useState, type ReactNode } from 'react'

type ViewMode = 'table' | 'report' | 'kanban'

interface DndFeeContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  selectedDndId: string | null
  setSelectedDndId: (id: string | null) => void
  openDialog: 'add' | 'edit' | 'delete' | null
  setOpenDialog: (dialog: 'add' | 'edit' | 'delete' | null) => void
  activeItem: any | null
  setActiveItem: (item: any | null) => void
}

const DndFeeContext = createContext<DndFeeContextType | undefined>(undefined)

export function DndFeeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedDndId, setSelectedDndId] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [activeItem, setActiveItem] = useState<any | null>(null)

  return (
    <DndFeeContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedDndId,
        setSelectedDndId,
        openDialog,
        setOpenDialog,
        activeItem,
        setActiveItem,
      }}
    >
      {children}
    </DndFeeContext.Provider>
  )
}

export function useDndFee() {
  const context = useContext(DndFeeContext)
  if (!context) {
    throw new Error('useDndFee must be used within DndFeeProvider')
  }
  return context
}
