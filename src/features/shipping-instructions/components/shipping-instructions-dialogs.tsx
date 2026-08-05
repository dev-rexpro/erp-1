import { toast } from 'sonner'
import {
  ConfirmDialog,
} from '@/components/confirm-dialog'
import { useShippingInstructions } from './shipping-instructions-provider'

export function ShippingInstructionsDialogs() {
  const { openDialog, setOpenDialog, activeItem, setActiveItem } = useShippingInstructions()

  const handleDelete = () => {
    toast.success(`Shipping Instruction ${activeItem?.siNo || ''} has been deleted.`)
    setOpenDialog(null)
    setActiveItem(null)
  }

  return (
    <>
      <ConfirmDialog
        open={openDialog === 'delete'}
        onOpenChange={(open) => !open && setOpenDialog(null)}
        title='Delete Shipping Instruction'
        desc={`Are you sure you want to delete Shipping Instruction ${activeItem?.siNo || ''}? This action cannot be undone.`}
        confirmText='Delete'
        destructive
        handleConfirm={handleDelete}
      />
    </>
  )
}
