import type { Invoice } from "@/types";
import { POS_WALK_IN_NAME, POS_WALK_IN_PHONE } from "@/lib/pos-checkout";

export const POS_PLACEHOLDER_CAR_NUMBER = "POS";

export type InvoiceBuyerKind = "company" | "cash" | "customer";

export function isPosWalkInCustomer(
  customer?: { name?: string; phone?: string } | null,
): boolean {
  if (!customer) return false;
  if (customer.name === POS_WALK_IN_NAME) return true;
  const digits = (customer.phone ?? "").replace(/\D/g, "");
  const walkDigits = POS_WALK_IN_PHONE.replace(/\D/g, "");
  return digits.endsWith(walkDigits) || digits.includes("999999999");
}

export function isPosPlaceholderCar(
  car?: { number?: string } | null,
): boolean {
  return car?.number === POS_PLACEHOLDER_CAR_NUMBER;
}

export function getInvoiceBuyerKind(
  invoice: Pick<Invoice, "customer" | "company">,
): InvoiceBuyerKind {
  if (invoice.company?.name) return "company";
  if (isPosWalkInCustomer(invoice.customer)) return "cash";
  return "customer";
}

/** الاسم المعروض في القوائم والفاتورة */
export function getInvoiceBuyerName(
  invoice: Pick<Invoice, "customer" | "company" | "notes">,
): string {
  if (invoice.company?.name) return invoice.company.name;
  if (isPosWalkInCustomer(invoice.customer) && invoice.notes?.trim()) {
    return invoice.notes.trim();
  }
  return invoice.customer?.name ?? "—";
}

export function getInvoiceBuyerPhone(
  invoice: Pick<Invoice, "customer" | "company">,
): string | null {
  if (invoice.company?.phone) return invoice.company.phone;
  if (isPosWalkInCustomer(invoice.customer)) return null;
  return invoice.customer?.phone ?? null;
}

export function shouldHideInvoiceCar(
  invoice: Pick<Invoice, "car" | "company" | "customer">,
): boolean {
  return isPosPlaceholderCar(invoice.car);
}

export function filterWorkshopCustomers<
  T extends { name?: string; phone?: string },
>(customers: T[]): T[] {
  return customers.filter((c) => !isPosWalkInCustomer(c));
}

export function filterWorkshopCars<T extends { number?: string }>(
  cars: T[],
): T[] {
  return cars.filter((c) => !isPosPlaceholderCar(c));
}

export function invoiceMatchesSearch(
  invoice: Invoice,
  query: string,
): boolean {
  const q = query.toLowerCase();
  return (
    invoice.invoiceNumber.toLowerCase().includes(q) ||
    getInvoiceBuyerName(invoice).toLowerCase().includes(q) ||
    (invoice.company?.name?.toLowerCase().includes(q) ?? false) ||
    invoice.customer.name.toLowerCase().includes(q) ||
    invoice.customer.phone.includes(q) ||
    (invoice.company?.phone?.includes(q) ?? false) ||
    invoice.car.number.toLowerCase().includes(q)
  );
}
