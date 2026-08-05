import { createFileRoute } from '@tanstack/react-router'
import PartnerDirectoryPage from '@/features/procurement/partner-directory'

export const Route = createFileRoute('/_authenticated/procurement/partner-directory')({
  component: PartnerDirectoryPage,
})
