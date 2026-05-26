"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, LogOut, Settings } from "lucide-react";

import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { getVisibleNavGroups, type NavGroupId } from "@/lib/dashboard-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logo from "@/assets/logo";

const GROUP_LABEL_KEYS: Record<
  NavGroupId,
  keyof typeof import("@/lib/i18n/ar").ar.navGroups
> = {
  overview: "overview",
  workshop: "workshop",
  catalog: "catalog",
  administration: "administration",
};

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, logout, hasPermission } = useAuth();

  const navContext = React.useMemo(
    () => ({
      user,
      hasPermission,
    }),
    [user, hasPermission],
  );

  const groups = React.useMemo(
    () => getVisibleNavGroups(navContext),
    [navContext],
  );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Logo size={32} />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold">{t.app.name}</span>
            {user?.role && (
              <Badge
                variant="secondary"
                className="mt-1 w-fit max-w-full truncate text-[10px] font-normal"
              >
                {user.role}
              </Badge>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {groups.map((group) => (
          <SidebarGroup key={group.id} className="py-1">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t.navGroups[GROUP_LABEL_KEYS[group.id]]}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={t.nav[item.labelKey]}
                      >
                        <Link href={item.href}>
                          <Icon className="size-4 shrink-0" />
                          <span>{t.nav[item.labelKey]}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
                      {user ? getInitials(user.name) : "م"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col items-start text-sm group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">
                      {user?.name || "المستخدم"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground" dir="ltr">
                      {user?.phone}
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
                {hasPermission("settings", "read") && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="ml-2 size-4" />
                      {t.nav.settings}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
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
  );
}
