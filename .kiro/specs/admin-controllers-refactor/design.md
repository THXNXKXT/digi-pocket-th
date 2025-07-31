# Design Document

## Overview

This design outlines the refactoring of admin controllers to create a clean, maintainable, and consistent architecture. The refactoring will reorganize existing controllers, standardize patterns, and improve code organization while maintaining all existing functionality.

## Architecture

### Current State Analysis

**Problems Identified:**
- Mixed patterns in error handling (some use asyncHandler, others don't)
- Inconsistent validation approaches
- Scattered responsibilities (admin.controller.ts handles both users and products)
- Different response formatting patterns
- Inconsistent import organization
- Mixed middleware usage patterns

### Target Architecture

**Modular Structure:**
```
controllers/admin/
├── index.ts                    # Main admin controller exports
├── base/
│   ├── base.controller.ts      # Base admin controller with common functionality
│   └── types.ts               # Shared types and interfaces
├── users/
│   ├── users.controller.ts     # User management operations
│   └── users.validation.ts     # User-specific validation schemas
├── products/
│   ├── products.controller.ts  # Product management operations
│   └── products.validation.ts  # Product-specific validation schemas
├── orders/
│   ├── orders.controller.ts    # Order management operations
│   └── orders.validation.ts    # Order-specific validation schemas
├── security/
│   ├── security.controller.ts  # Security monitoring operations
│   └── security.validation.ts  # Security-specific validation schemas
└── announcements/
    ├── announcements.controller.ts # Announcement operations
    └── announcements.validation.ts # Announcement validation schemas
```

## Components and Interfaces

### Base Controller

**Purpose:** Provide common functionality and patterns for all admin controllers

**Key Features:**
- Standardized error handling
- Common validation utilities
- Consistent response formatting
- Activity logging helpers
- Request context utilities

```typescript
interface BaseAdminController {
  validateInput<T>(schema: ZodSchema<T>, data: unknown): T;
  formatResponse(message: string, data?: any, status?: number): ResponseFormat;
  logAdminAction(action: string, targetUserId?: string, metadata?: any): Promise<void>;
  handleError(error: unknown, context: string): never;
}
```

### Controller Modules

**Users Controller:**
- User CRUD operations
- Status management
- Role management
- User activity monitoring

**Products Controller:**
- Product CRUD operations
- Price management
- Product analytics

**Orders Controller:**
- Order management
- Status updates
- Order statistics
- Manual callbacks

**Security Controller:**
- Activity monitoring
- Security alerts
- Configuration management
- Account unlocking

**Announcements Controller:**
- Announcement CRUD
- Publishing workflow
- Analytics tracking

### Validation Layer

**Centralized Validation:**
- Module-specific validation schemas
- Shared validation utilities
- Consistent error messages
- Type-safe validation

**Validation Structure:**
```typescript
interface ValidationModule {
  createSchema: ZodSchema;
  updateSchema: ZodSchema;
  filterSchema: ZodSchema;
  paramSchema: ZodSchema;
}
```

## Data Models

### Request/Response Models

**Standard Request Format:**
```typescript
interface AdminRequest<T = any> {
  body?: T;
  params: Record<string, string>;
  query: Record<string, string>;
  user: AuthenticatedUser;
}
```

**Standard Response Format:**
```typescript
interface AdminResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  pagination?: PaginationInfo;
}
```

### Activity Logging Model

```typescript
interface AdminActivity {
  adminId: string;
  action: string;
  targetUserId?: string;
  targetResource?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}
```

## Error Handling

### Standardized Error Handling

**Error Categories:**
1. Validation Errors (400)
2. Authorization Errors (403)
3. Not Found Errors (404)
4. Business Logic Errors (422)
5. Internal Server Errors (500)

**Error Handler Pattern:**
```typescript
const handleControllerError = (error: unknown, context: string) => {
  if (error instanceof ValidationError) {
    return formatErrorResponse(error.message, 400, error.details);
  }
  if (error instanceof AuthorizationError) {
    return formatErrorResponse(error.message, 403);
  }
  // ... other error types
  
  // Log unexpected errors
  logger.error(`Unexpected error in ${context}:`, error);
  return formatErrorResponse('Internal server error', 500);
};
```

## Testing Strategy

### Unit Testing

**Test Coverage:**
- Controller methods
- Validation schemas
- Error handling
- Response formatting
- Activity logging

**Test Structure:**
```typescript
describe('AdminUsersController', () => {
  describe('createUser', () => {
    it('should create user with valid data');
    it('should reject invalid data');
    it('should log admin action');
    it('should handle database errors');
  });
});
```

### Integration Testing

**API Testing:**
- End-to-end request/response flows
- Authentication/authorization
- Database interactions
- Activity logging verification

### Testing Utilities

**Mock Helpers:**
- Mock authenticated admin user
- Mock database responses
- Mock service dependencies
- Test data factories

## Implementation Plan

### Phase 1: Base Infrastructure
1. Create base controller class
2. Implement common utilities
3. Set up validation framework
4. Create response formatters

### Phase 2: Controller Migration
1. Migrate users controller
2. Migrate products controller
3. Migrate orders controller
4. Migrate security controller
5. Migrate announcements controller

### Phase 3: Route Updates
1. Update admin routes
2. Update middleware usage
3. Update imports and exports

### Phase 4: Testing & Validation
1. Add comprehensive tests
2. Validate functionality
3. Performance testing
4. Documentation updates

## Migration Strategy

### Backward Compatibility
- Maintain existing API endpoints
- Preserve response formats
- Keep existing functionality intact
- Gradual migration approach

### Risk Mitigation
- Feature flags for new controllers
- Rollback procedures
- Comprehensive testing
- Staged deployment

## Performance Considerations

### Optimization Areas
- Reduce code duplication
- Improve error handling efficiency
- Optimize validation performance
- Better memory usage patterns

### Monitoring
- Response time tracking
- Error rate monitoring
- Resource usage metrics
- Activity logging performance