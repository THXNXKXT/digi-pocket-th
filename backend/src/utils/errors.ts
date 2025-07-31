// Custom error classes for better error handling

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode?: string,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication related errors
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 401, 'AUTH_ERROR', details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
  }
}

export class TokenExpiredError extends AppError {
  constructor(message: string = 'Token has expired', details?: any) {
    super(message, 401, 'TOKEN_EXPIRED', details);
  }
}

export class InvalidTokenError extends AppError {
  constructor(message: string = 'Invalid token', details?: any) {
    super(message, 401, 'INVALID_TOKEN', details);
  }
}

// User related errors
export class UserNotFoundError extends AppError {
  constructor(message: string = 'User not found', details?: any) {
    super(message, 404, 'USER_NOT_FOUND', details);
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(message: string = 'User already exists', details?: any) {
    super(message, 409, 'USER_EXISTS', details);
  }
}

export class AccountLockedError extends AppError {
  constructor(message: string = 'Account is locked', details?: any) {
    super(message, 423, 'ACCOUNT_LOCKED', details);
  }
}

export class AccountSuspendedError extends AppError {
  constructor(message: string = 'Account is suspended', details?: any) {
    super(message, 403, 'ACCOUNT_SUSPENDED', details);
  }
}

// Validation errors
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = 'Invalid credentials', details?: any) {
    super(message, 401, 'INVALID_CREDENTIALS', details);
  }
}

// Security related errors
export class SecurityViolationError extends AppError {
  constructor(message: string = 'Security violation detected', details?: any) {
    super(message, 403, 'SECURITY_VIOLATION', details);
  }
}

export class RateLimitExceededError extends AppError {
  constructor(message: string = 'Rate limit exceeded', details?: any) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
  }
}

export class SuspiciousActivityError extends AppError {
  constructor(message: string = 'Suspicious activity detected', details?: any) {
    super(message, 403, 'SUSPICIOUS_ACTIVITY', details);
  }
}

// Database related errors
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, 'DATABASE_ERROR', details, false);
  }
}

// Helper function to check if error is operational
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};