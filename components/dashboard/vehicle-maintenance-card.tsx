"use client";

import * as React from "react";
import {
  Calendar,
  Gauge,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { fetchVehicleMaintenance } from "@/lib/maintenance-api";
import { REALTIME_EVENTS, useRealtimeEvent } from "@/lib/realtime";
import type { MaintenanceUrgency, VehicleMaintenance } from "@/types";

const URGENCY_STYLES: Record<
  MaintenanceUrgency,
  { border: string; bg: string; icon: typeof CheckCircle2 }
> = {
  overdue: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    icon: AlertTriangle,
  },
  due_soon: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    icon: Clock,
  },
  ok: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    icon: CheckCircle2,
  },
  unknown: {
    border: "border-border",
    bg: "bg-muted/30",
    icon: Clock,
  },
};

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-IQ" : "en-IQ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatKm(value: number, locale: string): string {
  return value.toLocaleString(locale === "ar" ? "ar-IQ" : "en-IQ");
}

function formatRemainingDays(
  days: number | null,
  t: ReturnType<typeof useTranslation>["t"],
): string | null {
  if (days == null) return null;
  if (days < 0) {
    return t.maintenance.overdueDays.replace("{days}", String(Math.abs(days)));
  }
  if (days === 0) return t.maintenance.dueToday;
  return t.maintenance.daysRemaining.replace("{days}", String(days));
}

function formatRemainingKm(
  km: number | null,
  locale: string,
  t: ReturnType<typeof useTranslation>["t"],
): string | null {
  if (km == null) return null;
  if (km < 0) {
    return t.maintenance.overdueKm.replace(
      "{km}",
      formatKm(Math.abs(km), locale),
    );
  }
  return t.maintenance.kmRemaining.replace("{km}", formatKm(km, locale));
}

interface VehicleMaintenanceCardProps {
  carId: string;
  className?: string;
}

export function VehicleMaintenanceCard({
  carId,
  className,
}: VehicleMaintenanceCardProps) {
  const { t, locale } = useTranslation();
  const [data, setData] = React.useState<VehicleMaintenance | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(false);

    fetchVehicleMaintenance(carId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [carId]);

  useRealtimeEvent<VehicleMaintenance>(
    REALTIME_EVENTS.MAINTENANCE_UPDATED,
    (payload) => {
      if (payload.carId !== carId) return;
      setData(payload);
      setError(false);
      setIsLoading(false);
    },
  );

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-dashed p-4",
          className,
        )}
      >
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const styles = URGENCY_STYLES[data.urgency];
  const UrgencyIcon = styles.icon;
  const daysText = formatRemainingDays(data.daysRemaining, t);
  const kmText = formatRemainingKm(data.kmRemaining, locale, t);
  const hasSchedule = data.nextServiceDate || data.nextServiceMileage != null;

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        styles.border,
        styles.bg,
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold">{t.maintenance.title}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
            data.urgency === "overdue" && "bg-red-500/10 text-red-600",
            data.urgency === "due_soon" && "bg-amber-500/10 text-amber-600",
            data.urgency === "ok" && "bg-emerald-500/10 text-emerald-600",
            data.urgency === "unknown" && "bg-muted text-muted-foreground",
          )}
        >
          <UrgencyIcon className="size-3" />
          {t.maintenance.urgency[data.urgency]}
        </span>
      </div>

      <div className="grid gap-2 text-xs">
        {data.lastServiceDate && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">
              {t.maintenance.lastService}
            </span>
            <span className="font-medium">
              {formatDate(data.lastServiceDate, locale)}
              {data.lastServiceMileage != null && (
                <span className="ms-1 text-muted-foreground">
                  · {formatKm(data.lastServiceMileage, locale)} km
                </span>
              )}
            </span>
          </div>
        )}

        {data.currentMileage != null && (
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Gauge className="size-3" />
              {t.maintenance.currentMileage}
            </span>
            <span className="font-medium">
              {formatKm(data.currentMileage, locale)} km
            </span>
          </div>
        )}

        {hasSchedule ? (
          <div className="mt-1 space-y-1.5 rounded-md bg-background/60 p-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {t.maintenance.nextService}
            </p>
            {daysText && (
              <p className="flex items-center gap-1.5 font-medium">
                <Calendar className="size-3.5 shrink-0 text-primary" />
                {daysText}
              </p>
            )}
            {kmText && (
              <p className="flex items-center gap-1.5 font-medium">
                <Gauge className="size-3.5 shrink-0 text-primary" />
                {kmText}
              </p>
            )}
            {!daysText && !kmText && (
              <p className="text-muted-foreground">{t.maintenance.noSchedule}</p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">{t.maintenance.noScheduleYet}</p>
        )}
      </div>
    </div>
  );
}
