import React from 'react'

interface MetricValueProps {
  value: string | number
  className?: string
}

export function MetricValue({ value, className = '' }: MetricValueProps) {
  const str = String(value)
  const parts = str.split(/(\s+)/)

  return (
    <div className={`mt-0.5 text-lg tracking-tight text-foreground flex items-baseline gap-1 flex-wrap ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null
        // Check if token contains numbers or currency ($21,600.00, 100%, 25, 12.5, 98.4%)
        const isNumericToken = /\d/.test(part) && !/[a-zA-Z]{3,}/.test(part)
        if (isNumericToken) {
          return (
            <span key={index} className="font-bold text-foreground">
              {part}
            </span>
          )
        }
        return (
          <span key={index} className="font-medium text-muted-foreground">
            {part}
          </span>
        )
      })}
    </div>
  )
}
