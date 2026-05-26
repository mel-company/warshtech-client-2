/**
 * قوالب الأدوار في الباك إند — مصدر الحقيقة لصلاحيات محاسب / استقبال.
 *
 * GET  /roles/presets/list
 * POST /roles/presets/accountant  — إنشاء أو تحديث دور «محاسب»
 * POST /roles/presets/reception   — إنشاء أو تحديث دور «موظف استقبال»
 */
import apiClient from "@/lib/api";
import type { Permission, Role } from "@/types";

export type ServerRolePresetId = "accountant" | "reception";

export interface ServerRolePreset {
  id: ServerRolePresetId;
  name: string;
  description?: string;
  permissions: Permission[];
}

function unwrapRole(data: Role | { role: Role }): Role {
  if (data && typeof data === "object" && "role" in data) {
    return (data as { role: Role }).role;
  }
  return data as Role;
}

export async function fetchRolePresetsList(): Promise<ServerRolePreset[]> {
  const res = await apiClient.get<
    ServerRolePreset[] | { data: ServerRolePreset[] }
  >("/roles/presets/list");

  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && "data" in res && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export async function applyAccountantRolePreset(): Promise<Role> {
  const res = await apiClient.post<Role | { role: Role }>(
    "/roles/presets/accountant",
    {},
  );
  return unwrapRole(res);
}

export async function applyReceptionRolePreset(): Promise<Role> {
  const res = await apiClient.post<Role | { role: Role }>(
    "/roles/presets/reception",
    {},
  );
  return unwrapRole(res);
}
