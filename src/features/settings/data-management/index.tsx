import { useState, useRef } from 'react'
import { Database, Download, Upload, Trash2, RefreshCw, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useDbStore } from '@/stores/db-store'

export function DataManagementSettings() {
  const { exportData, importData, generateDemoData, deleteAllData } = useDbStore()
  const [isUploading, setIsUploading] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const dataStr = exportData()
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      const exportFileDefaultName = `erp-data-backup-${new Date().toISOString().split('T')[0]}.json`

      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      toast.success('Data exported successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to export data')
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        importData(json)
        toast.success('Data imported successfully')
      } catch (error) {
        console.error(error)
        toast.error('Failed to parse JSON file')
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  const handleGenerateDemoData = () => {
    try {
      generateDemoData()
      toast.success('Realistic demo data generated successfully across all modules')
    } catch (error) {
      console.error(error)
      toast.error('Failed to generate demo data')
    }
  }

  const handleDeleteAllData = () => {
    try {
      deleteAllData()
      toast.success('All data has been permanently deleted')
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete data')
    }
  }

  return (
    <div className='flex flex-col space-y-6 flex-1'>
      <div>
        <h3 className='text-lg font-medium'>Data Management</h3>
        <p className='text-sm text-muted-foreground'>
          Manage your application state. Backup, restore, or generate demo data.
        </p>
      </div>
      <Separator />
      
      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Download className='size-5' />
              Export Data (Backup)
            </CardTitle>
            <CardDescription>
              Download a complete JSON snapshot of the current application state.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              This file contains all transactional data, master data, and settings. Store it securely.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleExport} className='w-full'>
              Download Backup
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='size-5' />
              Import Data (Restore)
            </CardTitle>
            <CardDescription>
              Upload a previously exported JSON snapshot to restore the application state.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Warning: This will overwrite any existing data that has the same keys in the state.
            </p>
            <input
              type='file'
              accept='.json'
              ref={fileInputRef}
              onChange={handleFileChange}
              className='hidden'
            />
          </CardContent>
          <CardFooter>
            <Button 
              variant='outline' 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading}
              className='w-full'
            >
              {isUploading ? 'Uploading...' : 'Upload JSON File'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className='mt-8'>
        <h3 className='text-lg font-medium text-red-600 dark:text-red-400 flex items-center gap-2'>
          <AlertTriangle className='size-5' /> Danger Zone
        </h3>
        <p className='text-sm text-muted-foreground mb-4'>
          Destructive actions that will permanently overwrite or delete current application state.
        </p>
        
        <div className='grid gap-6 md:grid-cols-2'>
          <Card className='border-orange-200 dark:border-orange-900'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-orange-600 dark:text-orange-400'>
                <RefreshCw className='size-5' />
                Generate Demo Data
              </CardTitle>
              <CardDescription>
                Populates the application with a powerful, interconnected set of mock data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Ideal for Hackathon presentations. This overwrites existing records with realistic client chains, quotes, shipments, and finance data.
              </p>
            </CardContent>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='outline' className='w-full text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-900 dark:hover:bg-orange-950 dark:hover:text-orange-400'>
                    Generate Demo Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will overwrite parts of your current data with generated demo data. Make sure you have exported a backup if needed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleGenerateDemoData} className='bg-orange-600 text-white hover:bg-orange-700'>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>

          <Card className='border-red-200 dark:border-red-900'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-red-600 dark:text-red-400'>
                <Trash2 className='size-5' />
                Delete All Data
              </CardTitle>
              <CardDescription>
                Permanently wipes all local state and clears the database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                This action cannot be undone. All clients, shipments, invoices, and settings will be permanently removed.
              </p>
            </CardContent>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='destructive' className='w-full'>
                    Delete All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      entire database and remove all transactional data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className='py-4'>
                    <label className='text-sm text-muted-foreground'>
                      Type <strong>DELETE</strong> to confirm (Admin privileges required)
                    </label>
                    <input
                      type='text'
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className='mt-2 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                      placeholder='DELETE'
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        if (deleteConfirmation !== 'DELETE') {
                          e.preventDefault()
                          toast.error('You must type DELETE to confirm.')
                          return
                        }
                        handleDeleteAllData()
                        setDeleteConfirmation('')
                      }}
                      className='bg-red-600 text-white hover:bg-red-700'
                    >
                      Yes, delete all data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
