"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Phone, KeyRound, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
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

export function UserLoginPage() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!phone || !password) {
      setError(t("auth.fillAllFields"));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login/simple`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone, password }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("auth.loginFailed"));
      }

      const data = await response.json();
      
      // Store auth data
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      localStorage.setItem("access_token", data.accessToken);
      localStorage.setItem("refresh_token", data.refreshToken);
      localStorage.setItem("auth_tenant", JSON.stringify(data.tenant));
      localStorage.setItem("tenant_id", data.tenant.id);

      toast.success(t("auth.loginSuccess"));
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(error.message || t("auth.loginFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
            <CardDescription>
              {t("auth.enterCredentials")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
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

        {/* Admin login link */}
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
