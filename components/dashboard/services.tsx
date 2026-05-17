"use client";

import * as React from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  Droplets,
  Car,
  Sparkles,
  Sun,
  Circle,
  Battery,
  Wind,
  Settings,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import type { Service, ServiceFormData } from "@/types";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveModal, ConfirmDialog } from "@/components/responsive-modal";

// =============================================================================
// Icon Map
// =============================================================================

const iconMap: Record<string, React.ElementType> = {
  Droplets,
  Car,
  Sparkles,
  Sun,
  Search,
  Circle,
  Battery,
  Wind,
  Settings,
  Wrench,
  Zap,
};

const iconOptions = [
  { value: "Droplets", label: "قطرة (زيوت)" },
  { value: "Car", label: "سيارة" },
  { value: "Sparkles", label: "لمعان (تنظيف)" },
  { value: "Sun", label: "شمس (تلميع)" },
  { value: "Search", label: "فحص" },
  { value: "Circle", label: "إطار" },
  { value: "Battery", label: "بطارية" },
  { value: "Wind", label: "تكييف" },
  { value: "Wrench", label: "صيانة عامة" },
  { value: "Zap", label: "كهرباء" },
  { value: "Settings", label: "إعدادات" },
];

// =============================================================================
// Service Form Component
// =============================================================================

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function ServiceForm({
  service,
  onSubmit,
  onCancel,
  isLoading,
}: ServiceFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = React.useState<ServiceFormData>({
    name: service?.name || "",
    price: Number(service?.price) || 0,
    icon: service?.icon || "Wrench",
    description: service?.description || "",
    estimatedDuration: Number(service?.estimatedDuration) || 30,
    isActive: service?.isActive ?? true,
  });

  const handleChange = (
    field: keyof ServiceFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t.validation.required);
      return;
    }
    const price = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
    if (price <= 0) {
      toast.error("السعر يجب أن يكون أكبر من صفر");
      return;
    }
    onSubmit({
      ...formData,
      price: price,
      estimatedDuration: typeof formData.estimatedDuration === 'string' ? parseInt(formData.estimatedDuration) : formData.estimatedDuration,
    });
  };

  const IconComponent = iconMap[formData.icon || "Wrench"] || Wrench;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rtl-auto">
      {/* Icon Preview */}
      <div className="flex justify-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconComponent className="size-10" />
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t.services.name}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="اسم الخدمة"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t.labels.description}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="وصف الخدمة (اختياري)"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">{t.services.icon}</Label>
          <Select
            value={formData.icon}
            onValueChange={(value) => handleChange("icon", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((option) => {
                const Icon = iconMap[option.value];
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pricing & Duration */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">{t.services.price}</Label>
          <div className="relative">
            <Input
              id="price"
              type="number"
              min={0}
              step={1000}
              value={formData.price}
              onChange={(e) =>
                handleChange("price", parseFloat(e.target.value) || 0)
              }
              className="pl-12"
            />
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {t.currency.symbol}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">{t.services.estimatedDuration}</Label>
          <div className="relative">
            <Input
              id="duration"
              type="number"
              min={0}
              value={formData.estimatedDuration}
              onChange={(e) =>
                handleChange("estimatedDuration", parseInt(e.target.value) || 0)
              }
              className="pl-12"
            />
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {t.services.minutes}
            </span>
          </div>
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>{t.labels.status}</Label>
          <p className="text-sm text-muted-foreground">
            {formData.isActive
              ? "الخدمة متاحة للعملاء"
              : "الخدمة غير متاحة حالياً"}
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
// Service Card Component
// =============================================================================

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleActive: (service: Service) => void;
  canWrite: boolean;
}

function ServiceCard({
  service,
  onEdit,
  onDelete,
  onToggleActive,
  canWrite,
}: ServiceCardProps) {
  const { t } = useTranslation();
  const IconComponent = iconMap[service.icon || "Wrench"] || Wrench;

  return (
    <Card
      className={cn(
        "card-hover group relative",
        !service.isActive && "opacity-60",
      )}
    >
      {canWrite && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(service)}>
                <Pencil className="ml-2 size-4" />
                {t.actions.edit}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(service)}>
                {service.isActive ? (
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
                onClick={() => onDelete(service)}
              >
                <Trash2 className="ml-2 size-4" />
                {t.actions.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <CardContent className="p-6 text-center">
        <div
          className={cn(
            "mx-auto flex size-16 items-center justify-center rounded-2xl mb-4",
            service.isActive
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <IconComponent className="size-8" />
        </div>

        <h3 className="font-semibold text-lg">{service.name}</h3>

        {service.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-primary font-semibold">
            <span>{service.price}</span>
            <span className="text-xs">{t.currency.symbol}</span>
          </div>
          {service.estimatedDuration && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3.5" />
              <span>
                {service.estimatedDuration} {t.services.minutes}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Badge
            variant={service.isActive ? "default" : "secondary"}
            className={cn(
              service.isActive
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted text-muted-foreground",
            )}
          >
            {service.isActive ? t.labels.active : t.labels.inactive}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Main Services Page Component
// =============================================================================

export function ServicesPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("services", "write");
  const [services, setServices] = React.useState<Service[]>([]);
  const [isFetching, setIsFetching] = React.useState(true);

  // Fetch services on mount
  React.useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsFetching(true);
      const response = await apiClient.get<{ data: Service[]; total: number }>(
        "/services",
      );
      setServices(response.data || []);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      toast.error(t.messages.error.general);
    } finally {
      setIsFetching(false);
    }
  };
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<
    Service | undefined
  >();
  const [deletingService, setDeletingService] = React.useState<
    Service | undefined
  >();
  const [isLoading, setIsLoading] = React.useState(false);

  const filteredServices = React.useMemo(() => {
    let result = services;

    if (!showInactive) {
      result = result.filter((s) => s.isActive);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [services, searchQuery, showInactive]);

  const stats = React.useMemo(() => {
    const active = services.filter((s) => s.isActive).length;
    const inactive = services.filter((s) => !s.isActive).length;
    const avgPrice = services.length
      ? Math.round(
        services.reduce((acc, s) => acc + s.price, 0) / services.length,
      )
      : 0;
    return { total: services.length, active, inactive, avgPrice };
  }, [services]);

  const handleAddNew = () => {
    setEditingService(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDelete = (service: Service) => {
    setDeletingService(service);
    setIsDeleteOpen(true);
  };

  const handleToggleActive = (service: Service) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id
          ? { ...s, isActive: !s.isActive, updatedAt: new Date() }
          : s,
      ),
    );
    toast.success(service.isActive ? "تم تعطيل الخدمة" : "تم تفعيل الخدمة");
  };

  const handleSubmit = async (data: ServiceFormData) => {
    setIsLoading(true);
    try {
      if (editingService) {
        await apiClient.patch(`/services/${editingService.id}`, data);
        toast.success(t.messages.success.updated);
      } else {
        await apiClient.post("/services", data);
        toast.success(t.messages.success.created);
      }
      await fetchServices();
      setIsFormOpen(false);
      setEditingService(undefined);
    } catch (error) {
      console.error("Failed to save service:", error);
      toast.error(t.messages.error.general);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingService) return;
    try {
      await apiClient.delete(`/services/${deletingService.id}`);
      toast.success(t.messages.success.deleted);
      await fetchServices();
      setDeletingService(undefined);
    } catch (error) {
      console.error("Failed to delete service:", error);
      toast.error(t.messages.error.general);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.services.title}</h2>
          <p className="text-muted-foreground">إدارة خدمات المركز والأسعار</p>
        </div>
        {canWrite && (
          <Button onClick={handleAddNew}>
            <Plus className="ml-1 size-4" />
            {t.services.addNew}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wrench className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">إجمالي الخدمات</p>
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
              <p className="text-sm text-muted-foreground">خدمات نشطة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <XCircle className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inactive}</p>
              <p className="text-sm text-muted-foreground">خدمات معطلة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
              <Zap className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.avgPrice} {t.currency.symbol}
              </p>
              <p className="text-sm text-muted-foreground">متوسط السعر</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.services.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label htmlFor="show-inactive" className="text-sm cursor-pointer">
            عرض الخدمات المعطلة
          </Label>
        </div>
      </div>

      {/* Services Grid */}
      {isFetching ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t.messages.loading}
            </p>
          </CardContent>
        </Card>
      ) : filteredServices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Wrench className="size-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">
              {t.messages.empty.noData}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? t.messages.empty.noResults
                : "ابدأ بإضافة خدمة جديدة"}
            </p>
            {canWrite && !searchQuery && (
              <Button className="mt-4" onClick={handleAddNew}>
                <Plus className="ml-1 size-4" />
                {t.services.addNew}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              canWrite={canWrite}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <ResponsiveModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingService ? t.services.editService : t.services.addNew}
        description={
          editingService ? "تعديل بيانات الخدمة" : "إضافة خدمة جديدة للمركز"
        }
        dismissible={false}
      >
        <ServiceForm
          service={editingService}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isLoading}
        />
      </ResponsiveModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t.services.deleteService}
        description={`${t.services.deleteConfirm} "${deletingService?.name}"`}
        confirmText={t.actions.delete}
        cancelText={t.actions.cancel}
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
