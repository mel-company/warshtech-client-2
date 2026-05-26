import type { AuthUser } from "@/types";
import {
  canAccessPos,
  canAccessReception,
  getPostLoginPath,
  getStaffPaths,
  isStaffOnlyUser,
} from "@/lib/user-capabilities";

export {
  canAccessPos,
  canAccessReception,
  getPostLoginPath,
  getStaffPaths,
  isStaffOnlyUser,
};

export { isReceptionistUser } from "@/lib/reception-access";

/** @deprecated استخدم canAccessPos */
export function isAccountantUser(user: AuthUser | null): boolean {
  return canAccessPos(user);
}

export const RECEPTIONIST_PATHS = [
  "/dashboard/reception",
  "/dashboard/active-service",
] as const;

export const ACCOUNTANT_PATHS = [
  "/dashboard/pos",
  "/dashboard/active-service",
] as const;
