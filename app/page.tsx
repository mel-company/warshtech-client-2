"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { getPostLoginPath } from "@/lib/pos-access"
import { LandingPage } from "@/components/landing/landing-page"
import { isRootSite } from "@/lib/workshop-host"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [site, setSite] = useState<"pending" | "root" | "app">("pending")

  useEffect(() => {
    setSite(isRootSite() ? "root" : "app")
  }, [])

  useEffect(() => {
    if (site !== "app" || isLoading || !user) return
    router.replace(getPostLoginPath(user))
  }, [site, user, isLoading, router])

  if (site === "pending" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (site === "root") {
    return <LandingPage />
  }

  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <LandingPage />
}
