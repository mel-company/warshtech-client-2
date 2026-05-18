"use client";

import * as React from "react";
import {
  Search,
  User,
  Car,
  Phone,
  Wrench,
  Package,
  Loader2,
  History,
  ArrowRight,
  Warehouse,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import apiClient from "@/lib/api";
import { extractListData } from "@/lib/list-response";
import { resolveCustomerAndCar } from "@/lib/checkout";
import {
  runIntakeLookup,
  updateInvoiceStatus,
  type IntakeLookupResponse,
} from "@/lib/reception-api";
import type {
  Car as CarType,
  Customer,
  Invoice,
  InvoiceFormProduct,
  InvoiceFormService,
  InvoiceStatus,
  Product,
  Service,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

function invoiceToCart(invoice: Invoice): {
  services: InvoiceFormService[];
  products: InvoiceFormProduct[];
} {
  return {
    services: invoice.services.map((s) => ({
      serviceId: s.serviceId,
      serviceName: s.service.name,
      price: Number(s.price),
      minPrice: Number(s.minPrice),
    })),
    products: invoice.products.map((p) => ({
      productId: p.productId,
      productName: p.product.name,
      productPhoto: p.product.photos?.[0],
      quantity: Number(p.quantity),
      unitPrice: Number(p.unitPrice),
      minPrice: Number(p.minPrice),
      unit: p.product.unit,
      unitValue: Number(p.product.unitValue) || 1,
      unitAdjustable: p.product.unitAdjustable || false,
      originalUnitValue: Number(p.product.unitValue) || 1,
      originalPrice: Number(p.unitPrice),
      originalMinPrice: Number(p.minPrice),
    })),
  };
}

export function ReceptionPage() {
  const { t } = useTranslation();

  const [catalogTab, setCatalogTab] = React.useState<"services" | "products">(
    "services",
  );
  const [catalogSearch, setCatalogSearch] = React.useState("");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = React.useState(true);

  const [custPhone, setCustPhone] = React.useState("");
  const [custName, setCustName] = React.useState("");
  const [matchedCustomer, setMatchedCustomer] = React.useState<Customer | null>(
    null,
  );
  const [carNumber, setCarNumber] = React.useState("");
  const [carName, setCarName] = React.useState("");
  const [carModel, setCarModel] = React.useState("");
  const [carColor, setCarColor] = React.useState("");
  const [matchedCar, setMatchedCar] = React.useState<CarType | null>(null);
  const [customerCars, setCustomerCars] = React.useState<CarType[]>([]);

  const [pastInvoices, setPastInvoices] = React.useState<Invoice[]>([]);
  const [openInvoice, setOpenInvoice] = React.useState<Invoice | null>(null);
  const [selectedServices, setSelectedServices] = React.useState<
    InvoiceFormService[]
  >([]);
  const [selectedProducts, setSelectedProducts] = React.useState<
    InvoiceFormProduct[]
  >([]);
  const [finalPrice, setFinalPrice] = React.useState(0);
  const [notes, setNotes] = React.useState("");

  const [isLookingUp, setIsLookingUp] = React.useState(false);
  const [isSearchingIntake, setIsSearchingIntake] = React.useState(false);
  const lookupRequestRef = React.useRef(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const [intakeDone, setIntakeDone] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, servicesRes] = await Promise.all([
          apiClient.get<{ data: Product[] }>("/products?take=500"),
          apiClient.get<{ data: Service[] }>("/services?take=500"),
        ]);
        setProducts(extractListData(productsRes));
        setServices(
          extractListData(servicesRes).filter((s) => s.isActive !== false),
        );
      } catch {
        toast.error(t.messages.error.fetchFailed);
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    void load();
  }, [t.messages.error.fetchFailed]);

  const totalServices = selectedServices.reduce((s, x) => s + x.price, 0);
  const totalProducts = selectedProducts.reduce((s, x) => s + x.unitPrice, 0);
  const totalPrice = totalServices + totalProducts;
  const minPrice =
    selectedServices.reduce((s, x) => s + x.minPrice, 0) +
    selectedProducts.reduce((s, x) => s + x.minPrice, 0);

  React.useEffect(() => {
    setFinalPrice(totalPrice);
  }, [totalPrice]);

  const applyCarFields = React.useCallback((car: CarType) => {
    setMatchedCar(car);
    setCarNumber(car.number);
    setCarName(car.name);
    setCarModel(car.model || "");
    setCarColor(car.color || "");
  }, []);

  const applyLookupResult = React.useCallback(
    (data: IntakeLookupResponse, options?: { silent?: boolean }) => {
      const cars =
        data.cars?.length > 0
          ? data.cars
          : (data.customer?.cars ?? []);

      if (data.customer) {
        setMatchedCustomer(data.customer);
        setCustName(data.customer.name);
        setCustPhone(data.customer.phone);
        setCustomerCars(cars);
        if (!options?.silent) {
          toast.success(t.reception.customerLoaded);
        }
      } else {
        setMatchedCustomer(null);
        setCustomerCars([]);
      }

      const car = data.matchedCar;
      if (car) {
        applyCarFields(car);
      } else if (cars.length === 1) {
        applyCarFields(cars[0]);
      }

      setPastInvoices(data.invoices ?? []);
      setOpenInvoice(data.openInvoice ?? null);
      if (data.openInvoice) {
        const cart = invoiceToCart(data.openInvoice);
        setSelectedServices(cart.services);
        setSelectedProducts(cart.products);
        setFinalPrice(Number(data.openInvoice.finalPrice));
        setNotes(data.openInvoice.notes || "");
        setIntakeDone(true);
        if (!options?.silent) {
          toast.message(t.reception.openJobLoaded);
        }
      } else if (data.customer) {
        setIntakeDone(true);
      }
    },
    [applyCarFields, t.reception.customerLoaded, t.reception.openJobLoaded],
  );

  const performIntakeLookup = React.useCallback(
    async (phone: string, plate: string, options?: { silent?: boolean }) => {
      const phoneDigits = phone.replace(/\D/g, "");
      if (phoneDigits.length < 4 && plate.trim().length < 2) {
        return;
      }

      const requestId = ++lookupRequestRef.current;
      setIsSearchingIntake(true);
      if (!options?.silent) setIsLookingUp(true);

      try {
        const data = await runIntakeLookup(phone, plate);
        if (requestId !== lookupRequestRef.current) return;
        applyLookupResult(data, options);
      } catch (error) {
        if (requestId !== lookupRequestRef.current) return;
        console.error(error);
        if (!options?.silent) {
          toast.error(t.messages.error.fetchFailed);
        }
      } finally {
        if (requestId === lookupRequestRef.current) {
          setIsSearchingIntake(false);
          if (!options?.silent) setIsLookingUp(false);
        }
      }
    },
    [applyLookupResult, t.messages.error.fetchFailed],
  );

  React.useEffect(() => {
    const phone = custPhone.trim();
    const plate = carNumber.trim();
    const phoneDigits = phone.replace(/\D/g, "");

    if (phoneDigits.length < 4 && plate.length < 2) {
      setMatchedCustomer(null);
      setCustomerCars([]);
      setPastInvoices([]);
      setOpenInvoice(null);
      setMatchedCar(null);
      setIntakeDone(false);
      return;
    }

    const timeout = setTimeout(() => {
      void performIntakeLookup(phone, plate, { silent: true });
    }, 450);

    return () => clearTimeout(timeout);
  }, [custPhone, carNumber, performIntakeLookup]);

  const handleSelectCar = (car: CarType) => {
    applyCarFields(car);
    void performIntakeLookup(custPhone.trim(), car.number, { silent: true });
  };

  const handleLookup = async () => {
    const phoneDigits = custPhone.trim().replace(/\D/g, "");
    if (phoneDigits.length < 4 && carNumber.trim().length < 2) {
      toast.error(t.reception.needPhoneMin);
      return;
    }
    setIsLookingUp(true);
    try {
      await performIntakeLookup(custPhone.trim(), carNumber.trim());
      toast.success(t.reception.lookupDone);
    } finally {
      setIsLookingUp(false);
    }
  };

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

  const addProduct = (product: Product) => {
    if (selectedProducts.some((p) => p.productId === product.id)) return;
    const uv = Number(product.unitValue) || 1;
    const prodMin = Number(product.minPrice) || Number(product.salePrice);
    setSelectedProducts((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        productPhoto: product.photos?.[0],
        quantity: uv,
        unitPrice: Number(product.salePrice),
        minPrice: prodMin,
        unit: product.unit,
        unitValue: uv,
        unitAdjustable: product.unitAdjustable || false,
        originalUnitValue: uv,
        originalPrice: Number(product.salePrice),
        originalMinPrice: prodMin,
      },
    ]);
  };

  const buildInvoicePayload = () => ({
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
    notes: notes.trim() || undefined,
  });

  const ensureInvoice = async (): Promise<Invoice | null> => {
    if (selectedServices.length === 0 && selectedProducts.length === 0) {
      toast.error(t.reception.needItems);
      return null;
    }
    if (finalPrice < minPrice) {
      toast.error(t.invoices.priceBelowMin);
      return null;
    }

    const resolved = await resolveCustomerAndCar(
      { phone: custPhone, name: custName, matchedCustomer },
      {
        number: carNumber,
        name: carName,
        model: carModel,
        color: carColor,
        matchedCar: matchedCar
          ? { ...matchedCar, customer: { id: matchedCustomer?.id ?? "" } }
          : null,
      },
    );
    if (!resolved) return null;

    const payload = {
      customerId: resolved.customerId,
      carId: resolved.carId,
      ...buildInvoicePayload(),
    };

    if (openInvoice) {
      return apiClient.patch<Invoice>(`/invoices/${openInvoice.id}`, payload);
    }
    const created = await apiClient.post<Invoice>("/invoices", payload);
    setOpenInvoice(created);
    return created;
  };

  const handleRegisterService = async () => {
    setIsSaving(true);
    try {
      const inv = await ensureInvoice();
      if (!inv) return;
      if (inv.status !== "PENDING") {
        await updateInvoiceStatus(inv.id, "PENDING");
      }
      setOpenInvoice({ ...inv, status: "PENDING" });
      toast.success(t.reception.registered);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t.messages.error.general,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendToWarehouse = async () => {
    setIsSaving(true);
    try {
      const inv = await ensureInvoice();
      if (!inv) return;
      const updated = await updateInvoiceStatus(inv.id, "IN_SERVICE");
      setOpenInvoice(updated);
      toast.success(t.reception.sentToWarehouse);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t.messages.error.general,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const inv = await ensureInvoice();
      if (!inv) return;
      await updateInvoiceStatus(inv.id, "COMPLETED");
      toast.success(t.reception.completed);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t.messages.error.general,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setCustPhone("");
    setCustName("");
    setMatchedCustomer(null);
    setCarNumber("");
    setCarName("");
    setCarModel("");
    setCarColor("");
    setMatchedCar(null);
    setCustomerCars([]);
    setPastInvoices([]);
    setOpenInvoice(null);
    setSelectedServices([]);
    setSelectedProducts([]);
    setNotes("");
    setIntakeDone(false);
  };

  const statusLabel = (status: InvoiceStatus) =>
    (t.invoices.statuses as Record<string, string>)[status] ?? status;

  const filteredServices = services.filter((s) =>
    catalogSearch
      ? s.name.toLowerCase().includes(catalogSearch.toLowerCase())
      : true,
  );
  const filteredProducts = products.filter((p) =>
    catalogSearch
      ? p.name.toLowerCase().includes(catalogSearch.toLowerCase())
      : true,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      {/* Intake + history */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-5 text-primary" />
              {t.reception.intakeTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="flex items-center justify-between gap-2">
                <span>{t.invoices.customerPhone}</span>
                {(isSearchingIntake || isLookingUp) && (
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                )}
              </Label>
              <Input
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                dir="ltr"
                placeholder="7803538208"
              />
              {isSearchingIntake && (
                <p className="text-xs text-muted-foreground">
                  {t.reception.searchingCustomer}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t.invoices.customerName}</Label>
              <Input
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
              />
            </div>
            {matchedCustomer && (
              <p className="text-xs text-primary">
                {t.reception.knownCustomer}
                {customerCars.length > 0 &&
                  ` · ${t.reception.carsRegistered.replace("{count}", String(customerCars.length))}`}
              </p>
            )}
            {customerCars.length > 1 && (
              <div className="space-y-1.5">
                <Label>{t.reception.selectCar}</Label>
                <div className="flex flex-col gap-1.5">
                  {customerCars.map((car) => (
                    <Button
                      key={car.id}
                      type="button"
                      variant={matchedCar?.id === car.id ? "default" : "outline"}
                      size="sm"
                      className="h-auto justify-start py-2 text-start"
                      onClick={() => handleSelectCar(car)}
                    >
                      <Car className="me-2 size-4 shrink-0" />
                      <span className="flex flex-col items-start gap-0.5">
                        <span dir="ltr" className="font-medium">
                          {car.number}
                        </span>
                        <span className="text-xs opacity-80">
                          {[car.name, car.model, car.color].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <Separator />
            <div className="space-y-1.5">
              <Label>{t.invoices.carNumber}</Label>
              <Input
                value={carNumber}
                onChange={(e) => setCarNumber(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>{t.invoices.carName}</Label>
                <Input value={carName} onChange={(e) => setCarName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.invoices.carModel}</Label>
                <Input value={carModel} onChange={(e) => setCarModel(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t.invoices.carColor}</Label>
              <Input value={carColor} onChange={(e) => setCarColor(e.target.value)} />
            </div>
            <Button
              className="w-full"
              onClick={() => void handleLookup()}
              disabled={isLookingUp}
            >
              {isLookingUp ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              <span className="ms-2">{t.reception.lookup}</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="size-5" />
              {t.reception.history}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[220px]">
              {pastInvoices.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  {t.reception.noHistory}
                </p>
              ) : (
                <ul className="divide-y">
                  {pastInvoices.map((inv) => (
                    <li key={inv.id} className="px-4 py-3 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium" dir="ltr">
                          {inv.invoiceNumber}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {statusLabel(inv.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inv.createdAt).toLocaleDateString("ar-SA")} ·{" "}
                        {Number(inv.finalPrice)} {t.currency.symbol}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {openInvoice && (
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="pt-4 text-sm">
              <p className="font-medium">{t.reception.currentJob}</p>
              <p className="text-muted-foreground" dir="ltr">
                {openInvoice.invoiceNumber} — {statusLabel(openInvoice.status)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Catalog + actions */}
      <Card className="flex min-h-[520px] flex-col overflow-hidden">
        <CardHeader className="shrink-0 space-y-3 border-b pb-4">
          <CardTitle className="text-base">{t.reception.addItemsTitle}</CardTitle>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder={t.pos.searchPlaceholder}
              className="ps-9"
              disabled={!intakeDone}
            />
          </div>
          <Tabs
            value={catalogTab}
            onValueChange={(v) => setCatalogTab(v as "services" | "products")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services" disabled={!intakeDone}>
                <Wrench className="size-4" />
                <span className="ms-1">{t.invoices.services}</span>
              </TabsTrigger>
              <TabsTrigger value="products" disabled={!intakeDone}>
                <Package className="size-4" />
                <span className="ms-1">{t.invoices.products}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4">
          {!intakeDone ? (
            <p className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              {t.reception.startWithLookup}
            </p>
          ) : isLoadingCatalog ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="grid gap-2 sm:grid-cols-2">
                {catalogTab === "services"
                  ? filteredServices.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => addService(s)}
                        className="rounded-lg border p-3 text-start hover:border-primary"
                      >
                        <span className="text-sm font-medium">{s.name}</span>
                        <p className="text-primary font-bold">
                          {Number(s.price)} {t.currency.symbol}
                        </p>
                      </button>
                    ))
                  : filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addProduct(p)}
                        className="rounded-lg border p-3 text-start hover:border-primary"
                      >
                        <span className="text-sm font-medium">{p.name}</span>
                        <p className="text-primary font-bold">
                          {Number(p.salePrice)} {t.currency.symbol}
                        </p>
                      </button>
                    ))}
              </div>
            </ScrollArea>
          )}

          <Separator />

          <div className="space-y-2 text-sm">
            {selectedServices.map((s) => (
              <div key={s.serviceId} className="flex justify-between">
                <span>{s.serviceName}</span>
                <span>
                  {s.price} {t.currency.symbol}
                </span>
              </div>
            ))}
            {selectedProducts.map((p) => (
              <div key={p.productId} className="flex justify-between">
                <span>{p.productName}</span>
                <span>
                  {p.unitPrice} {t.currency.symbol}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>{t.invoices.finalPrice}</span>
              <span>
                {finalPrice} {t.currency.symbol}
              </span>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              variant="outline"
              disabled={!intakeDone || isSaving}
              onClick={() => void handleRegisterService()}
            >
              <ClipboardList className="size-4" />
              <span className="ms-1">{t.reception.register}</span>
            </Button>
            <Button
              disabled={!intakeDone || isSaving}
              onClick={() => void handleSendToWarehouse()}
            >
              <Warehouse className="size-4" />
              <span className="ms-1">{t.reception.toWarehouse}</span>
            </Button>
            <Button
              variant="secondary"
              disabled={!intakeDone || isSaving}
              onClick={() => void handleComplete()}
            >
              <CheckCircle className="size-4" />
              <span className="ms-1">{t.reception.finish}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
