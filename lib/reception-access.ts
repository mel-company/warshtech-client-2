import type { AuthUser } from "@/types";
import {
  canAccessReception,
  canAccessPos,
  getStaffPaths,
  getPostLoginPath,
  isStaffOnlyUser,
  canAccessStaffPath,
  STAFF_PATH_PREFIXES,
} from "@/lib/user-capabilities";

export {
  canAccessReception,
  canAccessPos,
  getStaffPaths,
  getPostLoginPath,
  isStaffOnlyUser,
  canAccessStaffPath,
  STAFF_PATH_PREFIXES,
};

/** @deprecated استخدم canAccessReception */
export function isReceptionistUser(user: AuthUser | null): boolean {
  return canAccessReception(user);
}

export function isWorkshopStaffUser(user: AuthUser | null): boolean {
  return canAccessReception(user) || canAccessPos(user);
}

export const RECEPTIONIST_PATHS = [
  "/dashboard/reception",
  "/dashboard/active-service",
] as const;

export const ACCOUNTANT_PATHS = [
  "/dashboard/pos",
  "/dashboard/active-service",
] as const;
