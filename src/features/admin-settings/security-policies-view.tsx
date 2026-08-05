import { useState } from 'react'
import {
  Lock,
  Shield,
  Key,
  Clock,
  Globe,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRbacStore, SecurityPolicy } from '@/stores/rbac-store'
import { StandardPageLayout } from '@/components/templates'
import { toast } from 'sonner'

export function SecurityPoliciesView() {
  const { securityPolicy, updateSecurityPolicy } = useRbacStore()
  const currentPolicy = securityPolicy[0] || {
    mfaEnforced: true,
    passwordMinLength: 12,
    passwordExpireDays: 90,
    sessionTimeoutMinutes: 30,
    ipWhitelist: ['10.120.0.0/16', '192.168.1.0/24'],
    maxFailedLogins: 5,
    requireSpecialChar: true,
  }

  const [policy, setPolicy] = useState<SecurityPolicy>(currentPolicy)
  const [newIp, setNewIp] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateSecurityPolicy(policy)
    toast.success('Security & access policy updated')
  }

  const handleAddIp = () => {
    if (!newIp) return
    if (policy.ipWhitelist.includes(newIp)) {
      toast.error('IP address already in whitelist')
      return
    }
    setPolicy({
      ...policy,
      ipWhitelist: [...policy.ipWhitelist, newIp],
    })
    setNewIp('')
  }

  const handleRemoveIp = (ip: string) => {
    setPolicy({
      ...policy,
      ipWhitelist: policy.ipWhitelist.filter((item) => item !== ip),
    })
  }

  const primaryActions = (
    <Button onClick={handleSave} size='sm' className='h-8 px-3 gap-1.5 bg-black hover:bg-black/90 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black font-semibold shadow-xs rounded-lg transition-colors'>
      <Save size={15} />
      <span className='text-xs'>Save Policies</span>
    </Button>
  )

  return (
    <StandardPageLayout
      title='Security Policies'
      description='Manage system-wide authentication, session timeouts, password parameters, and corporate IP boundaries.'
      viewMode='list'
      primaryActions={primaryActions}
    >
      <form onSubmit={handleSave} className='flex flex-col gap-6 text-xs max-w-5xl'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Card 1: Authentication & MFA */}
          <Card className='border-slate-200 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-900/30 shadow-none'>
            <CardHeader className='p-5 pb-3'>
              <CardTitle className='text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100'>
                <Shield className='size-4 text-primary' />
                Multi-Factor & Password Policies
              </CardTitle>
              <CardDescription className='text-xs text-slate-500 dark:text-slate-400'>
                Enforce two-factor auth and strong credential parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className='p-5 pt-2 space-y-4'>
              <div className='flex items-center justify-between gap-2 pt-1 border-b pb-3 border-slate-200 dark:border-slate-800'>
                <div className='space-y-0.5'>
                  <Label className='text-xs font-medium'>Enforce MFA for All Users</Label>
                  <p className='text-[11px] text-muted-foreground'>Require TOTP / Authenticator app code upon login.</p>
                </div>
                <Switch
                  checked={policy.mfaEnforced}
                  onCheckedChange={(checked) => setPolicy({ ...policy, mfaEnforced: checked })}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Min. Password Length</Label>
                  <Input
                    type='number'
                    min={8}
                    max={32}
                    value={policy.passwordMinLength}
                    onChange={(e) => setPolicy({ ...policy, passwordMinLength: Number(e.target.value) })}
                    className='h-9 text-xs'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-medium'>Password Expiry (Days)</Label>
                  <Input
                    type='number'
                    min={30}
                    max={365}
                    value={policy.passwordExpireDays}
                    onChange={(e) => setPolicy({ ...policy, passwordExpireDays: Number(e.target.value) })}
                    className='h-9 text-xs'
                  />
                </div>
              </div>

              <div className='flex items-center justify-between gap-2 pt-1'>
                <div className='space-y-0.5'>
                  <Label className='text-xs font-medium'>Require Special Symbols</Label>
                  <p className='text-[11px] text-muted-foreground'>Must include @, #, $, %, or ! in password.</p>
                </div>
                <Switch
                  checked={policy.requireSpecialChar}
                  onCheckedChange={(checked) => setPolicy({ ...policy, requireSpecialChar: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Session & Lockdown */}
          <Card className='border-slate-200 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-900/30 shadow-none'>
            <CardHeader className='p-5 pb-3'>
              <CardTitle className='text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100'>
                <Clock className='size-4 text-primary' />
                Session & Brute Force Lockouts
              </CardTitle>
              <CardDescription className='text-xs text-slate-500 dark:text-slate-400'>
                Limit inactive sessions and block unauthorized attempts.
              </CardDescription>
            </CardHeader>
            <CardContent className='p-5 pt-2 space-y-4'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Session Idle Timeout (Minutes)</Label>
                <Input
                  type='number'
                  min={5}
                  max={480}
                  value={policy.sessionTimeoutMinutes}
                  onChange={(e) => setPolicy({ ...policy, sessionTimeoutMinutes: Number(e.target.value) })}
                  className='h-9 text-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-medium'>Max. Failed Login Attempts</Label>
                <Input
                  type='number'
                  min={3}
                  max={10}
                  value={policy.maxFailedLogins}
                  onChange={(e) => setPolicy({ ...policy, maxFailedLogins: Number(e.target.value) })}
                  className='h-9 text-xs'
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: IP Whitelist Boundaries */}
          <Card className='border-slate-200 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-900/30 shadow-none md:col-span-2'>
            <CardHeader className='p-5 pb-3'>
              <CardTitle className='text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100'>
                <Globe className='size-4 text-primary' />
                Corporate IP Address Whitelist (CIDR / Subnets)
              </CardTitle>
              <CardDescription className='text-xs text-slate-500 dark:text-slate-400'>
                Restrict ERP access to trusted office networks or VPN subnets.
              </CardDescription>
            </CardHeader>
            <CardContent className='p-5 pt-2 space-y-4'>
              <div className='flex items-center gap-2'>
                <Input
                  placeholder='e.g. 10.120.0.0/16 or 203.0.113.15'
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className='h-9 text-xs max-w-sm'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleAddIp}
                  className='h-9 text-xs gap-1.5 rounded-lg'
                >
                  <Plus className='size-3.5' /> Add IP Subnet
                </Button>
              </div>

              <div className='flex flex-wrap gap-2 pt-1'>
                {policy.ipWhitelist.map((ip) => (
                  <div
                    key={ip}
                    className='inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background text-xs font-medium shadow-2xs'
                  >
                    <span>{ip}</span>
                    <button
                      type='button'
                      onClick={() => handleRemoveIp(ip)}
                      className='text-muted-foreground hover:text-destructive transition-colors'
                    >
                      <Trash2 className='size-3.5' />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </StandardPageLayout>
  )
}
