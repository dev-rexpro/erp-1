import { ContentSection } from '../components/content-section'
import { CompanyForm } from './company-form'

export function SettingsCompany() {
  return (
    <ContentSection
      title='Company Settings'
      desc='Manage your company profile details, tax identifications, banking codes, and branding assets.'
    >
      <CompanyForm />
    </ContentSection>
  )
}
export { SettingsCompany as default }
