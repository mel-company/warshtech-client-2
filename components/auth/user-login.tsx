"use client";

import { useState } from "react";
import { Car, Phone, KeyRound, Loader2, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getPostLoginPath } from "@/lib/pos-access";
import { t } from "@/lib/i18n";
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
import { toast } from "sonner";
import type { AuthUser } from "@/types";
import { FIXED_TENANT_ID, isTenantLocked } from "@/lib/tenant-config";

export function UserLoginPage() {
  const { login, isLoading } = useAuth();
  const [tenantId, setTenantId] = useState(FIXED_TENANT_ID);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const trimmedTenant = (isTenantLocked ? FIXED_TENANT_ID : tenantId).trim();
    if (!trimmedTenant || !phone || !password) {
      setError(t("auth.fillAllFields"));
      setIsSubmitting(false);
      return;
    }

    const success = await login(phone, password, trimmedTenant);
    if (success) {
      const stored = localStorage.getItem("auth_user");
      const user = stored ? (JSON.parse(stored) as AuthUser) : null;
      toast.success(t("auth.loginSuccess"));
      window.location.href = getPostLoginPath(user);
    } else {
      setError(t("auth.loginFailed"));
    }
    setIsSubmitting(false);
  };

  const busy = isLoading || isSubmitting;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("appName")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("auth.welcomeBack")}
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">{t("auth.login")}</CardTitle>
            <CardDescription>{t("auth.enterCredentials")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {!isTenantLocked && (
              <div className="space-y-2">
                <Label htmlFor="tenant">{t("auth.tenant")}</Label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tenant"
                    type="text"
                    placeholder={t("auth.tenantPlaceholder")}
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="pl-4 pr-10 text-left"
                    dir="ltr"
                    disabled={busy}
                    autoComplete="organization"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("auth.tenantHint")}
                </p>
              </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="05XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-4 pr-10 text-left"
                    dir="ltr"
                    disabled={busy}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-4 pr-10 text-left"
                    dir="ltr"
                    disabled={busy}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <KeyRound className="ml-2 h-4 w-4" />
                    {t("auth.login")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <a
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            تسجيل الدخول كمسؤول
          </a>
        </p>
      </div>
    </div>
  );
}
