import apiClient from "@/lib/api";
import { extractListData } from "@/lib/list-response";
import type { Car, Customer } from "@/types";

/** أشكال رقم الهاتف للبحث (عراقي: 07xx، 7xx، +964…) */
export function phoneSearchVariants(raw: string): string[] {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return [];

  const variants = new Set<string>();
  variants.add(raw.trim());

  if (digits.startsWith("964")) {
    variants.add(`+${digits}`);
    variants.add(digits.slice(3));
    variants.add(`0${digits.slice(3)}`);
  } else if (digits.startsWith("0")) {
    variants.add(digits);
    variants.add(digits.slice(1));
    variants.add(`+964${digits.slice(1)}`);
  } else {
    variants.add(digits);
    variants.add(`0${digits}`);
    variants.add(`+964${digits}`);
    variants.add(`964${digits}`);
  }

  return [...variants].filter(Boolean);
}

export function normalizePhoneDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("964")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return d;
}

export function phonesMatch(a: string, b: string): boolean {
  const da = normalizePhoneDigits(a);
  const db = normalizePhoneDigits(b);
  if (!da || !db) return false;
  return da === db || da.endsWith(db) || db.endsWith(da);
}

export async function fetchCustomerWithCars(
  customerId: string,
): Promise<(Customer & { cars: Car[] }) | null> {
  try {
    return await apiClient.get<Customer & { cars: Car[] }>(
      `/customers/${customerId}`,
    );
  } catch {
    return null;
  }
}

export async function findCustomerByPhone(
  phone: string,
): Promise<(Customer & { cars: Car[] }) | null> {
  const variants = phoneSearchVariants(phone);
  if (variants.length === 0) return null;

  for (const variant of variants) {
    try {
      const exact = await apiClient.get<Customer & { cars?: Car[] }>(
        `/customers/search?phone=${encodeURIComponent(variant)}`,
      );
      if (exact?.id) {
        return fetchCustomerWithCars(exact.id);
      }
    } catch {
      // continue
    }
  }

  for (const variant of variants) {
    try {
      const res = await apiClient.get<{ data: Customer[] }>(
        `/customers?search=${encodeURIComponent(variant)}&take=5`,
      );
      const list = extractListData(res);
      const hit =
        list.find((c) => phonesMatch(c.phone, phone)) ?? list[0];
      if (hit?.id) {
        return fetchCustomerWithCars(hit.id);
      }
    } catch {
      // continue
    }
  }

  return null;
}
