import { type SVGProps } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { CircleCheck } from 'lucide-react'

import { fonts, fontLabels } from '@/config/fonts'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'

import { useFont } from '@/context/font-provider'
import { useTheme } from '@/context/theme-provider'
import { useLayout } from '@/context/layout-provider'
import { useSidebar } from '@/components/ui/sidebar'
import { useDirection } from '@/context/direction-provider'

import { Button, buttonVariants } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { IconDir } from '@/assets/custom/icon-dir'
import { IconLayoutCompact } from '@/assets/custom/icon-layout-compact'
import { IconLayoutDefault } from '@/assets/custom/icon-layout-default'
import { IconLayoutFull } from '@/assets/custom/icon-layout-full'
import { IconSidebarFloating } from '@/assets/custom/icon-sidebar-floating'
import { IconSidebarInset } from '@/assets/custom/icon-sidebar-inset'
import { IconSidebarSidebar } from '@/assets/custom/icon-sidebar-sidebar'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  font: z.enum(fonts),
  variant: z.enum(['inset', 'sidebar', 'floating']),
  layout: z.enum(['default', 'icon', 'offcanvas']),
  dir: z.enum(['ltr', 'rtl']),
  showSidebarTrigger: z.boolean(),
  sidebarMatchBackground: z.boolean(),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
  isTheme?: boolean
}) {
  return (
    <Item
      value={item.value}
      className={cn('group outline-none text-center', 'transition duration-200 ease-in')}
      aria-label={`Select ${item.label.toLowerCase()}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          'ring-border relative rounded-[6px] ring-[1px] cursor-pointer bg-card',
          'group-data-[state=checked]:ring-primary group-data-[state=checked]:shadow-2xl',
          'group-focus-visible:ring-2'
        )}
        role='img'
        aria-hidden='false'
        aria-label={`${item.label} option preview`}
      >
        <CircleCheck
          className={cn(
            'fill-primary size-6 stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 z-10'
          )}
          aria-hidden='true'
        />
        <item.icon
          className={cn(
            !isTheme &&
              'stroke-primary fill-primary group-data-[state=unchecked]:stroke-muted-foreground group-data-[state=unchecked]:fill-muted-foreground'
          )}
          aria-hidden='true'
        />
      </div>
      <div
        className='mt-1 text-[11px] text-muted-foreground group-data-[state=checked]:text-foreground group-data-[state=checked]:font-medium'
        id={`${item.value}-description`}
        aria-live='polite'
      >
        {item.label}
      </div>
    </Item>
  )
}

export function AppearanceForm() {
  const { font, setFont } = useFont()
  const { theme, setTheme } = useTheme()
  const {
    variant,
    setVariant,
    collapsible,
    setCollapsible,
    showSidebarTrigger,
    setShowSidebarTrigger,
    sidebarMatchBackground,
    setSidebarMatchBackground,
  } = useLayout()
  const { open, setOpen } = useSidebar()
  const { dir, setDir } = useDirection()

  // Determine starting value for layout RadioGroup
  const currentLayoutValue = open ? 'default' : collapsible

  // This can come from your database or API.
  const defaultValues: Partial<AppearanceFormValues> = {
    theme,
    font,
    variant,
    layout: currentLayoutValue as 'default' | 'icon' | 'offcanvas',
    dir,
    showSidebarTrigger,
    sidebarMatchBackground,
  }

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues,
  })

  function onSubmit(data: AppearanceFormValues) {
    if (data.font !== font) setFont(data.font)
    if (data.theme !== theme) setTheme(data.theme)
    if (data.variant !== variant) setVariant(data.variant)
    if (data.dir !== dir) setDir(data.dir)

    if (data.layout === 'default') {
      if (!open) setOpen(true)
    } else {
      if (open) setOpen(false)
      if (data.layout !== collapsible) setCollapsible(data.layout as any)
    }

    if (data.showSidebarTrigger !== showSidebarTrigger)
      setShowSidebarTrigger(data.showSidebarTrigger)
    if (data.sidebarMatchBackground !== sidebarMatchBackground)
      setSidebarMatchBackground(data.sidebarMatchBackground)

    showSubmittedData(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 max-w-md w-full'>
        {/* Theme Section */}
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem className='space-y-2'>
              <FormLabel className='text-sm font-semibold'>Theme</FormLabel>
              <FormDescription>
                Select the theme for the dashboard.
              </FormDescription>
              <FormMessage />
              <FormControl>
                <Radio
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    setTheme(val as any)
                  }}
                  className='grid w-full grid-cols-3 gap-4 pt-2'
                >
                  {[
                    { value: 'system', label: 'System', icon: IconThemeSystem },
                    { value: 'light', label: 'Light', icon: IconThemeLight },
                    { value: 'dark', label: 'Dark', icon: IconThemeDark },
                  ].map((item) => (
                    <RadioGroupItem key={item.value} item={item} isTheme />
                  ))}
                </Radio>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Sidebar Style Section */}
        <FormField
          control={form.control}
          name='variant'
          render={({ field }) => (
            <FormItem className='space-y-2'>
              <FormLabel className='text-sm font-semibold'>Sidebar Style</FormLabel>
              <FormDescription>
                Choose between inset, floating, or standard sidebar layout.
              </FormDescription>
              <FormMessage />
              <FormControl>
                <Radio
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    setVariant(val as any)
                  }}
                  className='grid w-full grid-cols-3 gap-4 pt-2'
                >
                  {[
                    { value: 'inset', label: 'Inset', icon: IconSidebarInset },
                    { value: 'floating', label: 'Floating', icon: IconSidebarFloating },
                    { value: 'sidebar', label: 'Sidebar', icon: IconSidebarSidebar },
                  ].map((item) => (
                    <RadioGroupItem key={item.value} item={item} />
                  ))}
                </Radio>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Layout Style Section */}
        <FormField
          control={form.control}
          name='layout'
          render={({ field }) => (
            <FormItem className='space-y-2'>
              <FormLabel className='text-sm font-semibold'>Layout</FormLabel>
              <FormDescription>
                Choose between default expanded, compact icon-only, or full layout mode.
              </FormDescription>
              <FormMessage />
              <FormControl>
                <Radio
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v)
                    if (v === 'default') {
                      setOpen(true)
                    } else {
                      setOpen(false)
                      setCollapsible(v as any)
                    }
                  }}
                  className='grid w-full grid-cols-3 gap-4 pt-2'
                >
                  {[
                    { value: 'default', label: 'Default', icon: IconLayoutDefault },
                    { value: 'icon', label: 'Compact', icon: IconLayoutCompact },
                    { value: 'offcanvas', label: 'Full layout', icon: IconLayoutFull },
                  ].map((item) => (
                    <RadioGroupItem key={item.value} item={item} />
                  ))}
                </Radio>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Direction Section */}
        <FormField
          control={form.control}
          name='dir'
          render={({ field }) => (
            <FormItem className='space-y-2'>
              <FormLabel className='text-sm font-semibold'>Direction</FormLabel>
              <FormDescription>
                Choose between left-to-right or right-to-left site reading direction.
              </FormDescription>
              <FormMessage />
              <FormControl>
                <Radio
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    setDir(val as any)
                  }}
                  className='grid w-full grid-cols-3 gap-4 pt-2'
                >
                  {[
                    {
                      value: 'ltr',
                      label: 'Left to Right',
                      icon: (props: SVGProps<SVGSVGElement>) => (
                        <IconDir dir='ltr' {...props} />
                      ),
                    },
                    {
                      value: 'rtl',
                      label: 'Right to Left',
                      icon: (props: SVGProps<SVGSVGElement>) => (
                        <IconDir dir='rtl' {...props} />
                      ),
                    },
                  ].map((item) => (
                    <RadioGroupItem key={item.value} item={item} />
                  ))}
                </Radio>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Font Selection */}
        <FormField
          control={form.control}
          name='font'
          render={({ field }) => (
            <FormItem className='space-y-2'>
              <FormLabel className='text-sm font-semibold'>Font</FormLabel>
              <FormDescription>
                Set the font you want to use in the dashboard.
              </FormDescription>
              <div className='w-[200px] pt-2'>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      setFont(val as any)
                    }}
                  >
                    <SelectTrigger className='w-[200px]'>
                      <SelectValue placeholder='Select font...' />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((font) => (
                        <SelectItem key={font} value={font}>
                          {fontLabels[font]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Switches */}
        <div className='space-y-4 pt-4 border-t w-full'>
          <FormField
            control={form.control}
            name='showSidebarTrigger'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 shadow-xs'>
                <div className='space-y-0.5 pr-4'>
                  <FormLabel className='text-sm font-medium'>Header Sidebar Toggle</FormLabel>
                  <FormDescription className='text-xs'>
                    Show or hide the sidebar toggle button in the header bar.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      setShowSidebarTrigger(checked)
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='sidebarMatchBackground'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 shadow-xs'>
                <div className='space-y-0.5 pr-4'>
                  <FormLabel className='text-sm font-medium'>Match Sidebar Background</FormLabel>
                  <FormDescription className='text-xs'>
                    Set sidebar background color to match the primary page background.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      setSidebarMatchBackground(checked)
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type='submit' className='w-full'>Update preferences</Button>
      </form>
    </Form>
  )
}
