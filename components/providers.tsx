'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { TranslationProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth'
import { RealtimeProvider } from '@/lib/realtime'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TranslationProvider>
        <AuthProvider>
          <RealtimeProvider>
            {children}
          </RealtimeProvider>
          <Toaster
            position="top-center" 
            richColors 
            closeButton
            dir="rtl"
            toastOptions={{
              className: 'font-sans',
            }}
          />
        </AuthProvider>
      </TranslationProvider>
    </NextThemesProvider>
  )
}
