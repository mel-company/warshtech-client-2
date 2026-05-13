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
  UserCog,
  Phone,
  Calendar,
  Banknote,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type { Employee, EmployeePosition, EmployeeFormData } from "@/types";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ResponsiveModal, ConfirmDialog } from "@/components/responsive-modal";

// =============================================================================
// Employee Form Component
// =============================================================================

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function EmployeeForm({
  employee,
  onSubmit,
  onCancel,
  isLoading,
}: EmployeeFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = React.useState<EmployeeFormData>({
    name: employee?.name || "",
    position: employee?.position || "technician",
    phone: employee?.phone || "",
    salary: employee?.salary || 0,
    hireDate: employee?.hireDate || new Date(),
    isActive: employee?.isActive ?? true,
  });

  const handleChange = (
    field: keyof EmployeeFormData,
    value: string | number | boolean | Date | EmployeePosition,
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
    onSubmit(formData);
  };

  const positions: EmployeePosition[] = [
    "manager",
    "technician",
    "receptionist",
    "accountant",
    "cleaner",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rtl-auto">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t.employees.name}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="اسم الموظف"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t.employees.phone}</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+966550000000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">{t.employees.position}</Label>
          <Select
            value={formData.position}
            onValueChange={(value: EmployeePosition) =>
              handleChange("position", value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {positions.map((position) => (
                <SelectItem key={position} value={position}>
                  {t.employees.positions[position]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Salary & Hire Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="salary">{t.employees.salary}</Label>
          <div className="relative">
            <Input
              id="salary"
              type="number"
              min={0}
              step={1000}
              value={formData.salary}
              onChange={(e) =>
                handleChange("salary", parseFloat(e.target.value) || 0)
              }
              className="pl-12"
            />
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {t.currency.symbol}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t.employees.hireDate}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-right font-normal",
                  !formData.hireDate && "text-muted-foreground",
                )}
              >
                <Calendar className="ml-2 size-4" />
                {formData.hireDate
                  ? format(formData.hireDate, "PPP", { locale: ar })
                  : "اختر التاريخ"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.hireDate}
                onSelect={(date) => date && handleChange("hireDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>{t.labels.status}</Label>
          <p className="text-sm text-muted-foreground">
            {formData.isActive ? "الموظف يعمل حالياً" : "الموظف متوقف عن العمل"}
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
// Employee Row Component
// =============================================================================

interface EmployeeRowProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onToggleActive: (employee: Employee) => void;
}

function EmployeeRow({
  employee,
  onEdit,
  onDelete,
  onToggleActive,
}: EmployeeRowProps) {
  const { t } = useTranslation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);
  };

  const getPositionColor = (position: EmployeePosition) => {
    switch (position) {
      case "manager":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "technician":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "receptionist":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "accountant":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20";
      case "cleaner":
        return "bg-chart-5/10 text-chart-5 border-chart-5/20";
      default:
        return "";
    }
  };

  return (
    <TableRow
      className={cn("table-row-hover", !employee.isActive && "opacity-60")}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{employee.name}</span>
            <span className="text-xs text-muted-foreground" dir="ltr">
              {employee.phone}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(getPositionColor(employee.position))}
        >
          {t.employees.positions[employee.position]}
        </Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="flex items-center gap-1">
          <Banknote className="size-4 text-muted-foreground" />
          <span>{employee.salary.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">
            {t.currency.symbol}
          </span>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="size-4" />
          <span className="text-sm">
            {format(employee.hireDate, "yyyy/MM/dd")}
          </span>
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Badge
          variant={employee.isActive ? "default" : "secondary"}
          className={cn(
            employee.isActive
              ? "bg-success/10 text-success border-success/20"
              : "bg-muted text-muted-foreground",
          )}
        >
          {employee.isActive ? t.labels.active : t.labels.inactive}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              <Pencil className="ml-2 size-4" />
              {t.actions.edit}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleActive(employee)}>
              {employee.isActive ? (
                <>
                  <XCircle className="ml-2 size-4" />
                  إيقاف
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
              onClick={() => onDelete(employee)}
            >
              <Trash2 className="ml-2 size-4" />
              {t.actions.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// =============================================================================
// Main Employees Page Component
// =============================================================================

export function EmployeesPage() {
  const { t } = useTranslation();
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterPosition, setFilterPosition] = React.useState<
    EmployeePosition | "all"
  >("all");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<
    Employee | undefined
  >();
  const [deletingEmployee, setDeletingEmployee] = React.useState<
    Employee | undefined
  >();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  const filteredEmployees = React.useMemo(() => {
    let result = employees;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) => e.name.toLowerCase().includes(query) || e.phone.includes(query),
      );
    }

    if (filterPosition !== "all") {
      result = result.filter((e) => e.position === filterPosition);
    }

    return result;
  }, [employees, searchQuery, filterPosition]);

  const stats = React.useMemo(() => {
    const active = employees.filter((e) => e.isActive).length;
    const totalSalaries = employees
      .filter((e) => e.isActive)
      .reduce((acc, e) => acc + e.salary, 0);
    return { total: employees.length, active, totalSalaries };
  }, [employees]);

  const fetchEmployees = React.useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await apiClient.get<{ data: Employee[]; total: number }>(
        "/employees",
      );
      setEmployees(
        (response.data || []).map((e) => ({
          ...e,
          hireDate: new Date(e.hireDate),
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
        })),
      );
    } catch (error) {
      toast.error(t.messages.error.fetchFailed);
    } finally {
      setIsFetching(false);
    }
  }, [t]);

  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddNew = () => {
    setEditingEmployee(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setDeletingEmployee(employee);
    setIsDeleteOpen(true);
  };

  const handleToggleActive = async (employee: Employee) => {
    try {
      await apiClient.patch(`/employees/${employee.id}`, {
        isActive: !employee.isActive,
      });
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === employee.id
            ? { ...e, isActive: !e.isActive, updatedAt: new Date() }
            : e,
        ),
      );
      toast.success(employee.isActive ? "تم إيقاف الموظف" : "تم تفعيل الموظف");
    } catch (error) {
      toast.error(t.messages.error.updateFailed);
    }
  };

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    try {
      if (editingEmployee) {
        const response = await apiClient.patch<Employee>(
          `/employees/${editingEmployee.id}`,
          data,
        );
        setEmployees((prev) =>
          prev.map((e) =>
            e.id === editingEmployee.id
              ? { ...response, updatedAt: new Date() }
              : e,
          ),
        );
        toast.success(t.messages.success.updated);
      } else {
        const response = await apiClient.post<Employee>("/employees", data);
        setEmployees((prev) => [
          {
            ...response,
            hireDate: new Date(response.hireDate),
            createdAt: new Date(response.createdAt),
            updatedAt: new Date(response.updatedAt),
          },
          ...prev,
        ]);
        toast.success(t.messages.success.created);
      }
      setIsFormOpen(false);
      setEditingEmployee(undefined);
    } catch (error) {
      toast.error(
        editingEmployee
          ? t.messages.error.updateFailed
          : t.messages.error.createFailed,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;
    try {
      await apiClient.delete(`/employees/${deletingEmployee.id}`);
      setEmployees((prev) => prev.filter((e) => e.id !== deletingEmployee.id));
      toast.success(t.messages.success.deleted);
    } catch (error) {
      toast.error(t.messages.error.deleteFailed);
    } finally {
      setDeletingEmployee(undefined);
      setIsDeleteOpen(false);
    }
  };

  const positions: EmployeePosition[] = [
    "manager",
    "technician",
    "receptionist",
    "accountant",
    "cleaner",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.employees.title}</h2>
          <p className="text-muted-foreground">
            إدارة بيانات الموظفين والرواتب
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchEmployees}
            disabled={isFetching}
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="ml-1 size-4" />
            {t.employees.addNew}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCog className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">إجمالي الموظفين</p>
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
              <p className="text-sm text-muted-foreground">موظفين نشطين</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
              <Banknote className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.totalSalaries.toLocaleString()} {t.currency.symbol}
              </p>
              <p className="text-sm text-muted-foreground">إجمالي الرواتب</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.employees.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>

        <Select
          value={filterPosition}
          onValueChange={(value) =>
            setFilterPosition(value as EmployeePosition | "all")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="تصفية حسب المنصب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.labels.all}</SelectItem>
            {positions.map((position) => (
              <SelectItem key={position} value={position}>
                {t.employees.positions[position]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCog className="size-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">
                {t.messages.empty.noData}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterPosition !== "all"
                  ? t.messages.empty.noResults
                  : "ابدأ بإضافة موظف جديد"}
              </p>
              {!searchQuery && filterPosition === "all" && (
                <Button className="mt-4" onClick={handleAddNew}>
                  <Plus className="ml-1 size-4" />
                  {t.employees.addNew}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.employees.name}</TableHead>
                  <TableHead>{t.employees.position}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t.employees.salary}
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t.employees.hireDate}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t.labels.status}
                  </TableHead>
                  <TableHead className="w-[60px]">{t.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <EmployeeRow
                    key={employee.id}
                    employee={employee}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
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
        title={editingEmployee ? t.employees.editEmployee : t.employees.addNew}
        description={
          editingEmployee ? "تعديل بيانات الموظف" : "إضافة موظف جديد للمركز"
        }
      >
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isLoading}
        />
      </ResponsiveModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t.employees.deleteEmployee}
        description={`${t.employees.deleteConfirm} "${deletingEmployee?.name}"`}
        confirmText={t.actions.delete}
        cancelText={t.actions.cancel}
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
