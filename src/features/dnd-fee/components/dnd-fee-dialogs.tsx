import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDndFee } from './dnd-fee-provider'

export function DndFeeDialogs() {
  const { openDialog, setOpenDialog, activeItem, setActiveItem } = useDndFee()

  const handleDelete = () => {
    toast.success(`D&D Record for Container ${activeItem?.containerNo || ''} deleted.`)
    setOpenDialog(null)
    setActiveItem(null)
  }

  return (
    <>
      <ConfirmDialog
        open={openDialog === 'delete'}
        onOpenChange={(open) => !open && setOpenDialog(null)}
        title='Delete D&D Fee Record'
        desc={`Are you sure you want to delete the D&D fee record for Container ${activeItem?.containerNo || ''}? This action cannot be undone.`}
        confirmText='Delete'
        destructive
        handleConfirm={handleDelete}
      />
    </>
  )
}
