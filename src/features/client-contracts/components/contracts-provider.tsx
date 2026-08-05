import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Contract } from '../data/schema'

type ContractsDialogType = 'invite' | 'add' | 'edit' | 'delete'

type ContractsContextType = {
  open: ContractsDialogType | null
  setOpen: (str: ContractsDialogType | null) => void
  currentRow: Contract | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Contract | null>>
  viewMode: 'list' | 'report' | 'kanban'
  setViewMode: React.Dispatch<React.SetStateAction<'list' | 'report' | 'kanban'>>
  selectedContractId: string | null
  setSelectedContractId: React.Dispatch<React.SetStateAction<string | null>>
}

const ContractsContext = React.createContext<ContractsContextType | null>(null)

export function ContractsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ContractsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Contract | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'report' | 'kanban'>('list')
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null)

  return (
    <ContractsContext value={{
      open,
      setOpen,
      currentRow,
      setCurrentRow,
      viewMode,
      setViewMode,
      selectedContractId,
      setSelectedContractId,
    }}>
      {children}
    </ContractsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useContracts = () => {
  const context = React.useContext(ContractsContext)
  if (!context) {
    throw new Error('useContracts has to be used within <ContractsContext>')
  }
  return context
}
