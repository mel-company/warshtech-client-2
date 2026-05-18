"use client";

import * as React from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  BarChart3,
  Barcode,
  Info,
  Box,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import type { Product, ProductUnit, ProductFormData } from "@/types";
import apiClient, { uploadFile } from "@/lib/api";
import { extractListData } from "@/lib/list-response";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { ResponsiveModal, ConfirmDialog } from "@/components/responsive-modal";

// =============================================================================
// Pricing helpers
// =============================================================================

function marginFromPrices(cost: number, price: number): number {
  if (cost <= 0 || price <= 0) return 0;
  return Math.round(((price / cost - 1) * 100) * 100) / 100;
}

function minPriceFromSaleDiscount(
  sale: number,
  cost: number,
  discountPercentOnProfit: number,
): number {
  if (sale <= 0) return 0;
  const profit = sale - cost;
  if (profit <= 0) return 0;
  return Math.round(sale - profit * (discountPercentOnProfit / 100));
}

function discountPercentOnProfit(
  sale: number,
  cost: number,
  minPrice: number,
): number {
  const profit = sale - cost;
  if (profit <= 0 || minPrice >= sale) return 0;
  return Math.round(((sale - minPrice) / profit) * 100 * 100) / 100;
}

const MIN_MARGIN_OPTIONS = [10, 15, 20] as const;
type MinMarginOption = (typeof MIN_MARGIN_OPTIONS)[number];

function pickClosestMinMargin(
  sale: number,
  cost: number,
  minPrice: number,
): MinMarginOption {
  const actual = discountPercentOnProfit(sale, cost, minPrice);
  if (actual <= 0) return 10;
  return MIN_MARGIN_OPTIONS.reduce((best, opt) =>
    Math.abs(opt - actual) < Math.abs(best - actual) ? opt : best,
  );
}

function isMinMarginValid(
  cost: number,
  sale: number,
  marginPercent: number,
): boolean {
  if (cost <= 0 || sale <= cost) return false;
  const min = minPriceFromSaleDiscount(sale, cost, marginPercent);
  return min > cost && min < sale;
}

// =============================================================================
// Product Form Component
// =============================================================================

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps) {
  const { t } = useTranslation();
  const initialCost = Number(product?.costPrice) || 0;
  const initialSale = Number(product?.salePrice) || 0;
  const initialMin = Number(product?.minPrice) || 0;

  const hasValidMinPrice =
    initialSale > initialCost &&
    initialMin > initialCost &&
    initialMin < initialSale;

  const [minPriceEnabled, setMinPriceEnabled] = React.useState(hasValidMinPrice);

  const [selectedMinMargin, setSelectedMinMargin] =
    React.useState<MinMarginOption | null>(() => {
      if (hasValidMinPrice) {
        return pickClosestMinMargin(initialSale, initialCost, initialMin);
      }
      return null;
    });

  const [formData, setFormData] = React.useState<ProductFormData>({
    name: product?.name || "",
    minPrice: initialMin,
    costPrice: initialCost,
    salePrice: initialSale,
    photos: product?.photos || [],
    unit: product?.unit || "piece",
    unitValue: Number(product?.unitValue) || 1,
    unitAdjustable: product?.unitAdjustable || false,
    stock: Number(product?.stock) || 0,
    minStock: Number(product?.minStock) || 0,
    barcode: product?.barcode || "",
    description: product?.description || "",
  });
  const [isUploading, setIsUploading] = React.useState(false);

  const profitMargin = marginFromPrices(
    formData.costPrice,
    formData.salePrice,
  );

  const resolveMinPrice = (
    enabled: boolean,
    cost: number,
    sale: number,
    margin: MinMarginOption | null,
  ): number => {
    if (!enabled) return sale;
    if (margin === null || !isMinMarginValid(cost, sale, margin)) return 0;
    return minPriceFromSaleDiscount(sale, cost, margin);
  };

  const handleCostChange = (cost: number) => {
    const sale = formData.salePrice;
    let margin = selectedMinMargin;
    if (
      minPriceEnabled &&
      margin !== null &&
      !isMinMarginValid(cost, sale, margin)
    ) {
      margin = null;
    }
    if (minPriceEnabled) setSelectedMinMargin(margin);
    setFormData((prev) => ({
      ...prev,
      costPrice: cost,
      minPrice: resolveMinPrice(minPriceEnabled, cost, sale, margin),
    }));
  };

  const handleSaleChange = (sale: number) => {
    const cost = formData.costPrice;
    let margin = selectedMinMargin;
    if (
      minPriceEnabled &&
      margin !== null &&
      !isMinMarginValid(cost, sale, margin)
    ) {
      margin = null;
    }
    if (minPriceEnabled) setSelectedMinMargin(margin);
    setFormData((prev) => ({
      ...prev,
      salePrice: sale,
      minPrice: resolveMinPrice(minPriceEnabled, cost, sale, margin),
    }));
  };

  const handleMinPriceToggle = (enabled: boolean) => {
    setMinPriceEnabled(enabled);
    const cost = formData.costPrice;
    const sale = formData.salePrice;

    if (!enabled) {
      setFormData((prev) => ({ ...prev, minPrice: prev.salePrice }));
      return;
    }

    let margin: MinMarginOption | null = selectedMinMargin ?? 10;
    if (!isMinMarginValid(cost, sale, margin)) {
      margin =
        MIN_MARGIN_OPTIONS.find((m) => isMinMarginValid(cost, sale, m)) ?? null;
    }
    setSelectedMinMargin(margin);
    setFormData((prev) => ({
      ...prev,
      minPrice: resolveMinPrice(true, cost, sale, margin),
    }));
  };

  const handleMinMarginSelect = (margin: MinMarginOption) => {
    const cost = formData.costPrice;
    const sale = formData.salePrice;
    if (!minPriceEnabled || !isMinMarginValid(cost, sale, margin)) return;
    setSelectedMinMargin(margin);
    setFormData((prev) => ({
      ...prev,
      minPrice: minPriceFromSaleDiscount(sale, cost, margin),
    }));
  };

  const handleChange = (
    field: keyof ProductFormData,
    value: string | number | boolean | ProductUnit | string[],
  ) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Compress image if too large (max 2MB)
      let processedFile = file;
      if (file.size > 2 * 1024 * 1024) {
        processedFile = await compressImage(file);
      }

      const key = `products/${Date.now()}-${processedFile.name}`;
      const publicUrl = await uploadFile(processedFile, key);

      setFormData((prev) => ({
        ...prev,
        photos: [publicUrl], // Only one photo
      }));
      toast.success(t.messages.success.uploaded);
    } catch (error) {
      console.error("Failed to upload photo:", error);
      toast.error(t.messages.error.upload);
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions (max 1200px)
          const maxSize = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.8 quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t.validation.required);
      return;
    }
    if (formData.salePrice <= formData.costPrice) {
      toast.error(t.products.validation.saleBelowCost);
      return;
    }
    if (minPriceEnabled) {
      if (selectedMinMargin === null) {
        toast.error(t.products.validation.minMarginRequired);
        return;
      }
      if (formData.minPrice <= formData.costPrice) {
        toast.error(t.products.validation.minBelowCost);
        return;
      }
      if (formData.minPrice >= formData.salePrice) {
        toast.error(t.products.validation.minAboveSale);
        return;
      }
    }

    onSubmit({
      ...formData,
      minPrice: minPriceEnabled ? formData.minPrice : formData.salePrice,
    });
  };

  const units: ProductUnit[] = [
    "piece",
    "liter",
    "kilogram",
    "meter",
    "box",
    "set",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rtl-auto">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t.products.name}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="اسم المنتج"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t.labels.description}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="وصف المنتج (اختياري)"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode">{t.products.barcode}</Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => handleChange("barcode", e.target.value)}
            placeholder="6291001234567"
          />
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <Label htmlFor="photos">{t.labels.photos}</Label>
          <div className="space-y-3">
            {/* Upload Area */}
            <div className="relative">
              <Input
                id="photos"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploading}
                className="hidden"
              />
              {formData.photos.length > 0 ? (
                <div className="relative border-2 border-dashed rounded-lg overflow-hidden flex justify-center">
                  <img
                    src={formData.photos[0]}
                    alt="Product photo"
                    className="max-h-64 max-w-64 object-contain"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => document.getElementById('photos')?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="size-4 mr-2" />
                      {t.actions.upload}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemovePhoto(0)}
                    >
                      <X className="size-4 mr-2" />
                      {t.actions.delete}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById('photos')?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"
                  )}
                >
                  <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isUploading ? t.messages.loading : t.actions.upload}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to upload or drag and drop
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">{t.products.pricingHint}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="costPrice">{t.products.costPrice}</Label>
          <Input
            id="costPrice"
            type="number"
            min={0}
            step={1000}
            value={formData.costPrice || ""}
            onChange={(e) =>
              handleCostChange(parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salePrice">{t.products.salePrice}</Label>
          <Input
            id="salePrice"
            type="number"
            min={0}
            step={1000}
            value={formData.salePrice || ""}
            onChange={(e) =>
              handleSaleChange(parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profitMargin">{t.products.profitMargin}</Label>
          <Input
            id="profitMargin"
            type="text"
            readOnly
            tabIndex={-1}
            className="bg-muted"
            value={profitMargin > 0 ? `${profitMargin}%` : "—"}
          />
        </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="minPriceEnabled" className="text-base">
                {t.products.minPriceEnabled}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t.products.minMarginDiscountHint}
              </p>
            </div>
            <Switch
              id="minPriceEnabled"
              checked={minPriceEnabled}
              onCheckedChange={handleMinPriceToggle}
            />
          </div>

          {minPriceEnabled && (
            <div className="space-y-3 border-t pt-3">
              <Label>{t.products.selectMinMargin}</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                className="flex flex-wrap justify-start gap-2"
                value={
                  selectedMinMargin !== null ? String(selectedMinMargin) : ""
                }
                onValueChange={(value) => {
                  if (value) {
                    handleMinMarginSelect(Number(value) as MinMarginOption);
                  }
                }}
              >
                {MIN_MARGIN_OPTIONS.map((percent) => {
                  const minForOption = minPriceFromSaleDiscount(
                    formData.salePrice,
                    formData.costPrice,
                    percent,
                  );
                  const disabled = !isMinMarginValid(
                    formData.costPrice,
                    formData.salePrice,
                    percent,
                  );
                  return (
                    <ToggleGroupItem
                      key={percent}
                      value={String(percent)}
                      disabled={disabled}
                      className="min-w-28 px-4"
                      aria-label={`${percent}%`}
                    >
                      {percent}%
                      {formData.salePrice > formData.costPrice && !disabled && (
                        <span className="ms-1 text-xs text-muted-foreground">
                          ({minForOption.toLocaleString()} {t.currency.symbol})
                        </span>
                      )}
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
              <div className="space-y-2">
                <Label htmlFor="minPrice">{t.products.minPrice}</Label>
                <Input
                  id="minPrice"
                  type="number"
                  readOnly
                  tabIndex={-1}
                  className="bg-muted"
                  value={formData.minPrice || ""}
                  placeholder="—"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock */}
      <div className="grid gap-4 sm:grid-cols-3">

        <div className="space-y-2">
          <Label htmlFor="unit">{t.products.unit}</Label>
          <Select
            value={formData.unit}
            onValueChange={(value: ProductUnit) => handleChange("unit", value)}

          >
            <SelectTrigger dir="rtl" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {units.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {t.products.units[unit]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

        <div className="space-y-2">
          <Label htmlFor="unitValue">{t.products.unitValue}</Label>
          <Input
            id="unitValue"
            type="number"
            placeholder="3.5"
            min={0.1}
            step={0.1}
            value={formData.unitValue}
            onChange={(e) =>
              handleChange("unitValue", parseFloat(e.target.value) || 1)
            }

          />
        </div>

        <div>
          <div className="flex items-center gap-2 mt-6 justify-between">
            <Label htmlFor="unitAdjustable" className="text-sm">{t.products.unitAdjustable}</Label>
            <Switch
              id="unitAdjustable"
              checked={formData.unitAdjustable}
              onCheckedChange={(checked) => handleChange("unitAdjustable", checked)}
            />
          </div>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1.5 mb-2.5">
            {/* <Info className="size-3.5 shrink-0 mt-0.5" /> */}
            <span>{t.products.unitNote}</span>
          </p>
        </div>


        <div className="space-y-2">
          <Label htmlFor="stock">{t.products.stock}</Label>
          <Input
            id="stock"
            type="number"
            min={0}
            value={formData.stock}
            onChange={(e) =>
              handleChange("stock", parseInt(e.target.value) || 0)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minStock">{t.products.minStock}</Label>
          <Input
            id="minStock"
            type="number"
            min={0}
            value={formData.minStock}
            onChange={(e) =>
              handleChange("minStock", parseInt(e.target.value) || 0)
            }
          />
        </div>
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
// Product Card Component (for grid view)
// =============================================================================

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  canWrite: boolean;
}

function ProductCard({ product, onEdit, onDelete, canWrite }: ProductCardProps) {
  const { t } = useTranslation();

  const getStockStatus = () => {
    if (product.stock === 0)
      return { label: t.products.outOfStock, variant: "destructive" as const };
    if (product.stock <= product.minStock)
      return { label: t.products.lowStock, variant: "warning" as const };
    return { label: t.products.inStock, variant: "default" as const };
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="card-hover group relative">
      {canWrite && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Pencil className="ml-2 size-4" />
                {t.actions.edit}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(product)}
              >
                <Trash2 className="ml-2 size-4" />
                {t.actions.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {product.photos && product.photos.length > 0 ? (
            <img
              src={product.photos[0]}
              alt={product.name}
              className="size-14 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Package className="size-7" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{product.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {Number(product.unitValue) || 1} {t.products.units[product.unit]}
            </p>
            {product.barcode && (
              <p
                className="text-xs text-muted-foreground flex items-center gap-1 mt-1"
                dir="ltr"
              >
                <Barcode className="size-3" />
                {product.barcode}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm">
          <p className="text-muted-foreground text-xs">
            {t.products.salePrice}
          </p>
          <p className="font-semibold text-primary">
            {product.salePrice} {t.currency.symbol}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Badge
            variant={
              stockStatus.variant === "warning"
                ? "secondary"
                : stockStatus.variant
            }
            className={cn(
              stockStatus.variant === "warning" &&
              "bg-warning/10 text-warning border-warning/20",
            )}
          >
            {stockStatus.label}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Box className="size-3" />
            {product.stock}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Main Products Page Component
// =============================================================================

export function ProductsPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("products", "write");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<
    "all" | "in-stock" | "low-stock" | "out-of-stock"
  >("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<
    Product | undefined
  >();
  const [deletingProduct, setDeletingProduct] = React.useState<
    Product | undefined
  >();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  // Fetch products on mount
  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsFetching(true);
      const response = await apiClient.get<{ data: Product[]; total: number }>(
        "/products?take=500",
      );
      setProducts(extractListData(response));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error(t.messages.error.general);
    } finally {
      setIsFetching(false);
    }
  };

  const filteredProducts = React.useMemo(() => {
    let result = products;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.barcode?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      );
    }

    // Filter by stock status
    switch (filterStatus) {
      case "in-stock":
        result = result.filter((p) => p.stock > p.minStock);
        break;
      case "low-stock":
        result = result.filter((p) => p.stock > 0 && p.stock <= p.minStock);
        break;
      case "out-of-stock":
        result = result.filter((p) => p.stock === 0);
        break;
    }

    return result;
  }, [products, searchQuery, filterStatus]);

  const stats = React.useMemo(() => {
    const inStock = products.filter((p) => p.stock > p.minStock).length;
    const lowStock = products.filter(
      (p) => p.stock > 0 && p.stock <= p.minStock,
    ).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const totalValue = products.reduce(
      (acc, p) => acc + p.stock * p.costPrice,
      0,
    );
    return { inStock, lowStock, outOfStock, totalValue };
  }, [products]);

  const handleAddNew = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      if (editingProduct) {
        await apiClient.patch(`/products/${editingProduct.id}`, data);
        toast.success(t.messages.success.updated);
      } else {
        await apiClient.post("/products", data);
        toast.success(t.messages.success.created);
      }
      await fetchProducts();
      setIsFormOpen(false);
      setEditingProduct(undefined);
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error(t.messages.error.general);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await apiClient.delete(`/products/${deletingProduct.id}`);
      toast.success(t.messages.success.deleted);
      await fetchProducts();
      setDeletingProduct(undefined);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(t.messages.error.general);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.products.title}</h2>
          <p className="text-muted-foreground">إدارة المنتجات والمخزون</p>
        </div>
        {canWrite && (
          <Button onClick={handleAddNew}>
            <Plus className="ml-1 size-4" />
            {t.products.addNew}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-success/10 text-success">
              <BarChart3 className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inStock}</p>
              <p className="text-sm text-muted-foreground">
                {t.products.inStock}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.lowStock}</p>
              <p className="text-sm text-muted-foreground">
                {t.products.lowStock}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Package className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.outOfStock}</p>
              <p className="text-sm text-muted-foreground">
                {t.products.outOfStock}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.products.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>

        <Tabs
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}
        >
          <TabsList>
            <TabsTrigger value="all">{t.labels.all}</TabsTrigger>
            <TabsTrigger value="in-stock">{t.products.inStock}</TabsTrigger>
            <TabsTrigger value="low-stock">{t.products.lowStock}</TabsTrigger>
            <TabsTrigger value="out-of-stock">
              {t.products.outOfStock}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Products Grid */}
      {isFetching ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t.messages.loading}
            </p>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="size-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">
              {t.messages.empty.noData}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || filterStatus !== "all"
                ? t.messages.empty.noResults
                : "ابدأ بإضافة منتج جديد"}
            </p>
            {canWrite && !searchQuery && filterStatus === "all" && (
              <Button className="mt-4" onClick={handleAddNew}>
                <Plus className="ml-1 size-4" />
                {t.products.addNew}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canWrite={canWrite}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <ResponsiveModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingProduct ? t.products.editProduct : t.products.addNew}
        description={
          editingProduct ? "تعديل بيانات المنتج" : "إضافة منتج جديد للمخزون"
        }
        className="sm:max-w-[600px]"
        dismissible={false}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isLoading}
        />
      </ResponsiveModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t.products.deleteProduct}
        description={`${t.products.deleteConfirm} "${deletingProduct?.name}"`}
        confirmText={t.actions.delete}
        cancelText={t.actions.cancel}
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
