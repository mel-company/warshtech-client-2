"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import {
  getVisibleNavGroups,
  type NavGroupId,
} from "@/lib/dashboard-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const GROUP_LABEL_KEYS: Record<
  NavGroupId,
  keyof typeof import("@/lib/i18n/ar").ar.navGroups
> = {
  overview: "overview",
  workshop: "workshop",
  catalog: "catalog",
  administration: "administration",
};

export function WorkspaceHome() {
  const { t } = useTranslation();
  const { user, hasPermission } = useAuth();

  const navContext = React.useMemo(
    () => ({ user, hasPermission }),
    [user, hasPermission],
  );

  const groups = React.useMemo(
    () =>
      getVisibleNavGroups(navContext).filter((g) => g.id !== "overview"),
    [navContext],
  );

  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t.workspaceHome.greeting.replace("{name}", firstName)}
        </h2>
        <p className="mt-1 text-muted-foreground">{t.workspaceHome.subtitle}</p>
        {user?.role && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t.workspaceHome.roleLabel}:{" "}
            <span className="font-medium text-foreground">{user.role}</span>
          </p>
        )}
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {t.workspaceHome.noAccess}
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t.navGroups[GROUP_LABEL_KEYS[group.id]]}
              </CardTitle>
              <CardDescription>{t.workspaceHome.pickTask}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{t.nav[item.labelKey]}</p>
                    </div>
                    <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
