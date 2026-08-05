export const siStatuses = [
  { label: 'Submitted', value: 'Submitted' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Amended', value: 'Amended' },
  { label: 'Cancelled', value: 'Cancelled' },
]

export const siStatusBadgeStyles: Record<string, string> = {
  Submitted: 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Confirmed: 'border-slate-400 bg-slate-200 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100',
  Draft: 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  Amended: 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
  Cancelled: 'border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400 line-through',
}
