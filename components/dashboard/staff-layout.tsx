"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Moon,
  Sun,
  ShoppingCart,
  ClipboardList,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";

import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { canAccessPos } from "@/lib/pos-access";
import {
  canAccessReception,
  isReceptionistUser,
  RECEPTIONIST_PATHS,
  ACCOUNTANT_PATHS,
} from "@/lib/reception-access";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Logo from "@/assets/logo";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="sr-only">{theme === "dark" ? t.theme.light : t.theme.dark}</span>
    </Button>
  );
}

function canAccessStaff(user: NonNullable<ReturnType<typeof useAuth>["user"]>) {
  return canAccessPos(user) || canAccessReception(user);
}

export function StaffLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (isLoading || !user) return;
    if (!user) {
      router.replace("/user-login");
      return;
    }
    if (!canAccessStaff(user)) {
      router.replace("/dashboard");
      return;
    }
    if (isReceptionistUser(user)) {
      const ok = RECEPTIONIST_PATHS.some((p) => pathname.startsWith(p));
      if (!ok) router.replace("/dashboard/reception");
    } else if (canAccessPos(user)) {
      const ok = ACCOUNTANT_PATHS.some((p) => pathname.startsWith(p));
      if (!ok) router.replace("/dashboard/pos");
    }
  }, [user, isLoading, pathname, router]);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) ?? "م";

  const pageTitle = pathname.startsWith("/dashboard/reception")
    ? t.nav.reception
    : pathname.startsWith("/dashboard/active-service")
      ? t.nav.activeService
      : t.nav.pos;

  if (isLoading || !user || !canAccessStaff(user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const isReception = isReceptionistUser(user);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 via-background to-background">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1600px] flex-wrap items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Logo size={28} />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">{pageTitle}</p>
              <p className="text-xs text-muted-foreground">{t.app.name}</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-lg border bg-card/80 p-0.5">
            {isReception ? (
              <Button
                variant={
                  pathname.startsWith("/dashboard/reception")
                    ? "secondary"
                    : "ghost"
                }
                size="sm"
                className="h-8 gap-1.5 px-2.5"
                asChild
              >
                <Link href="/dashboard/reception">
                  <UserRound className="size-4" />
                  <span className="hidden sm:inline">{t.nav.reception}</span>
                </Link>
              </Button>
            ) : (
              <Button
                variant={
                  pathname.startsWith("/dashboard/pos") ? "secondary" : "ghost"
                }
                size="sm"
                className="h-8 gap-1.5 px-2.5"
                asChild
              >
                <Link href="/dashboard/pos">
                  <ShoppingCart className="size-4" />
                  <span className="hidden sm:inline">{t.nav.pos}</span>
                </Link>
              </Button>
            )}
            <Button
              variant={
                pathname.startsWith("/dashboard/active-service")
                  ? "secondary"
                  : "ghost"
              }
              size="sm"
              className="h-8 gap-1.5 px-2.5"
              asChild
            >
              <Link href="/dashboard/active-service">
                <ClipboardList className="size-4" />
                <span className="hidden sm:inline">{t.nav.activeService}</span>
              </Link>
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 sm:flex">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary/15 text-primary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="size-4 sm:ms-1" />
              <span className="hidden sm:inline">{t.nav.logout}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 p-3 md:p-4">
        {children}
      </main>
    </div>
  );
}

/** @deprecated use StaffLayout */
export const PosLayout = StaffLayout;
