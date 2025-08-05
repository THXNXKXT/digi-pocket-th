# Game Products Feature

## Overview

Frontend implementation for `/products/game` with complete game top-up functionality including product listing, detail pages, and order creation.

## Features Implemented

### 1. **Game Categories Page** (`/products/game`)
- **Modified UI**: Changed "ดูสินค้าทั้งหมด" button text to "เติมเกม"
- **Hidden Prices**: Removed price display from main product listing
- **Category Grid**: Shows game categories with product counts
- **Responsive Design**: Mobile-friendly grid layout

### 2. **Game Category Products** (`/products/game/[category]`)
- **Product Grid**: Shows all games in selected category
- **Hidden Prices**: No price display on listing page
- **Direct Navigation**: Click to go to game detail page
- **"เติมเกม" Buttons**: Updated button text throughout

### 3. **Game Detail Page** (`/products/game/[category]/[productId]`)
- **Game Header**: Game title and image prominently displayed
- **UID Input**: Required field for Player UID/Game ID with validation
- **Price Selection**: Sortable price options (lowest to highest)
- **Order Creation**: Complete order flow with proper data structure

## Page Structure

```
/products/game/
├── page.tsx                    # Game categories overview
├── [category]/
│   ├── page.tsx               # Products in category
│   └── [productId]/
│       └── page.tsx           # Game detail & order page
```

## Key Components

### Game Detail Page Features

#### **1. Product Header**
```tsx
- Game title as main header
- Game image/icon display
- Product info/description (HTML support)
```

#### **2. UID Input Section**
```tsx
- Required UID/Game ID field
- Real-time validation
- Error message display
- Mobile-friendly input
```

#### **3. Price Options**
```tsx
- Multiple price tiers (main, recommended, VIP, agent)
- Sorted lowest to highest
- Selectable cards with visual feedback
- Recommended option highlighting
- Discount display
```

#### **4. Order Submission**
```tsx
- Validation before submission
- Loading states
- Error handling
- Success navigation
```

## Order Data Structure

When user submits an order, the following data structure is created:

```json
{
  "productId": "e2f59b37-597e-4948-8af9-2c5d71a2ecb0",
  "quantity": 1,
  "unitPrice": 1164,
  "uid": "123456789"
}
```

## API Integration

### **Order Service** (`/services/order.service.ts`)
- `createOrder()` - Create new game top-up order
- `getUserOrders()` - Fetch user's order history
- `getOrderById()` - Get specific order details
- `cancelOrder()` - Cancel pending order

### **Product Service** (existing)
- `useProductsByCategory('game')` - Fetch game products
- Integrated with existing product hooks

## UI/UX Features

### **Mobile-First Design**
- Touch-friendly buttons (min 44px)
- Responsive grid layouts
- Mobile-optimized spacing
- Safe area support

### **Validation & Error Handling**
- UID field validation (min 3 characters)
- Real-time error feedback
- API error handling
- Loading states

### **Visual Feedback**
- Selected price option highlighting
- Hover effects on cards
- Loading spinners
- Success/error messages

## CSS Classes Added

```css
.price-option-card {
  @apply transition-all duration-200 border-2 cursor-pointer;
}

.price-option-card.selected {
  @apply border-primary-500 bg-primary-50 shadow-md;
}

.price-option-card.recommended {
  @apply ring-2 ring-primary-200;
}
```

## Navigation Flow

```
1. /products/game
   ↓ Click category
2. /products/game/[category]
   ↓ Click "เติมเกม" or product
3. /products/game/[category]/[productId]
   ↓ Fill UID + Select price + Submit
4. /orders/[orderId] (success)
   OR error message (failure)
```

## Price Option Logic

The system automatically generates price options from product data:

1. **Main Price** (from `product.price`) - Marked as recommended
2. **Recommended Price** (from `product.recommendedPrice`) - If different from main
3. **VIP Price** (from `product.priceVip`) - Special pricing tier
4. **Agent Price** (from `product.agentPrice`) - Wholesale pricing

All options are sorted by price (lowest to highest) for better UX.

## Error Handling

### **Validation Errors**
- Empty UID field
- UID too short (< 3 characters)
- No price option selected

### **API Errors**
- Network connectivity issues
- Server errors (500, 502, etc.)
- Authentication failures (401)
- Rate limiting (429)

### **User Feedback**
- Inline validation messages
- Error banners for API failures
- Loading states during submission
- Success navigation on completion

## Testing Checklist

- [ ] Game categories load correctly
- [ ] Category products display without prices
- [ ] Game detail page shows all price options
- [ ] UID validation works properly
- [ ] Price selection updates UI
- [ ] Order submission creates correct data structure
- [ ] Error handling displays appropriate messages
- [ ] Mobile responsive design works
- [ ] Navigation between pages functions
- [ ] Loading states appear during API calls

## Future Enhancements

1. **Order History Integration**
2. **Favorite Games Feature**
3. **Price Comparison Tools**
4. **Game-specific UID Validation**
5. **Bulk Order Support**
6. **Payment Integration**
7. **Order Status Tracking**
8. **Push Notifications**
