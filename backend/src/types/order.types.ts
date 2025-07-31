import { z } from 'zod';

// Order enums
export type OrderStatus = 'pending' | 'success' | 'failed' | 'refunded';

// Base order interfaces
export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: string;
  amount: string;
  status: OrderStatus;
  upstreamId: string;
  code?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewOrder {
  userId: string;
  productId: string;
  quantity: string;
  amount: string;
  status: OrderStatus;
  upstreamId: string;
  code?: string;
}

// Request/Response types
export interface CreateOrderRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  uid?: string;
  number?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  reason?: string;
}

export interface OrderCallbackRequest {
  status: 'success' | 'failed';
  code?: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  userId?: string;
  productId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface AdminOrderFilters extends OrderFilters {
  // Admin can see all orders with additional filters
}

export interface PaginatedOrders {
  orders: OrderWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderWithDetails extends Order {
  userEmail?: string;
  username?: string;
  userStatus?: string;
  productName?: string;
  productType?: string;
  productPrice?: string;
}

// Order statistics
export interface OrderStatistics {
  period: string;
  statusBreakdown: {
    status: OrderStatus;
    count: number;
  }[];
  revenue: {
    total: number;
    orderCount: number;
  };
  topProducts: {
    productId: string;
    productName: string;
    orderCount: number;
    totalRevenue: number;
  }[];
}

export interface OrderStatsFilters {
  days?: number;
}

// Product-specific order data
export interface GameOrderData {
  uid: string;
}

export interface MobileOrderData {
  number: string;
}

export interface OrderProcessingData {
  userId: string;
  productId: string;
  quantity: number;
  total: number;
  reference: string;
  uid?: string;
  phone?: string;
}