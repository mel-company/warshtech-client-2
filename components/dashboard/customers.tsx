"use client";

import * as React from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Car,
  Phone,
  User,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import type { Customer, Car as CarType, CustomerFormData } from "@/types";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ResponsiveModal, ConfirmDialog } from "@/components/responsive-modal";

// =============================================================================
// Customer Form Component
// =============================================================================

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isLoading,
}: CustomerFormProps) {
  const { t } = useTranslation();
  const [name, setName] = React.useState(customer?.name || "");
  const [phone, setPhone] = React.useState(customer?.phone || "");
  const [cars, setCars] = React.useState<
    Omit<CarType, "id" | "customerId" | "createdAt" | "updatedAt">[]
  >(
    customer?.cars.map((c) => ({
      name: c.name,
      number: c.number,
      model: c.model,
      color: c.color,
    })) || [],
  );

  const handleAddCar = () => {
    setCars([...cars, { name: "", number: "", model: "", color: "" }]);
  };

  const handleRemoveCar = (index: number) => {
    setCars(cars.filter((_, i) => i !== index));
  };

  const handleCarChange = (
    index: number,
    field: keyof Omit<CarType, "id" | "customerId" | "createdAt" | "updatedAt">,
    value: string,
  ) => {
    const newCars = [...cars];
    newCars[index] = { ...newCars[index], [field]: value };
    setCars(newCars);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error(t.validation.required);
      return;
    }
    onSubmit({ name, phone, cars });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rtl-auto">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t.customers.name}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل اسم العميل"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t.customers.phone}</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+966500000000"
            required
          />
        </div>
      </div>

      <Separator />

      {/* Cars Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">{t.customers.cars}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCar}
          >
            <Plus className="mr-1 size-4" />
            {t.customers.car.add}
          </Button>
        </div>

        {cars.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t.customers.noCars}
          </p>
        ) : (
          <div className="space-y-4">
            {cars.map((car, index) => (
              <Card key={index} className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 end-2 size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveCar(index)}
                >
                  <X className="size-4" />
                </Button>
                <CardContent className="pt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t.customers.car.name}</Label>
                    <Input
                      value={car.name}
                      onChange={(e) =>
                        handleCarChange(index, "name", e.target.value)
                      }
                      placeholder="كامري، أكورد..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.customers.car.plateNumber}</Label>
                    <Input
                      value={car.number}
                      onChange={(e) =>
                        handleCarChange(index, "number", e.target.value)
                      }
                      placeholder="أ ب ج 1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.customers.car.model}</Label>
                    <Input
                      value={car.model}
                      onChange={(e) =>
                        handleCarChange(index, "model", e.target.value)
                      }
                      placeholder="2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.customers.car.color}</Label>
                    <Input
                      value={car.color}
                      onChange={(e) =>
                        handleCarChange(index, "color", e.target.value)
                      }
                      placeholder="أبيض، أسود..."
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
// Customer Row Component
// =============================================================================

interface CustomerRowProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  canWrite: boolean;
}

function CustomerRow({ customer, onEdit, onDelete, canWrite }: CustomerRowProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);
  };

  return (
    <>
      <TableRow
        className="table-row-hover cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{customer.name}</span>
              <span className="text-xs text-muted-foreground" dir="ltr">
                {customer.phone}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell className="hidden sm:table-cell">
          <Badge variant="secondary" className="gap-1">
            <Car className="size-3" />
            {customer.cars.length}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge variant="outline">{customer.usageCount} زيارة</Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
            {canWrite && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(customer)}>
                    <Pencil className="ml-2 size-4" />
                    {t.actions.edit}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(customer)}
                  >
                    <Trash2 className="ml-2 size-4" />
                    {t.actions.delete}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && customer.cars.length > 0 && (
        <TableRow>
          <TableCell colSpan={4} className="bg-muted/30 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {customer.cars.map((car) => (
                <Card key={car.id} className="bg-background">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Car className="size-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{car.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {car.number}
                        </p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{car.model}</span>
                          <span>•</span>
                          <span>{car.color}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// =============================================================================
// Main Customers Page Component
// =============================================================================

export function CustomersPage() {
  const { t } = useTranslation();
  const { hasPermission, user } = useAuth();
  const canWrite = hasPermission("customers", "write");

  // Debug logging - remove after testing
  React.useEffect(() => {
    console.log('[DEBUG] User:', user);
    console.log('[DEBUG] User role:', user?.role);
    console.log('[DEBUG] User permissions:', user?.permissions);
    console.log('[DEBUG] canWrite for customers:', canWrite);
  }, [user, canWrite]);

  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<
    Customer | undefined
  >();
  const [deletingCustomer, setDeletingCustomer] = React.useState<
    Customer | undefined
  >();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  // Fetch customers on mount
  React.useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsFetching(true);
      const response = await apiClient.get<{ data: Customer[]; total: number }>(
        "/customers",
      );
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error(t.messages.error.general);
    } finally {
      setIsFetching(false);
    }
  };

  const filteredCustomers = React.useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.cars.some(
          (car) =>
            car.name.toLowerCase().includes(query) ||
            car.number.toLowerCase().includes(query),
        ),
    );
  }, [customers, searchQuery]);

  const handleAddNew = () => {
    setEditingCustomer(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setDeletingCustomer(customer);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      if (editingCustomer) {
        // Update existing customer data
        await apiClient.patch(`/customers/${editingCustomer.id}`, {
          name: data.name,
          phone: data.phone,
        });

        // Handle cars separately - compare and update
        const existingCars = editingCustomer.cars || [];
        const updatedCars = data.cars || [];

        // Delete cars that are no longer in the updated list
        for (const existingCar of existingCars) {
          const stillExists = updatedCars.some(updatedCar =>
            updatedCar.number === existingCar.number &&
            updatedCar.name === existingCar.name
          );
          if (!stillExists) {
            await apiClient.delete(`/customers/${editingCustomer.id}/cars/${existingCar.id}`);
          }
        }

        // Add or update cars
        for (const updatedCar of updatedCars) {
          const existingCar = existingCars.find(car =>
            car.number === updatedCar.number &&
            car.name === updatedCar.name
          );

          if (existingCar) {
            // Update existing car
            await apiClient.put(`/customers/${editingCustomer.id}/cars/${existingCar.id}`, updatedCar);
          } else {
            // Add new car
            await apiClient.post(`/customers/${editingCustomer.id}/cars`, updatedCar);
          }
        }
        toast.success(t.messages.success.updated);
      } else {
        // Create new
        await apiClient.post("/customers", {
          name: data.name,
          phone: data.phone,
          cars: data.cars,
        });
        toast.success(t.messages.success.created);
      }
      await fetchCustomers();
      setIsFormOpen(false);
      setEditingCustomer(undefined);
    } catch (error) {
      console.error("Failed to save customer:", error);
      toast.error(t.messages.error.general);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;
    try {
      await apiClient.delete(`/customers/${deletingCustomer.id}`);
      toast.success(t.messages.success.deleted);
      await fetchCustomers();
      setDeletingCustomer(undefined);
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error(t.messages.error.general);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.customers.title}</h2>
          <p className="text-muted-foreground">
            إدارة بيانات العملاء وسياراتهم
          </p>
        </div>
        {canWrite && (
          <Button onClick={handleAddNew}>
            <Plus className="ml-1 size-4" />
            {t.customers.addNew}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t.customers.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-9"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{customers.length}</p>
              <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
              <Car className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {customers?.reduce((acc, c) => acc + c.cars.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">إجمالي السيارات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
              <Phone className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {customers?.reduce((acc, c) => acc + c.usageCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">إجمالي الزيارات</p>
            </div>
          </CardContent>
        </Card>
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
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="size-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">
                {t.messages.empty.noData}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? t.messages.empty.noResults
                  : "ابدأ بإضافة عميل جديد"}
              </p>
              {canWrite && !searchQuery && (
                <Button className="mt-4" onClick={handleAddNew}>
                  <Plus className="ml-1 size-4" />
                  {t.customers.addNew}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.customers.name}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t.customers.cars}
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t.customers.usageCount}
                  </TableHead>
                  <TableHead className="w-[100px]">{t.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    canWrite={canWrite}
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
        title={editingCustomer ? t.customers.editCustomer : t.customers.addNew}
        description={
          editingCustomer
            ? "تعديل بيانات العميل وسياراته"
            : "إضافة عميل جديد مع سياراته"
        }
        dismissible={false}
      >
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isLoading}
        />
      </ResponsiveModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t.customers.deleteCustomer}
        description={`${t.customers.deleteConfirm} "${deletingCustomer?.name}"`}
        confirmText={t.actions.delete}
        cancelText={t.actions.cancel}
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
