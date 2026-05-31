import apiClient from "@/lib/api";
import type {
  MaintenanceFilter,
  UpdateMaintenanceRulesData,
  VehicleMaintenance,
} from "@/types";

export async function fetchVehicleMaintenance(carId: string) {
  return apiClient.get<VehicleMaintenance>(
    `/maintenance/cars/${encodeURIComponent(carId)}`,
  );
}

export async function fetchUpcomingMaintenance(filter?: MaintenanceFilter) {
  const params = filter ? `?filter=${encodeURIComponent(filter)}` : "";
  return apiClient.get<{ data: VehicleMaintenance[]; total: number }>(
    `/maintenance/upcoming${params}`,
  );
}

export async function updateMaintenanceRules(
  carId: string,
  data: UpdateMaintenanceRulesData,
) {
  return apiClient.patch<VehicleMaintenance>(
    `/maintenance/cars/${encodeURIComponent(carId)}`,
    data,
  );
}
