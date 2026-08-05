import { createFileRoute } from '@tanstack/react-router'
import { DocumentHub } from '@/features/document-hub'

export const Route = createFileRoute('/_authenticated/document-hub')({
  component: DocumentHub,
})

