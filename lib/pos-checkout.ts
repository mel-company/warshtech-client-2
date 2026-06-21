import apiClient from "@/lib/api";
import { fetchCustomerWithCars } from "@/lib/customer-lookup";
import { extractListData } from "@/lib/list-response";
import type { Car, Customer } from "@/types";

export type PosBuyerType = "cash" | "company";

/** رقم ثابت لزبون النقدي — لا يُستخدم لعميل حقيقي */
export const POS_WALK_IN_PHONE = "09999999999";

export const POS_WALK_IN_NAME = "زبون نقدي";

const PLACEHOLDER_CAR = {
  number: "POS",
  name: "بيع مباشر",
  model: "—",
  color: "—",
};

async function findWalkInCustomer(): Promise<Customer | null> {
  try {
    const exact = await apiClient.get<Customer>(
      `/customers/search?phone=${encodeURIComponent(POS_WALK_IN_PHONE)}`,
    );
    if (exact?.id) return exact;
  } catch {
    // not found yet
  }

  try {
    const res = await apiClient.get<{ data: Customer[] }>(
      `/customers?search=${encodeURIComponent(POS_WALK_IN_PHONE)}&take=5`,
    );
    const list = extractListData(res);
    return list.find((c) => c.phone.includes("999999999")) ?? list[0] ?? null;
  } catch {
    return null;
  }
}

async function getOrCreatePlaceholderCar(customerId: string): Promise<string> {
  const full = await fetchCustomerWithCars(customerId);
  const existing = full?.cars.find((c) => c.number === PLACEHOLDER_CAR.number);
  if (existing) return existing.id;

  const created = await apiClient.post<Car>(
    `/customers/${customerId}/cars`,
    PLACEHOLDER_CAR,
  );
  return created.id;
}

export async function resolveCashPosSale(options?: {
  noteName?: string;
}): Promise<{ customerId: string; carId: string; notes?: string }> {
  let customer = await findWalkInCustomer();
  let customerId: string;

  if (customer) {
    customerId = customer.id;
  } else {
    const created = await apiClient.post<Customer>("/customers", {
      name: POS_WALK_IN_NAME,
      phone: POS_WALK_IN_PHONE,
    });
    customerId = created.id;
  }

  const carId = await getOrCreatePlaceholderCar(customerId);
  const note = options?.noteName?.trim();

  return {
    customerId,
    carId,
    notes: note || undefined,
  };
}

export async function resolveCompanyPosSale(
  companyId: string,
): Promise<{ customerId: string; carId: string; companyId: string }> {
  const base = await resolveCashPosSale();
  return {
    customerId: base.customerId,
    carId: base.carId,
    companyId,
  };
}
