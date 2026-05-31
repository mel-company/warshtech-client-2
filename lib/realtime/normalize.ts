import type { AppNotification } from "@/types";

export function normalizeNotification(
  data: AppNotification & { createdAt?: string | Date; readAt?: string | Date | null },
): AppNotification {
  return {
    ...data,
    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : new Date(data.createdAt ?? Date.now()).toISOString(),
    readAt: data.readAt
      ? typeof data.readAt === "string"
        ? data.readAt
        : new Date(data.readAt).toISOString()
      : null,
  };
}

export function normalizeVehicleEvent<T extends { createdAt?: string | Date }>(
  data: T,
): T & { createdAt: string } {
  return {
    ...data,
    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : new Date(data.createdAt ?? Date.now()).toISOString(),
  };
}
