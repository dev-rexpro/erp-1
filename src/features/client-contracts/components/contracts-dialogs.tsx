import { ContractActionDialog } from './contract-action-dialog'
import { ContractDeleteDialog } from './contract-delete-dialog'
import { ContractInviteDialog } from './contract-invite-dialog'
import { useContracts } from './contracts-provider'

export function ContractsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useContracts()
  return (
    <>
      <ContractActionDialog
        key='ctr-add'
        open={open === 'add'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
          else setOpen('add')
        }}
      />

      <ContractInviteDialog
        key='ctr-invite'
        open={open === 'invite'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
          else setOpen('invite')
        }}
      />

      {currentRow && (
        <>
          <ContractActionDialog
            key={`ctr-edit-${currentRow.id}`}
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

          <ContractDeleteDialog
            key={`ctr-delete-${currentRow.id}`}
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
