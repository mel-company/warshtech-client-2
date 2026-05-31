"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import {
  REALTIME_EVENTS,
  useRealtimeEvent,
} from "@/lib/realtime";
import { normalizeNotification } from "@/lib/realtime/normalize";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications-api";
import type { AppNotification } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FALLBACK_POLL_MS = 5 * 60_000;

function formatRelativeTime(iso: string, locale: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return locale.startsWith("ar") ? "الآن" : "Just now";
  if (minutes < 60) {
    return locale.startsWith("ar") ? `منذ ${minutes} د` : `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return locale.startsWith("ar") ? `منذ ${hours} س` : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return locale.startsWith("ar") ? `منذ ${days} ي` : `${days}d ago`;
}

function NotificationItem({
  item,
  locale,
  onRead,
}: {
  item: AppNotification;
  locale: string;
  onRead: (id: string) => void;
}) {
  const isUnread = !item.readAt;
  const isOverdue = item.type === "MAINTENANCE_OVERDUE";

  return (
    <button
      type="button"
      onClick={() => {
        if (isUnread) onRead(item.id);
      }}
      className={cn(
        "w-full rounded-lg border p-3 text-start transition-colors hover:bg-muted/50",
        isUnread && "border-primary/20 bg-primary/5",
        isOverdue && isUnread && "border-red-500/20 bg-red-500/5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{item.title}</p>
        {isUnread && (
          <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{item.message}</p>
      <p className="mt-2 text-[10px] text-muted-foreground">
        {formatRelativeTime(item.createdAt, locale)}
      </p>
    </button>
  );
}

export function NotificationBell() {
  const { t, locale } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const result = await fetchNotifications({ take: 20 });
      setItems(result.data);
      setUnreadCount(result.unreadCount);
    } catch {
      // silent — bell is non-critical
    }
  }, []);

  React.useEffect(() => {
    void load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, FALLBACK_POLL_MS);
    return () => window.clearInterval(interval);
  }, [load]);

  React.useEffect(() => {
    if (open) {
      setIsLoading(true);
      void load().finally(() => setIsLoading(false));
    }
  }, [open, load]);

  useRealtimeEvent<AppNotification>(
    REALTIME_EVENTS.NOTIFICATION_CREATED,
    (data) => {
      const notification = normalizeNotification(data);
      setItems((prev) => {
        if (prev.some((item) => item.id === notification.id)) return prev;
        return [notification, ...prev].slice(0, 20);
      });
      if (!notification.readAt) {
        setUnreadCount((count) => count + 1);
      }
      toast.info(notification.title, { description: notification.message });
    },
  );

  useRealtimeEvent<AppNotification>(
    REALTIME_EVENTS.NOTIFICATION_UPDATED,
    (data) => {
      const notification = normalizeNotification(data);
      setItems((prev) => {
        const wasUnread = prev.find((item) => item.id === notification.id && !item.readAt);
        const next = prev.map((item) =>
          item.id === notification.id ? notification : item,
        );
        if (wasUnread && notification.readAt) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return next;
      });
    },
  );

  useRealtimeEvent(REALTIME_EVENTS.NOTIFICATIONS_REFRESH, () => {
    void load();
  });

  const handleRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        ),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error(t.messages.error.general);
    }
  };

  const handleMarkAll = async () => {
    setIsMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          readAt: item.readAt ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch {
      toast.error(t.messages.error.general);
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-9">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
              <span className="sr-only">{t.notifications.title}</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t.notifications.title}</TooltipContent>
      </Tooltip>

      <PopoverContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">{t.notifications.title}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              disabled={isMarkingAll}
              onClick={() => void handleMarkAll()}
            >
              {isMarkingAll ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <CheckCheck className="size-3" />
              )}
              {t.notifications.markAllRead}
            </Button>
          )}
        </div>

        <div className="max-h-80 space-y-2 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t.notifications.empty}
            </p>
          ) : (
            items.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                locale={locale}
                onRead={(id) => void handleRead(id)}
              />
            ))
          )}
        </div>

        <div className="border-t p-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => setOpen(false)}
          >
            <Link href="/dashboard/maintenance">{t.notifications.viewAll}</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
