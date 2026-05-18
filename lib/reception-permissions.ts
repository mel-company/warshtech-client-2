import type { Permission } from "@/types";

/** اسم الدور الافتراضي في الباك إند */
export const RECEPTIONIST_ROLE_NAMES = [
  "موظف استقبال",
  "استقبال السيارات",
  "Receptionist",
  "Reception",
] as const;

/** صلاحيات موظف الاستقبال — انسخها لدور في الباك إند */
export const RECEPTIONIST_PERMISSIONS: Permission[] = [
  "CUSTOMERS_READ",
  "CUSTOMERS_WRITE",
  "PRODUCTS_READ",
  "SERVICES_READ",
  "INVOICES_READ",
  "INVOICES_WRITE",
];

const RECEPTION_READ_SET: Permission[] = [
  "CUSTOMERS_READ",
  "PRODUCTS_READ",
  "SERVICES_READ",
  "INVOICES_READ",
];

export function hasReceptionistPermissions(permissions: string[]): boolean {
  return RECEPTIONIST_PERMISSIONS.every((p) => permissions.includes(p));
}

export function hasReceptionistReadAccess(permissions: string[]): boolean {
  return RECEPTION_READ_SET.every((p) => permissions.includes(p));
}

export type ReceptionPermissionLevel = "none" | "read" | "write";

export function getReceptionBundleLevel(
  permissions: Permission[],
): ReceptionPermissionLevel {
  if (hasReceptionistPermissions(permissions)) return "write";
  if (hasReceptionistReadAccess(permissions)) return "read";
  const any = RECEPTIONIST_PERMISSIONS.some((p) => permissions.includes(p));
  return any ? "read" : "none";
}

export function applyReceptionBundleLevel(
  permissions: Permission[],
  level: ReceptionPermissionLevel,
): Permission[] {
  const rest = permissions.filter((p) => !RECEPTIONIST_PERMISSIONS.includes(p));
  if (level === "none") return rest;
  if (level === "read") {
    return [...new Set([...rest, ...RECEPTION_READ_SET])];
  }
  return [...new Set([...rest, ...RECEPTIONIST_PERMISSIONS])];
}

export function findReceptionistRoleId(
  roles: { id: string; name: string }[],
): string | null {
  const match = roles.find((r) =>
    RECEPTIONIST_ROLE_NAMES.some(
      (n) => r.name.toLowerCase() === n.toLowerCase(),
    ),
  );
  return match?.id ?? null;
}
