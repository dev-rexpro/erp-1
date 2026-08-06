import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, Save } from 'lucide-react'
import { toast } from 'sonner'

export function IntelligenceSettingsView() {
  // Logical end-user workspace AI action preferences
  const [actionCardsEnabled, setActionCardsEnabled] = useState<boolean>(true)
  const [proactiveAlerts, setProactiveAlerts] = useState<boolean>(true)
  const [smartDrafts, setSmartDrafts] = useState<boolean>(true)
  const [completionNotifications, setCompletionNotifications] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Workspace AI action preferences saved successfully!')
    }, 400)
  }

  return (
    <div className='space-y-6 max-w-4xl pb-10'>
      <div>
        <h3 className='text-base font-medium text-foreground'>System Intelligence Preferences</h3>
        <p className='text-xs text-muted-foreground mt-0.5'>
          Configure automated action cards, proactive alerts, and smart email draft behaviors for your ERP workspace.
        </p>
      </div>

      <Separator />

      <Card className='border bg-card shadow-none'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-semibold'>Automated AI Actions & Workflows</CardTitle>
          <CardDescription className='text-xs'>
            Manage interactive action cards and automated task resolution preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 pt-1 text-xs'>
          <div className='flex items-center justify-between py-2 border-b'>
            <div className='space-y-0.5 max-w-xl'>
              <div className='font-medium text-foreground text-xs'>Automated Action Cards & Approval</div>
              <p className='text-muted-foreground text-[11px]'>
                Display interactive action confirmation cards (Confirm & Send / Later) beneath Masbro recommendations.
              </p>
            </div>
            <Switch checked={actionCardsEnabled} onCheckedChange={setActionCardsEnabled} />
          </div>

          <div className='flex items-center justify-between py-2 border-b'>
            <div className='space-y-0.5 max-w-xl'>
              <div className='font-medium text-foreground text-xs'>Proactive Operational Alerts</div>
              <p className='text-muted-foreground text-[11px]'>
                Automatically highlight problem-solving action plans when container delays, customs holds, or overdue invoices occur.
              </p>
            </div>
            <Switch checked={proactiveAlerts} onCheckedChange={setProactiveAlerts} />
          </div>

          <div className='flex items-center justify-between py-2 border-b'>
            <div className='space-y-0.5 max-w-xl'>
              <div className='font-medium text-foreground text-xs'>Smart Email Draft Assistance</div>
              <p className='text-muted-foreground text-[11px]'>
                Auto-generate email copy and recipient details for AR payment reminders and CEISA customs inquiries.
              </p>
            </div>
            <Switch checked={smartDrafts} onCheckedChange={setSmartDrafts} />
          </div>

          <div className='flex items-center justify-between py-2'>
            <div className='space-y-0.5 max-w-xl'>
              <div className='font-medium text-foreground text-xs'>Action Completion System Alerts</div>
              <p className='text-muted-foreground text-[11px]'>
                Receive system toast notifications when automated email dispatches or background tasks complete.
              </p>
            </div>
            <Switch checked={completionNotifications} onCheckedChange={setCompletionNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Action footer */}
      <div className='flex justify-end pt-2'>
        <Button size='sm' className='h-8 px-4 gap-1.5 text-xs font-semibold' onClick={handleSave} disabled={isSaving}>
          {isSaving ? <RefreshCw className='size-3.5 animate-spin' /> : <Save className='size-3.5' />}
          <span>Save Preferences</span>
        </Button>
      </div>
    </div>
  )
}

export default IntelligenceSettingsView
