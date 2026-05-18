import apiClient from "@/lib/api";
import type { Car, Customer } from "@/types";

export interface CheckoutCustomerInput {
  phone: string;
  name: string;
  matchedCustomer: Customer | null;
}

export interface CheckoutCarInput {
  number: string;
  name: string;
  model: string;
  color: string;
  matchedCar: (Car & { customer?: { id: string } }) | null;
}

export async function resolveCustomerAndCar(
  customer: CheckoutCustomerInput,
  car: CheckoutCarInput,
): Promise<{ customerId: string; carId: string } | null> {
  let customerId: string;

  if (customer.matchedCustomer) {
    const nameChanged = customer.name.trim() !== customer.matchedCustomer.name;
    const phoneChanged = customer.phone.trim() !== customer.matchedCustomer.phone;
    if (nameChanged || phoneChanged) {
      await apiClient.patch(`/customers/${customer.matchedCustomer.id}`, {
        ...(nameChanged ? { name: customer.name.trim() } : {}),
        ...(phoneChanged ? { phone: customer.phone.trim() } : {}),
      });
    }
    customerId = customer.matchedCustomer.id;
  } else {
    const newCustomer = await apiClient.post<Customer>("/customers", {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
    });
    customerId = newCustomer.id;
  }

  let carId: string;

  if (car.matchedCar?.id) {
    const changes: Record<string, string> = {};
    if (car.name.trim() !== car.matchedCar.name) changes.name = car.name.trim();
    if (car.number.trim() !== car.matchedCar.number) changes.number = car.number.trim();
    if (car.model.trim() !== car.matchedCar.model) changes.model = car.model.trim();
    if (car.color.trim() !== car.matchedCar.color) changes.color = car.color.trim();
    if (Object.keys(changes).length > 0) {
      await apiClient.put(`/customers/${customerId}/cars/${car.matchedCar.id}`, changes);
    }
    carId = car.matchedCar.id;
  } else {
    const newCar = await apiClient.post<Car>(`/customers/${customerId}/cars`, {
      name: car.name.trim(),
      number: car.number.trim(),
      model: car.model.trim(),
      color: car.color.trim(),
    });
    carId = newCar.id;
  }

  return { customerId, carId };
}
