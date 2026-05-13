'use client'

import * as React from 'react'
import ar, { Translations as ArTranslations } from './ar'
import en, { Translations as EnTranslations } from './en'

type TranslationContextType = {
  t: ArTranslations & EnTranslations
  locale: string
  setLocale: (locale: string) => void
  dir: 'rtl' | 'ltr'
}

const translations = { ar, en }

const TranslationContext = React.createContext<TranslationContextType | null>(null)

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState('ar')

  const value = React.useMemo<TranslationContextType>(() => ({
    t: translations[locale as keyof typeof translations] as ArTranslations & EnTranslations,
    locale,
    setLocale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
  }), [locale])

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
      document.documentElement.dir = value.dir
    }
  }, [locale, value.dir])

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
export function t(key: string, locale: string = 'ar'): string {
  const keys = key.split('.')
  const trans = translations[locale as keyof typeof translations] || ar
  let value: unknown = trans
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key // Return key if not found
    }
  }
  return typeof value === 'string' ? value : key
}

export { ar, en }
export type { ArTranslations, EnTranslations }
