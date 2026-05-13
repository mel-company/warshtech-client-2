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
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type { Product, ProductUnit, ProductFormData } from "@/types";
import apiClient from "@/lib/api";
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
import { ResponsiveModal, ConfirmDialog } from "@/components/responsive-modal";

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
  const [formData, setFormData] = React.useState<ProductFormData>({
    name: product?.name || "",
    minPrice: product?.minPrice || 0,
    costPrice: product?.costPrice || 0,
    salePrice: product?.salePrice || 0,
    photos: product?.photos || [],
    unit: product?.unit || "piece",
    stock: product?.stock || 0,
    minStock: product?.minStock || 0,
    barcode: product?.barcode || "",
    description: product?.description || "",
  });

  const handleChange = (
    field: keyof ProductFormData,
    value: string | number | ProductUnit,
  ) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t.validation.required);
      return;
    }
    if (formData.salePrice < formData.costPrice) {
      toast.error("سعر البيع يجب أن يكون أكبر من سعر التكلفة");
      return;
    }
    onSubmit(formData);
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
      </div>

      {/* Pricing */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="costPrice">{t.products.costPrice}</Label>
          <Input
            id="costPrice"
            type="number"
            min={0}
            step={1000}
            value={formData.costPrice}
            onChange={(e) =>
              handleChange("costPrice", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minPrice">{t.products.minPrice}</Label>
          <Input
            id="minPrice"
            type="number"
            min={0}
            step={1000}
            value={formData.minPrice}
            onChange={(e) =>
              handleChange("minPrice", parseFloat(e.target.value) || 0)
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
            value={formData.salePrice}
            onChange={(e) =>
              handleChange("salePrice", parseFloat(e.target.value) || 0)
            }
          />
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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {t.products.units[unit]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
}

function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
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

      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Package className="size-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{product.name}</h3>
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

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">
              {t.products.costPrice}
            </p>
            <p className="font-medium">
              {product.costPrice} {t.currency.symbol}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">
              {t.products.salePrice}
            </p>
            <p className="font-semibold text-primary">
              {product.salePrice} {t.currency.symbol}
            </p>
          </div>
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
          <span className="text-sm text-muted-foreground">
            {product.stock} {t.products.units[product.unit]}
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
        "/products",
      );
      setProducts(response.data || []);
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
        <Button onClick={handleAddNew}>
          <Plus className="ml-1 size-4" />
          {t.products.addNew}
        </Button>
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
            {!searchQuery && filterStatus === "all" && (
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
