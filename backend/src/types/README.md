# Types Directory

This directory contains TypeScript type definitions, validation schemas, and constants for the Digi-Pocket backend application.

## Structure

Each domain has three files:
- `*.types.ts` - TypeScript interfaces and type definitions
- `*.schemas.ts` - Zod validation schemas and input types
- `*.constants.ts` - Constants, enums, and helper functions

Plus a shared constants file:
- `shared.constants.ts` - Shared constants across all domains

## Domains

### 👤 User (`user.*`)
- User management types
- Authentication and authorization
- Activity logging and security alerts
- User sessions and preferences

### 📦 Order (`order.*`)
- Order processing and management
- Product-specific order data (game UID, mobile number)
- Order status transitions and callbacks
- Order statistics and analytics

### 🛍️ Product (`product.*`)
- Product catalog management
- Product types and pricing
- Product availability and analytics
- Role-based pricing logic

### 💰 Wallet (`wallet.*`)
- Wallet and transaction management
- Deposits and withdrawals
- Transaction types and status tracking
- Balance calculations and limits

### 📢 Announcement (`announcement.*`)
- Announcement system (if implemented)
- Content management and scheduling
- Read tracking and analytics
- Notification preferences

## Usage

### Import Types
```typescript
import { User, CreateUserRequest, UserFilters } from '../types';
```

### Import Schemas
```typescript
import { createUserSchema, userFilterSchema } from '../types';
```

### Import Constants
```typescript
import { USER_ROLES, USER_STATUSES, ACTIVITY_TYPES } from '../types';
import { PRODUCT_TYPES, PAGINATION_DEFAULTS } from '../types'; // Shared constants
```

### Import Everything
```typescript
import * from '../types';
```

## Validation Example

```typescript
import { createOrderSchema, CreateOrderInput } from '../types';

export async function createOrder(data: unknown): Promise<Order> {
  // Validate input
  const validatedData: CreateOrderInput = createOrderSchema.parse(data);
  
  // Process order...
  return processOrder(validatedData);
}
```

## Constants Example

```typescript
import { ORDER_STATUSES, canTransitionOrderStatus } from '../types';

if (canTransitionOrderStatus(currentStatus, ORDER_STATUSES.SUCCESS)) {
  // Update order status
}
```

## Benefits

1. **Type Safety** - Comprehensive TypeScript coverage
2. **Validation** - Zod schemas for runtime validation with constants
3. **Consistency** - Standardized patterns and shared constants across domains
4. **Maintainability** - Centralized type definitions and constants
5. **Documentation** - Self-documenting code with clear types
6. **Reusability** - Shared types and constants across services and controllers
7. **DRY Principle** - No duplicate constants or validation rules

## Adding New Domains

When adding a new domain, create three files:

1. `domain.types.ts` - Interfaces and types
2. `domain.schemas.ts` - Zod validation schemas
3. `domain.constants.ts` - Constants and helpers

Then export them in `index.ts`:

```typescript
export * from './domain.types';
export * from './domain.schemas';
export * from './domain.constants';
```

## Best Practices

1. **Naming** - Use clear, descriptive names
2. **Exports** - Export both types and runtime values
3. **Validation** - Always provide Zod schemas for API inputs
4. **Constants** - Use constants instead of magic strings/numbers
5. **Documentation** - Add JSDoc comments for complex types
6. **Consistency** - Follow established patterns across domains