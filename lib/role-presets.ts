import type { Permission } from "@/types";
import { RECEPTIONIST_PERMISSIONS } from "@/lib/reception-permissions";
import { POS_PERMISSIONS } from "@/lib/pos-permissions";

export type RolePresetId =
  | "reception"
  | "accountant"
  | "cashier"
  | "warehouse"
  | "multiTask";

export interface RolePreset {
  id: RolePresetId;
  /** مفتاح i18n: roles.presets.{id}.name */
  defaultNameAr: string;
  defaultNameEn: string;
  permissions: Permission[];
}

/** قوالب جاهزة — تُطبَّق على الدور عند الإنشاء (قابلة للتعديل بعدها) */
export const ROLE_PRESETS: RolePreset[] = [
  {
    id: "reception",
    defaultNameAr: "موظف استقبال",
    defaultNameEn: "Receptionist",
    permissions: [...RECEPTIONIST_PERMISSIONS],
  },
  {
    id: "accountant",
    defaultNameAr: "محاسب / نقطة بيع",
    defaultNameEn: "Accountant / POS",
    permissions: [...POS_PERMISSIONS],
  },
  {
    id: "cashier",
    defaultNameAr: "كاشير",
    defaultNameEn: "Cashier",
    permissions: [...POS_PERMISSIONS],
  },
  {
    id: "warehouse",
    defaultNameAr: "أمين مخزن",
    defaultNameEn: "Warehouse",
    permissions: ["PRODUCTS_READ", "PRODUCTS_WRITE"],
  },
  {
    id: "multiTask",
    defaultNameAr: "موظف متعدد المهام",
    defaultNameEn: "Multi-role staff",
    permissions: [
      "CUSTOMERS_READ",
      "CUSTOMERS_WRITE",
      "PRODUCTS_READ",
      "PRODUCTS_WRITE",
      "SERVICES_READ",
      "INVOICES_READ",
      "INVOICES_WRITE",
    ],
  },
];

export function getRolePreset(id: RolePresetId): RolePreset | undefined {
  return ROLE_PRESETS.find((p) => p.id === id);
}
