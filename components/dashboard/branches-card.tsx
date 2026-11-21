"use client";

import * as React from "react";
import { toast } from "sonner";
import { GitBranch, Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import type { WorkshopBranch } from "@/lib/branch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BranchesCard() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("settings", "write");
  const [branches, setBranches] = React.useState<WorkshopBranch[]>([]);
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const data = await apiClient.get<WorkshopBranch[]>("/branches");
      setBranches(data);
    } catch (error) {
      console.error(error);
      toast.error(t.messages.error.fetchFailed);
    }
  }, [t.messages.error.fetchFailed]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const addBranch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await apiClient.post("/branches", {
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setName("");
      setAddress("");
      setPhone("");
      toast.success(t.messages.success.created);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.messages.error.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (branch: WorkshopBranch) => {
    try {
      await apiClient.patch(`/branches/${branch.id}`, {
        isActive: branch.isActive === false,
      });
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.messages.error.saveFailed);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="size-5" />
          {t.settings?.branches || "الفروع"}
        </CardTitle>
        <CardDescription>
          {t.settings?.branchesHint ||
            "النطاق الفرعي واحد للورشة. الفروع مواقع داخل نفس الورشة."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {branches.map((branch) => (
            <li
              key={branch.id}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">
                  {branch.name}
                  {branch.isMain
                    ? ` (${t.settings?.mainBranch || "الرئيسي"})`
                    : ""}
                </p>
                {branch.address ? (
                  <p className="text-xs text-muted-foreground">{branch.address}</p>
                ) : null}
              </div>
              {!branch.isMain && canWrite ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void toggle(branch)}
                >
                  {branch.isActive === false
                    ? t.settings?.enableBranch || "تفعيل"
                    : t.settings?.disableBranch || "إيقاف"}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>

        {canWrite && (
          <form onSubmit={addBranch} className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="branch-name">
                {t.settings?.branchName || "اسم الفرع"}
              </Label>
              <Input
                id="branch-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t.settings?.branchNamePlaceholder || "فرع الكرادة"}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder={t.settings?.branchAddress || "العنوان"}
              />
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder={t.settings?.branchPhone || "الهاتف"}
                dir="ltr"
              />
            </div>
            <Button type="submit" disabled={saving || name.trim().length < 2}>
              <Plus className="size-4" />
              {t.settings?.addBranch || "إضافة فرع"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
