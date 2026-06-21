import type { Permission } from "@/types";

/**
 * صلاحيات نقطة البيع / محاسب — متوافقة مع `pos-permissions.ts` في الباك إند.
 * COMPANIES_READ: اختيار شركة في POS فقط (بدون COMPANIES_WRITE).
 */
export const POS_PERMISSIONS: Permission[] = [
  "CUSTOMERS_READ",
  "CUSTOMERS_WRITE",
  "COMPANIES_READ",
  "PRODUCTS_READ",
  "SERVICES_READ",
  "INVOICES_READ",
  "INVOICES_WRITE",
];

export const ACCOUNTANT_ROLE_NAMES = [
  "محاسب",
  "محاسب / نقطة بيع",
  "Accountant",
  "Accountant / POS",
] as const;

export const CASHIER_ROLE_NAMES = [
  "كاشير",
  "Cashier",
  "نقطة البيع",
  "Point of Sale",
] as const;

export const POS_ROLE_NAMES = [
  ...ACCOUNTANT_ROLE_NAMES,
  ...CASHIER_ROLE_NAMES,
] as const;

export function findAccountantRoleId(
  roles: { id: string; name: string }[],
): string | null {
  return findRoleIdByNames(roles, ACCOUNTANT_ROLE_NAMES);
}

export function findCashierRoleId(
  roles: { id: string; name: string }[],
): string | null {
  return findRoleIdByNames(roles, CASHIER_ROLE_NAMES);
}

export function findPosRoleId(
  roles: { id: string; name: string }[],
): string | null {
  return findRoleIdByNames(roles, POS_ROLE_NAMES);
}

function findRoleIdByNames(
  roles: { id: string; name: string }[],
  names: readonly string[],
): string | null {
  const match = roles.find((r) =>
    names.some((n) => r.name.toLowerCase() === n.toLowerCase()),
  );
  return match?.id ?? null;
}

export function isPosRoleName(role?: string | null): boolean {
  if (!role) return false;
  const r = role.trim().toLowerCase();
  if (POS_ROLE_NAMES.some((n) => r === n.toLowerCase())) return true;
  return (
    r.includes("محاسب") ||
    r.includes("كاشير") ||
    r.includes("accountant") ||
    r.includes("cashier")
  );
}

/** يظهر رابط POS في القائمة */
export function hasPosNavAccess(
  permissions: string[],
  role?: string | null,
): boolean {
  if (isPosRoleName(role)) return true;
  if (!permissions?.length) return false;
  if (permissions.includes("INVOICES_WRITE")) return true;
  return (
    permissions.includes("INVOICES_READ") &&
    (permissions.includes("PRODUCTS_READ") ||
      permissions.includes("SERVICES_READ") ||
      permissions.includes("PRODUCTS_WRITE") ||
      permissions.includes("SERVICES_WRITE"))
  );
}

/** يستطيع إتمام البيع (إنشاء فاتورة) */
export function hasPosSellAccess(permissions: string[]): boolean {
  if (!permissions?.length) return false;
  return permissions.includes("INVOICES_WRITE");
}

/** صلاحيات ناقصة لعمل POS بالكامل (للتنبيه في الواجهة والدور في DB) */
export function getPosPermissionGaps(permissions: string[]): string[] {
  const gaps: string[] = [];
  if (!permissions.includes("INVOICES_WRITE")) gaps.push("INVOICES_WRITE");
  if (
    !permissions.includes("PRODUCTS_READ") &&
    !permissions.includes("PRODUCTS_WRITE")
  ) {
    gaps.push("PRODUCTS_READ");
  }
  if (
    !permissions.includes("SERVICES_READ") &&
    !permissions.includes("SERVICES_WRITE")
  ) {
    gaps.push("SERVICES_READ");
  }
  if (
    !permissions.includes("CUSTOMERS_READ") &&
    !permissions.includes("CUSTOMERS_WRITE")
  ) {
    gaps.push("CUSTOMERS_READ");
  }
  if (!permissions.includes("COMPANIES_READ")) {
    gaps.push("COMPANIES_READ");
  }
  return gaps;
}
