'use client'

import { DashboardHome } from '@/components/dashboard/home'
import { WorkspaceHome } from '@/components/dashboard/workspace-home'
import { useAuth } from '@/lib/auth'
import { canAccessAdminDashboard } from '@/lib/user-capabilities'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (canAccessAdminDashboard(user)) {
    return <DashboardHome />
  }

  return <WorkspaceHome />
}
