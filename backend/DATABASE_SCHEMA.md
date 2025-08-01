# Database Schema Documentation

## Overview

The database schema is organized into domain-specific modules for better maintainability and separation of concerns.

## Schema Structure

```
backend/src/db/schemas/
├── index.ts          # Main export file
├── base.ts           # Core user management
├── wallet.ts         # Wallet and transactions
├── product.ts        # Product catalog
├── order.ts          # Order management
├── announcement.ts   # Announcement system
└── notification.ts   # Notification system
```

## Domain Modules

### 1. Base (`base.ts`)

**Core user management system**

- `users` - User accounts with roles and status
- `roleEnum` - User roles (admin, customer)
- `statusEnum` - User status (active, suspended, banned, pending)

### 2. Wallet (`wallet.ts`)

**Digital wallet system**

- `wallets` - User wallet balances
- `walletTransactions` - Transaction history
- `txnTypeEnum` - Transaction types (deposit, withdraw)

### 3. Product (`product.ts`)

**Product catalog management**

- `products` - Product information
- `productPrices` - Dynamic pricing and stock
- `productTypeEnum` - Product categories (app-premium, game, mobile, etc.)

### 4. Order (`order.ts`)

**Order processing system**

- `orders` - Purchase orders
- `orderStatusEnum` - Order status (pending, success, failed, refunded)

### 5. Announcement (`announcement.ts`)

**Announcement/News system**

- `announcements` - Announcement content
- `announcementReads` - Read tracking
- `announcementTypeEnum` - Announcement types (general, promotion, maintenance, etc.)
- `announcementPriorityEnum` - Priority levels (low, normal, high, urgent)
- `announcementStatusEnum` - Status (draft, published, archived, deleted)

### 6. Notification (`notification.ts`)

**Push notification system**

- `notifications` - Notification records
- `userNotificationPreferences` - User notification settings
- `notificationStatusEnum` - Delivery status (pending, sent, failed, delivered)

## Key Relationships

```
users (1) ←→ (1) wallets
users (1) ←→ (*) walletTransactions
users (1) ←→ (*) orders
users (1) ←→ (*) announcements (as creator)
users (1) ←→ (*) announcementReads
users (1) ←→ (*) notifications
users (1) ←→ (1) userNotificationPreferences

products (1) ←→ (*) productPrices
announcements (1) ←→ (*) announcementReads
announcements (1) ←→ (*) notifications
wallets (1) ←→ (*) walletTransactions
```

## Benefits of This Structure

1. **Separation of Concerns** - Each domain has its own file
2. **Better Maintainability** - Easier to find and modify specific schemas
3. **Reduced Coupling** - Clear dependencies between domains
4. **Type Safety** - Each module exports its own types
5. **Scalability** - Easy to add new domains without affecting existing ones

## Usage

Import schemas from the main index file:

```typescript
import { users, announcements, products } from "../db/schemas";
```

Or import from specific domain files:

```typescript
import { announcements, announcementReads } from "../db/schemas/announcement";
```
