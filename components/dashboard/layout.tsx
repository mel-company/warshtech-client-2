'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Package,
  Wrench,
  UserCog,
  Shield,
  Settings,
  LogOut,
  Moon,
  Sun,
  Car,
  ChevronLeft,
  Menu,
  FileText,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Logo from '@/assets/logo'
import { PosLayout } from '@/components/dashboard/pos-layout'
import { isAccountantUser } from '@/lib/pos-access'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' as const, permission: null },
  { href: '/dashboard/customers', icon: Users, labelKey: 'customers' as const, permission: 'customers' as const },
  { href: '/dashboard/products', icon: Package, labelKey: 'products' as const, permission: 'products' as const },
  { href: '/dashboard/services', icon: Wrench, labelKey: 'services' as const, permission: 'services' as const },
  { href: '/dashboard/employees', icon: UserCog, labelKey: 'employees' as const, permission: 'employees' as const },
  { href: '/dashboard/users', icon: Shield, labelKey: 'users' as const, permission: 'users' as const },
  { href: '/dashboard/invoices', icon: FileText, labelKey: 'invoices' as const, permission: 'invoices' as const },
  { href: '/dashboard/roles', icon: Shield, labelKey: 'roles' as const, permission: 'roles' as const },
]

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

function AppSidebar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { user, logout, hasPermission } = useAuth()
  const { state } = useSidebar()

  // Filter nav items based on user permissions
  const visibleNavItems = React.useMemo(() => {
    return navItems.filter(item => {
      if (!item.permission) return true // dashboard is always visible
      return hasPermission(item.permission, 'read')
    })
  }, [hasPermission])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
  }

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Logo size={32} />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold">{t.app.name}</span>
            <span className="text-xs text-muted-foreground">لوحة التحكم</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item, index) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <React.Fragment key={item.href}>
                    {index === visibleNavItems?.length - 2 && <div className='w-full h-px bg-zinc-200 dark:bg-zinc-800' />}
                    <SidebarMenuItem >
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={t.nav[item.labelKey]}
                      >
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{t.nav[item.labelKey]}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </React.Fragment>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user ? getInitials(user.name) : 'م'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm group-data-[collapsible=icon]:hidden">
                    <span className="font-medium">{user?.name || 'المستخدم'}</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.phone || '+966...'}
                    </span>
                  </div>
                  <ChevronLeft className="mr-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                side="left"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="ml-2 size-4" />
                    {t.nav.settings}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="ml-2 size-4" />
                  {t.nav.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function DashboardHeader() {
  const { t } = useTranslation()
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pathname === '/dashboard') return t.nav.dashboard
    if (pathname.includes('/customers')) return t.nav.customers
    if (pathname.includes('/products')) return t.nav.products
    if (pathname.includes('/services')) return t.nav.services
    if (pathname.includes('/employees')) return t.nav.employees
    if (pathname.includes('/users')) return t.nav.users
    if (pathname.includes('/invoices')) return t.nav.invoices
    if (pathname.includes('/pos')) return t.nav.pos
    if (pathname.includes('/roles')) return t.nav.roles
    if (pathname.includes('/settings')) return t.nav.settings
    return t.nav.dashboard
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="md:hidden">
        <Menu className="size-5" />
      </SidebarTrigger>

      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  React.useEffect(() => {
    if (isLoading || !user) return
    if (isAccountantUser(user) && !pathname.startsWith('/dashboard/pos')) {
      router.replace('/dashboard/pos')
    }
  }, [user, isLoading, pathname, router])

  if (pathname.startsWith('/dashboard/pos')) {
    return <PosLayout>{children}</PosLayout>
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
