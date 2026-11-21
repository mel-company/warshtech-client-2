"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, GitBranch } from "lucide-react";
import { t } from "@/lib/i18n";
import { apiClient } from "@/lib/api";
import {
  FIXED_TENANT_ID,
  getDefaultTenantId,
  isTenantLocked,
} from "@/lib/tenant-config";
import { readWorkshopSubdomain, workshopUrl } from "@/lib/workshop-host";
import type { PublicWorkshop } from "@/lib/branch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function WorkshopAccessFields({
  tenantId,
  onTenantId,
  branchId,
  onBranchId,
  onBranchCount,
  disabled,
}: {
  tenantId: string;
  onTenantId: (value: string) => void;
  branchId: string;
  onBranchId: (value: string) => void;
  onBranchCount?: (count: number) => void;
  disabled?: boolean;
}) {
  const [locked, setLocked] = useState(false);
  const [workshop, setWorkshop] = useState<PublicWorkshop | null>(null);
  const branchRef = useRef(branchId);
  branchRef.current = branchId;

  useEffect(() => {
    const host = readWorkshopSubdomain();
    if (host) {
      setLocked(true);
      onTenantId(host);
      return;
    }
    setLocked(isTenantLocked);
    onTenantId(isTenantLocked ? FIXED_TENANT_ID : getDefaultTenantId());
    // Mount-only: the host decides the workshop before the user types.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const key = tenantId.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(key)) {
      setWorkshop(null);
      onBranchCount?.(0);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const data = await apiClient.get<PublicWorkshop>(`/workshops/${key}`);
        if (cancelled) return;
        setWorkshop(data);
        const branches = data.branches ?? [];
        onBranchCount?.(branches.length);
        const current = branchRef.current;
        if (branches.length === 1) {
          onBranchId(branches[0].id);
        } else if (!branches.some((branch) => branch.id === current)) {
          onBranchId("");
        }
      } catch {
        if (!cancelled) {
          setWorkshop(null);
          onBranchCount?.(0);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [tenantId, onBranchId, onBranchCount]);

  const branches = workshop?.branches ?? [];

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="tenant">{t("auth.tenant")}</Label>
        {locked ? (
          <div className="rounded-md border bg-muted/50 px-3 py-2">
            <p className="text-sm font-medium" dir="ltr">
              {workshopUrl(tenantId)}
            </p>
            {workshop?.name ? (
              <p className="text-xs text-muted-foreground">{workshop.name}</p>
            ) : null}
          </div>
        ) : (
          <div className="relative">
            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="tenant"
              type="text"
              placeholder={t("auth.tenantPlaceholder")}
              value={tenantId}
              onChange={(e) => onTenantId(e.target.value)}
              className="pl-4 pr-10 text-left"
              dir="ltr"
              disabled={disabled}
              autoComplete="organization"
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground">{t("auth.tenantHint")}</p>
      </div>

      {branches.length > 1 && (
        <div className="space-y-2">
          <Label>{t("auth.branch")}</Label>
          <Select
            value={branchId || undefined}
            onValueChange={onBranchId}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <GitBranch className="size-4 text-muted-foreground" />
              <SelectValue placeholder={t("auth.branchPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                  {branch.isMain ? ` (${t("auth.mainBranch")})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}
