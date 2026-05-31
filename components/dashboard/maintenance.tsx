"use client";

import * as React from "react";
import {
  AlertTriangle,
  CalendarClock,
  Clock,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { fetchUpcomingMaintenance } from "@/lib/maintenance-api";
import { triggerMaintenanceScan } from "@/lib/notifications-api";
import type { MaintenanceFilter, MaintenanceUrgency, VehicleMaintenance } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const FILTERS: MaintenanceFilter[] = ["overdue", "week", "month"];

const URGENCY_BADGE: Record<
  MaintenanceUrgency,
  { variant: "destructive" | "secondary" | "outline"; className?: string }
> = {
  overdue: { variant: "destructive" },
  due_soon: {
    variant: "secondary",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  },
  ok: {
    variant: "secondary",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  },
  unknown: { variant: "outline" },
};

function MaintenanceRow({ item, locale, t }: {
  item: VehicleMaintenance;
  locale: string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const badge = URGENCY_BADGE[item.urgency];
  const customer = item.customer;

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">
              {item.car?.name ?? "—"} · {item.car?.number ?? "—"}
            </p>
            <Badge variant={badge.variant} className={badge.className}>
              {t.maintenance.urgency[item.urgency]}
            </Badge>
          </div>
          {customer && (
            <p className="text-sm text-muted-foreground">
              {customer.name} · {customer.phone}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {item.daysRemaining != null && (
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3" />
                {item.daysRemaining < 0
                  ? t.maintenance.overdueDays.replace(
                      "{days}",
                      String(Math.abs(item.daysRemaining)),
                    )
                  : t.maintenance.daysRemaining.replace(
                      "{days}",
                      String(item.daysRemaining),
                    )}
              </span>
            )}
            {item.kmRemaining != null && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {item.kmRemaining < 0
                  ? t.maintenance.overdueKm.replace(
                      "{km}",
                      Math.abs(item.kmRemaining).toLocaleString(locale),
                    )
                  : t.maintenance.kmRemaining.replace(
                      "{km}",
                      item.kmRemaining.toLocaleString(locale),
                    )}
              </span>
            )}
          </div>
        </div>
        {item.nextServiceDate && (
          <div className="text-end text-xs text-muted-foreground">
            <p>{t.maintenance.nextService}</p>
            <p className="font-medium text-foreground">
              {new Date(item.nextServiceDate).toLocaleDateString(
                locale === "ar" ? "ar-IQ" : "en-IQ",
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MaintenancePage() {
  const { t, locale } = useTranslation();
  const { hasPermission } = useAuth();
  const canScan = hasPermission("settings", "write");

  const [filter, setFilter] = React.useState<MaintenanceFilter>("overdue");
  const [items, setItems] = React.useState<VehicleMaintenance[]>([]);
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isScanning, setIsScanning] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchUpcomingMaintenance(filter);
      setItems(result.data);
    } catch {
      toast.error(t.messages.error.fetchFailed);
    } finally {
      setIsLoading(false);
    }
  }, [filter, t.messages.error.fetchFailed]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = [
        item.car?.name,
        item.car?.number,
        item.car?.model,
        item.customer?.name,
        item.customer?.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search]);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const result = await triggerMaintenanceScan();
      toast.success(
        t.maintenancePage.scanDone.replace("{count}", String(result.created)),
      );
      await load();
    } catch {
      toast.error(t.messages.error.general);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.maintenancePage.title}</h2>
          <p className="text-muted-foreground">{t.maintenancePage.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={isLoading}>
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            <span className="ms-2">{t.actions.refresh}</span>
          </Button>
          {canScan && (
            <Button size="sm" onClick={() => void handleScan()} disabled={isScanning}>
              {isScanning ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <AlertTriangle className="size-4" />
              )}
              <span className="ms-2">{t.maintenancePage.runScan}</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.maintenancePage.searchPlaceholder}
            className="pe-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {t.maintenancePage.filters[f]}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarClock className="size-14 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium">{t.maintenancePage.empty}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t.maintenancePage.emptyHint}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t.maintenancePage.count.replace("{count}", String(filtered.length))}
          </p>
          {filtered.map((item) => (
            <MaintenanceRow key={item.id} item={item} locale={locale} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
