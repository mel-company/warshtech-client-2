import apiClient from "@/lib/api";
import type { AppNotification } from "@/types";

export async function fetchNotifications(options?: {
  unreadOnly?: boolean;
  take?: number;
}) {
  const params = new URLSearchParams();
  if (options?.unreadOnly) params.set("unreadOnly", "true");
  if (options?.take != null) params.set("take", String(options.take));
  const query = params.toString();
  return apiClient.get<{
    data: AppNotification[];
    total: number;
    unreadCount: number;
  }>(`/notifications${query ? `?${query}` : ""}`);
}

export async function fetchUnreadNotificationCount() {
  return apiClient.get<{ count: number }>("/notifications/unread-count");
}

export async function markNotificationRead(id: string) {
  return apiClient.patch<AppNotification>(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  return apiClient.patch<{ updated: number }>("/notifications/read-all");
}

export async function triggerMaintenanceScan() {
  return apiClient.post<{ created: number; tenants: number }>(
    "/notifications/scan-maintenance",
  );
}
