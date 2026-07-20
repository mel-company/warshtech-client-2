"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  Phone,
  KeyRound,
  ArrowLeft,
  Loader2,
  Building2,
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { FIXED_TENANT_ID, isTenantLocked } from "@/lib/tenant-config";

type AuthStep = "credentials" | "otp";

export function LoginPage() {
  const router = useRouter();
  const { sendOTP, verifyOTP, login, isLoading } = useAuth();
  const [step, setStep] = useState<AuthStep>("credentials");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState(FIXED_TENANT_ID);
  const [otpTenantId, setOtpTenantId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const tenant = (isTenantLocked ? FIXED_TENANT_ID : tenantId).trim();
    if (!phone || !password || !tenant) {
      setError(t("auth.fillAllFields"));
      return;
    }

    const success = await login(phone, password, tenant);
    if (success) {
      router.push("/dashboard");
    } else {
      setError(t("auth.loginFailed"));
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const tenant = (isTenantLocked ? FIXED_TENANT_ID : tenantId).trim();
    if (!phone || phone.length < 10 || !tenant) {
      setError(t("auth.fillAllFields"));
      return;
    }

    const success = await sendOTP(phone, tenant);
    if (success) {
      setOtpTenantId(tenant);
      setStep("otp");
    } else {
      setError(t("auth.otpSendFailed"));
    }
  };

  const handleVerifyOTP = async (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      setError("");
      const success = await verifyOTP(phone, value, otpTenantId);
      if (success) {
        router.push("/dashboard");
      } else {
        setError(t("auth.invalidOTP"));
        setOtp("");
      }
    }
  };

  const handleBack = () => {
    setStep("credentials");
    setOtpTenantId("");
    setOtp("");
    setError("");
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
            <CardTitle className="text-xl">
              {step === "credentials" ? t("auth.login") : t("auth.verifyOTP")}
            </CardTitle>
            <CardDescription>
              {step === "credentials"
                ? t("auth.enterCredentials")
                : t("auth.otpSentTo").replace("{phone}", phone)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "credentials" ? (
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
                        disabled={isLoading}
                      />
                    </div>
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
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
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {t("auth.or")}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                >
                  <Phone className="ml-2 h-4 w-4" />
                  {t("auth.loginWithOTP")}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("common.back")}
                </button>

                <div className="flex flex-col items-center space-y-4">
                  <Label>{t("auth.enterOTP")}</Label>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={handleVerifyOTP}
                    disabled={isLoading}
                    dir="ltr"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{t("auth.verifying")}</span>
                    </div>
                  )}

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm"
                    onClick={handleSendOTP}
                    disabled={isLoading}
                  >
                    {t("auth.resendOTP")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          {t("auth.noAccount")}{" "}
          <a
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            {t("auth.createAccount")}
          </a>
        </p>

        {/* Demo hint */}
        <p className="text-center text-xs text-muted-foreground mt-2">
          {t("auth.demoHint")}
        </p>
      </div>
    </div>
  );
}
