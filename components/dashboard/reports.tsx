"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  FileText,
  Package,
  Users,
  Loader2,
  FileDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import apiClient from "@/lib/api";
import { extractListData } from "@/lib/list-response";
import type { Invoice, Product } from "@/types";
import {
  type ReportPeriod,
  filterInvoicesByPeriod,
  sumRevenue,
  countByStatus,
  revenueByMonth,
  topCustomersByRevenue,
  topProductsFromInvoices,
  topServicesFromInvoices,
  inventoryBreakdown,
  lowStockProducts,
} from "@/lib/reports-analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const PERIODS: ReportPeriod[] = ["7d", "30d", "90d", "year", "all"];

function KpiCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportsPage() {
  const { t } = useTranslation();
  const { hasPermission, tenant } = useAuth();
  const [period, setPeriod] = React.useState<ReportPeriod>("30d");
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExportingPdf, setIsExportingPdf] = React.useState(false);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [invRes, prodRes] = await Promise.all([
        hasPermission("invoices", "read")
          ? apiClient.get<{ data: Invoice[] }>("/invoices?take=2000")
          : Promise.resolve({ data: [] as Invoice[] }),
        hasPermission("products", "read")
          ? apiClient.get<{ data: Product[] }>("/products?take=500")
          : Promise.resolve({ data: [] as Product[] }),
      ]);
      setInvoices(extractListData(invRes));
      setProducts(extractListData(prodRes));
    } catch (error) {
      console.error(error);
      toast.error(t.reports.loadFailed);
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, t.reports.loadFailed]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(
    () => filterInvoicesByPeriod(invoices, period),
    [invoices, period],
  );

  const completedRevenue = React.useMemo(
    () => sumRevenue(filtered, ["COMPLETED"]),
    [filtered],
  );
  const allRevenue = React.useMemo(
    () => sumRevenue(filtered.filter((i) => i.status !== "CANCELLED")),
    [filtered],
  );
  const statusCounts = React.useMemo(() => countByStatus(filtered), [filtered]);
  const completedCount = statusCounts.COMPLETED;
  const pendingCount = statusCounts.PENDING + statusCounts.IN_SERVICE;
  const avgTicket =
    completedCount > 0 ? Math.round(completedRevenue / completedCount) : 0;

  const monthly = React.useMemo(() => revenueByMonth(invoices), [invoices]);
  const statusChartData = React.useMemo(
    () =>
      (["COMPLETED", "PENDING", "IN_SERVICE", "CANCELLED"] as const).map(
        (s) => ({
          status: (t.invoices.statuses as Record<string, string>)[s] ?? s,
          count: statusCounts[s],
        }),
      ),
    [statusCounts, t.invoices.statuses],
  );

  const topCustomers = React.useMemo(
    () => topCustomersByRevenue(filtered),
    [filtered],
  );
  const topProducts = React.useMemo(
    () => topProductsFromInvoices(filtered),
    [filtered],
  );
  const topServices = React.useMemo(
    () => topServicesFromInvoices(filtered),
    [filtered],
  );
  const inventory = React.useMemo(() => inventoryBreakdown(products), [products]);
  const lowStock = React.useMemo(() => lowStockProducts(products), [products]);

  const recentInvoices = React.useMemo(
    () =>
      [...filtered]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 20),
    [filtered],
  );

  const revenueChartConfig = {
    revenue: { label: t.reports.kpi.revenue, color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  const statusChartConfig = {
    count: { label: t.reports.tables.count, color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  const sym = t.currency.symbol;

  const exportPdf = React.useCallback(async () => {
    setIsExportingPdf(true);
    try {
      let logoDataUri: string | null = null;
      const logoUrl = tenant?.logo || null;
      if (logoUrl) {
        try {
          const res = await fetch(logoUrl);
          const logoBlob = await res.blob();
          logoDataUri = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(logoBlob);
          });
        } catch {
          // ignore logo errors
        }
      }

      const statusLabels = t.invoices.statuses as Record<string, string>;
      const generatedAt = new Date().toLocaleString("ar-SA", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const snapshot = {
        workshopName: tenant?.name || "",
        workshopLogo: logoDataUri,
        pdfTitle: t.reports.pdfTitle,
        periodLabel: t.reports.periods[period],
        generatedAt,
        currency: sym,
        kpis: [
          {
            label: t.reports.kpi.revenue,
            value: `${allRevenue.toLocaleString("ar-SA")} ${sym}`,
          },
          {
            label: t.reports.kpi.completed,
            value: String(completedCount),
          },
          {
            label: t.reports.kpi.avgTicket,
            value: `${avgTicket.toLocaleString("ar-SA")} ${sym}`,
          },
          {
            label: t.reports.kpi.pending,
            value: String(pendingCount),
          },
          {
            label: t.reports.kpi.stockValue,
            value: `${Math.round(inventory.stockValue).toLocaleString("ar-SA")} ${sym}`,
          },
          {
            label: t.reports.kpi.lowStock,
            value: String(lowStock.length),
          },
        ],
        statusSectionTitle: t.reports.charts.statusBreakdown,
        statusRows: (["COMPLETED", "PENDING", "IN_SERVICE", "CANCELLED"] as const).map(
          (s) => ({
            label: statusLabels[s] ?? s,
            count: statusCounts[s],
          }),
        ),
        monthlySectionTitle: t.reports.charts.revenueTrend,
        monthlyHeaders: {
          month: t.reports.period,
          revenue: t.reports.tables.revenue,
          invoices: t.reports.tables.count,
        },
        monthlyRows: monthly.map((m) => ({
          month: m.month,
          revenue: m.revenue,
          invoices: m.invoices,
        })),
        topCustomersTitle: t.reports.tables.topCustomers,
        topCustomersHeaders: {
          customer: t.reports.tables.customer,
          phone: t.reports.tables.phone,
          count: t.reports.tables.count,
          revenue: t.reports.tables.revenue,
        },
        topCustomers,
        topProductsTitle: t.reports.tables.topProducts,
        topProductsHeaders: {
          product: t.reports.tables.product,
          quantity: t.reports.tables.quantity,
          revenue: t.reports.tables.revenue,
        },
        topProducts,
        topServicesTitle: t.reports.tables.topServices,
        topServicesHeaders: {
          service: t.reports.tables.service,
          count: t.reports.tables.count,
          revenue: t.reports.tables.revenue,
        },
        topServices,
        inventoryTitle: t.reports.tabs.inventory,
        inventorySummary: t.reports.pdfInventorySummary
          .replace("{total}", String(inventory.total))
          .replace("{inStock}", String(inventory.inStock))
          .replace("{low}", String(inventory.low))
          .replace("{out}", String(inventory.out))
          .replace(
            "{value}",
            Math.round(inventory.stockValue).toLocaleString("ar-SA"),
          )
          .replace("{currency}", sym),
        lowStockTitle: t.reports.tables.lowStock,
        lowStockHeaders: {
          product: t.reports.tables.product,
          stock: t.reports.tables.stock,
          minStock: t.reports.tables.minStock,
        },
        lowStock: lowStock.map((p) => ({
          name: p.name,
          stock: Number(p.stock),
          minStock: Number(p.minStock),
        })),
        recentTitle: t.reports.tables.recentInvoices,
        recentHeaders: {
          invoice: t.reports.tables.invoice,
          date: t.reports.tables.date,
          customer: t.reports.tables.customer,
          status: t.reports.tables.status,
          amount: t.reports.tables.amount,
        },
        recentInvoices: recentInvoices.map((inv) => ({
          number: inv.invoiceNumber,
          date: new Date(inv.createdAt).toLocaleDateString("ar-SA"),
          customer: inv.customer?.name ?? "—",
          status: statusLabels[inv.status] ?? inv.status,
          amount: Number(inv.finalPrice) || 0,
        })),
        emptyNote: t.reports.empty,
        pageFooter: t.reports.pdfPageFooter,
      };

      const [{ pdf }, { ReportsPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./reports-pdf"),
      ]);
      const blob = await pdf(
        React.createElement(ReportsPDF, { data: snapshot }) as React.ReactElement,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 10);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${period}-${stamp}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t.reports.pdfGenerated);
    } catch (error) {
      console.error(error);
      toast.error(t.reports.pdfFailed);
    } finally {
      setIsExportingPdf(false);
    }
  }, [
    tenant,
    t,
    period,
    sym,
    allRevenue,
    completedCount,
    avgTicket,
    pendingCount,
    inventory,
    lowStock,
    statusCounts,
    monthly,
    topCustomers,
    topProducts,
    topServices,
    recentInvoices,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <BarChart3 className="size-7 text-primary" />
            {t.reports.title}
          </h2>
          <p className="text-muted-foreground">{t.reports.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={period}
            onValueChange={(v) => setPeriod(v as ReportPeriod)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t.reports.period} />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p} value={p}>
                  {t.reports.periods[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            disabled={isExportingPdf}
            onClick={() => void exportPdf()}
          >
            {isExportingPdf ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileDown className="size-4" />
            )}
            <span className="ms-2">
              {isExportingPdf ? t.reports.generatingPdf : t.reports.downloadPdf}
            </span>
          </Button>
          <Button type="button" variant="outline" onClick={() => void load()}>
            <RefreshCw className="size-4" />
            <span className="ms-2">{t.reports.refresh}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title={t.reports.kpi.revenue}
          value={`${allRevenue.toLocaleString()} ${sym}`}
          icon={TrendingUp}
        />
        <KpiCard
          title={t.reports.kpi.completed}
          value={String(completedCount)}
          icon={FileText}
        />
        <KpiCard
          title={t.reports.kpi.avgTicket}
          value={`${avgTicket.toLocaleString()} ${sym}`}
          icon={BarChart3}
        />
        <KpiCard
          title={t.reports.kpi.pending}
          value={String(pendingCount)}
          icon={FileText}
        />
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="sales">{t.reports.tabs.sales}</TabsTrigger>
          <TabsTrigger value="invoices">{t.reports.tabs.invoices}</TabsTrigger>
          <TabsTrigger value="inventory">{t.reports.tabs.inventory}</TabsTrigger>
          <TabsTrigger value="customers">{t.reports.tabs.customers}</TabsTrigger>
          <TabsTrigger value="catalog">{t.reports.tabs.catalog}</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t.reports.charts.revenueTrend}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueChartConfig} className="h-[280px] w-full">
                  <LineChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t.reports.charts.statusBreakdown}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={statusChartConfig} className="h-[280px] w-full">
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.reports.tables.recentInvoices}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentInvoices.length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">{t.reports.empty}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.reports.tables.invoice}</TableHead>
                      <TableHead>{t.reports.tables.customer}</TableHead>
                      <TableHead>{t.reports.tables.date}</TableHead>
                      <TableHead>{t.reports.tables.status}</TableHead>
                      <TableHead className="text-end">{t.reports.tables.amount}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell>
                          <Link
                            href="/dashboard/invoices"
                            className="font-medium text-primary hover:underline"
                            dir="ltr"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{inv.customer?.name}</TableCell>
                        <TableCell>
                          {new Date(inv.createdAt).toLocaleDateString("ar-SA")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {(t.invoices.statuses as Record<string, string>)[inv.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-end" dir="ltr">
                          {Number(inv.finalPrice).toLocaleString()} {sym}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard
              title={t.reports.kpi.stockValue}
              value={`${Math.round(inventory.stockValue).toLocaleString()} ${sym}`}
              icon={Package}
            />
            <KpiCard
              title={t.dashboard.charts.inStock}
              value={String(inventory.inStock)}
              icon={Package}
            />
            <KpiCard
              title={t.reports.kpi.lowStock}
              value={String(inventory.low + inventory.out)}
              icon={Package}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.reports.tables.lowStock}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {lowStock.length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">
                  {t.dashboard.charts.noLowStock}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.reports.tables.product}</TableHead>
                      <TableHead>{t.reports.tables.stock}</TableHead>
                      <TableHead>{t.reports.tables.minStock}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStock.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.stock}</TableCell>
                        <TableCell>{p.minStock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.reports.tables.topCustomers}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {topCustomers.length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">{t.reports.empty}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.reports.tables.customer}</TableHead>
                      <TableHead>{t.reports.tables.phone}</TableHead>
                      <TableHead>{t.reports.tables.count}</TableHead>
                      <TableHead className="text-end">{t.reports.tables.revenue}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell dir="ltr">{c.phone}</TableCell>
                        <TableCell>{c.count}</TableCell>
                        <TableCell className="text-end" dir="ltr">
                          {c.revenue.toLocaleString()} {sym}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.reports.tables.topProducts}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {topProducts.length === 0 ? (
                  <p className="p-6 text-center text-muted-foreground">{t.reports.empty}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.reports.tables.product}</TableHead>
                        <TableHead>{t.reports.tables.quantity}</TableHead>
                        <TableHead className="text-end">{t.reports.tables.revenue}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.qty}</TableCell>
                          <TableCell className="text-end" dir="ltr">
                            {p.revenue.toLocaleString()} {sym}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.reports.tables.topServices}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {topServices.length === 0 ? (
                  <p className="p-6 text-center text-muted-foreground">{t.reports.empty}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.reports.tables.service}</TableHead>
                        <TableHead>{t.reports.tables.count}</TableHead>
                        <TableHead className="text-end">{t.reports.tables.revenue}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topServices.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>{s.count}</TableCell>
                          <TableCell className="text-end" dir="ltr">
                            {s.revenue.toLocaleString()} {sym}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
