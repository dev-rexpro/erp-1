import { createContext, useContext, useState, type ReactNode } from 'react'

type ViewMode = 'table' | 'report' | 'kanban'

interface ShippingInstructionsContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  selectedSiId: string | null
  setSelectedSiId: (id: string | null) => void
  openDialog: 'add' | 'edit' | 'delete' | null
  setOpenDialog: (dialog: 'add' | 'edit' | 'delete' | null) => void
  activeItem: any | null
  setActiveItem: (item: any | null) => void
}

const ShippingInstructionsContext = createContext<ShippingInstructionsContextType | undefined>(undefined)

export function ShippingInstructionsProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedSiId, setSelectedSiId] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [activeItem, setActiveItem] = useState<any | null>(null)

  return (
    <ShippingInstructionsContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedSiId,
        setSelectedSiId,
        openDialog,
        setOpenDialog,
        activeItem,
        setActiveItem,
      }}
    >
      {children}
    </ShippingInstructionsContext.Provider>
  )
}

export function useShippingInstructions() {
  const context = useContext(ShippingInstructionsContext)
  if (!context) {
    throw new Error('useShippingInstructions must be used within ShippingInstructionsProvider')
  }
  return context
}
