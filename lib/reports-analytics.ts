import type { Invoice, InvoiceStatus, Product } from "@/types";

export type ReportPeriod = "7d" | "30d" | "90d" | "year" | "all";

export function periodStart(period: ReportPeriod): Date | null {
  if (period === "all") return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "7d") d.setDate(d.getDate() - 7);
  else if (period === "30d") d.setDate(d.getDate() - 30);
  else if (period === "90d") d.setDate(d.getDate() - 90);
  else if (period === "year") d.setFullYear(d.getFullYear() - 1);
  return d;
}

export function filterInvoicesByPeriod(
  invoices: Invoice[],
  period: ReportPeriod,
): Invoice[] {
  const start = periodStart(period);
  if (!start) return invoices;
  return invoices.filter((inv) => new Date(inv.createdAt) >= start);
}

export function sumRevenue(invoices: Invoice[], statuses?: InvoiceStatus[]): number {
  return invoices
    .filter((inv) => !statuses || statuses.includes(inv.status))
    .reduce((s, inv) => s + (Number(inv.finalPrice) || 0), 0);
}

export function countByStatus(invoices: Invoice[]): Record<InvoiceStatus, number> {
  const base: Record<InvoiceStatus, number> = {
    PENDING: 0,
    IN_SERVICE: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };
  for (const inv of invoices) {
    base[inv.status] = (base[inv.status] ?? 0) + 1;
  }
  return base;
}

export function revenueByMonth(invoices: Invoice[]) {
  const points: {
    month: string;
    revenue: number;
    invoices: number;
    sortKey: string;
  }[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    points.push({
      month: d.toLocaleDateString("ar", { month: "short", year: "2-digit" }),
      revenue: 0,
      invoices: 0,
      sortKey,
    });
  }

  for (const inv of invoices) {
    if (inv.status === "CANCELLED") continue;
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

export function topCustomersByRevenue(invoices: Invoice[], limit = 10) {
  const map = new Map<
    string,
    { name: string; phone: string; revenue: number; count: number }
  >();

  for (const inv of invoices) {
    if (inv.status === "CANCELLED") continue;
    const id = inv.customer?.id ?? inv.customerId;
    const cur = map.get(id) ?? {
      name: inv.customer?.name ?? "—",
      phone: inv.customer?.phone ?? "",
      revenue: 0,
      count: 0,
    };
    cur.revenue += Number(inv.finalPrice) || 0;
    cur.count += 1;
    map.set(id, cur);
  }

  return [...map.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function topProductsFromInvoices(invoices: Invoice[], limit = 10) {
  const map = new Map<string, { name: string; qty: number; revenue: number }>();

  for (const inv of invoices) {
    if (inv.status === "CANCELLED") continue;
    for (const line of inv.products ?? []) {
      const id = line.productId;
      const cur = map.get(id) ?? {
        name: line.product?.name ?? id,
        qty: 0,
        revenue: 0,
      };
      cur.qty += Number(line.quantity) || 0;
      cur.revenue += Number(line.total) || Number(line.unitPrice) * Number(line.quantity);
      map.set(id, cur);
    }
  }

  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function topServicesFromInvoices(invoices: Invoice[], limit = 10) {
  const map = new Map<string, { name: string; count: number; revenue: number }>();

  for (const inv of invoices) {
    if (inv.status === "CANCELLED") continue;
    for (const line of inv.services ?? []) {
      const id = line.serviceId;
      const cur = map.get(id) ?? {
        name: line.service?.name ?? id,
        count: 0,
        revenue: 0,
      };
      cur.count += 1;
      cur.revenue += Number(line.price) || 0;
      map.set(id, cur);
    }
  }

  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function inventoryBreakdown(products: Product[]) {
  let inStock = 0;
  let low = 0;
  let out = 0;
  let stockValue = 0;

  for (const p of products) {
    const stock = Number(p.stock);
    const min = Number(p.minStock);
    stockValue += stock * Number(p.costPrice || p.salePrice);
    if (stock <= 0) out += 1;
    else if (stock <= min) low += 1;
    else inStock += 1;
  }

  return { inStock, low, out, stockValue, total: products.length };
}

export function lowStockProducts(products: Product[], limit = 15) {
  return products
    .filter((p) => Number(p.stock) <= Number(p.minStock))
    .sort((a, b) => Number(a.stock) - Number(b.stock))
    .slice(0, limit);
}
