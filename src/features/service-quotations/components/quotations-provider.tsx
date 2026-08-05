import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Quotation } from '../data/schema'

type QuotationsDialogType = 'invite' | 'add' | 'edit' | 'delete'

type QuotationsContextType = {
  open: QuotationsDialogType | null
  setOpen: (str: QuotationsDialogType | null) => void
  currentRow: Quotation | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Quotation | null>>
  viewMode: 'list' | 'report' | 'kanban'
  setViewMode: React.Dispatch<React.SetStateAction<'list' | 'report' | 'kanban'>>
  selectedQuotationId: string | null
  setSelectedQuotationId: React.Dispatch<React.SetStateAction<string | null>>
}

const QuotationsContext = React.createContext<QuotationsContextType | null>(null)

export function QuotationsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<QuotationsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Quotation | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'report' | 'kanban'>('list')
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null)

  return (
    <QuotationsContext value={{
      open,
      setOpen,
      currentRow,
      setCurrentRow,
      viewMode,
      setViewMode,
      selectedQuotationId,
      setSelectedQuotationId,
    }}>
      {children}
    </QuotationsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useQuotations = () => {
  const context = React.useContext(QuotationsContext)
  if (!context) {
    throw new Error('useQuotations has to be used within <QuotationsContext>')
  }
  return context
}
