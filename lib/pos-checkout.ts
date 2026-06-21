import apiClient from "@/lib/api";
import { fetchCustomerWithCars } from "@/lib/customer-lookup";
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

async function getOrCreateWalkInCustomer(): Promise<Customer> {
  return apiClient.post<Customer>("/customers", {
    name: POS_WALK_IN_NAME,
    phone: POS_WALK_IN_PHONE,
    findOrCreate: true,
  });
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
  const customer = await getOrCreateWalkInCustomer();
  const carId = await getOrCreatePlaceholderCar(customer.id);
  const note = options?.noteName?.trim();

  return {
    customerId: customer.id,
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
