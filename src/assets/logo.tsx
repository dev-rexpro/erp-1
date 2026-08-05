import * as React from 'react'
import { cn } from '@/lib/utils'

export function Logo({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src='/o1_logo.png'
      alt='ERP One Logo'
      className={cn('size-6 object-contain dark:invert', className)}
      {...props}
    />
  )
}
