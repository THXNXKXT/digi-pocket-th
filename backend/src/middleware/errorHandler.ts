import type { Context, Next } from 'hono';
import { AppError, isOperationalError } from '../utils/errors';
import { activityService } from '../services/activity.service';

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

// Create standardized error response
const createErrorResponse = (
  error: AppError | Error,
  requestId?: string
): { body: ErrorResponse; status: number } => {
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    return {
      body: {
        success: false,
        error: {
          code: error.errorCode || 'UNKNOWN_ERROR',
          message: error.message,
          details: error.details,
          timestamp,
          requestId,
        },
      },
      status: error.statusCode,
    };
  }

  // Handle non-operational errors
  return {
    body: {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp,
        requestId,
      },
    },
    status: 500,
  };
};

// Log error for monitoring
const logError = async (error: Error, context: Context) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    url: context.req.url,
    method: context.req.method,
    userAgent: context.req.header('user-agent'),
    ip: context.req.header('x-forwarded-for') || context.req.header('x-real-ip'),
    user: context.get('user'),
  };

  // Log to console (in production, you might want to use a proper logging service)
  console.error('Application Error:', errorInfo);

  // Log security-related errors to activity log
  if (error instanceof AppError && error.errorCode) {
    const securityErrorCodes = [
      'AUTH_ERROR',
      'AUTHORIZATION_ERROR',
      'TOKEN_EXPIRED',
      'INVALID_TOKEN',
      'ACCOUNT_LOCKED',
      'ACCOUNT_SUSPENDED',
      'SECURITY_VIOLATION',
      'RATE_LIMIT_EXCEEDED',
      'SUSPICIOUS_ACTIVITY',
    ];

    if (securityErrorCodes.includes(error.errorCode)) {
      await activityService.logActivity({
        userId: context.get('user')?.sub,
        activityType: 'api_access',
        description: `Security error: ${error.message}`,
        ...activityService.extractRequestInfo(context),
        severity: 'high',
        metadata: {
          errorCode: error.errorCode,
          statusCode: error.statusCode,
          url: context.req.url,
          method: context.req.method,
        },
      });
    }
  }
};

// Main error handling middleware
export const errorHandler = async (error: Error, c: Context) => {
  // Generate request ID for tracking
  const requestId = crypto.randomUUID();

  // Log the error
  await logError(error, c);

  // Create error response
  const { body, status } = createErrorResponse(error, requestId);

  // Set security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');

  return c.json(body, status as any);
};

// Async error wrapper for route handlers
export const asyncHandler = (fn: (c: Context, next: Next) => Promise<any>) => {
  return async (c: Context, next: Next) => {
    try {
      return await fn(c, next);
    } catch (error) {
      return errorHandler(error as Error, c);
    }
  };
};

// 404 handler
export const notFoundHandler = (c: Context) => {
  const { body, status } = createErrorResponse(
    new AppError('Resource not found', 404, 'NOT_FOUND')
  );
  return c.json(body, status as any);
};

// Validation error handler
export const handleValidationError = (error: any) => {
  if (error.name === 'ZodError') {
    const errorMessages = error.errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    throw new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      { errors: errorMessages }
    );
  }
  throw error;
};

// Database error handler
export const handleDatabaseError = (error: any) => {
  // Handle common database errors
  if (error.code === '23505') { // Unique constraint violation
    throw new AppError(
      'Resource already exists',
      409,
      'DUPLICATE_RESOURCE',
      { constraint: error.constraint }
    );
  }

  if (error.code === '23503') { // Foreign key constraint violation
    throw new AppError(
      'Referenced resource not found',
      400,
      'FOREIGN_KEY_VIOLATION',
      { constraint: error.constraint }
    );
  }

  if (error.code === '23502') { // Not null constraint violation
    throw new AppError(
      'Required field is missing',
      400,
      'MISSING_REQUIRED_FIELD',
      { column: error.column }
    );
  }

  // Generic database error
  throw new AppError(
    'Database operation failed',
    500,
    'DATABASE_ERROR',
    { originalError: error.message }
  );
};

// Rate limiting error handler
export const handleRateLimitError = (limit: number, windowMs: number) => {
  const windowMinutes = Math.ceil(windowMs / 60000);
  throw new AppError(
    `Too many requests. Limit: ${limit} requests per ${windowMinutes} minutes`,
    429,
    'RATE_LIMIT_EXCEEDED',
    { limit, windowMs }
  );
};