import type { AuthUser } from "@/types";
import { canAccessAdminDashboard } from "@/lib/user-capabilities";

/** إدارة الشركات — Owner / مدير النظام، أو دور بـ COMPANIES_WRITE */
export function canManageCompanies(user: AuthUser | null): boolean {
  if (!user) return false;
  if (canAccessAdminDashboard(user)) return true;
  return user.permissions.includes("COMPANIES_WRITE");
}

/** اختيار شركة في نقطة البيع — يظهر لكل مستخدم داخل الصفحة */
export function canPickCompanyInPos(user: AuthUser | null): boolean {
  return Boolean(user);
}
