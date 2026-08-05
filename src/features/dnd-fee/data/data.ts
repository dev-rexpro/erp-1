export const dndStatuses = [
  { label: 'Accruing', value: 'Accruing' },
  { label: 'Billed', value: 'Billed' },
  { label: 'Waived', value: 'Waived' },
  { label: 'Settled', value: 'Settled' },
  { label: 'Disputed', value: 'Disputed' },
]

export const dndTypes = [
  { label: 'Demurrage', value: 'Demurrage' },
  { label: 'Detention', value: 'Detention' },
  { label: 'Storage', value: 'Storage' },
]

export const dndStatusBadgeStyles: Record<string, string> = {
  Accruing: 'border-slate-400 bg-slate-200 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100',
  Billed: 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Waived: 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  Settled: 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
  Disputed: 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400',
}

export const dndTypeBadgeStyles: Record<string, string> = {
  Demurrage: 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Detention: 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  Storage: 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400',
}
