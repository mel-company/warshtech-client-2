"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Phone,
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from "lucide-react";
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

export function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    tenantName: "",
    subdomain: "",
    userName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Auto-generate subdomain from tenant name
    if (field === "tenantName") {
      const subdomain = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setFormData((prev) => ({ ...prev, subdomain }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.tenantName ||
      !formData.subdomain ||
      !formData.userName ||
      !formData.phone ||
      !formData.password
    ) {
      setError(t("auth.fillAllFields"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    if (formData.password.length < 6) {
      setError(t("auth.passwordTooShort"));
      return;
    }

    setIsLoading(true);

    const result = await register({
      tenantName: formData.tenantName,
      subdomain: formData.subdomain,
      userName: formData.userName,
      phone: formData.phone,
      password: formData.password,
    });

    setIsLoading(false);

    if (result.success) {
      router.push("/login?registered=true");
    } else {
      setError(result.error || t("auth.registerFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">X-ERP</span>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {t("auth.createAccount")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.registerDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Tenant Info */}
              <div className="space-y-2">
                <Label htmlFor="tenantName">{t("auth.tenantName")}</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tenantName"
                    placeholder={t("auth.tenantNamePlaceholder")}
                    value={formData.tenantName}
                    onChange={(e) => handleChange("tenantName", e.target.value)}
                    className="pl-10"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subdomain">{t("auth.subdomain")}</Label>
                <div className="relative">
                  <span className="absolute right-3 top-3 text-muted-foreground text-sm">
                    .x-erp.com
                  </span>
                  <Input
                    id="subdomain"
                    placeholder={t("auth.subdomainPlaceholder")}
                    value={formData.subdomain}
                    onChange={(e) => handleChange("subdomain", e.target.value)}
                    className="pl-10 pr-24"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                {/* User Info */}
                <div className="space-y-2">
                  <Label htmlFor="userName">{t("auth.yourName")}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="userName"
                      placeholder={t("auth.yourNamePlaceholder")}
                      value={formData.userName}
                      onChange={(e) => handleChange("userName", e.target.value)}
                      className="pl-10"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="phone">{t("auth.phone")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t("auth.phonePlaceholder")}
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="pl-10"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("auth.passwordPlaceholder")}
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="pl-10"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="confirmPassword">
                    {t("auth.confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={t("auth.confirmPasswordPlaceholder")}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      className="pl-10"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {t("auth.createAccount")}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {t("auth.alreadyHaveAccount")}
                </span>{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push("/login")}
                >
                  {t("auth.login")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
