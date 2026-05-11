"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Car, Phone, KeyRound, ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

type AuthStep = "phone" | "otp"

export function LoginPage() {
  const router = useRouter()
  const { sendOTP, verifyOTP, isLoading } = useAuth()
  const [step, setStep] = useState<AuthStep>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!phone || phone.length < 10) {
      setError(t("auth.phoneRequired"))
      return
    }

    const success = await sendOTP(phone)
    if (success) {
      setStep("otp")
    } else {
      setError(t("auth.otpSendFailed"))
    }
  }

  const handleVerifyOTP = async (value: string) => {
    setOtp(value)
    if (value.length === 6) {
      setError("")
      const success = await verifyOTP(phone, value)
      if (success) {
        router.push("/dashboard")
      } else {
        setError(t("auth.invalidOTP"))
        setOtp("")
      }
    }
  }

  const handleBack = () => {
    setStep("phone")
    setOtp("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("appName")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("auth.welcomeBack")}</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">
              {step === "phone" ? t("auth.login") : t("auth.verifyOTP")}
            </CardTitle>
            <CardDescription>
              {step === "phone" 
                ? t("auth.enterPhone") 
                : t("auth.otpSent").replace("{phone}", phone)
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "phone" ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
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

                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
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
                      {t("auth.sendOTP")}
                    </>
                  )}
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

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

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

        {/* Demo hint */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          {t("auth.demoHint")}
        </p>
      </div>
    </div>
  )
}
