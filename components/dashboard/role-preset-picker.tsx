"use client";

import * as React from "react";
import {
  CarFront,
  ShoppingCart,
  Package,
  Layers,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type { Permission } from "@/types";
import { ROLE_PRESETS, type RolePresetId } from "@/lib/role-presets";

const PRESET_ICONS: Record<RolePresetId, React.ElementType> = {
  reception: CarFront,
  accountant: ShoppingCart,
  cashier: ShoppingCart,
  warehouse: Package,
  multiTask: Layers,
};

interface RolePresetPickerProps {
  onApply: (data: {
    id: RolePresetId;
    name: string;
    permissions: Permission[];
  }) => void;
  disabled?: boolean;
  selectedId?: RolePresetId | null;
}

export function RolePresetPicker({
  onApply,
  disabled,
  selectedId,
}: RolePresetPickerProps) {
  const { t, locale } = useTranslation();

  const handleSelect = (id: RolePresetId) => {
    const preset = ROLE_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const name =
      locale === "ar" ? preset.defaultNameAr : preset.defaultNameEn;
    onApply({ id, name, permissions: [...preset.permissions] });
    toast.message(t.rolesPage.presetApplied);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{t.rolesPage.presetsTitle}</p>
        <p className="text-xs text-muted-foreground">{t.rolesPage.presetsHint}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {ROLE_PRESETS.map((preset) => {
          const Icon = PRESET_ICONS[preset.id];
          const isSelected = selectedId === preset.id;
          const presetT = t.rolesPage.presets[preset.id];
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(preset.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 text-start transition-colors",
                "hover:border-primary/50 hover:bg-primary/5",
                isSelected && "border-primary bg-primary/10 ring-1 ring-primary/30",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{presetT.name}</span>
                  {isSelected && (
                    <Check className="size-4 shrink-0 text-primary" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {presetT.description}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {t.rolesPage.permissionCount.replace(
                    "{count}",
                    String(preset.permissions.length),
                  )}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
