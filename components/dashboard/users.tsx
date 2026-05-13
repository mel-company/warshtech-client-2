"use client";

import * as React from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  Phone,
  Clock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Users,
  Package,
  Wrench,
  UserCog,
  FileText,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import type {
  User,
  UserPosition,
  UserFormData,
  Role,
  Permission,
} from "@/types";
import apiClient from "@/lib/api";
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
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Separator } from "@/components/ui/separator";
import { ResponsiveModal, ConfirmDialog } from "@/components/responsive-modal";

// =============================================================================
// Permission Grid Component
// =============================================================================

interface PermissionGridProps {
  permissions: Role["permissions"];
  onChange: (permissions: Role["permissions"]) => void;
  readonly?: boolean;
}

type ResourceType =
  | "customers"
  | "products"
  | "services"
  | "employees"
  | "users"
  | "settings";

type PermissionLevel = "none" | "read" | "write";

const resourceIcons: Record<ResourceType, React.ElementType> = {
  customers: Users,
  products: Package,
  services: Wrench,
  employees: UserCog,
  users: Shield,
  settings: FileText,
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
              <Select
                value={currentLevel}
                onValueChange={(value: PermissionLevel) =>
                  handleChange(resource, value)
                }
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
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// User Form Component
// =============================================================================

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function UserForm({ user, onSubmit, onCancel, isLoading }: UserFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [formData, setFormData] = React.useState<UserFormData>({
    name: user?.name || "",
    phone: user?.phone || "",
    password: "",
    position: user?.position || "viewer",
    roleId: user?.roleId || null,
    isActive: user?.isActive ?? true,
  });

  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await apiClient.get<Role[]>("/roles");
        setRoles(data || []);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (
    field: keyof UserFormData,
    value: string | boolean | UserPosition | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t.validation.required);
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("رقم الهاتف مطلوب");
      return;
    }
    if (!user && !formData.password) {
      toast.error("كلمة المرور مطلوبة للمستخدمين الجدد");
      return;
    }
    onSubmit(formData);
  };

  const positions: UserPosition[] = ["admin", "manager", "cashier", "viewer"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rtl-auto">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t.users.name}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="اسم المستخدم"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t.users.phone}</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+966500000000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t.users.password}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder={
                user
                  ? "اتركه فارغاً للحفاظ على كلمة المرور الحالية"
                  : "كلمة المرور"
              }
              className="pl-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 size-8"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">{t.users.position}</Label>
          <Select
            value={formData.position}
            onValueChange={(value: UserPosition) =>
              handleChange("position", value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {positions.map((position) => (
                <SelectItem key={position} value={position}>
                  {t.users.positions[position]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">{t.users.roles}</Label>
          <Select
            value={formData.roleId || "none"}
            onValueChange={(value) =>
              handleChange("roleId", value === "none" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الدور (اختياري)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">بدون دور</SelectItem>
              {roles.filter((role) => role.name !== 'Owner').map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Active Status */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>{t.labels.status}</Label>
          <p className="text-sm text-muted-foreground">
            {formData.isActive
              ? "المستخدم يمكنه تسجيل الدخول"
              : "المستخدم معطل"}
          </p>
        </div>
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => handleChange("isActive", checked)}
        />
      </div>

      {/* Actions */}
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
// User Row Component
// =============================================================================

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleActive: (user: User) => void;
  onViewPermissions: (user: User) => void;
}

function UserRow({
  user,
  onEdit,
  onDelete,
  onToggleActive,
  onViewPermissions,
}: UserRowProps) {
  const { t } = useTranslation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);
  };

  const getPositionColor = (position: UserPosition) => {
    switch (position) {
      case "admin":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "manager":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "cashier":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "viewer":
        return "bg-muted text-muted-foreground";
      default:
        return "";
    }
  };

  return (
    <TableRow className={cn("table-row-hover", !user.isActive && "opacity-60")}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground" dir="ltr">
              {user.phone}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(getPositionColor(user.position))}
        >
          {t.users.positions[user.position]}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onViewPermissions(user)}
        >
          <Lock className="ml-1 size-3" />
          عرض الصلاحيات
        </Button>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge
          variant={user.isActive ? "default" : "secondary"}
          className={cn(
            user.isActive
              ? "bg-success/10 text-success border-success/20"
              : "bg-muted text-muted-foreground",
          )}
        >
          {user.isActive ? t.labels.active : t.labels.inactive}
        </Badge>
      </TableCell>
      <TableCell>
        {user.role?.name === 'Owner' ? (
          <Badge variant="secondary" className="text-xs">
            Owner
          </Badge>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil className="ml-2 size-4" />
                {t.actions.edit}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewPermissions(user)}>
                <Lock className="ml-2 size-4" />
                الصلاحيات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(user)}>
                {user.isActive ? (
                  <>
                    <XCircle className="ml-2 size-4" />
                    تعطيل
                  </>
                ) : (
                  <>
                    <CheckCircle className="ml-2 size-4" />
                    تفعيل
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(user)}
              >
                <Trash2 className="ml-2 size-4" />
                {t.actions.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}

// =============================================================================
// Main Users Page Component
// =============================================================================

export function UsersPage() {
  const { t } = useTranslation();
  const { user: currentUser, hasPermission } = useAuth();
  const [users, setUsers] = React.useState<User[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterPosition, setFilterPosition] = React.useState<
    UserPosition | "all"
  >("all");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | undefined>();
  const [deletingUser, setDeletingUser] = React.useState<User | undefined>();
  const [viewingUser, setViewingUser] = React.useState<User | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsFetching(true);
      const data = await apiClient.get<{ data: User[]; total: number }>(
        "/users",
      );
      setUsers(data.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error(t.messages.error.fetchFailed);
    } finally {
      setIsFetching(false);
    }
  }, [t]);

  const fetchRoles = React.useCallback(async () => {
    // Only fetch roles if user has permission
    if (!hasPermission("roles", "read")) {
      return;
    }
    try {
      const data = await apiClient.get<Role[]>("/roles");
      setRoles(data || []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      // Don't show toast for permission errors
    }
  }, [hasPermission]);

  React.useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const filteredUsers = React.useMemo(() => {
    let result = users;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(query) || u.phone.includes(query),
      );
    }

    if (filterPosition !== "all") {
      result = result.filter((u) => u.position === filterPosition);
    }

    return result;
  }, [users, searchQuery, filterPosition]);

  const stats = React.useMemo(() => {
    const active = users.filter((u) => u.isActive).length;
    const admins = users.filter((u) => u.position === "admin").length;
    return { total: users.length, active, admins };
  }, [users]);

  const handleAddNew = () => {
    setEditingUser(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setIsDeleteOpen(true);
  };

  const handleViewPermissions = (user: User) => {
    setViewingUser(user);
    setIsPermissionsOpen(true);
  };

  const handleToggleActive = async (user: User) => {
    try {
      await apiClient.patch(`/users/${user.id}`, { isActive: !user.isActive });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isActive: !user.isActive } : u,
        ),
      );
      toast.success(user.isActive ? "تم تعطيل المستخدم" : "تم تفعيل المستخدم");
    } catch (error) {
      console.error("Failed to toggle user active status:", error);
      toast.error(t.messages.error.updateFailed);
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      if (editingUser) {
        const result = await apiClient.patch<User>(
          `/users/${editingUser.id}`,
          data,
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? result : u)),
        );
        toast.success(t.messages.success.updated);
      } else {
        const result = await apiClient.post<User>("/users", data);
        setUsers((prev) => [result, ...prev]);
        toast.success(t.messages.success.created);
      }
      setIsFormOpen(false);
      setEditingUser(undefined);
    } catch (error) {
      console.error("Failed to save user:", error);
      toast.error(t.messages.error.saveFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      await apiClient.delete(`/users/${deletingUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      toast.success(t.messages.success.deleted);
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(t.messages.error.deleteFailed);
    } finally {
      setDeletingUser(undefined);
    }
  };

  const positions: UserPosition[] = ["admin", "manager", "cashier", "viewer"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.users.title}</h2>
          <p className="text-muted-foreground">إدارة المستخدمين والصلاحيات</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="ml-1 size-4" />
          {t.users.addNew}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">مستخدمين نشطين</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Lock className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-sm text-muted-foreground">مديري النظام</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.users.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>

        <Select
          value={filterPosition}
          onValueChange={(value) =>
            setFilterPosition(value as UserPosition | "all")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="تصفية حسب المنصب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.labels.all}</SelectItem>
            {positions.map((position) => (
              <SelectItem key={position} value={position}>
                {t.users.positions[position]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="size-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">
                {t.messages.empty.noData}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterPosition !== "all"
                  ? t.messages.empty.noResults
                  : "ابدأ بإضافة مستخدم جديد"}
              </p>
              {!searchQuery && filterPosition === "all" && (
                <Button className="mt-4" onClick={handleAddNew}>
                  <Plus className="ml-1 size-4" />
                  {t.users.addNew}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.users.name}</TableHead>
                  <TableHead>{t.users.position}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t.users.roles}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t.users.lastLogin}
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t.labels.status}
                  </TableHead>
                  <TableHead className="w-[60px]">{t.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    onViewPermissions={handleViewPermissions}
                  />
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
        title={editingUser ? t.users.editUser : t.users.addNew}
        description={
          editingUser
            ? "تعديل بيانات المستخدم والصلاحيات"
            : "إضافة مستخدم جديد للنظام"
        }
        className="sm:max-w-[600px]"
      >
        <UserForm
          user={editingUser}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isLoading}
        />
      </ResponsiveModal>

      {/* Permissions View Modal */}
      <ResponsiveModal
        open={isPermissionsOpen}
        onOpenChange={setIsPermissionsOpen}
        title={`صلاحيات ${viewingUser?.name || ""}`}
        description="عرض صلاحيات الوصول للمستخدم"
      >
        {viewingUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {viewingUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{viewingUser.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t.users.positions[viewingUser.position]}
                </p>
              </div>
            </div>
            <PermissionGrid
              permissions={viewingUser.role?.permissions || []}
              onChange={() => { }}
              readonly
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsPermissionsOpen(false)}
            >
              {t.actions.close}
            </Button>
          </div>
        )}
      </ResponsiveModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t.users.deleteUser}
        description={`${t.users.deleteConfirm} "${deletingUser?.name}"`}
        confirmText={t.actions.delete}
        cancelText={t.actions.cancel}
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
