// User Types
export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'customer'
  status: 'active' | 'suspended' | 'banned' | 'pending'
  createdAt: string
  updatedAt: string
}

// Product Types
export interface Product {
  id: string
  upstream_id: string
  type: 'app-premium' | 'preorder' | 'game' | 'mobile' | 'cashcard'
  category: string
  name: string
  img: string
  description: string
  price: string
  priceVip?: string
  agentPrice?: string
  discount?: string
  stock: number
  updated_at: string

  // App Premium specific fields
  type_app?: string        // ประเภทแอป (สำหรับ app-premium)
  des?: string            // รายละเอียดสินค้า (สำหรับ app-premium)

  // Other product type specific fields
  recommendedPrice?: string // ราคาแนะนำ (สำหรับ game, mobile, cashcard)
  info?: string            // ข้อมูลสินค้า (สำหรับ game, mobile, cashcard)
}

// Order Types
export interface Order {
  id: string
  userId: string
  productId: string
  quantity: number
  unitPrice: string
  amount: string
  status: 'pending' | 'success' | 'failed' | 'refunded'
  code?: string
  uid?: string
  createdAt: string
  updatedAt: string
  product?: Product
}

export interface CreateOrderRequest {
  productId: string
  quantity: number
  unitPrice: number
  uid?: string // Required for game products
}

export interface OrderListParams {
  page?: number
  limit?: number
  status?: Order['status']
}

// Wallet Types
export interface WalletBalance {
  balance: string
}

export interface WalletTransaction {
  id: string
  userId: string
  type: 'deposit' | 'withdraw' | 'order_payment' | 'order_refund'
  amount: string
  description: string
  createdAt: string
}

export interface DepositRequest {
  amount: number
}

// Slip Deposit Types
export interface StoreAccount {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
  isActive: boolean
}

export interface DepositRequestData {
  id: string
  amount: string
  status: 'pending' | 'approved' | 'rejected'
  storeAccountId: string
  createdAt: string
  storeAccount?: StoreAccount
}

export interface CreateDepositRequest {
  amount: number
  storeAccountId: string
}

// Announcement Types
export interface Announcement {
  id: string
  title: string
  content: string
  type: 'general' | 'promotion' | 'maintenance' | 'security' | 'product-update'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  isSticky: boolean
  publishAt: string
  expiresAt?: string
  createdAt: string
}

export interface AnnouncementListParams {
  page?: number
  limit?: number
  priority?: Announcement['priority']
  type?: Announcement['type']
}

// Authentication Types
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  sessionToken: string
  user: User
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

// Pagination Types
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

// User Tracking Types
export interface DeviceInfo {
  id: string
  deviceId: string
  userAgent: string
  ipAddress: string
  location?: string
  lastSeen: string
  isActive: boolean
}

export interface LocationHistory {
  id: string
  ipAddress: string
  location: string
  country: string
  city: string
  timestamp: string
}

export interface LoginPattern {
  hour: number
  count: number
  dayOfWeek: number
}

export interface SecuritySummary {
  totalLogins: number
  uniqueDevices: number
  uniqueLocations: number
  suspiciousActivities: number
  lastLogin: string
  accountAge: number
}

// Admin Types (for future admin dashboard)
export interface AdminUser extends User {
  permissions: string[]
  lastLogin?: string
}

export interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: string
  pendingDeposits: number
}

// Error Types
export interface ValidationError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: ValidationError[] | any
  timestamp: string
}
