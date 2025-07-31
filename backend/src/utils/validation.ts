import { z } from 'zod';
import { ValidationError } from './errors';

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Email validation schema
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(100, 'Email must not exceed 100 characters')
  .toLowerCase();

// Username validation schema
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(50, 'Username must not exceed 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .toLowerCase();

// User registration schema
export const userRegistrationSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// User login schema
export const userLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// User update schema
export const userUpdateSchema = z.object({
  email: emailSchema.optional(),
  role: z.enum(['admin', 'customer']).optional(),
  status: z.enum(['active', 'suspended', 'banned', 'pending']).optional(),
});

// Password change schema
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

// Password reset schema
export const passwordResetSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Admin user creation schema
export const adminUserCreationSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['admin', 'customer']).default('customer'),
  status: z.enum(['active', 'suspended', 'banned', 'pending']).default('active'),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// User search schema
export const userSearchSchema = z.object({
  q: z.string().optional(),
  role: z.enum(['admin', 'customer']).optional(),
  status: z.enum(['active', 'suspended', 'banned', 'pending']).optional(),
  ...paginationSchema.shape,
});

// Activity log filter schema
export const activityLogFilterSchema = z.object({
  userId: z.string().uuid().optional(),
  activityType: z.enum([
    'login',
    'logout',
    'register',
    'password_change',
    'password_reset',
    'profile_update',
    'role_change',
    'status_change',
    'failed_login',
    'account_locked',
    'account_unlocked',
    'suspicious_activity',
    'api_access',
    'data_export',
    'admin_action'
  ]).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  ...paginationSchema.shape,
});

// Security alert filter schema
export const securityAlertFilterSchema = z.object({
  alertType: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  resolved: z.coerce.boolean().optional(),
  ...paginationSchema.shape,
});

// Validation helper functions
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new ValidationError('Validation failed', {
        errors: errorMessages,
        details: error.errors,
      });
    }
    throw error;
  }
};

// Sanitization functions
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizeUsername = (username: string): string => {
  return username.toLowerCase().trim();
};

// Rate limiting validation
export const rateLimitSchema = z.object({
  identifier: z.string().min(1),
  action: z.string().min(1),
  windowMs: z.number().int().min(1000).default(900000), // 15 minutes
  maxRequests: z.number().int().min(1).default(100),
});

// IP address validation
export const ipAddressSchema = z.string().ip();

// User agent validation
export const userAgentSchema = z.string().max(500);

// Metadata validation for activity logs
export const activityMetadataSchema = z.record(z.any()).optional();

// Location validation
export const locationSchema = z.object({
  country: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
}).optional();

// Order validation schemas
export const createOrderSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  uid: z.string().min(1).optional(), // สำหรับ game products
  number: z.string().regex(/^[0-9]{9,10}$/, 'Phone number must be 9-10 digits').optional(), // สำหรับ mobile products
});

export const orderFilterSchema = z.object({
  status: z.enum(['pending', 'success', 'failed', 'refunded']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  ...paginationSchema.shape,
});

export const orderCallbackSchema = z.object({
  upstreamId: z.string().min(1, 'Upstream ID is required'),
  status: z.enum(['success', 'failed'], {
    errorMap: () => ({ message: 'Status must be either success or failed' })
  }),
});

export const preorderCallbackSchema = z.object({
  reference: z.string().min(1, 'Reference is required'),
  status: z.enum(['success', 'failed'], {
    errorMap: () => ({ message: 'Status must be either success or failed' })
  }),
  prize: z.string().optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'success', 'failed', 'refunded']),
  reason: z.string().optional(),
});