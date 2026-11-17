"use client";

import * as React from "react";
import {
  Search,
  Package,
  Wrench,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  Loader2,
  Banknote,
  RotateCcw,
  Building2,
  UserCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import apiClient from "@/lib/api";
import { getPosPermissionGaps } from "@/lib/pos-permissions";
import { canSellFromPos } from "@/lib/user-capabilities";
import { extractListData } from "@/lib/list-response";
import { resolveCashPosSale, resolveCompanyPosSale, type PosBuyerType } from "@/lib/pos-checkout";
import type {
  Company,
  InvoiceFormProduct,
  InvoiceFormService,
  Product,
  Service,
} from "@/types";
import { getTenantId } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PosPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const permissionGaps = React.useMemo(
    () => getPosPermissionGaps(user?.permissions ?? []),
    [user?.permissions],
  );
  const canSell = canSellFromPos(user);
  const [catalogTab, setCatalogTab] = React.useState<"products" | "services">("products");
  const [search, setSearch] = React.useState("");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = React.useState(true);
  const [catalogError, setCatalogError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [cashNoteName, setCashNoteName] = React.useState("");
  const [buyerType, setBuyerType] = React.useState<PosBuyerType>("cash");
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [companySearch, setCompanySearch] = React.useState("");
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string | null>(null);
  const [isLoadingCompanies, setIsLoadingCompanies] = React.useState(false);
  const [customerOpen, setCustomerOpen] = React.useState(true);

  const [selectedServices, setSelectedServices] = React.useState<InvoiceFormService[]>([]);
  const [selectedProducts, setSelectedProducts] = React.useState<InvoiceFormProduct[]>([]);
  const [finalPrice, setFinalPrice] = React.useState(0);

  React.useEffect(() => {
    if (!getTenantId()) {
      setIsLoadingCatalog(false);
      return;
    }

    const load = async () => {
      setCatalogError(null);
      let productList: Product[] = [];
      let serviceList: Service[] = [];
      let hadForbidden = false;
      let hadFailure = false;

      try {
        const productsRes = await apiClient.get<{ data: Product[] }>(
          "/products?take=500",
        );
        productList = extractListData(productsRes);
      } catch (error) {
        hadFailure = true;
        const msg = error instanceof Error ? error.message : "";
        if (msg.toLowerCase().includes("forbidden")) hadForbidden = true;
        console.error("POS products load failed:", error);
      }

      try {
        const servicesRes = await apiClient.get<{ data: Service[] }>(
          "/services?take=500",
        );
        serviceList = extractListData(servicesRes).filter(
          (s) => s.isActive !== false,
        );
      } catch (error) {
        hadFailure = true;
        const msg = error instanceof Error ? error.message : "";
        if (msg.toLowerCase().includes("forbidden")) hadForbidden = true;
        console.error("POS services load failed:", error);
      }

      setProducts(productList);
      setServices(serviceList);

      if (hadForbidden) {
        setCatalogError(t.pos.catalogForbidden);
      } else if (
        !hadFailure &&
        productList.length === 0 &&
        serviceList.length === 0
      ) {
        toast.message(t.pos.catalogEmpty);
      }

      setIsLoadingCatalog(false);
    };
    void load();
  }, [t.pos.catalogEmpty, t.pos.catalogForbidden]);

  React.useEffect(() => {
    if (!getTenantId()) return;
    const loadCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const res = await apiClient.get<{ data: Company[] }>("/companies?take=500");
        setCompanies(extractListData(res));
      } catch (error) {
        console.error("POS companies load failed:", error);
        const message = error instanceof Error ? error.message : t.messages.error.general;
        toast.error(message);
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    void loadCompanies();
  }, [t.messages.error.general]);

  const filteredCompanies = React.useMemo(() => {
    const q = companySearch.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)),
    );
  }, [companies, companySearch]);

  const selectedCompany = React.useMemo(
    () => companies.find((c) => c.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );

  const customerReady =
    buyerType === "cash" || (buyerType === "company" && !!selectedCompanyId);

  const handleBuyerTypeChange = (type: PosBuyerType) => {
    setBuyerType(type);
    if (type === "cash") {
      setSelectedCompanyId(null);
      setCompanySearch("");
    }
  };

  const filteredProducts = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q)),
    );
  }, [products, search]);

  const filteredServices = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => s.name.toLowerCase().includes(q));
  }, [services, search]);

  const totalServices = selectedServices.reduce((s, x) => s + x.price, 0);
  const totalProducts = selectedProducts.reduce((s, x) => s + x.unitPrice, 0);
  const totalPrice = totalServices + totalProducts;
  const minPrice =
    selectedServices.reduce((s, x) => s + x.minPrice, 0) +
    selectedProducts.reduce((s, x) => s + x.minPrice, 0);

  React.useEffect(() => {
    setFinalPrice(totalPrice);
  }, [totalPrice]);

  const addService = (service: Service) => {
    if (selectedServices.some((s) => s.serviceId === service.id)) return;
    setSelectedServices((prev) => [
      ...prev,
      {
        serviceId: service.id,
        serviceName: service.name,
        price: Number(service.price),
        minPrice: Number(service.price),
      },
    ]);
  };

  const productStep = (product: Product) => Number(product.unitValue) || 1;

  const maxProductCount = (product: Product) => {
    const step = productStep(product);
    const stock = Number(product.stock);
    if (!Number.isFinite(stock)) return 99;
    return Math.max(0, Math.floor(stock / step));
  };

  const lineCount = (line: InvoiceFormProduct) => {
    const step = line.originalUnitValue || 1;
    return Math.max(1, Math.round(line.quantity / step));
  };

  const setProductCount = (product: Product, count: number) => {
    const max = maxProductCount(product);
    if (count > max) {
      toast.error(t.products.outOfStock);
      return;
    }
    if (count <= 0) {
      setSelectedProducts((prev) => prev.filter((p) => p.productId !== product.id));
      return;
    }
    const step = productStep(product);
    const sale = Number(product.salePrice);
    const min = Number(product.minPrice) || sale;
    const quantity = step * count;
    const next: InvoiceFormProduct = {
      productId: product.id,
      productName: product.name,
      productPhoto: product.photos?.[0],
      quantity,
      unitPrice: Math.round(sale * count),
      minPrice: Math.round(min * count),
      unit: product.unit,
      unitValue: quantity,
      unitAdjustable: product.unitAdjustable || false,
      originalUnitValue: step,
      originalPrice: sale,
      originalMinPrice: min,
    };
    setSelectedProducts((prev) => {
      const index = prev.findIndex((p) => p.productId === product.id);
      if (index === -1) return [...prev, next];
      const copy = [...prev];
      copy[index] = next;
      return copy;
    });
  };

  const resetSale = () => {
    setSelectedServices([]);
    setSelectedProducts([]);
    setFinalPrice(0);
    setSearch("");
    setCashNoteName("");
    setBuyerType("cash");
    setSelectedCompanyId(null);
    setCompanySearch("");
  };

  const handleCheckout = async () => {
    if (!canSell) {
      toast.error(t.pos.cannotSell);
      return;
    }
    if (selectedServices.length === 0 && selectedProducts.length === 0) {
      toast.error(t.pos.addItems);
      return;
    }
    if (buyerType === "company" && !selectedCompanyId) {
      toast.error(t.pos.completeCompany);
      return;
    }
    if (finalPrice < minPrice) {
      toast.error(t.invoices.priceBelowMin);
      return;
    }

    setIsSubmitting(true);
    try {
      const isCompanySale = buyerType === "company" && !!selectedCompanyId;
      const resolved = isCompanySale
        ? await resolveCompanyPosSale(selectedCompanyId)
        : await resolveCashPosSale({ noteName: cashNoteName });

      const created = await apiClient.post<{ id: string }>("/invoices", {
        ...("customerId" in resolved
          ? { customerId: resolved.customerId, carId: resolved.carId }
          : {}),
        ...("companyId" in resolved ? { companyId: resolved.companyId } : {}),
        services: selectedServices.map((s) => ({
          serviceId: s.serviceId,
          price: s.price,
        })),
        products: selectedProducts.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
        })),
        finalPrice,
        notes: "notes" in resolved ? resolved.notes : undefined,
        paymentMethod: isCompanySale ? "CREDIT" : "CASH",
        paidAmount: isCompanySale ? 0 : finalPrice,
      });

      await apiClient.patch(`/invoices/${created.id}/status`, {
        status: "COMPLETED",
      });

      toast.success(t.pos.saleComplete);
      resetSale();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t.messages.error.general;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {permissionGaps.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <p className="font-medium">{t.pos.missingPermissionsTitle}</p>
          <p className="mt-1 text-muted-foreground">{t.pos.missingPermissionsHint}</p>
          <p className="mt-2 font-mono text-xs" dir="ltr">
            {permissionGaps.join(" · ")}
          </p>
        </div>
      )}
      {catalogError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {catalogError}
        </div>
      )}
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[1fr_380px]">
      <Card className="flex min-h-0 flex-col overflow-hidden border-0 shadow-md">
        <CardHeader className="shrink-0 space-y-3 border-b pb-4">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.pos.searchPlaceholder}
              className="ps-9"
            />
          </div>
          <Tabs
            value={catalogTab}
            onValueChange={(v) => setCatalogTab(v as "products" | "services")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products" className="gap-2">
                <Package className="size-4" />
                {t.invoices.products}
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-2">
                <Wrench className="size-4" />
                {t.invoices.services}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 p-0">
          {isLoadingCatalog ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-full max-h-[calc(100vh-14rem)]">
              <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {catalogTab === "products"
                  ? filteredProducts.map((product) => {
                      const line = selectedProducts.find(
                        (p) => p.productId === product.id,
                      );
                      const count = line ? lineCount(line) : 0;
                      const out = maxProductCount(product) <= 0;
                      return (
                        <div
                          key={product.id}
                          className={cn(
                            "flex flex-col rounded-xl border p-3 text-start",
                            count > 0 && "border-primary bg-primary/5 ring-1 ring-primary/30",
                            out && "opacity-50",
                          )}
                        >
                          {product.photos?.[0] ? (
                            <img
                              src={product.photos[0]}
                              alt=""
                              className="mb-2 h-20 w-full rounded-lg object-cover"
                            />
                          ) : (
                            <div className="mb-2 flex h-20 items-center justify-center rounded-lg bg-muted">
                              <Package className="size-8 text-muted-foreground" />
                            </div>
                          )}
                          <span className="line-clamp-2 text-sm font-medium">
                            {product.name}
                          </span>
                          <span className="mt-1 text-base font-bold text-primary">
                            {Number(product.salePrice).toLocaleString("en-US")}{" "}
                            {t.currency.symbol}
                          </span>
                          <span className="mt-0.5 text-xs text-muted-foreground">
                            {t.products.stock}: {Number(product.stock)}
                          </span>
                          {out ? (
                            <Badge variant="destructive" className="mt-2 w-fit text-xs">
                              {t.products.outOfStock}
                            </Badge>
                          ) : (
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">
                                {count > 0
                                  ? `${count} × ${Number(product.salePrice).toLocaleString("en-US")}`
                                  : t.invoices.quantity}
                              </span>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="size-8"
                                  disabled={count <= 0}
                                  onClick={() => setProductCount(product, count - 1)}
                                >
                                  <Minus className="size-4" />
                                </Button>
                                <span className="w-6 text-center text-sm font-semibold">
                                  {count}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="size-8"
                                  disabled={count >= maxProductCount(product)}
                                  onClick={() => setProductCount(product, count + 1)}
                                >
                                  <Plus className="size-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  : filteredServices.map((service) => {
                      const inCart = selectedServices.some(
                        (s) => s.serviceId === service.id,
                      );
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => addService(service)}
                          className={cn(
                            "flex flex-col rounded-xl border p-4 text-start transition-all hover:border-primary hover:shadow-md",
                            inCart && "border-primary bg-primary/5 ring-1 ring-primary/30",
                          )}
                        >
                          <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                            <Wrench className="size-6 text-primary" />
                          </div>
                          <span className="line-clamp-2 text-sm font-medium">
                            {service.name}
                          </span>
                          <span className="mt-1 text-base font-bold text-primary">
                            {Number(service.price).toLocaleString("en-US")}{" "}
                            {t.currency.symbol}
                          </span>
                        </button>
                      );
                    })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="flex min-h-0 flex-col border-0 shadow-md">
        <CardHeader className="shrink-0 border-b pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-primary" />
              {t.pos.cart}
            </span>
            <Badge variant="secondary">
              {selectedServices.length +
                selectedProducts.reduce((sum, line) => sum + lineCount(line), 0)}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4">
          <Collapsible open={customerOpen} onOpenChange={setCustomerOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  {buyerType === "company" ? (
                    <Building2 className="size-4" />
                  ) : (
                    <User className="size-4" />
                  )}
                  {buyerType === "company"
                    ? selectedCompany?.name ?? t.pos.registeredCustomer
                    : t.pos.cashCustomer}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    customerReady ? "text-muted-foreground" : "text-destructive",
                  )}
                >
                  {customerReady ? t.pos.ready : t.pos.required}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3 rounded-lg border bg-muted/30 p-3">
              <div className="space-y-2">
                  <Label className="text-xs">{t.pos.buyerType}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={buyerType === "cash" ? "default" : "outline"}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleBuyerTypeChange("cash")}
                    >
                      <UserCircle className="size-4" />
                      {t.pos.cashCustomer}
                    </Button>
                    <Button
                      type="button"
                      variant={buyerType === "company" ? "default" : "outline"}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleBuyerTypeChange("company")}
                    >
                      <Building2 className="size-4" />
                      {t.pos.registeredCustomer}
                    </Button>
                  </div>
                </div>

              {buyerType === "cash" ? (
                <>
                  <p className="text-xs text-muted-foreground">{t.pos.cashHint}</p>
                  <div className="space-y-1">
                    <Label className="text-xs">{t.pos.cashNoteName}</Label>
                    <Input
                      value={cashNoteName}
                      onChange={(e) => setCashNoteName(e.target.value)}
                      placeholder={t.pos.cashNoteName}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs">{t.pos.searchCompany}</Label>
                  <Input
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    placeholder={t.pos.searchCompany}
                  />
                  {isLoadingCompanies ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ScrollArea className="max-h-40 rounded-md border bg-background">
                      <div className="p-1">
                        {filteredCompanies.length === 0 ? (
                          <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                            {t.pos.noCompaniesFound}
                          </p>
                        ) : (
                          filteredCompanies.map((company) => {
                            const selected = selectedCompanyId === company.id;
                            return (
                              <button
                                key={company.id}
                                type="button"
                                onClick={() => setSelectedCompanyId(company.id)}
                                className={cn(
                                  "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-start text-sm transition-colors hover:bg-muted",
                                  selected && "bg-primary/10 ring-1 ring-primary/30",
                                )}
                              >
                                <span className="min-w-0 truncate font-medium">
                                  {company.name}
                                </span>
                                {selected && (
                                  <CheckCircle className="size-4 shrink-0 text-primary" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  )}
                  {!selectedCompanyId && (
                    <p className="text-xs text-muted-foreground">{t.pos.selectCompany}</p>
                  )}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-2 pr-1">
              {selectedServices.length === 0 && selectedProducts.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {t.pos.emptyCart}
                </p>
              )}
              {selectedServices.map((s, i) => (
                <div
                  key={s.serviceId}
                  className="flex items-center justify-between gap-2 rounded-lg border bg-card p-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.serviceName}</p>
                    <p className="text-xs text-primary">
                      {s.price.toLocaleString("en-US")} {t.currency.symbol}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-destructive"
                    onClick={() =>
                      setSelectedServices((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              {selectedProducts.map((p) => {
                const product = products.find((item) => item.id === p.productId);
                const count = lineCount(p);
                return (
                  <div
                    key={p.productId}
                    className="flex items-center justify-between gap-2 rounded-lg border bg-card p-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {count} × {p.originalPrice.toLocaleString("en-US")}
                      </p>
                      <p className="text-xs font-medium text-primary">
                        {p.unitPrice.toLocaleString("en-US")} {t.currency.symbol}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={!product}
                        onClick={() => product && setProductCount(product, count - 1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold">{count}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={!product || count >= maxProductCount(product)}
                        onClick={() => product && setProductCount(product, count + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="shrink-0 space-y-3 rounded-xl border bg-muted/40 p-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.invoices.totalPrice}</span>
              <span>{totalPrice.toLocaleString("en-US")} {t.currency.symbol}</span>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t.invoices.finalPrice}</Label>
              <Input
                type="number"
                min={minPrice}
                value={finalPrice || ""}
                onChange={(e) => setFinalPrice(parseFloat(e.target.value) || 0)}
                className="text-lg font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={resetSale} disabled={isSubmitting}>
                <RotateCcw className="size-4" />
                {t.pos.newSale}
              </Button>
              <Button
                type="button"
                className="gap-2"
                onClick={handleCheckout}
                disabled={isSubmitting || !canSell || !customerReady}
                title={!canSell ? t.pos.cannotSell : undefined}
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Banknote className="size-4" />
                )}
                {t.pos.checkout}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
