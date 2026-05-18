"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Car,
  User,
  Wrench,
  Package,
  CheckCircle,
  Clock,
  Loader2,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { fetchActiveInvoices, updateInvoiceStatus } from "@/lib/reception-api";
import type { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatSince(date: Date | string, locale: string): string {
  const then = new Date(date).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return locale.startsWith("ar") ? "الآن" : "Just now";
  if (minutes < 60) {
    return locale.startsWith("ar")
      ? `منذ ${minutes} د`
      : `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return locale.startsWith("ar")
      ? `منذ ${hours} س`
      : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return locale.startsWith("ar")
    ? `منذ ${days} ي`
    : `${days}d ago`;
}

export function ActiveServicePage() {
  const { t, locale } = useTranslation();
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("invoices", "write");

  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [completingId, setCompletingId] = React.useState<string | null>(null);
  const [confirmInvoice, setConfirmInvoice] = React.useState<Invoice | null>(
    null,
  );

  const load = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setInvoices(await fetchActiveInvoices());
    } catch (error) {
      console.error("Failed to load active service queue:", error);
      toast.error(t.messages.error.fetchFailed);
    } finally {
      setIsLoading(false);
    }
  }, [t.messages.error.fetchFailed]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const haystack = [
        inv.invoiceNumber,
        inv.customer?.name,
        inv.customer?.phone,
        inv.car?.name,
        inv.car?.number,
        inv.car?.model,
        ...inv.services.map((s) => s.service?.name),
        ...inv.products.map((p) => p.product?.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [invoices, search]);

  const handleComplete = async (invoice: Invoice) => {
    if (!canWrite) return;
    setCompletingId(invoice.id);
    try {
      await updateInvoiceStatus(invoice.id, "COMPLETED");
      toast.success(t.activeService.completed);
      setConfirmInvoice(null);
      await load();
    } catch (error) {
      console.error("Failed to complete invoice:", error);
      toast.error(t.messages.error.general);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.activeService.title}</h2>
          <p className="text-muted-foreground">{t.activeService.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
            <Clock className="size-3.5" />
            {filtered.length}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={isLoading}>
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            <span className="ms-2">{t.actions.refresh}</span>
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.activeService.searchPlaceholder}
          className="pe-9"
        />
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Car className="size-14 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium">{t.activeService.empty}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t.activeService.emptyHint}
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/dashboard/pos">{t.nav.pos}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((invoice) => (
            <Card
              key={invoice.id}
              className="overflow-hidden border-yellow-200/60 shadow-sm dark:border-yellow-900/40"
            >
              <CardHeader className="border-b bg-yellow-50/50 pb-3 dark:bg-yellow-950/20">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="size-4 text-primary" />
                      {invoice.customer.name}
                    </CardTitle>
                    <p
                      className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"
                      dir="ltr"
                    >
                      <Phone className="size-3" />
                      {invoice.customer.phone}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-yellow-300 bg-yellow-100/80 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300"
                  >
                    {formatSince(invoice.createdAt, locale)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5">
                  <Car className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">{invoice.car.name}</p>
                    <p className="text-muted-foreground">
                      {invoice.car.number}
                      {invoice.car.model ? ` · ${invoice.car.model}` : ""}
                      {invoice.car.color ? ` · ${invoice.car.color}` : ""}
                    </p>
                  </div>
                </div>

                {invoice.services.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Wrench className="size-3" />
                      {t.activeService.services}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {invoice.services.map((item) => (
                        <Badge key={item.id} variant="secondary" className="text-xs">
                          {item.service.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {invoice.products.length > 0 && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Package className="size-3" />
                    {t.activeService.productsCount.replace(
                      "{count}",
                      String(invoice.products.length),
                    )}
                  </p>
                )}

                <div className="flex items-center justify-between border-t pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {Number(invoice.finalPrice).toLocaleString()}{" "}
                      {t.currency.symbol}
                    </p>
                  </div>
                  {canWrite && (
                    <Button
                      size="sm"
                      onClick={() => setConfirmInvoice(invoice)}
                      disabled={completingId === invoice.id}
                    >
                      {completingId === invoice.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle className="size-4" />
                      )}
                      <span className="ms-1">{t.activeService.markDone}</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!confirmInvoice}
        onOpenChange={(open) => !open && setConfirmInvoice(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.activeService.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.activeService.confirmDescription.replace(
                "{name}",
                confirmInvoice?.customer.name ?? "",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmInvoice && void handleComplete(confirmInvoice)}
            >
              {t.activeService.markDone}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
