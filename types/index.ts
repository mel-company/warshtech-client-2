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

export type ResourceType =
  | 'customers'
  | 'products'
  | 'services'
  | 'employees'
  | 'users'
  | 'reports'

export type PermissionLevel = 'none' | 'read' | 'write'

export interface Permission {
  resource: ResourceType
  level: PermissionLevel
}

export interface Role {
  id: string
  name: string
  permissions: Permission[]
}

export type UserPosition = 'admin' | 'manager' | 'cashier' | 'viewer'

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
