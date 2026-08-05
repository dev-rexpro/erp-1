import { useState, useEffect } from 'react'

export interface CompanySettingsValues {
  name: string
  address: string
  email: string
  phone: string
  website: string
  npwp: string
  nib: string
  bankName: string
  bankAccount: string
  bankAccountName: string
  logoUrl: string
  stampUrl: string
}

export const defaultCompanySettings: CompanySettingsValues = {
  name: 'PT REXINDO ARUNA SEDAYA',
  address: 'Main Office St., Jakarta, Indonesia',
  email: 'info@rexindo.com',
  phone: '+62-21-5555-0184',
  website: 'rexindo-aruna.com',
  npwp: '01.234.567.8-901.000',
  nib: '-',
  bankName: 'MANDIRI',
  bankAccount: '123-456-7890',
  bankAccountName: 'PT REXINDO ARUNA SEDAYA',
  logoUrl: '',
  stampUrl: '',
}

const STORAGE_KEY = 'erp_company_settings'

export function getCompanySettings(): CompanySettingsValues {
  if (typeof window === 'undefined') return defaultCompanySettings
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...defaultCompanySettings, ...JSON.parse(stored) }
    }
  } catch {
    // Ignore error
  }
  return defaultCompanySettings
}

export function saveCompanySettings(settings: CompanySettingsValues) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    window.dispatchEvent(new Event('company_settings_changed'))
  } catch {
    // Ignore error
  }
}

export function useCompanySettings(): CompanySettingsValues {
  const [settings, setSettings] = useState<CompanySettingsValues>(() => getCompanySettings())

  useEffect(() => {
    function handleChange() {
      setSettings(getCompanySettings())
    }

    window.addEventListener('company_settings_changed', handleChange)
    window.addEventListener('storage', handleChange)
    return () => {
      window.removeEventListener('company_settings_changed', handleChange)
      window.removeEventListener('storage', handleChange)
    }
  }, [])

  return settings
}

