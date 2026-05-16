"use client";

import * as React from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  Users,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import apiClient from "@/lib/api";
import type { Role, Permission } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveModal, ConfirmDialog } from "@/components/responsive-modal";

// =============================================================================
// Permission Grid Component (reused from users.tsx)
// =============================================================================

interface PermissionGridProps {
  permissions: Permission[];
  onChange: (permissions: Permission[]) => void;
  readonly?: boolean;
}

type ResourceType =
  | "customers"
  | "products"
  | "services"
  | "employees"
  | "users"
  | "invoices"
  | "settings";

type PermissionLevel = "none" | "read" | "write";

const resourceIcons: Record<ResourceType, React.ElementType> = {
  customers: Users,
  products: Shield,
  services: Shield,
  employees: Users,
  users: Shield,
  invoices: Shield,
  settings: Lock,
};

const resourcePermissionMap: Record<
  ResourceType,
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

function PermissionGrid({
  permissions,
  onChange,
  readonly = false,
}: PermissionGridProps) {
  const { t } = useTranslation();
  const resources: ResourceType[] = [
    "customers",
    "products",
    "services",
    "employees",
    "users",
    "invoices",
    "settings",
  ];
  const levels: PermissionLevel[] = ["none", "read", "write"];

  const getPermissionLevel = (resource: ResourceType): PermissionLevel => {
    const perms = resourcePermissionMap[resource];
    if (permissions.includes(perms.write)) return "write";
    if (permissions.includes(perms.read)) return "read";
    return "none";
  };

  const handleChange = (resource: ResourceType, level: PermissionLevel) => {
    if (readonly) return;
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
      {resources.map((resource) => {
        const Icon = resourceIcons[resource];
        const currentLevel = getPermissionLevel(resource);
        return (
          <div
            key={resource}
            className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                <Icon className="size-4" />
              </div>
              <span className="font-medium">
                {t.users.permissions[resource]}
              </span>
            </div>
            {readonly ? (
              <Badge
                variant={currentLevel === "none" ? "secondary" : "default"}
                className={cn(
                  currentLevel === "write" &&
                  "bg-success/10 text-success border-success/20",
                  currentLevel === "read" &&
                  "bg-chart-3/10 text-chart-3 border-chart-3/20",
                  currentLevel === "none" && "bg-muted text-muted-foreground",
                )}
              >
                {t.users.permissions[currentLevel]}
              </Badge>
            ) : (
              <select
                value={currentLevel}
                onChange={(e) => handleChange(resource, e.target.value as PermissionLevel)}
                className="w-[140px] h-9 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {t.users.permissions[level]}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Role Form Component
// =============================================================================

interface RoleFormProps {
  role?: Role;
  onSubmit: (data: { name: string; permissions: Permission[] }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function RoleForm({ role, onSubmit, onCancel, isLoading }: RoleFormProps) {
  const { t } = useTranslation();
  const [name, setName] = React.useState(role?.name || "");
  const [permissions, setPermissions] = React.useState<Permission[]>(
    role?.permissions || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t.validation.required);
      return;
    }
    onSubmit({ name, permissions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">{t.labels.name}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم الدور"
          required
        />
      </div>

      <div className="space-y-4">
        <Label>{t.users.permissions.title}</Label>
        <PermissionGrid permissions={permissions} onChange={setPermissions} />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? t.messages.loading : t.actions.save}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t.actions.cancel}
        </Button>
      </div>
    </form>
  );
}

// =============================================================================
// Main Roles Page Component
// =============================================================================

export function RolesPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("roles", "write");
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | undefined>();
  const [deletingRole, setDeletingRole] = React.useState<Role | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);
  const [hasAccess, setHasAccess] = React.useState(true);

  const fetchRoles = React.useCallback(async () => {
    // Check if user has permission
    if (!hasPermission("roles", "read")) {
      setHasAccess(false);
      setIsFetching(false);
      return;
    }
    setHasAccess(true);
    try {
      setIsFetching(true);
      const data = await apiClient.get<Role[]>("/roles");
      setRoles(data || []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setRoles([]);
      // Don't show toast for permission errors
    } finally {
      setIsFetching(false);
    }
  }, [hasPermission]);

  React.useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const filteredRoles = React.useMemo(() => {
    if (!searchQuery) return roles;
    const query = searchQuery.toLowerCase();
    return roles.filter((r) => r.name.toLowerCase().includes(query));
  }, [roles, searchQuery]);

  const stats = React.useMemo(() => {
    return { total: roles.length };
  }, [roles]);

  const handleAddNew = () => {
    setEditingRole(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleDelete = (role: Role) => {
    setDeletingRole(role);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: { name: string; permissions: Permission[] }) => {
    setIsLoading(true);
    try {
      if (editingRole) {
        const result = await apiClient.patch<Role>(
          `/roles/${editingRole.id}`,
          data
        );
        setRoles((prev) =>
          prev.map((r) => (r.id === editingRole.id ? result : r))
        );
        toast.success(t.messages.success.updated);
      } else {
        const result = await apiClient.post<Role>("/roles", data);
        setRoles((prev) => [result, ...prev]);
        toast.success(t.messages.success.created);
      }
      setIsFormOpen(false);
      setEditingRole(undefined);
    } catch (error) {
      console.error("Failed to save role:", error);
      toast.error(t.messages.error.saveFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRole) return;
    try {
      await apiClient.delete(`/roles/${deletingRole.id}`);
      setRoles((prev) => prev.filter((r) => r.id !== deletingRole.id));
      toast.success(t.messages.success.deleted);
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error(t.messages.error.deleteFailed);
    } finally {
      setDeletingRole(undefined);
    }
  };

  const getPermissionCount = (permissions: Permission[]) => {
    return permissions.length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">الأدوار والصلاحيات</h2>
          <p className="text-muted-foreground">إدارة الأدوار وصلاحيات الوصول</p>
        </div>
        {hasAccess && canWrite && (
          <Button onClick={handleAddNew}>
            <Plus className="ml-1 size-4" />
            إضافة دور جديد
          </Button>
        )}
      </div>

      {!hasAccess && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Lock className="size-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">لا تملك صلاحية الوصول</p>
            <p className="text-sm text-muted-foreground">
              أنت لا تملك صلاحية ROLES_READ لعرض هذه الصفحة
            </p>
          </CardContent>
        </Card>
      )}

      {hasAccess && (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="size-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">إجمالي الأدوار</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-chart-1/10 text-chart-1">
                  <Lock className="size-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {roles.reduce((sum, r) => sum + getPermissionCount(r.permissions), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">إجمالي الصلاحيات</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث عن دور..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {isFetching ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t.messages.loading}
                  </p>
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Shield className="size-12 text-muted-foreground/50" />
                  <p className="mt-4 text-lg font-medium">{t.messages.empty.noData}</p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? t.messages.empty.noResults : "ابدأ بإضافة دور جديد"}
                  </p>
                  {canWrite && !searchQuery && (
                    <Button className="mt-4" onClick={handleAddNew}>
                      <Plus className="ml-1 size-4" />
                      إضافة دور جديد
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم الدور</TableHead>
                      <TableHead>عدد الصلاحيات</TableHead>
                      <TableHead>تاريخ الإنشاء</TableHead>
                      <TableHead className="w-[60px]">{t.table.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Shield className="size-5" />
                            </div>
                            <span className="font-medium">{role.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getPermissionCount(role.permissions)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(role.createdAt).toLocaleDateString("ar-SA")}
                        </TableCell>
                        <TableCell>
                          {canWrite ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {role.name !== 'Owner' && (
                                  <DropdownMenuItem onClick={() => handleEdit(role)}>
                                    <Pencil className="ml-2 size-4" />
                                    {t.actions.edit}
                                  </DropdownMenuItem>
                                )}
                                {role.name !== 'Owner' && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDelete(role)}
                                  >
                                    <Trash2 className="ml-2 size-4" />
                                    {t.actions.delete}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Form Modal */}
          <ResponsiveModal
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            title={editingRole ? "تعديل الدور" : "إضافة دور جديد"}
            description={
              editingRole
                ? "تعديل صلاحيات الدور"
                : "إنشاء دور جديد مع صلاحيات مخصصة"
            }
            className="sm:max-w-[600px]"
          >
            <RoleForm
              role={editingRole}
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isLoading}
            />
          </ResponsiveModal>

          {/* Delete Confirmation */}
          <ConfirmDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            title="حذف الدور"
            description={`هل أنت متأكد من حذف دور "${deletingRole?.name}"؟`}
            confirmText={t.actions.delete}
            cancelText={t.actions.cancel}
            onConfirm={handleConfirmDelete}
            variant="destructive"
          />
        </>
      )}
    </div>
  );
}
