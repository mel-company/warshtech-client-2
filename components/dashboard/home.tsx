'use client'

import * as React from 'react'
import {
  Users,
  Package,
  Wrench,
  UserCog,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ArrowUpLeft,
  ArrowDownLeft,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { mockCustomers, mockProducts, mockServices, mockEmployees } from '@/lib/mock-data'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
  return (
    <Card className={cn('card-hover', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold animate-count-up">{value}</div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  'flex items-center gap-0.5 font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpLeft className="size-3" />
                ) : (
                  <ArrowDownLeft className="size-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecentCustomersCard() {
  const { t } = useTranslation()
  const recentCustomers = mockCustomers.slice(0, 5)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5 text-primary" />
          {t.dashboard.recentCustomers}
        </CardTitle>
        <CardDescription>آخر العملاء المضافين</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCustomers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                    {getInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{customer.name}</span>
                  <span className="text-xs text-muted-foreground" dir="ltr">
                    {customer.phone}
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {customer.cars.length} سيارة
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LowStockCard() {
  const { t } = useTranslation()
  const lowStockProducts = mockProducts.filter(
    (p) => p.stock <= p.minStock
  ).slice(0, 5)

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-warning" />
          {t.dashboard.lowStockProducts}
        </CardTitle>
        <CardDescription>المنتجات التي تحتاج إعادة تخزين</CardDescription>
      </CardHeader>
      <CardContent>
        {lowStockProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد منتجات منخفضة المخزون
          </p>
        ) : (
          <div className="space-y-4">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="text-xs text-muted-foreground">
                    الحد الأدنى: {product.minStock} {t.products.units[product.unit]}
                  </span>
                </div>
                <Badge
                  variant={product.stock === 0 ? 'destructive' : 'secondary'}
                  className={cn(
                    'text-xs',
                    product.stock === 0 && 'bg-destructive text-destructive-foreground',
                    product.stock > 0 && product.stock <= product.minStock && 'bg-warning/10 text-warning border-warning/20'
                  )}
                >
                  {product.stock === 0 ? 'نفذ' : `${product.stock} متبقي`}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PopularServicesCard() {
  const { t } = useTranslation()
  const activeServices = mockServices.filter((s) => s.isActive).slice(0, 5)

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5 text-success" />
          {t.dashboard.popularServices}
        </CardTitle>
        <CardDescription>الخدمات الأكثر طلباً</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeServices.map((service, index) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{service.name}</span>
              </div>
              <span className="text-sm font-semibold text-primary">
                {service.price} {t.currency.symbol}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardHome() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const totalCustomers = mockCustomers.length
  const totalProducts = mockProducts.length
  const totalServices = mockServices.filter((s) => s.isActive).length
  const totalEmployees = mockEmployees.filter((e) => e.isActive).length

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">
          {t.dashboard.welcome}، {user?.name || 'المستخدم'}
        </h2>
        <p className="text-muted-foreground">
          إليك ملخص نشاط مركز الخدمة اليوم
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t.dashboard.totalCustomers}
          value={totalCustomers}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          description="مقارنة بالشهر الماضي"
        />
        <StatCard
          title={t.dashboard.totalProducts}
          value={totalProducts}
          icon={Package}
          trend={{ value: 5, isPositive: true }}
          description="منتج جديد هذا الأسبوع"
        />
        <StatCard
          title={t.dashboard.totalServices}
          value={totalServices}
          icon={Wrench}
          description="خدمة نشطة"
        />
        <StatCard
          title={t.dashboard.totalEmployees}
          value={totalEmployees}
          icon={UserCog}
          description="موظف نشط"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RecentCustomersCard />
        <LowStockCard />
        <PopularServicesCard />
      </div>
    </div>
  )
}
