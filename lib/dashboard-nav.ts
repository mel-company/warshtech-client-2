import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  UserRound,
  ShoppingCart,
  ClipboardList,
  FileText,
  Users,
  Package,
  Wrench,
  UserCog,
  Shield,
  Settings,
  BarChart3,
  CalendarClock,
} from "lucide-react";
import type { AuthUser } from "@/types";
import {
  canAccessReception,
  canAccessPos,
  canAccessActiveService,
  canAccessAdminDashboard,
  canAccessWorkspaceHome,
  canAccessReports,
} from "@/lib/user-capabilities";
import { hasPosNavAccess, hasPosSellAccess } from "@/lib/pos-permissions";
import {
  hasReceptionistPermissions,
  hasReceptionistReadAccess,
} from "@/lib/reception-permissions";

export type NavGroupId =
  | "overview"
  | "workshop"
  | "catalog"
  | "reports"
  | "administration";

export type NavLabelKey = keyof typeof import("@/lib/i18n/ar").ar.nav;

export interface NavContext {
  user: AuthUser | null;
  hasPermission: (resource: string, level: "read" | "write") => boolean;
}

export interface DashboardNavItem {
  id: string;
  href: string;
  icon: LucideIcon;
  labelKey: NavLabelKey;
  group: NavGroupId;
  isVisible: (ctx: NavContext) => boolean;
}

export const NAV_GROUP_ORDER: NavGroupId[] = [
  "overview",
  "workshop",
  "catalog",
  "reports",
  "administration",
];

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    id: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    labelKey: "dashboard",
    group: "overview",
    isVisible: ({ user }) => {
      if (!user) return false;
      if (user.role === "Owner") return true;
      return (
        canAccessAdminDashboard(user) || canAccessWorkspaceHome(user)
      );
    },
  },
  {
    id: "pos",
    href: "/dashboard/pos",
    icon: ShoppingCart,
    labelKey: "pos",
    group: "workshop",
    isVisible: ({ user }) => canAccessPos(user),
  },
  {
    id: "reception",
    href: "/dashboard/reception",
    icon: UserRound,
    labelKey: "reception",
    group: "workshop",
    isVisible: ({ user }) => canAccessReception(user),
  },
  {
    id: "active-service",
    href: "/dashboard/active-service",
    icon: ClipboardList,
    labelKey: "activeService",
    group: "workshop",
    isVisible: ({ user }) => canAccessActiveService(user),
  },
  {
    id: "maintenance",
    href: "/dashboard/maintenance",
    icon: CalendarClock,
    labelKey: "maintenance",
    group: "workshop",
    isVisible: ({ hasPermission }) => hasPermission("customers", "read"),
  },
  {
    id: "invoices",
    href: "/dashboard/invoices",
    icon: FileText,
    labelKey: "invoices",
    group: "workshop",
    isVisible: ({ hasPermission }) => hasPermission("invoices", "read"),
  },
  {
    id: "customers",
    href: "/dashboard/customers",
    icon: Users,
    labelKey: "customers",
    group: "catalog",
    isVisible: ({ hasPermission }) => hasPermission("customers", "read"),
  },
  {
    id: "products",
    href: "/dashboard/products",
    icon: Package,
    labelKey: "products",
    group: "catalog",
    isVisible: ({ hasPermission }) => hasPermission("products", "read"),
  },
  {
    id: "services",
    href: "/dashboard/services",
    icon: Wrench,
    labelKey: "services",
    group: "catalog",
    isVisible: ({ hasPermission }) => hasPermission("services", "read"),
  },
  {
    id: "reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    labelKey: "detailedReports",
    group: "reports",
    isVisible: ({ user }) => canAccessReports(user),
  },
  {
    id: "employees",
    href: "/dashboard/employees",
    icon: UserCog,
    labelKey: "employees",
    group: "administration",
    isVisible: ({ hasPermission }) => hasPermission("employees", "read"),
  },
  {
    id: "users",
    href: "/dashboard/users",
    icon: Users,
    labelKey: "users",
    group: "administration",
    isVisible: ({ hasPermission }) => hasPermission("users", "read"),
  },
  {
    id: "roles",
    href: "/dashboard/roles",
    icon: Shield,
    labelKey: "roles",
    group: "administration",
    isVisible: ({ hasPermission }) => hasPermission("roles", "read"),
  },
  {
    id: "settings",
    href: "/dashboard/settings",
    icon: Settings,
    labelKey: "settings",
    group: "administration",
    isVisible: ({ user, hasPermission }) => {
      if (!user) return false;
      if (user.role === "Owner") return true;
      return hasPermission("settings", "read");
    },
  },
];

export interface NavGroup {
  id: NavGroupId;
  items: DashboardNavItem[];
}

/** سياق تنقل من المستخدم فقط (لتسجيل الدخول قبل تحميل AuthProvider الكامل) */
export function buildNavContextFromUser(user: AuthUser | null): NavContext {
  return {
    user,
    hasPermission(resource, level) {
      if (!user) return false;
      if (user.role === "Owner") return true;

      if (resource === "reception") {
        if (level === "write") {
          return hasReceptionistPermissions(user.permissions);
        }
        return canAccessReception(user);
      }

      if (resource === "pos") {
        if (level === "write") return hasPosSellAccess(user.permissions ?? []);
        return hasPosNavAccess(user.permissions ?? [], user.role);
      }

      const resourceUpper = resource.toUpperCase();
      const readPerm = `${resourceUpper}_READ`;
      const writePerm = `${resourceUpper}_WRITE`;

      if (level === "read") {
        return (
          user.permissions.includes(readPerm) ||
          user.permissions.includes(writePerm)
        );
      }
      return user.permissions.includes(writePerm);
    },
  };
}

export function getVisibleNavGroups(ctx: NavContext): NavGroup[] {
  const byGroup = new Map<NavGroupId, DashboardNavItem[]>();

  for (const item of DASHBOARD_NAV_ITEMS) {
    if (!item.isVisible(ctx)) continue;
    const list = byGroup.get(item.group) ?? [];
    list.push(item);
    byGroup.set(item.group, list);
  }

  return NAV_GROUP_ORDER.filter((id) => byGroup.has(id)).map((id) => ({
    id,
    items: byGroup.get(id)!,
  }));
}

export function getVisibleNavItems(ctx: NavContext): DashboardNavItem[] {
  return getVisibleNavGroups(ctx).flatMap((g) => g.items);
}

export function findNavItemByPath(pathname: string): DashboardNavItem | undefined {
  const sorted = [...DASHBOARD_NAV_ITEMS].sort(
    (a, b) => b.href.length - a.href.length,
  );
  return sorted.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href)),
  );
}

export function canAccessPath(ctx: NavContext, pathname: string): boolean {
  if (!ctx.user) return false;
  if (ctx.user.role === "Owner") return true;
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return (
      canAccessAdminDashboard(ctx.user) ||
      canAccessWorkspaceHome(ctx.user)
    );
  }
  const item = findNavItemByPath(pathname);
  if (!item) return true;
  return item.isVisible(ctx);
}

export function getDefaultNavPath(ctx: NavContext): string {
  const user = ctx.user;
  if (!user) return "/user-login";
  if (user.role === "Owner" || canAccessAdminDashboard(user)) {
    return "/dashboard";
  }
  const items = getVisibleNavItems(ctx).filter((i) => i.id !== "dashboard");
  if (canAccessPos(user)) {
    const posItem = items.find((i) => i.id === "pos");
    if (posItem) return posItem.href;
  }
  return items[0]?.href ?? "/dashboard";
}
