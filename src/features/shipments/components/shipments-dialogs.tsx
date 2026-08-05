import { ShipmentActionDialog } from './shipment-action-dialog'
import { ShipmentDeleteDialog } from './shipment-delete-dialog'
import { ShipmentInviteDialog } from './shipment-invite-dialog'
import { useShipments } from './shipments-provider'

export function ShipmentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useShipments()
  return (
    <>
      <ShipmentActionDialog
        key='shipment-add'
        open={open === 'add'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
          else setOpen('add')
        }}
      />

      <ShipmentInviteDialog
        key='shipment-invite'
        open={open === 'invite'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
          else setOpen('invite')
        }}
      />

      {currentRow && (
        <>
          <ShipmentActionDialog
            key={`shipment-edit-${currentRow.id}`}
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

          <ShipmentDeleteDialog
            key={`shipment-delete-${currentRow.id}`}
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
