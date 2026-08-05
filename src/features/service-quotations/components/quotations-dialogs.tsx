import { QuotationActionDialog } from './quotation-action-dialog'
import { QuotationDeleteDialog } from './quotation-delete-dialog'
import { QuotationInviteDialog } from './quotation-invite-dialog'
import { useQuotations } from './quotations-provider'

export function QuotationsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useQuotations()
  return (
    <>
      <QuotationActionDialog
        key='quote-add'
        open={open === 'add'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
          else setOpen('add')
        }}
      />

      <QuotationInviteDialog
        key='quote-invite'
        open={open === 'invite'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
          else setOpen('invite')
        }}
      />

      {currentRow && (
        <>
          <QuotationActionDialog
            key={`quote-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              } else {
                setOpen('edit')
              }
            }}
            currentRow={currentRow}
          />

          <QuotationDeleteDialog
            key={`quote-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              } else {
                setOpen('delete')
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
