/**
 * صلاحيات دور موظف الاستقبال في الباك إند (انظر RECEPTIONIST_PERMISSIONS في reception-permissions.ts):
 * CUSTOMERS_READ, CUSTOMERS_WRITE, PRODUCTS_READ, SERVICES_READ, INVOICES_READ, INVOICES_WRITE
 *
 * عقد الـ API لموظف الاستقبال — نفّذ هذه المسارات في الباك إند.
 *
 * GET  /customers/intake/lookup?phone=&plate=
 *      → IntakeLookupResponse (لا ترجع 404 إذا الزبون جديد — customer: null)
 *
 * GET  /invoices?customerId=&carId=&take=
 * GET  /invoices?activeOnly=true&take=   (PENDING + IN_SERVICE)
 * GET  /invoices?status=PENDING&take=
 *
 * POST   /invoices
 * PATCH  /invoices/:id
 * PATCH  /invoices/:id/status  { status: PENDING | IN_SERVICE | COMPLETED | CANCELLED }
 *
 * POST   /customers
 * POST   /customers/:id/cars
 * PATCH  /customers/:id
 * PUT    /customers/:id/cars/:carId
 */
import apiClient from "@/lib/api";
import { extractListData } from "@/lib/list-response";
import { findCustomerByPhone, fetchCustomerWithCars } from "@/lib/customer-lookup";
import type { Car, Customer, Invoice } from "@/types";

export interface IntakeLookupResponse {
  customer: (Customer & { cars?: Car[] }) | null;
  matchedCar: Car | null;
  cars: Car[];
  invoices: Invoice[];
  /** فاتورة مفتوحة لهذه السيارة (PENDING أو IN_SERVICE) */
  openInvoice: Invoice | null;
}

export async function runIntakeLookup(
  phone: string,
  plate = "",
): Promise<IntakeLookupResponse> {
  try {
    return await intakeLookup(phone, plate);
  } catch {
    return intakeLookupFallback(phone, plate);
  }
}

export async function intakeLookup(
  phone: string,
  plate: string,
): Promise<IntakeLookupResponse> {
  const params = new URLSearchParams();
  if (phone.trim()) params.set("phone", phone.trim());
  if (plate.trim()) params.set("plate", plate.trim());
  return apiClient.get<IntakeLookupResponse>(
    `/customers/intake/lookup?${params.toString()}`,
  );
}

/** بديل إذا لم يُنفَّذ intake/lookup بعد */
export async function intakeLookupFallback(
  phone: string,
  plate: string,
): Promise<IntakeLookupResponse> {
  let customer: (Customer & { cars?: Car[] }) | null = null;
  let matchedCar: Car | null = null;

  if (phone.trim().length >= 4) {
    customer = await findCustomerByPhone(phone);
  }

  if (plate.trim().length >= 2) {
    const carsRes = await apiClient.get<{ data: Car[] }>(
      `/cars?search=${encodeURIComponent(plate.trim())}&take=10`,
    );
    const found = extractListData(carsRes);
    const plateNorm = plate.trim().toLowerCase();
    matchedCar =
      found.find((c) => c.number.toLowerCase() === plateNorm) ?? found[0] ?? null;
    if (matchedCar && !customer) {
      customer = await fetchCustomerWithCars(matchedCar.customerId);
    }
  }

  const cars = customer?.cars?.length
    ? customer.cars
    : matchedCar
      ? [matchedCar]
      : [];

  let invoices: Invoice[] = [];
  if (customer?.id) {
    const invRes = await apiClient.get<{ data: Invoice[] }>(
      `/invoices?customerId=${customer.id}&take=30`,
    );
    invoices = extractListData(invRes);
  }

  const carId = matchedCar?.id;
  let openInvoice: Invoice | null = null;
  if (carId) {
    openInvoice =
      invoices.find(
        (i) =>
          i.carId === carId &&
          (i.status === "PENDING" || i.status === "IN_SERVICE"),
      ) ?? null;
    if (!openInvoice) {
      try {
        const active = await apiClient.get<{ data: Invoice[] }>(
          `/invoices?carId=${carId}&activeOnly=true&take=1`,
        );
        openInvoice = extractListData(active)[0] ?? null;
      } catch {
        openInvoice =
          invoices.find(
            (i) => i.carId === carId && i.status === "PENDING",
          ) ?? null;
      }
    }
  }

  return { customer, matchedCar, cars, invoices, openInvoice };
}

export async function fetchActiveInvoices(): Promise<Invoice[]> {
  try {
    const res = await apiClient.get<{ data: Invoice[] }>(
      "/invoices?activeOnly=true&take=500",
    );
    return extractListData(res);
  } catch {
    const [pending, inService] = await Promise.all([
      apiClient
        .get<{ data: Invoice[] }>("/invoices?status=PENDING&take=500")
        .then(extractListData)
        .catch(() => [] as Invoice[]),
      apiClient
        .get<{ data: Invoice[] }>("/invoices?status=IN_SERVICE&take=500")
        .then(extractListData)
        .catch(() => [] as Invoice[]),
    ]);
    const byId = new Map<string, Invoice>();
    [...pending, ...inService].forEach((i) => byId.set(i.id, i));
    return [...byId.values()];
  }
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: "PENDING" | "IN_SERVICE" | "COMPLETED" | "CANCELLED",
  mileage?: number,
): Promise<Invoice> {
  return apiClient.patch<Invoice>(`/invoices/${invoiceId}/status`, {
    status,
    ...(mileage !== undefined ? { mileage } : {}),
  });
}
