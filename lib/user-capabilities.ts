/**
 * قدرات الواجهة — تُشتق من `user.permissions` فقط (من role.permissions في DB).
 * `position` واسم الدور للعرض/التقارير — لا يفتحان صفحات إضافية.
 * Owner: استثناء كامل.
 */
import type { AuthUser } from "@/types";
import {
  hasReceptionistReadAccess,
  hasReceptionistPermissions,
} from "@/lib/reception-permissions";
import {
  buildNavContextFromUser,
  getDefaultNavPath,
} from "@/lib/dashboard-nav";
import {
  hasPosNavAccess,
  hasPosSellAccess,
} from "@/lib/pos-permissions";

/** مسارات واجهة الموظف (استقبال / نقطة بيع / تحت الصيانة) */
export const STAFF_PATH_PREFIXES = [
  "/dashboard/reception",
  "/dashboard/pos",
  "/dashboard/active-service",
] as const;

export function hasPerm(user: AuthUser | null, perm: string): boolean {
  if (!user) return false;
  if (user.role === "Owner") return true;
  return user.permissions.includes(perm);
}

/** استقبال: حزمة كاملة أو الحد الأدنى (عملاء + فواتير + خدمات/منتجات) */
export function canAccessReception(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.role === "Owner") return true;
  if (hasReceptionistReadAccess(user.permissions)) return true;
  if (hasReceptionistPermissions(user.permissions)) return true;
  return (
    hasPerm(user, "CUSTOMERS_READ") &&
    hasPerm(user, "INVOICES_READ") &&
    (hasPerm(user, "SERVICES_READ") || hasPerm(user, "PRODUCTS_READ"))
  );
}

/** نقطة البيع — ظهور في القائمة */
export function canAccessPos(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.role === "Owner") return true;
  return hasPosNavAccess(user.permissions ?? [], user.role);
}

/** إتمام بيع من POS */
export function canSellFromPos(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.role === "Owner") return true;
  return hasPosSellAccess(user.permissions ?? []);
}

/** تحت الصيانة: صلاحية فواتير */
export function canAccessActiveService(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.role === "Owner") return true;
  return (
    hasPerm(user, "INVOICES_READ") ||
    hasPerm(user, "INVOICES_WRITE")
  );
}

/** إدارة المخزن / المنتجات */
export function canAccessInventory(user: AuthUser | null): boolean {
  return hasPerm(user, "PRODUCTS_READ") || hasPerm(user, "PRODUCTS_WRITE");
}

export function getStaffPaths(user: AuthUser | null): string[] {
  if (!user) return [];
  const paths: string[] = [];
  if (canAccessReception(user)) paths.push("/dashboard/reception");
  if (canAccessPos(user)) paths.push("/dashboard/pos");
  if (canAccessActiveService(user)) paths.push("/dashboard/active-service");
  return paths;
}

/** لوحة إحصائيات الإدارة — للمالك ومديري النظام فقط */
export function canAccessAdminDashboard(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.role === "Owner") return true;
  const management = [
    "USERS_READ",
    "USERS_WRITE",
    "ROLES_READ",
    "ROLES_WRITE",
    "EMPLOYEES_READ",
    "EMPLOYEES_WRITE",
    "SETTINGS_READ",
    "SETTINGS_WRITE",
  ] as const;
  return management.some((p) => user.permissions.includes(p));
}

/** صلاحيات بيانات التشغيل (عملاء، مخزن، فواتير…) */
export function hasOperationalAccess(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.role === "Owner") return true;
  const ops = [
    "CUSTOMERS_READ",
    "CUSTOMERS_WRITE",
    "PRODUCTS_READ",
    "PRODUCTS_WRITE",
    "SERVICES_READ",
    "SERVICES_WRITE",
    "INVOICES_READ",
    "INVOICES_WRITE",
  ] as const;
  return ops.some((p) => user.permissions.includes(p));
}

/** موظف ورشة فقط — استقبال/بيع بدون صفحات بيانات أو إدارة */
export function isStaffOnlyUser(user: AuthUser | null): boolean {
  if (!user || user.role === "Owner") return false;
  const staff = getStaffPaths(user).length > 0;
  return staff && !hasOperationalAccess(user) && !canAccessAdminDashboard(user);
}

/** صفحة رئيسية مختصرة بروابط صفحات المستخدم (بدون إحصائيات الإدارة) */
export function canAccessWorkspaceHome(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.role === "Owner") return false;
  if (canAccessAdminDashboard(user)) return false;
  if (isStaffOnlyUser(user)) return false;
  return hasOperationalAccess(user);
}

export function isStaffPath(pathname: string): boolean {
  return STAFF_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}

export function canAccessStaffPath(
  user: AuthUser | null,
  pathname: string,
): boolean {
  if (!user) return false;
  if (pathname.startsWith("/dashboard/reception")) return canAccessReception(user);
  if (pathname.startsWith("/dashboard/pos")) return canAccessPos(user);
  if (pathname.startsWith("/dashboard/active-service")) {
    return canAccessActiveService(user);
  }
  return false;
}

export function getPostLoginPath(user: AuthUser | null): string {
  if (!user) return "/user-login";
  return getDefaultNavPath(buildNavContextFromUser(user));
}

export function describeUserCapabilities(user: AuthUser | null): string[] {
  if (!user) return [];
  if (user.role === "Owner") return ["owner"];
  const labels: string[] = [];
  if (canAccessReception(user)) labels.push("reception");
  if (canAccessPos(user)) labels.push("pos");
  if (canAccessInventory(user)) labels.push("inventory");
  if (hasReceptionistPermissions(user.permissions)) labels.push("reception-write");
  if (canAccessAdminDashboard(user)) labels.push("admin-dashboard");
  if (canAccessWorkspaceHome(user)) labels.push("workspace-home");
  return labels;
}
