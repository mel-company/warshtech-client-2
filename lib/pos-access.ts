import type { AuthUser } from "@/types";

export {
  isReceptionistUser,
  canAccessReception,
  getPostLoginPath,
  RECEPTIONIST_PATHS,
  ACCOUNTANT_PATHS,
} from "@/lib/reception-access";

/** مستخدم محاسب — يرى نقطة البيع فقط */
export function isAccountantUser(user: AuthUser | null): boolean {
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

export function canAccessPos(user: AuthUser | null): boolean {
  return isAccountantUser(user);
}
