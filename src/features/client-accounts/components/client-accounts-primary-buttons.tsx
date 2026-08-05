import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useDbStore } from '@/stores/db-store'
import { useClientAccounts } from './client-accounts-provider'

export function ClientAccountsPrimaryButtons() {
  const { setIsAddOpen } = useClientAccounts()
  const { clients } = useDbStore()

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(clients, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `client-accounts-export-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success('Exported client accounts data successfully!')
  }

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={handleExport}
        className='h-8 text-xs'
      >
        <Download className='mr-1.5 h-3.5 w-3.5' /> Export Data
      </Button>
      <Button
        size='sm'
        onClick={() => setIsAddOpen(true)}
        className='h-8 text-xs'
      >
        <Plus className='mr-1.5 h-3.5 w-3.5' /> Add Client Account
      </Button>
    </div>
  )
}
