"use client";

import * as React from "react";
import {
  Users,
  Package,
  Wrench,
  UserCog,
  Shield,
  FileText,
  Lock,
  CarFront,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type { Permission } from "@/types";
import {
  applyReceptionBundleLevel,
  getReceptionBundleLevel,
  type ReceptionPermissionLevel,
} from "@/lib/reception-permissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ResourceType =
  | "reception"
  | "customers"
  | "products"
  | "services"
  | "employees"
  | "users"
  | "invoices"
  | "settings";

type PermissionLevel = "none" | "read" | "write";

const resourceIcons: Record<ResourceType, React.ElementType> = {
  reception: CarFront,
  customers: Users,
  products: Package,
  services: Wrench,
  employees: UserCog,
  users: Shield,
  invoices: FileText,
  settings: Lock,
};

const resourcePermissionMap: Record<
  Exclude<ResourceType, "reception">,
  { read: Permission; write: Permission }
> = {
  customers: { read: "CUSTOMERS_READ", write: "CUSTOMERS_WRITE" },
  products: { read: "PRODUCTS_READ", write: "PRODUCTS_WRITE" },
  services: { read: "SERVICES_READ", write: "SERVICES_WRITE" },
  employees: { read: "EMPLOYEES_READ", write: "EMPLOYEES_WRITE" },
  users: { read: "USERS_READ", write: "USERS_WRITE" },
  invoices: { read: "INVOICES_READ", write: "INVOICES_WRITE" },
  settings: { read: "SETTINGS_READ", write: "SETTINGS_WRITE" },
};

const RESOURCE_ORDER: ResourceType[] = [
  "reception",
  "customers",
  "products",
  "services",
  "invoices",
  "employees",
  "users",
  "settings",
];

export interface PermissionGridProps {
  permissions: Permission[];
  onChange: (permissions: Permission[]) => void;
  readonly?: boolean;
}

export function PermissionGrid({
  permissions,
  onChange,
  readonly = false,
}: PermissionGridProps) {
  const { t } = useTranslation();
  const levels: PermissionLevel[] = ["none", "read", "write"];

  const getPermissionLevel = (resource: ResourceType): PermissionLevel => {
    if (resource === "reception") {
      return getReceptionBundleLevel(permissions);
    }
    const perms = resourcePermissionMap[resource];
    if (permissions.includes(perms.write)) return "write";
    if (permissions.includes(perms.read)) return "read";
    return "none";
  };

  const handleChange = (resource: ResourceType, level: PermissionLevel) => {
    if (readonly) return;
    if (resource === "reception") {
      onChange(
        applyReceptionBundleLevel(
          permissions,
          level as ReceptionPermissionLevel,
        ),
      );
      return;
    }
    const perms = resourcePermissionMap[resource];
    const newPermissions = permissions.filter(
      (p) => p !== perms.read && p !== perms.write,
    );
    if (level === "read") newPermissions.push(perms.read);
    if (level === "write") {
      newPermissions.push(perms.read);
      newPermissions.push(perms.write);
    }
    onChange(newPermissions);
  };

  return (
    <div className="space-y-3">
      {RESOURCE_ORDER.map((resource) => {
        const Icon = resourceIcons[resource];
        const currentLevel = getPermissionLevel(resource);
        const label =
          resource === "reception"
            ? t.users.permissions.reception
            : t.users.permissions[resource];

        return (
          <div
            key={resource}
            className={cn(
              "flex items-center justify-between gap-4 rounded-lg border bg-card p-3",
              resource === "reception" && "border-primary/30 bg-primary/5",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-md",
                  resource === "reception" ? "bg-primary/15" : "bg-muted",
                )}
              >
                <Icon
                  className={cn(
                    "size-4",
                    resource === "reception" && "text-primary",
                  )}
                />
              </div>
              <div>
                <span className="font-medium">{label}</span>
                {resource === "reception" && (
                  <p className="text-xs text-muted-foreground">
                    {t.users.permissions.receptionHint}
                  </p>
                )}
              </div>
            </div>
            <Select
              value={currentLevel}
              onValueChange={(v: PermissionLevel) =>
                handleChange(resource, v)
              }
              disabled={readonly}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {t.users.permissions[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
