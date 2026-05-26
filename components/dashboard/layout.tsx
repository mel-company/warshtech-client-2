'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { useTranslation } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import {
  buildNavContextFromUser,
  canAccessPath,
  findNavItemByPath,
  getDefaultNavPath,
} from '@/lib/dashboard-nav'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9">
        <Sun className="size-4" />
      </Button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
          <span className="sr-only">
            {theme === 'dark' ? t.theme.light : t.theme.dark}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {theme === 'dark' ? t.theme.light : t.theme.dark}
      </TooltipContent>
    </Tooltip>
  )
}

function DashboardHeader() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const item = findNavItemByPath(pathname)
  const title = item ? t.nav[item.labelKey] : t.nav.dashboard

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="md:hidden">
        <Menu className="size-5" />
      </SidebarTrigger>
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <ThemeToggle />
      </div>
    </header>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, hasPermission } = useAuth()

  const navContext = React.useMemo(
    () => ({
      user,
      hasPermission,
    }),
    [user, hasPermission],
  )

  React.useEffect(() => {
    if (isLoading || !user) return
    if (!canAccessPath(navContext, pathname)) {
      router.replace(getDefaultNavPath(navContext))
    }
  }, [user, isLoading, pathname, router, navContext])

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
