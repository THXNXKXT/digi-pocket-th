// User enums
export type UserRole = 'admin' | 'customer';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending';

// Base user interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewUser {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  status?: UserStatus;
}

// Request/Response types
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserRequest {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  status?: UserStatus;
  role?: UserRole;
  search?: string;
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Activity log types
export interface UserActivityLog {
  id: string;
  userId: string;
  activityType: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface NewUserActivityLog {
  userId: string;
  activityType: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

// Security types
export interface SecurityAlert {
  id: string;
  userId: string;
  alertType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface NewSecurityAlert {
  userId: string;
  alertType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

// User session types
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress: string;
  userAgent: string;
}

export interface NewUserSession {
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
}