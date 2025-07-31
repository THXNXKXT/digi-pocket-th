import { z } from 'zod';
import { USER_STATUSES, USER_ROLES, ACTIVITY_SEVERITY, USER_VALIDATION, USER_PAGINATION } from './user.constants';

// User validation schemas
export const userStatusSchema = z.enum([
  USER_STATUSES.ACTIVE,
  USER_STATUSES.SUSPENDED,
  USER_STATUSES.BANNED,
  USER_STATUSES.PENDING,
] as const);

export const userRoleSchema = z.enum([
  USER_ROLES.ADMIN,
  USER_ROLES.CUSTOMER,
] as const);

export const createUserSchema = z.object({
  username: z.string()
    .min(USER_VALIDATION.USERNAME_MIN_LENGTH, `Username must be at least ${USER_VALIDATION.USERNAME_MIN_LENGTH} characters`)
    .max(USER_VALIDATION.USERNAME_MAX_LENGTH, `Username must be less than ${USER_VALIDATION.USERNAME_MAX_LENGTH} characters`),
  email: z.string()
    .email('Invalid email format')
    .max(USER_VALIDATION.EMAIL_MAX_LENGTH, 'Email too long'),
  password: z.string()
    .min(USER_VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${USER_VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .max(USER_VALIDATION.PASSWORD_MAX_LENGTH, 'Password too long'),
  role: userRoleSchema.optional().default(USER_ROLES.CUSTOMER),
  status: userStatusSchema.optional().default(USER_STATUSES.ACTIVE),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
});

export const updateUserStatusSchema = z.object({
  status: userStatusSchema
});

export const userFilterSchema = z.object({
  page: z.coerce.number().min(1).default(USER_PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(USER_PAGINATION.MAX_LIMIT).default(USER_PAGINATION.DEFAULT_LIMIT),
  status: userStatusSchema.optional(),
  role: userRoleSchema.optional(),
  search: z.string().optional(),
});

export const userParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format')
});

// Severity schema for reuse
const severitySchema = z.enum([
  ACTIVITY_SEVERITY.LOW,
  ACTIVITY_SEVERITY.MEDIUM,
  ACTIVITY_SEVERITY.HIGH,
  ACTIVITY_SEVERITY.CRITICAL,
] as const);

// Activity log schemas
export const activityLogFilterSchema = z.object({
  page: z.coerce.number().min(1).default(USER_PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(USER_PAGINATION.MAX_LIMIT).default(USER_PAGINATION.DEFAULT_LIMIT),
  userId: z.string().uuid().optional(),
  activityType: z.string().optional(),
  severity: severitySchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const createActivityLogSchema = z.object({
  userId: z.string().uuid(),
  activityType: z.string().min(1),
  description: z.string().min(1),
  ipAddress: z.string().ip(),
  userAgent: z.string().min(1),
  severity: severitySchema,
  metadata: z.record(z.any()).optional(),
});

// Security alert schemas
export const securityAlertFilterSchema = z.object({
  page: z.coerce.number().min(1).default(USER_PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(USER_PAGINATION.MAX_LIMIT).default(USER_PAGINATION.DEFAULT_LIMIT),
  resolved: z.coerce.boolean().optional(),
  severity: severitySchema.optional(),
  userId: z.string().uuid().optional(),
});

export const createSecurityAlertSchema = z.object({
  userId: z.string().uuid(),
  alertType: z.string().min(1),
  description: z.string().min(1),
  severity: severitySchema,
  metadata: z.record(z.any()).optional(),
});

export const resolveSecurityAlertSchema = z.object({
  resolvedBy: z.string().uuid(),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
export type UserParamInput = z.infer<typeof userParamSchema>;
export type ActivityLogFilterInput = z.infer<typeof activityLogFilterSchema>;
export type CreateActivityLogInput = z.infer<typeof createActivityLogSchema>;
export type SecurityAlertFilterInput = z.infer<typeof securityAlertFilterSchema>;
export type CreateSecurityAlertInput = z.infer<typeof createSecurityAlertSchema>;
export type ResolveSecurityAlertInput = z.infer<typeof resolveSecurityAlertSchema>;