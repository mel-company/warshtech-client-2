import type { AuthUser } from "@/types";
import { canAccessAdminDashboard } from "@/lib/user-capabilities";

/** إدارة الشركات — Owner / مدير النظام، أو دور بـ COMPANIES_WRITE */
export function canManageCompanies(user: AuthUser | null): boolean {
  if (!user) return false;
  if (canAccessAdminDashboard(user)) return true;
  return user.permissions.includes("COMPANIES_WRITE");
}

/** اختيار شركة في POS — للكاشير (COMPANIES_READ)، مو للأدmin */
export function canPickCompanyInPos(user: AuthUser | null): boolean {
  if (!user) return false;
  if (canAccessAdminDashboard(user)) return false;
  return (
    user.permissions.includes("COMPANIES_READ") ||
    user.permissions.includes("COMPANIES_WRITE")
  );
}
