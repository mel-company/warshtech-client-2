"use client";

import * as React from "react";
import {
  Droplets,
  Wrench,
  Package,
  Search,
  CircleDot,
  Loader2,
  User,
  Gauge,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { fetchVehicleEvents } from "@/lib/vehicle-events-api";
import { REALTIME_EVENTS, useRealtimeEvent } from "@/lib/realtime";
import { normalizeVehicleEvent } from "@/lib/realtime/normalize";
import type { VehicleServiceEvent, VehicleServiceEventType } from "@/types";

const TYPE_ICONS: Record<VehicleServiceEventType, LucideIcon> = {
  OIL_CHANGE: Droplets,
  REPAIR: Wrench,
  PARTS_REPLACEMENT: Package,
  INSPECTION: Search,
  GENERAL_SERVICE: CircleDot,
  OTHER: CircleDot,
};

const TYPE_COLORS: Record<VehicleServiceEventType, string> = {
  OIL_CHANGE: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  REPAIR: "bg-red-500/10 text-red-600 border-red-500/20",
  PARTS_REPLACEMENT: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  INSPECTION: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  GENERAL_SERVICE: "bg-primary/10 text-primary border-primary/20",
  OTHER: "bg-muted text-muted-foreground border-border",
};

function formatEventDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale.startsWith("ar") ? "ar-IQ" : "en-IQ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface VehicleTimelineProps {
  carId: string;
  className?: string;
}

export function VehicleTimeline({ carId, className }: VehicleTimelineProps) {
  const { t, locale } = useTranslation();
  const [events, setEvents] = React.useState<VehicleServiceEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(false);
        const response = await fetchVehicleEvents(carId);
        if (!cancelled) {
          setEvents(response.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setEvents([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [carId]);

  useRealtimeEvent<VehicleServiceEvent>(
    REALTIME_EVENTS.VEHICLE_EVENT_CREATED,
    (data) => {
      const event = normalizeVehicleEvent(data);
      if (event.carId !== carId) return;
      setEvents((prev) => {
        if (prev.some((item) => item.id === event.id)) return prev;
        return [event, ...prev];
      });
      setError(false);
      setIsLoading(false);
    },
  );

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground", className)}>
        <Loader2 className="size-4 animate-spin" />
        {t.common.loading}
      </div>
    );
  }

  if (error) {
    return (
      <p className={cn("py-4 text-center text-sm text-destructive", className)}>
        {t.messages.error.fetchFailed}
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className={cn("py-4 text-center text-sm text-muted-foreground", className)}>
        {t.vehicleEvents.empty}
      </p>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, index) => {
        const Icon = TYPE_ICONS[event.type];
        const typeLabel = t.vehicleEvents.types[event.type];

        return (
          <div key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
            {index < events.length - 1 && (
              <span
                className="absolute start-[15px] top-8 bottom-0 w-px bg-border"
                aria-hidden
              />
            )}

            <div
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
                TYPE_COLORS[event.type],
              )}
            >
              <Icon className="size-3.5" />
            </div>

            <div className="min-w-0 flex-1 space-y-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium leading-tight">{event.title}</span>
                <span className="rounded-md border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {typeLabel}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                {formatEventDate(event.createdAt, locale)}
              </p>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {event.user?.name && (
                  <span className="inline-flex items-center gap-1">
                    <User className="size-3" />
                    {event.user.name}
                  </span>
                )}
                {event.mileage != null && (
                  <span className="inline-flex items-center gap-1" dir="ltr">
                    <Gauge className="size-3" />
                    {event.mileage.toLocaleString()} km
                  </span>
                )}
                {event.invoice?.invoiceNumber && (
                  <span className="inline-flex items-center gap-1">
                    <FileText className="size-3" />
                    {event.invoice.invoiceNumber}
                  </span>
                )}
              </div>

              {event.notes && (
                <p className="text-xs text-muted-foreground/80 line-clamp-2">
                  {event.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
