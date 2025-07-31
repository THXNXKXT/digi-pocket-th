import { z } from 'zod';

// Product enums
export type ProductType = 'app-premium' | 'preorder' | 'game' | 'mobile' | 'cashcard';
export type ProductStatus = 'active' | 'inactive';

// Base product interfaces
export interface Product {
  id: string;
  name: string;
  description?: string;
  type: ProductType;
  status: ProductStatus;
  price: string;
  upstreamId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewProduct {
  name: string;
  description?: string;
  type: ProductType;
  status?: ProductStatus;
  price: string;
  upstreamId: string;
}

// Product pricing
export interface ProductPrice {
  id: string;
  productId: string;
  price: string;
  recommended?: string;
  agentPrice?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewProductPrice {
  productId: string;
  price: string;
  recommended?: string;
  agentPrice?: string;
}

// Request/Response types
export interface CreateProductRequest {
  name: string;
  description?: string;
  type: ProductType;
  status?: ProductStatus;
  price: number;
  upstreamId: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  type?: ProductType;
  status?: ProductStatus;
  price?: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  type?: ProductType;
  status?: ProductStatus;
  search?: string;
}

export interface PaginatedProducts {
  products: ProductWithPricing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductWithPricing extends Product {
  pricing?: ProductPrice;
  effectivePrice?: number; // Price based on user role
}

// Product analytics
export interface ProductAnalytics {
  productId: string;
  totalOrders: number;
  successfulOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  popularityRank: number;
  lastOrderDate?: Date;
}

export interface ProductStatsFilters {
  days?: number;
  type?: ProductType;
}

// Product pricing by user role
export interface ProductPricing {
  customer: number;
  admin: number;
  recommended?: number;
}

// Product availability
export interface ProductAvailability {
  productId: string;
  isAvailable: boolean;
  reason?: string;
  estimatedRestockDate?: Date;
}