'use client'

import * as React from 'react'
import ar, { Translations } from './ar'

type TranslationContextType = {
  t: Translations
  locale: string
  setLocale: (locale: string) => void
  dir: 'rtl' | 'ltr'
}

const TranslationContext = React.createContext<TranslationContextType | null>(null)

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState('ar')
  
  const value = React.useMemo<TranslationContextType>(() => ({
    t: ar,
    locale,
    setLocale,
    dir: 'rtl',
  }), [locale])

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = React.useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

// Flat translation helper for simple key access
// Example: t("auth.login") returns the translation value
export function t(key: string): string {
  const keys = key.split('.')
  let value: unknown = ar
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key // Return key if not found
    }
  }
  return typeof value === 'string' ? value : key
}

export { ar }
export type { Translations }
