"use client";

import * as React from "react";
import {
  Users,
  Package,
  Wrench,
  UserCog,
  TrendingUp,
  AlertTriangle,
  ArrowUpLeft,
  ArrowDownLeft,
  Sparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import apiClient from "@/lib/api";
import type { Product } from "@/types";
import type { Invoice } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalServices: number;
  totalEmployees: number;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    minStock: number;
    unit: string;
  }>;
  recentCustomers: Array<{
    id: string;
    name: string;
    phone: string;
    cars: Array<{ id: string }>;
  }>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  className?: string;
  accent?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  accent = "from-primary/20 to-primary/5",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "card-hover relative overflow-hidden border-0 bg-gradient-to-br shadow-sm",
        accent,
        className,
      )}
    >
      <div className="pointer-events-none absolute -end-6 -top-6 size-24 rounded-full bg-primary/10 blur-2xl" />
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex size-10 items-center justify-center rounded-xl bg-background/80 text-primary shadow-sm backdrop-blur-sm">
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold tracking-tight animate-count-up">
          {value}
        </div>
        {(description || trend) && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {trend && trend.value > 0 && (
              <span
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                  trend.isPositive
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive",
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpLeft className="size-3" />
                ) : (
                  <ArrowDownLeft className="size-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
  className,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  iconClassName?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("card-hover overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-lg bg-primary/10",
              iconClassName,
            )}
          >
            <Icon className="size-4 text-primary" />
          </div>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function buildRevenueSeries(invoices: Invoice[]) {
  const points: { month: string; revenue: number; invoices: number; sortKey: string }[] =
    [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    points.push({
      month: d.toLocaleDateString("ar", { month: "short" }),
      revenue: 0,
      invoices: 0,
      sortKey,
    });
  }

  for (const inv of invoices) {
    const d = new Date(inv.createdAt);
    const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const point = points.find((p) => p.sortKey === sortKey);
    if (point) {
      point.revenue += Number(inv.finalPrice) || 0;
      point.invoices += 1;
    }
  }

  return points;
}

function buildInventorySeries(products: Product[]) {
  let inStock = 0;
  let low = 0;
  let out = 0;

  for (const p of products) {
    const stock = Number(p.stock);
    const min = Number(p.minStock);
    if (stock <= 0) out += 1;
    else if (stock <= min) low += 1;
    else inStock += 1;
  }

  return { inStock, low, out };
}

function computeInvoiceTrend(invoices: Invoice[]) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  let current = 0;
  let previous = 0;

  for (const inv of invoices) {
    const d = new Date(inv.createdAt);
    if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) current += 1;
    const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    if (d.getFullYear() === prevYear && d.getMonth() === prevMonth) previous += 1;
  }

  if (previous === 0) return { value: 0, isPositive: true };
  const change = Math.round(((current - previous) / previous) * 100);
  return { value: Math.abs(change), isPositive: change >= 0 };
}

function RecentCustomersCard({
  customers,
}: {
  customers: DashboardStats["recentCustomers"];
}) {
  const { t } = useTranslation();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);

  return (
    <Card className="card-hover h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-5 text-primary" />
          {t.dashboard.recentCustomers}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t.dashboard.charts.noChartData}
          </p>
        ) : (
          <div className="space-y-4">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 ring-2 ring-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{customer.name}</span>
                    <span className="text-xs text-muted-foreground" dir="ltr">
                      {customer.phone}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {customer.cars.length}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [services, setServices] = React.useState<
    Array<{ id: string; name: string; price: number; isActive: boolean }>
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    void loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [dashboardRes, productsRes, invoicesRes, servicesRes] =
        await Promise.all([
          apiClient.get<DashboardStats>("/dashboard"),
          apiClient
            .get<{ data: Product[] }>("/products")
            .catch(() => ({ data: [] as Product[] })),
          apiClient
            .get<{ data: Invoice[] }>("/invoices?take=100")
            .catch(() => ({ data: [] as Invoice[] })),
          apiClient
            .get<{
              data: Array<{
                id: string;
                name: string;
                price: number;
                isActive: boolean;
              }>;
            }>("/services")
            .catch(() => ({ data: [] })),
        ]);

      setStats(dashboardRes);
      setProducts(productsRes.data || []);
      setInvoices(invoicesRes.data || []);
      setServices(
        (servicesRes.data || []).filter((s) => s.isActive).slice(0, 6),
      );
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const revenueData = React.useMemo(
    () => buildRevenueSeries(invoices),
    [invoices],
  );

  const inventory = React.useMemo(
    () => buildInventorySeries(products),
    [products],
  );

  const overviewData = React.useMemo(
    () => [
      {
        name: t.dashboard.totalCustomers,
        value: stats?.totalCustomers ?? 0,
        fill: "var(--color-customers)",
      },
      {
        name: t.dashboard.totalProducts,
        value: stats?.totalProducts ?? 0,
        fill: "var(--color-products)",
      },
      {
        name: t.dashboard.totalServices,
        value: stats?.totalServices ?? 0,
        fill: "var(--color-services)",
      },
      {
        name: t.dashboard.totalEmployees,
        value: stats?.totalEmployees ?? 0,
        fill: "var(--color-employees)",
      },
    ],
    [stats, t],
  );

  const inventoryData = React.useMemo(
    () => [
      {
        status: t.dashboard.charts.inStock,
        count: inventory.inStock,
        fill: "var(--color-inStock)",
      },
      {
        status: t.dashboard.charts.lowStockStatus,
        count: inventory.low,
        fill: "var(--color-lowStock)",
      },
      {
        status: t.dashboard.charts.outOfStock,
        count: inventory.out,
        fill: "var(--color-outOfStock)",
      },
    ],
    [inventory, t],
  );

  const lowStockChartData = React.useMemo(
    () =>
      (stats?.lowStockProducts ?? []).slice(0, 6).map((p) => ({
        name: p.name.length > 14 ? `${p.name.slice(0, 14)}…` : p.name,
        stock: Number(p.stock),
        minStock: Number(p.minStock),
      })),
    [stats?.lowStockProducts],
  );

  const servicesChartData = React.useMemo(
    () =>
      services.map((s) => ({
        name: s.name.length > 12 ? `${s.name.slice(0, 12)}…` : s.name,
        price: Number(s.price),
      })),
    [services],
  );

  const invoiceTrend = React.useMemo(
    () => computeInvoiceTrend(invoices),
    [invoices],
  );

  const overviewConfig = {
    customers: { label: t.dashboard.totalCustomers, color: "var(--chart-1)" },
    products: { label: t.dashboard.totalProducts, color: "var(--chart-2)" },
    services: { label: t.dashboard.totalServices, color: "var(--chart-3)" },
    employees: { label: t.dashboard.totalEmployees, color: "var(--chart-4)" },
  } satisfies ChartConfig;

  const revenueConfig = {
    revenue: {
      label: t.dashboard.charts.revenueLabel,
      color: "var(--chart-1)",
    },
    invoices: {
      label: t.dashboard.charts.invoicesLabel,
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;

  const inventoryConfig = {
    inStock: { label: t.dashboard.charts.inStock, color: "var(--chart-2)" },
    lowStock: {
      label: t.dashboard.charts.lowStockStatus,
      color: "var(--chart-3)",
    },
    outOfStock: {
      label: t.dashboard.charts.outOfStock,
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;

  const stockBarConfig = {
    stock: {
      label: t.dashboard.charts.currentStock,
      color: "var(--chart-1)",
    },
    minStock: {
      label: t.dashboard.charts.minStock,
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  const servicesConfig = {
    price: { label: t.dashboard.totalServices, color: "var(--chart-1)" },
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-6 shadow-sm">
        <div className="pointer-events-none absolute -start-10 -top-10 size-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -end-10 size-32 rounded-full bg-chart-2/20 blur-3xl" />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {t.dashboard.title}
              </span>
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">
              {t.dashboard.welcome}، {user?.name || "المستخدم"}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {t.dashboard.summaryToday}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t.dashboard.totalCustomers}
          value={stats?.totalCustomers ?? 0}
          icon={Users}
          accent="from-blue-500/10 to-card"
        />
        <StatCard
          title={t.dashboard.totalProducts}
          value={stats?.totalProducts ?? 0}
          icon={Package}
          accent="from-violet-500/10 to-card"
        />
        <StatCard
          title={t.dashboard.totalServices}
          value={stats?.totalServices ?? 0}
          icon={Wrench}
          accent="from-emerald-500/10 to-card"
        />
        <StatCard
          title={t.dashboard.totalEmployees}
          value={stats?.totalEmployees ?? 0}
          icon={UserCog}
          trend={invoiceTrend}
          description={
            invoiceTrend.value > 0 ? t.dashboard.charts.invoicesLabel : undefined
          }
          accent="from-amber-500/10 to-card"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title={t.dashboard.charts.overview}
          description={t.dashboard.charts.overviewDesc}
          icon={TrendingUp}
        >
          <ChartContainer config={overviewConfig} className="h-[280px] w-full">
            <BarChart data={overviewData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                {overviewData.map((entry, i) => (
                  <linearGradient
                    key={entry.name}
                    id={`barGrad${i}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={entry.fill} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={entry.fill} stopOpacity={0.35} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/50" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                {overviewData.map((entry, i) => (
                  <Cell key={entry.name} fill={`url(#barGrad${i})`} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard
          title={t.dashboard.charts.revenue}
          description={t.dashboard.charts.revenueDesc}
          icon={TrendingUp}
          iconClassName="bg-success/10"
        >
          {revenueData.every((d) => d.revenue === 0 && d.invoices === 0) ? (
            <p className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              {t.dashboard.charts.noChartData}
            </p>
          ) : (
            <ChartContainer config={revenueConfig} className="h-[280px] w-full">
              <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/50" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                  dot={{ fill: "var(--color-revenue)", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title={t.dashboard.charts.inventory}
          description={t.dashboard.charts.inventoryDesc}
          icon={Package}
          className="lg:col-span-1"
        >
          {products.length === 0 ? (
            <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
              {t.dashboard.charts.noChartData}
            </p>
          ) : (
            <ChartContainer config={inventoryConfig} className="mx-auto h-[240px] w-full max-w-[280px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={inventoryData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  strokeWidth={2}
                >
                  {inventoryData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="status" />} />
              </PieChart>
            </ChartContainer>
          )}
        </ChartCard>

        <ChartCard
          title={t.dashboard.charts.lowStock}
          description={t.dashboard.charts.lowStockDesc}
          icon={AlertTriangle}
          iconClassName="bg-warning/10"
          className="lg:col-span-2"
        >
          {lowStockChartData.length === 0 ? (
            <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
              {t.dashboard.charts.noLowStock}
            </p>
          ) : (
            <ChartContainer config={stockBarConfig} className="h-[240px] w-full">
              <BarChart
                data={lowStockChartData}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="4 4" className="stroke-border/50" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={72}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="stock" fill="var(--color-stock)" radius={[0, 6, 6, 0]} barSize={14} />
                <Bar dataKey="minStock" fill="var(--color-minStock)" radius={[0, 6, 6, 0]} barSize={14} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title={t.dashboard.charts.servicesPrices}
          description={t.dashboard.charts.servicesPricesDesc}
          icon={Wrench}
          className="lg:col-span-2"
        >
          {servicesChartData.length === 0 ? (
            <p className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
              {t.dashboard.charts.noChartData}
            </p>
          ) : (
            <ChartContainer config={servicesConfig} className="h-[220px] w-full">
              <BarChart data={servicesChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="serviceBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-price)" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="var(--color-price)" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/50" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} width={44} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="price" fill="url(#serviceBar)" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ChartContainer>
          )}
        </ChartCard>

        <RecentCustomersCard customers={stats?.recentCustomers ?? []} />
      </div>
    </div>
  );
}
