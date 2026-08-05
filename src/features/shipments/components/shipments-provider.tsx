import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Shipment } from '../data/schema'

type ShipmentsDialogType = 'invite' | 'add' | 'edit' | 'delete'

type ShipmentsContextType = {
  open: ShipmentsDialogType | null
  setOpen: (str: ShipmentsDialogType | null) => void
  currentRow: Shipment | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Shipment | null>>
  viewMode: 'list' | 'report' | 'kanban'
  setViewMode: React.Dispatch<React.SetStateAction<'list' | 'report' | 'kanban'>>
  selectedShipmentId: string | null
  setSelectedShipmentId: React.Dispatch<React.SetStateAction<string | null>>
}

const ShipmentsContext = React.createContext<ShipmentsContextType | null>(null)

export function ShipmentsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ShipmentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Shipment | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'report' | 'kanban'>('list')
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null)

  return (
    <ShipmentsContext value={{
      open,
      setOpen,
      currentRow,
      setCurrentRow,
      viewMode,
      setViewMode,
      selectedShipmentId,
      setSelectedShipmentId,
    }}>
      {children}
    </ShipmentsContext>
  )
}

export const useShipments = () => {
  const context = React.useContext(ShipmentsContext)
  if (!context) {
    throw new Error('useShipments has to be used within <ShipmentsContext>')
  }
  return context
}
