export function getRealtimeBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

export const REALTIME_NAMESPACE = "/realtime";

export const REALTIME_EVENTS = {
  NOTIFICATION_CREATED: "notification:created",
  NOTIFICATION_UPDATED: "notification:updated",
  NOTIFICATIONS_REFRESH: "notifications:refresh",
  VEHICLE_EVENT_CREATED: "vehicle-event:created",
  MAINTENANCE_UPDATED: "maintenance:updated",
} as const;

export type RealtimeEventName =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];
