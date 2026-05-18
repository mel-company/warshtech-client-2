import type { AuthUser } from "@/types";

/** موظف استقبال — استقبال السيارات وإدخال الخدمة */
export function isReceptionistUser(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.role === "Owner") return false;

  const position = (user.position || "").toLowerCase();
  const role = (user.role || "").toLowerCase();

  return (
    position === "receptionist" ||
    role === "receptionist" ||
    role.includes("استقبال")
  );
}

export function isWorkshopStaffUser(user: AuthUser | null): boolean {
  return isReceptionistUser(user) || isAccountantUser(user);
}

function isAccountantUser(user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.role === "Owner") return false;
  const position = (user.position || "").toLowerCase();
  const role = (user.role || "").toLowerCase();
  return (
    position === "accountant" ||
    role === "accountant" ||
    role.includes("محاسب")
  );
}

export function canAccessReception(user: AuthUser | null): boolean {
  return isReceptionistUser(user);
}

export const RECEPTIONIST_PATHS = [
  "/dashboard/reception",
  "/dashboard/active-service",
] as const;

export const ACCOUNTANT_PATHS = [
  "/dashboard/pos",
  "/dashboard/active-service",
] as const;

export function getPostLoginPath(user: AuthUser | null): string {
  if (isReceptionistUser(user)) return "/dashboard/reception";
  if (isAccountantUser(user)) return "/dashboard/pos";
  return "/dashboard";
}
