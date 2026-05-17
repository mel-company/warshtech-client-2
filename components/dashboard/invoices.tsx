"use client";

import * as React from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  FileText,
  Phone,
  Car,
  Wrench,
  Package,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Users,
  CircleCheck,
  Loader2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import type {
  Invoice,
  InvoiceFormProduct,
  InvoiceFormService,
  Customer,
  Car as CarType,
  Product,
  Service,
} from "@/types";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
// Invoice Create Form — 3-Step Wizard
// =============================================================================

interface InvoiceFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  invoice?: Invoice | null;
}

const STEPS = [1, 2, 3] as const;
type Step = (typeof STEPS)[number];

function StepIndicator({
  current,
  labels,
}: {
  current: Step;
  labels: string[];
}) {
  const icons = [Users, Package, FileText];

  return (
    <div className="flex items-center justify-between gap-2 mb-6">
      {STEPS.map((step, i) => {
        const Icon = icons[i];
        const isActive = step === current;
        const isDone = step < current;
        return (
          <React.Fragment key={step}>
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors",
                  isDone ? "bg-primary" : "bg-muted",
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 transition-all",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isDone && "border-primary bg-primary/10 text-primary",
                  !isActive && !isDone && "border-muted-foreground/30 text-muted-foreground/50",
                )}
              >
                {isDone ? (
                  <CircleCheck className="size-5" />
                ) : (
                  <Icon className="size-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center max-w-[80px] leading-tight",
                  isActive && "text-primary",
                  isDone && "text-primary/80",
                  !isActive && !isDone && "text-muted-foreground",
                )}
              >
                {labels[i]}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function InvoiceForm({ onSubmit, onCancel, isLoading, invoice }: InvoiceFormProps) {
  const { t } = useTranslation();
  const isEditing = !!invoice;
  const [step, setStep] = React.useState<Step>(1);

  // Step 1 — Customer & Car (unified inputs)
  const [custPhone, setCustPhone] = React.useState(invoice?.customer?.phone || "");
  const [custName, setCustName] = React.useState(invoice?.customer?.name || "");
  const [matchedCustomer, setMatchedCustomer] = React.useState<Customer | null>(null);

  const [carNumber, setCarNumber] = React.useState(invoice?.car?.number || "");
  const [carName, setCarName] = React.useState(invoice?.car?.name || "");
  const [carModel, setCarModel] = React.useState(invoice?.car?.model || "");
  const [carColor, setCarColor] = React.useState(invoice?.car?.color || "");
  const [matchedCar, setMatchedCar] = React.useState<(CarType & { customer?: { id: string } }) | null>(null);

  const [isSearchingPhone, setIsSearchingPhone] = React.useState(false);
  const [isSearchingCar, setIsSearchingCar] = React.useState(false);
  const [isSavingStep1, setIsSavingStep1] = React.useState(false);

  // Step 2 — Services & Products
  const [serviceSearch, setServiceSearch] = React.useState("");
  const [productSearch, setProductSearch] = React.useState("");
  const [availableServices, setAvailableServices] = React.useState<Service[]>([]);
  const [availableProducts, setAvailableProducts] = React.useState<Product[]>([]);
  const [selectedServices, setSelectedServices] = React.useState<InvoiceFormService[]>(
    invoice?.services?.map((s) => ({
      serviceId: s.serviceId,
      serviceName: s.service?.name || "",
      price: Number(s.price),
    })) || [],
  );
  const [selectedProducts, setSelectedProducts] = React.useState<InvoiceFormProduct[]>(
    invoice?.products?.map((p) => ({
      productId: p.productId,
      productName: p.product?.name || "",
      quantity: Number(p.quantity),
      unitPrice: Number(p.unitPrice),
      minPrice: Number(p.minPrice),
      unit: p.product?.unit || "",
      unitValue: Number(p.quantity),
      unitAdjustable: p.product?.unitAdjustable || false,
      originalUnitValue: Number(p.product?.unitValue) || 1,
      originalPrice: Number(p.unitPrice),
      originalMinPrice: Number(p.minPrice),
    })) || [],
  );
  const [filteredServices, setFilteredServices] = React.useState<Service[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const [showServiceDropdown, setShowServiceDropdown] = React.useState(false);
  const [showProductDropdown, setShowProductDropdown] = React.useState(false);

  // Step 3 — Price
  const [finalPrice, setFinalPrice] = React.useState(invoice ? Number(invoice.finalPrice) : 0);
  const [notes, setNotes] = React.useState(invoice?.notes || "");

  // Load services and products when entering step 2
  React.useEffect(() => {
    if (step !== 2 || availableServices.length > 0) return;
    const loadData = async () => {
      try {
        const [servicesRes, productsRes] = await Promise.all([
          apiClient.get<{ data: Service[] }>("/services?take=100"),
          apiClient.get<{ data: Product[] }>("/products?take=100"),
        ]);
        setAvailableServices(servicesRes.data || []);
        setAvailableProducts(productsRes.data || []);
      } catch {
        toast.error(t.messages.error.fetchFailed);
      }
    };
    loadData();
  }, [step]);

  // Calculate totals
  const totalServicesPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalProductsPrice = selectedProducts.reduce(
    (sum, p) => sum + p.unitPrice,
    0,
  );
  const totalPrice = totalServicesPrice + totalProductsPrice;
  const minPrice = selectedProducts.reduce(
    (sum, p) => sum + p.minPrice,
    0,
  );

  // Auto-set final price when total changes
  React.useEffect(() => {
    setFinalPrice(totalPrice);
  }, [totalPrice]);

  // Filter services
  React.useEffect(() => {
    if (!serviceSearch.trim()) {
      setFilteredServices([]);
      return;
    }
    const query = serviceSearch.toLowerCase();
    setFilteredServices(
      availableServices.filter(
        (s) =>
          s.isActive &&
          s.name.toLowerCase().includes(query) &&
          !selectedServices.find((ss) => ss.serviceId === s.id),
      ),
    );
  }, [serviceSearch, availableServices, selectedServices]);

  // Filter products
  React.useEffect(() => {
    if (!productSearch.trim()) {
      setFilteredProducts([]);
      return;
    }
    const query = productSearch.toLowerCase();
    setFilteredProducts(
      availableProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) &&
          !selectedProducts.find((sp) => sp.productId === p.id),
      ),
    );
  }, [productSearch, availableProducts, selectedProducts]);

  // --- Debounced lookups ---------------------------------------------------

  // Lookup customer by phone (partial search, also try +964 prefix)
  React.useEffect(() => {
    const phone = custPhone.trim();
    if (phone.length < 4) { setMatchedCustomer(null); setIsSearchingPhone(false); return; }
    setIsSearchingPhone(true);
    const timeout = setTimeout(async () => {
      try {
        // Try partial search
        const res = await apiClient.get<{ data: Customer[] }>(
          `/customers?search=${encodeURIComponent(phone)}&take=1`,
        );
        if (res.data?.length > 0) {
          setMatchedCustomer(res.data[0]);
        } else if (!phone.startsWith("+")) {
          // Retry with +964 prefix
          const withPrefix = `+964${phone.replace(/^0/, "")}`;
          const res2 = await apiClient.get<{ data: Customer[] }>(
            `/customers?search=${encodeURIComponent(withPrefix)}&take=1`,
          );
          setMatchedCustomer(res2.data?.length > 0 ? res2.data[0] : null);
        } else {
          setMatchedCustomer(null);
        }
      } catch {
        setMatchedCustomer(null);
      } finally {
        setIsSearchingPhone(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [custPhone]);

  // Lookup car by plate number
  React.useEffect(() => {
    const plate = carNumber.trim();
    if (plate.length < 2) { setMatchedCar(null); setIsSearchingCar(false); return; }
    setIsSearchingCar(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await apiClient.get<{ data: any[] }>(
          `/cars?search=${encodeURIComponent(plate)}`,
        );
        if (res.data?.length > 0) {
          setMatchedCar(res.data[0]);
        } else {
          setMatchedCar(null);
        }
      } catch {
        setMatchedCar(null);
      } finally {
        setIsSearchingCar(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [carNumber]);

  // --- Handlers -----------------------------------------------------------

  const applyMatchedCustomer = () => {
    if (!matchedCustomer) return;
    setCustName(matchedCustomer.name);
    setCustPhone(matchedCustomer.phone);
  };

  const applyMatchedCar = async () => {
    if (!matchedCar) return;
    setCarName(matchedCar.name);
    setCarModel(matchedCar.model);
    setCarColor(matchedCar.color);
    // Also apply customer from the car's owner
    if (matchedCar.customer) {
      try {
        const cust = await apiClient.get<Customer>(`/customers/${matchedCar.customer.id}`);
        setMatchedCustomer(cust);
        setCustName(cust.name);
        setCustPhone(cust.phone);
      } catch { /* ignore */ }
    }
  };

  // Resolve customer & car (create or update) when going to step 2
  const resolveStep1 = async (): Promise<{ customerId: string; carId: string } | null> => {
    setIsSavingStep1(true);
    try {
      let customerId: string;

      if (matchedCustomer) {
        // Update existing customer if data changed
        const nameChanged = custName.trim() !== matchedCustomer.name;
        const phoneChanged = custPhone.trim() !== matchedCustomer.phone;
        if (nameChanged || phoneChanged) {
          await apiClient.patch(`/customers/${matchedCustomer.id}`, {
            ...(nameChanged ? { name: custName.trim() } : {}),
            ...(phoneChanged ? { phone: custPhone.trim() } : {}),
          });
        }
        customerId = matchedCustomer.id;
      } else {
        // Create new customer
        const newCustomer = await apiClient.post<Customer>("/customers", {
          name: custName.trim(),
          phone: custPhone.trim(),
        });
        setMatchedCustomer(newCustomer);
        customerId = newCustomer.id;
      }

      let carId: string;

      if (matchedCar && matchedCar.id) {
        // Update existing car if data changed
        const changes: Record<string, string> = {};
        if (carName.trim() !== matchedCar.name) changes.name = carName.trim();
        if (carNumber.trim() !== matchedCar.number) changes.number = carNumber.trim();
        if (carModel.trim() !== matchedCar.model) changes.model = carModel.trim();
        if (carColor.trim() !== matchedCar.color) changes.color = carColor.trim();
        if (Object.keys(changes).length > 0) {
          await apiClient.put(`/customers/${customerId}/cars/${matchedCar.id}`, changes);
        }
        carId = matchedCar.id;
      } else {
        // Create new car
        const newCar = await apiClient.post<CarType>(`/customers/${customerId}/cars`, {
          name: carName.trim(),
          number: carNumber.trim(),
          model: carModel.trim(),
          color: carColor.trim(),
        });
        setMatchedCar(newCar);
        carId = newCar.id;
      }

      return { customerId, carId };
    } catch (error: any) {
      toast.error(error?.message || t.messages.error.general);
      return null;
    } finally {
      setIsSavingStep1(false);
    }
  };

  const handleAddService = (service: Service) => {
    setSelectedServices([
      ...selectedServices,
      { serviceId: service.id, serviceName: service.name, price: Number(service.price) },
    ]);
    setServiceSearch("");
    setShowServiceDropdown(false);
  };

  const handleRemoveService = (index: number) =>
    setSelectedServices(selectedServices.filter((_, i) => i !== index));

  const handleServicePriceChange = (index: number, price: number) => {
    const updated = [...selectedServices];
    updated[index] = { ...updated[index], price };
    setSelectedServices(updated);
  };

  const handleAddProduct = (product: Product) => {
    const uv = Number(product.unitValue) || 1;
    setSelectedProducts([
      ...selectedProducts,
      {
        productId: product.id,
        productName: product.name,
        quantity: uv,
        unitPrice: Number(product.salePrice),
        minPrice: Number(product.minPrice),
        unit: product.unit,
        unitValue: uv,
        unitAdjustable: product.unitAdjustable || false,
        originalUnitValue: uv,
        originalPrice: Number(product.salePrice),
        originalMinPrice: Number(product.minPrice),
      },
    ]);
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const handleRemoveProduct = (index: number) =>
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));

  const handleProductUnitValueChange = (index: number, newUnitValue: number) => {
    const updated = [...selectedProducts];
    const p = updated[index];
    const ratio = newUnitValue / p.originalUnitValue;
    updated[index] = {
      ...p,
      unitValue: newUnitValue,
      quantity: newUnitValue,
      unitPrice: Math.round(p.originalPrice * ratio),
      minPrice: Math.round(p.originalMinPrice * ratio),
    };
    setSelectedProducts(updated);
  };

  const handleProductPriceChange = (index: number, newPrice: number) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], unitPrice: newPrice };
    setSelectedProducts(updated);
  };

  // --- Resolved IDs from step 1 -------------------------------------------

  const [resolvedCustomerId, setResolvedCustomerId] = React.useState<string | null>(invoice?.customerId || null);
  const [resolvedCarId, setResolvedCarId] = React.useState<string | null>(invoice?.carId || null);

  // --- Step navigation -----------------------------------------------------

  const step1Valid = custPhone.trim().length > 0 && custName.trim().length > 0
    && carNumber.trim().length > 0 && carName.trim().length > 0
    && carModel.trim().length > 0 && carColor.trim().length > 0;

  const canGoNext = (): boolean => {
    if (step === 1) return step1Valid;
    if (step === 2) return selectedServices.length > 0 || selectedProducts.length > 0;
    return true;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!step1Valid) return;
      const result = await resolveStep1();
      if (!result) return;
      setResolvedCustomerId(result.customerId);
      setResolvedCarId(result.carId);
      setStep(2);
      return;
    }
    if (step === 2 && selectedServices.length === 0 && selectedProducts.length === 0) {
      toast.error("يجب إضافة خدمة أو منتج واحد على الأقل");
      return;
    }
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = () => {
    if (finalPrice < minPrice) {
      toast.error(t.invoices.priceBelowMin);
      return;
    }
    onSubmit({
      customerId: resolvedCustomerId,
      carId: resolvedCarId,
      services: selectedServices.map((s) => ({ serviceId: s.serviceId, price: s.price })),
      products: selectedProducts.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
      })),
      finalPrice,
      notes: notes.trim() || undefined,
    });
  };

  // --- Step labels ---------------------------------------------------------

  const stepLabels = [
    t.invoices.steps.customerAndCar,
    t.invoices.steps.productsAndServices,
    t.invoices.steps.priceAndConfirm,
  ];

  // --- Render each step ----------------------------------------------------

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* --- Customer --- */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-1.5">
          <Users className="size-4" />
          {t.invoices.customer}
        </Label>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t.invoices.customerPhone}</Label>
            <div className="relative">
              <Input
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="+964 أو رقم الهاتف"
                dir="ltr"
                className="pr-8"
              />
              {isSearchingPhone && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {matchedCustomer && !isSearchingPhone && (
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                onClick={applyMatchedCustomer}
              >
                <CheckCircle className="size-3" />
                {matchedCustomer.name} — <span dir="ltr">{matchedCustomer.phone}</span>
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t.invoices.customerName}</Label>
            <Input
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder={t.invoices.customerName}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* --- Car --- */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-1.5">
          <Car className="size-4" />
          {t.invoices.car}
        </Label>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t.invoices.carNumber}</Label>
            <div className="relative">
              <Input
                value={carNumber}
                onChange={(e) => setCarNumber(e.target.value)}
                placeholder="أ ب ج 1234"
                className="pl-8"
              />
              {isSearchingCar && (
                <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {matchedCar && !isSearchingCar && (
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                onClick={applyMatchedCar}
              >
                <CheckCircle className="size-3" />
                {matchedCar.name} — {matchedCar.number} — {matchedCar.model}
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t.invoices.carName}</Label>
            <Input
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
              placeholder={t.invoices.carName}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t.invoices.carModel}</Label>
            <Input
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              placeholder="Toyota Corolla 2024"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t.invoices.carColor}</Label>
            <Input
              value={carColor}
              onChange={(e) => setCarColor(e.target.value)}
              placeholder="أبيض"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Services */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-1.5">
          <Wrench className="size-4" />
          {t.invoices.services}
        </Label>

        <div className="relative">
          <Input
            value={serviceSearch}
            onChange={(e) => { setServiceSearch(e.target.value); setShowServiceDropdown(true); }}
            onFocus={() => setShowServiceDropdown(true)}
            placeholder={t.invoices.searchServices}
          />
          {showServiceDropdown && filteredServices.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => handleAddService(service)}
                >
                  <span>{service.name}</span>
                  <Badge variant="secondary">{Number(service.price)} {t.currency.symbol}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedServices.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-3">{t.invoices.noServices}</p>
        ) : (
          <div className="space-y-2">
            {selectedServices.map((service, index) => (
              <div key={service.serviceId} className="flex items-center gap-3 rounded-lg border p-3">
                <Wrench className="size-4 text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm font-medium">{service.serviceName}</span>
                <Input
                  type="number"
                  value={service.price}
                  onChange={(e) => handleServicePriceChange(index, Number(e.target.value))}
                  className="w-24 text-center"
                  min={0}
                />
                <span className="text-xs text-muted-foreground shrink-0">{t.currency.symbol}</span>
                <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive shrink-0" onClick={() => handleRemoveService(index)}>
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Products */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-1.5">
          <Package className="size-4" />
          {t.invoices.products}
        </Label>

        <div className="relative">
          <Input
            value={productSearch}
            onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
            onFocus={() => setShowProductDropdown(true)}
            placeholder={t.invoices.searchProducts}
          />
          {showProductDropdown && filteredProducts.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => handleAddProduct(product)}
                >
                  <div>
                    <span>{product.name}</span>
                    <span className="mx-2 text-muted-foreground text-xs">
                      ({Number(product.unitValue) || 1} {t.products.units[product.unit as keyof typeof t.products.units] || product.unit})
                    </span>
                  </div>
                  <Badge variant="secondary">{Number(product.salePrice)} {t.currency.symbol}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedProducts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-3">{t.invoices.noProducts}</p>
        ) : (
          <div className="space-y-2">
            {selectedProducts.map((product, index) => (
              <div key={product.productId} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate flex-1">{product.productName}</span>
                  <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive shrink-0" onClick={() => handleRemoveProduct(index)}>
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {product.unitAdjustable ? (
                    <div className="flex items-center gap-1 flex-1">
                      <Input
                        type="number"
                        value={product.unitValue}
                        onChange={(e) => handleProductUnitValueChange(index, Math.max(0.01, Number(e.target.value)))}
                        className="w-20 text-center"
                        min={0.01}
                        step={0.1}
                      />
                      <span className="text-xs text-muted-foreground shrink-0">
                        {t.products.units[product.unit as keyof typeof t.products.units] || product.unit}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground flex-1">
                      {product.unitValue} {t.products.units[product.unit as keyof typeof t.products.units] || product.unit}
                    </span>
                  )}
                  <Input
                    type="number"
                    value={product.unitPrice}
                    onChange={(e) => handleProductPriceChange(index, Number(e.target.value))}
                    className="w-24 text-center"
                    min={0}
                  />
                  <span className="text-xs text-muted-foreground shrink-0">{t.currency.symbol}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      {/* Summary of customer + car */}
      <div className="rounded-lg border p-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm">
          <Users className="size-4 text-muted-foreground" />
          <span className="font-medium">{custName}</span>
          <span className="text-muted-foreground" dir="ltr">{custPhone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Car className="size-4 text-muted-foreground" />
          <span className="font-medium">{carName}</span>
          <span className="text-muted-foreground">{carNumber} • {carModel}</span>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="rounded-lg bg-muted/50 p-4 space-y-3">
        {selectedServices.length > 0 && (
          <>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.invoices.services}</p>
            {selectedServices.map((s) => (
              <div key={s.serviceId} className="flex justify-between text-sm">
                <span>{s.serviceName}</span>
                <span>{s.price.toFixed(0)} {t.currency.symbol}</span>
              </div>
            ))}
          </>
        )}
        {selectedProducts.length > 0 && (
          <>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">{t.invoices.products}</p>
            {selectedProducts.map((p) => (
              <div key={p.productId} className="flex justify-between text-sm">
                <span>{p.productName} — {p.unitValue} {t.products.units[p.unit as keyof typeof t.products.units] || p.unit}</span>
                <span>{p.unitPrice.toFixed(0)} {t.currency.symbol}</span>
              </div>
            ))}
          </>
        )}

        <Separator />
        <div className="flex justify-between font-medium">
          <span>{t.invoices.totalPrice}</span>
          <span>{totalPrice.toFixed(0)} {t.currency.symbol}</span>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label className="font-semibold">{t.invoices.finalPrice}</Label>
          <Input
            type="number"
            value={finalPrice}
            onChange={(e) => setFinalPrice(Number(e.target.value))}
            className="text-lg font-bold text-center"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>{t.invoices.notes}</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="ملاحظات إضافية..."
          rows={2}
        />
      </div>
    </div>
  );

  // --- Main render ---------------------------------------------------------

  return (
    <form onSubmit={(e) => e.preventDefault()} className="rtl-auto">
      <StepIndicator current={step} labels={stepLabels} />

      <div className="min-h-[320px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2 pt-6 mt-4 border-t">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={handleBack}>
            <ArrowRight className="ml-1 size-4" />
            {t.invoices.steps.previous}
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t.actions.cancel}
          </Button>
        )}

        <div className="flex-1" />

        {step < 3 ? (
          <Button type="button" onClick={handleNext} disabled={!canGoNext() || isSavingStep1}>
            {isSavingStep1 ? t.messages.loading : t.invoices.steps.next}
            {!isSavingStep1 && <ArrowLeft className="mr-1 size-4" />}
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isLoading || finalPrice < minPrice}>
            {isLoading ? t.messages.loading : t.actions.save}
          </Button>
        )}
      </div>
    </form>
  );
}

// =============================================================================
// Invoice Detail View
// =============================================================================

function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">{t.invoices.invoiceNumber}</p>
          <p className="font-medium" dir="ltr">{invoice.invoiceNumber}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t.invoices.status}</p>
          <StatusBadge status={invoice.status} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t.invoices.customer}</p>
          <p className="font-medium">{invoice.customer.name}</p>
          <p className="text-xs text-muted-foreground" dir="ltr">{invoice.customer.phone}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t.invoices.car}</p>
          <p className="font-medium">{invoice.car.name} - {invoice.car.number}</p>
          <p className="text-xs text-muted-foreground">{invoice.car.model} • {invoice.car.color}</p>
        </div>
      </div>

      {invoice.services.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-sm font-semibold mb-2">{t.invoices.services}</p>
            {invoice.services.map((s) => (
              <div key={s.id} className="flex justify-between text-sm py-1">
                <span>{s.service.name}</span>
                <span>{Number(s.price)} {t.currency.symbol}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {invoice.products.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-sm font-semibold mb-2">{t.invoices.products}</p>
            {invoice.products.map((p) => (
              <div key={p.id} className="flex justify-between text-sm py-1">
                <span>
                  {p.product.name} — {Number(p.quantity)} {t.products.units[p.product.unit as keyof typeof t.products.units] || p.product.unit}
                </span>
                <span>{Number(p.total)} {t.currency.symbol}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <Separator />
      <div className="rounded-lg bg-muted/50 p-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span>{t.invoices.totalPrice}</span>
          <span>{Number(invoice.totalPrice)} {t.currency.symbol}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-1">
          <span>{t.invoices.finalPrice}</span>
          <span>{Number(invoice.finalPrice)} {t.currency.symbol}</span>
        </div>
      </div>

      {invoice.notes && (
        <div>
          <p className="text-sm text-muted-foreground">{t.invoices.notes}</p>
          <p className="text-sm">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Status Badge
// =============================================================================

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  const config: Record<string, { className: string; icon: React.ElementType }> = {
    PENDING: { className: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400", icon: Clock },
    COMPLETED: { className: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400", icon: CheckCircle },
    CANCELLED: { className: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400", icon: XCircle },
  };

  const { className, icon: Icon } = config[status] || config.PENDING;

  return (
    <Badge variant="outline" className={cn("gap-1 font-normal", className)}>
      <Icon className="size-3" />
      {(t.invoices.statuses as any)[status] || status}
    </Badge>
  );
}

// =============================================================================
// Invoice Row
// =============================================================================

interface InvoiceRowProps {
  invoice: Invoice;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onStatusChange: (invoice: Invoice, status: string) => void;
  onDelete: (invoice: Invoice) => void;
  canWrite: boolean;
}

function InvoiceRow({ invoice, onView, onEdit, onStatusChange, onDelete, canWrite }: InvoiceRowProps) {
  const { t } = useTranslation();

  return (
    <TableRow className="table-row-hover cursor-pointer" onClick={() => onView(invoice)}>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium" dir="ltr">{invoice.invoiceNumber}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(invoice.createdAt).toLocaleDateString("ar-SA")}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{invoice.customer.name}</span>
          <span className="text-xs text-muted-foreground" dir="ltr">
            {invoice.customer.phone}
          </span>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="flex flex-col">
          <span className="text-sm">{invoice.car.name}</span>
          <span className="text-xs text-muted-foreground">{invoice.car.number}</span>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <span className="font-medium">
          {Number(invoice.finalPrice)} {t.currency.symbol}
        </span>
      </TableCell>
      <TableCell>
        <StatusBadge status={invoice.status} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onView(invoice)}
          >
            <Eye className="size-4" />
          </Button>
          {canWrite && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {invoice.status === "PENDING" && (
                  <DropdownMenuItem onClick={() => onEdit(invoice)}>
                    <Pencil className="ml-2 size-4" />
                    {t.actions.edit}
                  </DropdownMenuItem>
                )}
                {invoice.status === "PENDING" && (
                  <DropdownMenuItem onClick={() => onStatusChange(invoice, "COMPLETED")}>
                    <CheckCircle className="ml-2 size-4" />
                    إكمال الفاتورة
                  </DropdownMenuItem>
                )}
                {invoice.status === "PENDING" && (
                  <DropdownMenuItem onClick={() => onStatusChange(invoice, "CANCELLED")}>
                    <XCircle className="ml-2 size-4" />
                    إلغاء الفاتورة
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(invoice)}
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
  );
}

// =============================================================================
// Main Invoices Page
// =============================================================================

export function InvoicesPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("invoices", "write");

  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = React.useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = React.useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  React.useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsFetching(true);
      const response = await apiClient.get<{ data: Invoice[]; total: number }>(
        "/invoices?take=100",
      );
      setInvoices(response.data || []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      toast.error(t.messages.error.general);
    } finally {
      setIsFetching(false);
    }
  };

  const filteredInvoices = React.useMemo(() => {
    if (!searchQuery) return invoices;
    const query = searchQuery.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.customer.name.toLowerCase().includes(query) ||
        inv.customer.phone.includes(query) ||
        inv.car.number.toLowerCase().includes(query),
    );
  }, [invoices, searchQuery]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await apiClient.post("/invoices", data);
      toast.success(t.messages.success.created);
      await fetchInvoices();
      setIsFormOpen(false);
    } catch (error: any) {
      console.error("Failed to create invoice:", error);
      toast.error(error?.message || t.messages.error.general);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (invoice: Invoice, status: string) => {
    try {
      await apiClient.patch(`/invoices/${invoice.id}/status`, { status });
      toast.success(t.messages.success.updated);
      await fetchInvoices();
    } catch {
      toast.error(t.messages.error.general);
    }
  };

  const handleDelete = (invoice: Invoice) => {
    setDeletingInvoice(invoice);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingInvoice) return;
    try {
      await apiClient.delete(`/invoices/${deletingInvoice.id}`);
      toast.success(t.messages.success.deleted);
      await fetchInvoices();
      setDeletingInvoice(null);
    } catch {
      toast.error(t.messages.error.general);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (data: any) => {
    if (!editingInvoice) return;
    setIsLoading(true);
    try {
      await apiClient.patch(`/invoices/${editingInvoice.id}`, data);
      toast.success(t.messages.success.updated);
      await fetchInvoices();
      setIsEditOpen(false);
      setEditingInvoice(null);
    } catch (error: any) {
      console.error("Failed to update invoice:", error);
      toast.error(error?.message || t.messages.error.general);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setIsViewOpen(true);
  };

  // Stats
  const totalRevenue = invoices
    .filter((i) => i.status === "COMPLETED")
    .reduce((sum, i) => sum + Number(i.finalPrice), 0);
  const pendingCount = invoices.filter((i) => i.status === "PENDING").length;
  const completedCount = invoices.filter((i) => i.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.invoices.title}</h2>
          <p className="text-muted-foreground">إدارة الفواتير والمبيعات</p>
        </div>
        {canWrite && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="ml-1 size-4" />
            {t.invoices.addNew}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t.invoices.searchPlaceholder}
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
              <FileText className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{invoices.length}</p>
              <p className="text-sm text-muted-foreground">إجمالي الفواتير</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
              <CheckCircle className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">
                مكتملة / {pendingCount} معلقة
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
              <Package className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                إجمالي الإيرادات ({t.currency.symbol})
              </p>
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
              <p className="mt-4 text-sm text-muted-foreground">{t.messages.loading}</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="size-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">{t.messages.empty.noData}</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? t.messages.empty.noResults : "ابدأ بإنشاء فاتورة جديدة"}
              </p>
              {canWrite && !searchQuery && (
                <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
                  <Plus className="ml-1 size-4" />
                  {t.invoices.addNew}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.invoices.invoiceNumber}</TableHead>
                  <TableHead>{t.invoices.customer}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t.invoices.car}</TableHead>
                  <TableHead className="hidden md:table-cell">{t.invoices.finalPrice}</TableHead>
                  <TableHead>{t.invoices.status}</TableHead>
                  <TableHead className="w-[100px]">{t.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    onView={handleView}
                    onEdit={handleEdit}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    canWrite={canWrite}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Form Modal */}
      <ResponsiveModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={t.invoices.addNew}
        description="إنشاء فاتورة جديدة مع الخدمات والمنتجات"
        className="sm:max-w-[700px]"
      >
        <InvoiceForm
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isLoading}
        />
      </ResponsiveModal>

      {/* Edit Form Modal */}
      <ResponsiveModal
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditingInvoice(null);
        }}
        title={`${t.actions.edit} — ${editingInvoice?.invoiceNumber || ""}`}
        description="تعديل الفاتورة"
        className="sm:max-w-[700px]"
      >
        {editingInvoice && (
          <InvoiceForm
            onSubmit={handleEditSubmit}
            onCancel={() => { setIsEditOpen(false); setEditingInvoice(null); }}
            isLoading={isLoading}
            invoice={editingInvoice}
          />
        )}
      </ResponsiveModal>

      {/* View Invoice Modal */}
      <ResponsiveModal
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        title={viewingInvoice?.invoiceNumber || ""}
        description="تفاصيل الفاتورة"
      >
        {viewingInvoice && <InvoiceDetail invoice={viewingInvoice} />}
      </ResponsiveModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t.invoices.deleteInvoice}
        description={`${t.invoices.deleteConfirm} "${deletingInvoice?.invoiceNumber}"`}
        confirmText={t.actions.delete}
        cancelText={t.actions.cancel}
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
