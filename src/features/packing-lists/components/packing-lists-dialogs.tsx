import { PackingListActionDialog } from './packing-list-action-dialog'
import { PackingListDeleteDialog } from './packing-list-delete-dialog'
import { PackingListInviteDialog } from './packing-list-invite-dialog'
import { usePackingLists } from './packing-lists-provider'

export function PackingListsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePackingLists()
  return (
    <>
      <PackingListActionDialog
        key='packing-list-add'
        open={open === 'add'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
          else setOpen('add')
        }}
      />

      <PackingListInviteDialog
        key='packing-list-invite'
        open={open === 'invite'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
          else setOpen('invite')
        }}
      />

      {currentRow && (
        <>
          <PackingListActionDialog
            key={`packing-list-edit-${currentRow.id}`}
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

          <PackingListDeleteDialog
            key={`packing-list-delete-${currentRow.id}`}
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
