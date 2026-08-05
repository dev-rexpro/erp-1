import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type PackingList } from '../data/schema'

type PackingListsDialogType = 'invite' | 'add' | 'edit' | 'delete'

type PackingListsContextType = {
  open: PackingListsDialogType | null
  setOpen: (str: PackingListsDialogType | null) => void
  currentRow: PackingList | null
  setCurrentRow: React.Dispatch<React.SetStateAction<PackingList | null>>
  viewMode: 'list' | 'report' | 'kanban'
  setViewMode: React.Dispatch<React.SetStateAction<'list' | 'report' | 'kanban'>>
  selectedPackingListId: string | null
  setSelectedPackingListId: React.Dispatch<React.SetStateAction<string | null>>
}

const PackingListsContext = React.createContext<PackingListsContextType | null>(null)

export function PackingListsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<PackingListsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<PackingList | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'report' | 'kanban'>('list')
  const [selectedPackingListId, setSelectedPackingListId] = useState<string | null>(null)

  return (
    <PackingListsContext value={{
      open,
      setOpen,
      currentRow,
      setCurrentRow,
      viewMode,
      setViewMode,
      selectedPackingListId,
      setSelectedPackingListId,
    }}>
      {children}
    </PackingListsContext>
  )
}

export const usePackingLists = () => {
  const context = React.useContext(PackingListsContext)
  if (!context) {
    throw new Error('usePackingLists has to be used within <PackingListsContext>')
  }
  return context
}
