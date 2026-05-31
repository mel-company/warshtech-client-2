// =============================================================================
// Core Types for Car Workstation Management System
// =============================================================================

// -----------------------------------------------------------------------------
// Customer & Car Types
// -----------------------------------------------------------------------------

export interface Car {
  id: string
  name: string
  number: string  // plate number in Arabic
  model: string
  color: string
  customerId: string
  usageCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  name: string
  phone: string
  cars: Car[]
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

// -----------------------------------------------------------------------------
// Product / Stock Types
// -----------------------------------------------------------------------------

export type ProductUnit =
  | 'piece'
  | 'liter'
  | 'kilogram'
  | 'meter'
  | 'box'
  | 'set'

export interface Product {
  id: string
  name: string
  minPrice: number
  costPrice: number
  salePrice: number
  photos: string[]
  unit: ProductUnit
  unitValue: number
  unitAdjustable: boolean
  stock: number
  minStock: number
  barcode?: string
  description?: string
  categoryId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
}

// -----------------------------------------------------------------------------
// Service Types
// -----------------------------------------------------------------------------

export interface Service {
  id: string
  name: string
  price: number
  icon?: string
  photo?: string
  description?: string
  estimatedDuration?: number // in minutes
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// -----------------------------------------------------------------------------
// Employee Types
// -----------------------------------------------------------------------------

export type EmployeePosition =
  | 'manager'
  | 'technician'
  | 'receptionist'
  | 'accountant'
  | 'cleaner'

export interface Employee {
  id: string
  name: string
  position: EmployeePosition
  phone: string
  salary: number
  photo?: string
  hireDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// -----------------------------------------------------------------------------
// User & Permission Types
// -----------------------------------------------------------------------------

export type Permission =
  | 'CUSTOMERS_READ'
  | 'CUSTOMERS_WRITE'
  | 'PRODUCTS_READ'
  | 'PRODUCTS_WRITE'
  | 'SERVICES_READ'
  | 'SERVICES_WRITE'
  | 'EMPLOYEES_READ'
  | 'EMPLOYEES_WRITE'
  | 'USERS_READ'
  | 'USERS_WRITE'
  | 'ROLES_READ'
  | 'ROLES_WRITE'
  | 'SETTINGS_READ'
  | 'SETTINGS_WRITE'
  | 'INVOICES_READ'
  | 'INVOICES_WRITE'

export interface Role {
  id: string
  name: string
  permissions: Permission[]
  createdAt: Date
  updatedAt: Date
}

export type UserPosition = 'admin' | 'manager' | 'cashier' | 'accountant' | 'receptionist' | 'viewer'

export interface User {
  id: string
  name: string
  phone: string
  position: UserPosition
  roleId: string | null
  role?: Role
  isActive: boolean
  lastLogin?: Date | null
  createdAt: Date
  updatedAt: Date
}

// -----------------------------------------------------------------------------
// Authentication Types
// -----------------------------------------------------------------------------

export interface AuthUser {
  id: string
  name: string
  phone: string
  position: UserPosition
  role?: string
  permissions: string[]
}

export interface OTPRequest {
  phone: string
  code?: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// -----------------------------------------------------------------------------
// Form Types
// -----------------------------------------------------------------------------

export interface CustomerFormData {
  name: string
  phone: string
  cars: Omit<Car, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>[]
}

export interface ProductFormData {
  name: string
  minPrice: number
  costPrice: number
  salePrice: number
  photos: string[]
  unit: ProductUnit
  unitValue: number
  unitAdjustable: boolean
  stock: number
  minStock: number
  barcode?: string
  description?: string
  categoryId?: string
}

export interface ServiceFormData {
  name: string
  price: number
  icon?: string
  photo?: string
  description?: string
  estimatedDuration?: number
  isActive: boolean
}

export interface EmployeeFormData {
  name: string
  position: EmployeePosition
  phone: string
  salary: number
  photo?: string
  hireDate: Date
  isActive: boolean
}

export interface UserFormData {
  name: string
  phone: string
  password?: string
  position: UserPosition
  roleId: string | null
  isActive: boolean
}

// -----------------------------------------------------------------------------
// Invoice Types
// -----------------------------------------------------------------------------

export type InvoiceStatus = 'PENDING' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED'

export interface InvoiceProduct {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  minPrice: number
  total: number
  product: {
    id: string
    name: string
    unit: string
    unitValue: number
    unitAdjustable: boolean
    photos: string[]
  }
}

export interface InvoiceService {
  id: string
  serviceId: string
  price: number
  minPrice: number
  service: {
    id: string
    name: string
  }
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  carId: string
  totalPrice: number
  minPrice: number
  finalPrice: number
  notes?: string
  status: InvoiceStatus
  customer: {
    id: string
    name: string
    phone: string
  }
  car: {
    id: string
    name: string
    number: string
    model: string
    color: string
  }
  products: InvoiceProduct[]
  services: InvoiceService[]
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceFormProduct {
  productId: string
  productName: string
  productPhoto?: string
  quantity: number
  unitPrice: number
  minPrice: number
  unit: string
  unitValue: number
  unitAdjustable: boolean
  originalUnitValue: number
  originalPrice: number
  originalMinPrice: number
}

export interface InvoiceFormService {
  serviceId: string
  serviceName: string
  price: number
  minPrice: number
}

export interface InvoiceFormData {
  customerId: string
  carId: string
  products: { productId: string; quantity: number; unitPrice: number }[]
  services: { serviceId: string; price: number }[]
  finalPrice: number
  notes?: string
}

// -----------------------------------------------------------------------------
// Vehicle Service Events
// -----------------------------------------------------------------------------

export type VehicleServiceEventType =
  | 'OIL_CHANGE'
  | 'REPAIR'
  | 'PARTS_REPLACEMENT'
  | 'INSPECTION'
  | 'GENERAL_SERVICE'
  | 'OTHER'

export interface VehicleServiceEvent {
  id: string
  carId: string
  userId: string | null
  invoiceId: string | null
  type: VehicleServiceEventType
  title: string
  mileage: number | null
  notes: string | null
  createdAt: string
  user?: { id: string; name: string; phone: string } | null
  invoice?: { id: string; invoiceNumber: string } | null
}

export interface CreateVehicleServiceEventData {
  carId: string
  type: VehicleServiceEventType
  title: string
  mileage?: number
  notes?: string
}

// -----------------------------------------------------------------------------
// Vehicle Maintenance (Next Service Engine)
// -----------------------------------------------------------------------------

export type MaintenanceUrgency = 'overdue' | 'due_soon' | 'ok' | 'unknown'
export type MaintenanceFilter = 'overdue' | 'week' | 'month'

export interface VehicleMaintenance {
  id: string
  carId: string
  lastServiceDate: string | null
  lastServiceMileage: number | null
  currentMileage: number | null
  oilIntervalKm: number
  oilIntervalDays: number
  nextServiceDate: string | null
  nextServiceMileage: number | null
  urgency: MaintenanceUrgency
  daysRemaining: number | null
  kmRemaining: number | null
  car?: {
    id: string
    name: string
    number: string
    model: string
    color: string
  }
  customer?: {
    id: string
    name: string
    phone: string
  }
}

export interface UpdateMaintenanceRulesData {
  oilIntervalKm?: number
  oilIntervalDays?: number
  currentMileage?: number
}

// -----------------------------------------------------------------------------
// Notifications
// -----------------------------------------------------------------------------

export type NotificationType =
  | 'MAINTENANCE_OVERDUE'
  | 'MAINTENANCE_DUE_SOON'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  carId: string | null
  readAt: string | null
  createdAt: string
  car?: {
    id: string
    name: string
    number: string
    model: string
    customer?: { id: string; name: string; phone: string }
  }
}

// -----------------------------------------------------------------------------
// Workspace/Settings Types
// -----------------------------------------------------------------------------

export interface WorkspaceSettings {
  id: string
  name: string
  subdomain: string
  logo: string | null
  countryCode: string
  plan: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface CountryConfig {
  prefix: string
  name: string
  nameAr: string
  flag: string
  example: string
}
