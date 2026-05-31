import apiClient from "@/lib/api";
import type {
  CreateVehicleServiceEventData,
  VehicleServiceEvent,
} from "@/types";

export async function fetchVehicleEvents(carId: string, take = 50) {
  return apiClient.get<{
    data: VehicleServiceEvent[];
    total: number;
    skip: number;
    take: number;
  }>(`/vehicle-events?carId=${encodeURIComponent(carId)}&take=${take}`);
}

export async function createVehicleEvent(data: CreateVehicleServiceEventData) {
  return apiClient.post<VehicleServiceEvent>("/vehicle-events", data);
}
