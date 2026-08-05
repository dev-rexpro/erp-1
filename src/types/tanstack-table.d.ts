import '@tanstack/react-table'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    title?: string
    className?: string
    tdClassName?: string
  }
}
