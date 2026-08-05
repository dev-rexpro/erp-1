import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Invoice } from '../data/schema'

type InvoicesDialogType = 'invite' | 'add' | 'edit' | 'delete'

type InvoicesContextType = {
  open: InvoicesDialogType | null
  setOpen: (str: InvoicesDialogType | null) => void
  currentRow: Invoice | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Invoice | null>>
  viewMode: 'list' | 'report' | 'kanban'
  setViewMode: React.Dispatch<React.SetStateAction<'list' | 'report' | 'kanban'>>
  selectedInvoiceId: string | null
  setSelectedInvoiceId: React.Dispatch<React.SetStateAction<string | null>>
}

const InvoicesContext = React.createContext<InvoicesContextType | null>(null)

export function InvoicesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<InvoicesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Invoice | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'report' | 'kanban'>('list')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)

  return (
    <InvoicesContext value={{
      open,
      setOpen,
      currentRow,
      setCurrentRow,
      viewMode,
      setViewMode,
      selectedInvoiceId,
      setSelectedInvoiceId,
    }}>
      {children}
    </InvoicesContext>
  )
}

export const useInvoices = () => {
  const context = React.useContext(InvoicesContext)
  if (!context) {
    throw new Error('useInvoices has to be used within <InvoicesContext>')
  }
  return context
}
