# 🏪 Digi-Pocket Thailand

**A comprehensive digital marketplace API for Thailand's e-commerce ecosystem**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![Hono](https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)

## 🌟 Overview

Digi-Pocket Thailand is a robust, scalable digital marketplace API designed specifically for the Thai e-commerce market. Built with modern technologies and security-first principles, it provides a comprehensive platform for digital product sales, user management, and financial transactions.

### **🚀 Tech Stack**

**Runtime & Framework**
- **[Bun](https://bun.sh/)** - Ultra-fast JavaScript runtime and package manager
- **[Hono](https://hono.dev/)** - Lightweight, fast web framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development

**Database & Caching**
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database with ACID compliance
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database operations
- **[Redis](https://redis.io/)** - High-performance caching and session storage

**Security & Validation**
- **[Zod](https://zod.dev/)** - Runtime type validation and parsing
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Password hashing
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** - JWT authentication

**DevOps & Deployment**
- **[Docker](https://www.docker.com/)** - Containerization
- **[Docker Compose](https://docs.docker.com/compose/)** - Multi-container orchestration

### **🔥 Key Features**

🔐 **Enterprise-Grade Security**
- JWT-based authentication with session management
- Role-based access control (RBAC) with granular permissions
- Advanced security monitoring and threat detection
- Account lockout protection and intelligent rate limiting
- Comprehensive audit logging and activity tracking
- Device fingerprinting and suspicious activity detection

💰 **Advanced Digital Wallet System**
- Real-time balance management with atomic transactions
- Secure transaction processing with double-entry bookkeeping
- Slip-based deposit verification system with image processing
- Multi-bank account support for seamless deposits
- Transaction history with detailed analytics
- Automated reconciliation and fraud detection

🛒 **Comprehensive E-commerce Platform**
- Multi-category product catalog (Apps, Games, Mobile Top-ups, Cash Cards)
- Dynamic pricing engine with real-time inventory management
- Order processing with upstream service integration (Peamsub API)
- Automated fulfillment workflows with callback handling
- Comprehensive order tracking and status management
- Product synchronization with external providers

👥 **Advanced User Management**
- Multi-role user system (Customer, Admin, Super Admin)
- Comprehensive profile management and user preferences
- Device and location tracking with geolocation
- Real-time activity monitoring and behavioral analytics
- Intelligent notification system with preferences
- User session management across multiple devices

📊 **Powerful Admin Dashboard**
- Real-time analytics and business intelligence
- User lifecycle and order management
- Security monitoring with alert system
- Financial transaction oversight and reporting
- System configuration and feature toggles
- Comprehensive audit trails and compliance reporting

📢 **Communication System**
- System-wide announcement management
- User notification preferences and delivery
- Real-time alerts and status updates
- Multi-channel notification support

## 🚀 Quick Start

### **Prerequisites**
- [Bun](https://bun.sh/) >= 1.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 14
- [Redis](https://redis.io/) >= 6.0
- [Docker](https://www.docker.com/) (optional)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/THXNXKXT/digi-pocket-th.git
cd digi-pocket-th
```

2. **Install dependencies**
```bash
cd backend
bun install
```

3. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database Setup**
```bash
# Start PostgreSQL and Redis (using Docker)
docker-compose up -d postgres redis

# Run database migrations
bun run db:push

# Seed initial data (optional)
bun run db:seed
```

5. **Start Development Server**
```bash
bun run dev
```

The API will be available at `http://localhost:3031`

### **Docker Setup**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## 📚 API Documentation

### **Interactive Documentation**
- **Swagger UI**: `http://localhost:3031/swagger`
- **OpenAPI JSON**: `http://localhost:3031/doc`
- **Health Check**: `http://localhost:3031/`

### **Complete API Endpoints (74+ endpoints)**

#### **🌐 System Routes**
```http
GET  /                    # API status check
GET  /doc                 # OpenAPI JSON documentation
GET  /swagger             # Swagger UI interface
```

#### **🔐 Authentication (3 endpoints)**
```http
POST /auth/register       # User registration
POST /auth/login          # User login
POST /auth/logout         # User logout (Auth Required)
```

#### **📦 Products (5 endpoints)**
```http
GET /products/app-premium # List app premium products
GET /products/preorder    # List preorder products
GET /products/game        # List game products
GET /products/mobile      # List mobile products
GET /products/cashcard    # List cash card products
```

#### **🛒 Orders (7 endpoints)**
```http
# Customer Orders (Auth Required)
POST   /orders                  # Create new order
GET    /orders                  # Get user's orders (with pagination)
GET    /orders/price/:productId # Get product price
GET    /orders/:id              # Get specific order details
PATCH  /orders/:id/cancel       # Cancel order

# Public Webhooks (No Auth)
POST /orders/callback           # Peamsub payment callback
POST /orders/preorder-callback  # Preorder payment callback
```

#### **💰 Wallet System (11 endpoints)**
```http
# Basic Wallet (Auth Required)
GET  /wallet/balance      # Get wallet balance
GET  /wallet/transactions # List wallet transactions
POST /wallet/deposit      # Basic deposit (legacy)
POST /wallet/withdraw     # Withdraw funds

# Slip Deposit System (Auth Required)
GET    /wallet/deposit/accounts                    # Get available store accounts
POST   /wallet/deposit/request                     # Create deposit request
POST   /wallet/deposit/request/:requestId/slip     # Upload slip image
GET    /wallet/deposit/request/:requestId/status   # Check deposit status
GET    /wallet/deposit/requests                    # Get pending requests
GET    /wallet/deposit/request/:requestId          # Resume specific request
DELETE /wallet/deposit/request/:requestId          # Cancel request
```

#### **📢 Announcements (6 endpoints)**
```http
# Public Routes (Optional Auth)
GET /announcements        # List published announcements
GET /announcements/:id    # Get specific announcement

# Authenticated Routes
GET /announcements/unread-count                    # Get unread count
GET /announcements/notifications/preferences       # Get notification preferences
PUT /announcements/notifications/preferences       # Update notification preferences
GET /announcements/notifications                   # Get user notifications
```

#### **👤 User Tracking (4 endpoints)**
```http
# All require authentication
GET /user/tracking/devices          # Get user's device history
GET /user/tracking/locations        # Get user's IP/location history
GET /user/tracking/patterns         # Get user's login patterns
GET /user/tracking/security-summary # Get security summary
```

### **👨‍💼 Admin Routes (35+ endpoints)**
**Authentication:** Required (Admin Role)

#### **User Management (6 endpoints)**
```http
GET    /admin/users           # List all users
POST   /admin/users           # Create new user
GET    /admin/users/:id       # Get specific user
PATCH  /admin/users/:id       # Update user
DELETE /admin/users/:id       # Delete user
```

#### **Product Management (2 endpoints)**
```http
PATCH  /admin/products/:id    # Update product
DELETE /admin/products/:id    # Delete product
```

#### **Order Management (5 endpoints)**
```http
GET   /admin/orders              # List all orders (with filters)
GET   /admin/orders/statistics   # Get order statistics
GET   /admin/orders/:id          # Get order details
PATCH /admin/orders/:id/status   # Update order status
POST  /admin/orders/:id/callback # Trigger order callback
```

#### **Announcement Management (8 endpoints)**
```http
GET    /admin/announcements           # List all announcements
POST   /admin/announcements           # Create announcement
GET    /admin/announcements/:id       # Get announcement details
PATCH  /admin/announcements/:id       # Update announcement
DELETE /admin/announcements/:id       # Delete announcement
POST   /admin/announcements/:id/publish # Publish announcement
POST   /admin/announcements/:id/archive # Archive announcement
GET    /admin/announcements/analytics # Get announcement analytics
```

#### **Security Monitoring (9 endpoints)**
```http
GET  /admin/security/stats              # Get security statistics
GET  /admin/security/events             # Get security events
GET  /admin/security/alerts             # Get security alerts
POST /admin/security/alerts/:alertId/resolve # Resolve security alert
GET  /admin/security/activity           # Get all activity logs
POST /admin/security/unlock/:userId     # Unlock user account
GET  /admin/security/users/:userId/logs # Get user activity logs
```

#### **Deposit Management (12 endpoints)**
```http
# Store Account Management
GET    /admin/deposits/store-accounts                    # List store accounts
GET    /admin/deposits/store-accounts/:id                # Get store account
POST   /admin/deposits/store-accounts                    # Create store account
PUT    /admin/deposits/store-accounts/:id                # Update store account
PATCH  /admin/deposits/store-accounts/:id/toggle-status  # Toggle account status
DELETE /admin/deposits/store-accounts/:id                # Delete store account

# Deposit Request Management
GET  /admin/deposits/requests              # List deposit requests (with filters)
GET  /admin/deposits/requests/:id          # Get deposit request details
POST /admin/deposits/requests/:id/approve  # Approve deposit request
POST /admin/deposits/requests/:id/reject   # Reject deposit request
GET  /admin/deposits/statistics            # Get deposit statistics
```

## 🛡️ Security Architecture

### **Authentication & Authorization**
- **JWT Tokens**: Secure token-based authentication with refresh rotation
- **Session Management**: Redis-backed session storage with TTL
- **Role-Based Access Control**: Granular permission system
- **Account Lockout**: Protection against brute force attacks
- **Device Fingerprinting**: Advanced device identification

### **Input Validation & Sanitization**
- **Zod Validation**: Runtime type checking and validation
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: Intelligent request throttling and abuse prevention

### **Security Monitoring**
- **Activity Logging**: Comprehensive user activity tracking
- **Threat Detection**: Real-time suspicious activity monitoring
- **Security Alerts**: Automated alert system for security events
- **Audit Trails**: Complete forensic logging for compliance
- **IP Analysis**: Geolocation and reputation checking

## 📊 Database Schema

### **Core Tables**
```sql
-- User Management
users                    # User accounts and authentication
user_sessions           # Active session management
user_activity_logs      # Comprehensive activity tracking
security_alerts         # Security monitoring and alerts

-- E-commerce
products               # Product catalog and metadata
product_prices         # Dynamic pricing and inventory
orders                 # Order processing and fulfillment

-- Financial
wallets               # User wallet balances
wallet_transactions   # Transaction history
deposit_requests      # Slip-based deposit system
store_bank_accounts   # Multi-bank account support
slip_records          # Deposit slip verification

-- Communication
announcements         # System announcements
announcement_reads    # Read status tracking
notifications         # User notifications
user_notification_preferences # Notification settings
```

## 🧪 Testing

### **Comprehensive Test Suite**
- **54+ Security Functions** tested and validated
- **Authentication System** with complete coverage
- **Device Tracking** and fingerprinting tests
- **E-commerce Workflows** end-to-end testing
- **Performance Testing** with load simulation

### **Running Tests**
```bash
# Run all tests
bun run test:all

# Specific test suites
bun run test:auth      # Authentication tests
bun run test:security  # Security tests
bun run test:device    # Device tracking tests
bun run test:ecommerce # E-commerce tests
bun run test:performance # Performance tests

# Watch mode
bun run test:watch

# Coverage report
bun run test:coverage
```

## 🚀 Deployment

### **Production Setup**
```bash
# Build for production
bun run build

# Start production server
bun run start

# Using Docker
docker-compose -f docker-compose.prod.yml up -d
```

### **Environment Variables**
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/digi_pocket
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# API
PORT=3031
NODE_ENV=production

# External Services
PEAMSUB_API_URL=https://api.peamsub.com
PEAMSUB_API_KEY=your-api-key
PEAMSUB_USERNAME=your-username
PEAMSUB_PASSWORD=your-password
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts              # Main application entry
│   ├── controllers/        # Request handlers
│   │   ├── admin/          # Admin-specific controllers
│   │   ├── auth.controller.ts
│   │   ├── order.controller.ts
│   │   ├── wallet.controller.ts
│   │   └── ...
│   ├── services/           # Business logic
│   │   ├── auth.service.ts
│   │   ├── security.service.ts
│   │   ├── wallet.service.ts
│   │   └── ...
│   ├── middleware/         # Custom middleware
│   │   ├── auth.ts
│   │   ├── admin.ts
│   │   ├── errorHandler.ts
│   │   └── ...
│   ├── routes/             # API routes
│   │   ├── admin.route.ts
│   │   ├── auth.route.ts
│   │   ├── order.route.ts
│   │   └── ...
│   ├── db/                 # Database layer
│   │   ├── schemas/        # Drizzle schemas
│   │   ├── migrations/     # Database migrations
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── security.utils.ts
│   │   ├── validation.ts
│   │   └── ...
│   ├── types/              # TypeScript definitions
│   ├── config/             # Configuration files
│   ├── docs/               # API documentation
│   └── workers/            # Background workers
├── tests/                  # Test suites
├── docker/                 # Docker configurations
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── docker-compose.yml
```

## 🔧 Available Scripts

```bash
# Development
bun run dev          # Start development server with hot reload
bun run start        # Start production server
bun run worker       # Start background worker
bun run product-sync # Start product sync worker

# Database
bun run db:push      # Push schema changes to database
bun run db:clear     # Clear all data (keep schema)
bun run db:reset     # Reset database (drop + recreate)
bun run db:fresh     # Reset and push schema

# Testing
bun run test         # Run all tests
bun run test:all     # Run comprehensive test suite
bun run test:auth    # Run authentication tests
bun run test:security # Run security tests
bun run test:watch   # Run tests in watch mode
bun run test:coverage # Run tests with coverage

# Utilities
bun run lint         # Run ESLint
bun run type-check   # Run TypeScript type checking
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Bun](https://bun.sh/) for the amazing JavaScript runtime
- [Hono](https://hono.dev/) for the lightweight web framework
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations
- [Zod](https://zod.dev/) for runtime type validation
- [Redis](https://redis.io/) for high-performance caching
- [PostgreSQL](https://www.postgresql.org/) for reliable data storage

## 📞 Support

- **Documentation**: [API Docs](http://localhost:3031/swagger)
- **Issues**: [GitHub Issues](https://github.com/THXNXKXT/digi-pocket-th/issues)
- **Discussions**: [GitHub Discussions](https://github.com/THXNXKXT/digi-pocket-th/discussions)

---

**Built with ❤️ for the Thai digital marketplace ecosystem**

## 🚀 Quick Start

### **Prerequisites**
- [Bun](https://bun.sh/) >= 1.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 14
- [Redis](https://redis.io/) >= 6.0
- [Docker](https://www.docker.com/) (optional)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/THXNXKXT/digi-pocket-th.git
cd digi-pocket-th
```

2. **Install dependencies**
```bash
cd backend
bun install
```

3. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database Setup**
```bash
# Start PostgreSQL and Redis (using Docker)
docker-compose up -d postgres redis

# Run database migrations
bun run db:migrate

# Seed initial data (optional)
bun run db:seed
```

5. **Start Development Server**
```bash
bun run dev
```

The API will be available at `http://localhost:3000`

### **Docker Setup**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

## 📚 API Documentation

### **Interactive Documentation**
- **Swagger UI**: `http://localhost:3000/swagger`
- **OpenAPI JSON**: `http://localhost:3000/doc`

### **Core Endpoints**

#### **Authentication**
```http
POST /auth/register    # User registration
POST /auth/login       # User login
POST /auth/logout      # User logout
GET  /auth/profile     # Get user profile
```

#### **Products**
```http
GET /products/:type    # List products by type
# Types: app-premium, preorder, game, mobile, cashcard
```

#### **Orders**
```http
POST /orders           # Create new order
GET  /orders           # Get user orders
GET  /orders/:id       # Get specific order
```

#### **Wallet**
```http
GET  /wallet/balance   # Get wallet balance
POST /wallet/deposit   # Create deposit
POST /wallet/withdraw  # Create withdrawal
```

### **API Examples**

#### **User Registration**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "role": "customer"
  }'
```

#### **User Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePassword123!"
  }'
```

#### **Get Products**
```bash
# Get app-premium products
curl -X GET http://localhost:3000/products/app-premium \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get game products
curl -X GET http://localhost:3000/products/game \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### **Create Order**
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "product-uuid",
    "quantity": 1,
    "paymentMethod": "wallet"
  }'
```

### **Response Format**
All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req-uuid"
  }
}
```

#### **Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req-uuid"
  }
}
```

## 🧪 Testing

### **Test Coverage**
- ✅ **127+ Tests Passing**
- 🔐 **54 Security Utils Tests**
- 📱 **26 Device Tracking Tests**
- 👤 **17 User Schema Tests**
- 🛒 **Product & Order Tests**

### **Run Tests**
```bash
# Run all tests
bun test

# Run specific test files
bun test unit.comprehensive.test.ts
bun test auth.simple.test.ts
bun test security.utils.test.ts

# Run with coverage
bun test --coverage
```

### **Test Categories**
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Security Tests**: Vulnerability and penetration testing
- **Performance Tests**: Load and stress testing

## 🔧 Development

### **Project Structure**
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Custom middleware
│   ├── routes/          # API routes
│   ├── db/             # Database schemas & migrations
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript definitions
├── tests/              # Test suites
├── docs/               # Documentation
└── docker/             # Docker configurations
```

### **Available Scripts**
```bash
# Development
bun run dev          # Start development server with hot reload
bun run build        # Build for production
bun run start        # Start production server
bun run preview      # Preview production build locally

# Testing
bun run test         # Run all test suites
bun run test:unit    # Run unit tests only
bun run test:integration # Run integration tests only
bun run test:security    # Run security tests only
bun run test:coverage    # Run tests with coverage report

# Database
bun run db:migrate   # Run database migrations
bun run db:rollback  # Rollback last migration
bun run db:seed      # Seed database with test data
bun run db:reset     # Reset database (drop + migrate + seed)
bun run db:studio    # Open database studio (GUI)

# Code Quality
bun run lint         # Run ESLint
bun run lint:fix     # Fix ESLint issues automatically
bun run format       # Format code with Prettier
bun run type-check   # Run TypeScript type checking

# Utilities
bun run clean        # Clean build artifacts
bun run docs:generate # Generate API documentation
bun run security:audit # Run security audit
```

### **Environment Variables**
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/digi_pocket
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# API
PORT=3000
NODE_ENV=development

# External Services
PEAMSUB_API_URL=https://api.peamsub.com
PEAMSUB_API_KEY=your-api-key
```

## 🔒 Security

### **Security Features**
- **Password Security**: Bcrypt hashing with configurable rounds
- **Session Security**: Secure session tokens with expiration
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: Configurable rate limits per endpoint
- **CSRF Protection**: Cross-site request forgery prevention
- **XSS Protection**: Cross-site scripting prevention

### **Security Testing**
All security features are thoroughly tested with automated test suites covering:
- Authentication flows
- Authorization checks
- Input validation
- Session management
- Rate limiting
- Security headers

## 📈 Performance

### **Optimization Features**
- **Redis Caching**: Fast data retrieval with configurable TTL
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Lazy Loading**: On-demand resource loading
- **Compression**: Response compression for faster transfers

### **Performance Metrics**
- **Response Time**: < 200ms for most endpoints
- **Throughput**: 100+ requests/second
- **Memory Usage**: Optimized for low memory footprint
- **Database Queries**: Optimized with proper indexing

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`bun test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## �️ Roadmap

### **Version 1.0.0** (Current)
- ✅ Core authentication system
- ✅ Product catalog management
- ✅ Order processing
- ✅ Wallet system
- ✅ Security features
- ✅ Comprehensive testing suite

### **Version 1.1.0** (Planned)
- 🔄 Real-time notifications
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app API enhancements
- 🔄 Multi-language support
- 🔄 Enhanced fraud detection

### **Version 1.2.0** (Future)
- 📋 Subscription management
- 📋 Advanced reporting
- 📋 Third-party integrations
- 📋 Machine learning recommendations
- 📋 Advanced caching strategies

### **Version 2.0.0** (Long-term)
- 📋 Microservices architecture
- 📋 GraphQL API
- 📋 Real-time chat support
- 📋 Advanced AI features
- 📋 Blockchain integration

## 📝 Changelog

### **[1.0.0]** - 2024-01-01
#### Added
- Complete authentication system with JWT and sessions
- Product catalog with multiple categories
- Order management with upstream integration
- Wallet system with deposit/withdrawal
- Comprehensive security features
- Device tracking and analytics
- 127+ automated tests
- API documentation with Swagger
- Docker containerization

#### Security
- Password hashing with bcrypt
- Rate limiting and account lockout
- Input sanitization and validation
- CSRF protection
- Session management
- Security audit logging

#### Performance
- Redis caching implementation
- Database query optimization
- Connection pooling
- Response compression
- Lazy loading strategies

## �📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

### **Production Deployment**

#### **Using Docker**
```bash
# Build production image
docker build -t digi-pocket-th .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

#### **Manual Deployment**
```bash
# Build the application
bun run build

# Start production server
bun run start
```

### **Environment Configuration**
```env
# Production Environment
NODE_ENV=production
PORT=3000

# Database (Production)
DATABASE_URL=postgresql://user:pass@prod-db:5432/digi_pocket
REDIS_URL=redis://prod-redis:6379

# Security (Production)
JWT_SECRET=your-production-jwt-secret
BCRYPT_ROUNDS=12

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

## 🔍 Monitoring & Logging

### **Application Monitoring**
- **Health Checks**: `/health` endpoint for service monitoring
- **Metrics**: Performance and usage metrics collection
- **Error Tracking**: Comprehensive error logging and tracking
- **Uptime Monitoring**: Service availability monitoring

### **Security Monitoring**
- **Failed Login Attempts**: Automatic account lockout
- **Suspicious Activity Detection**: IP-based anomaly detection
- **Security Alerts**: Real-time security event notifications
- **Audit Logs**: Comprehensive user activity logging

## 🛠️ Troubleshooting

### **Common Issues**

#### **Database Connection Issues**
```bash
# Check database connection
bun run db:check

# Reset database
bun run db:reset

# Check migrations
bun run db:status
```

#### **Redis Connection Issues**
```bash
# Test Redis connection
redis-cli ping

# Check Redis logs
docker logs redis-container
```

#### **Performance Issues**
```bash
# Run performance tests
bun test performance.comprehensive.test.ts

# Check memory usage
bun --inspect src/app.ts

# Profile database queries
bun run db:profile
```

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* bun run dev

# Run with verbose logging
LOG_LEVEL=debug bun run dev
```

## 🔐 Security Best Practices

### **For Developers**
- Always validate input data using Zod schemas
- Use parameterized queries to prevent SQL injection
- Implement proper error handling without exposing sensitive data
- Follow the principle of least privilege for database access
- Regularly update dependencies and check for vulnerabilities

### **For Deployment**
- Use HTTPS in production environments
- Configure proper CORS policies
- Set up rate limiting and DDoS protection
- Implement proper backup and disaster recovery
- Monitor security logs and set up alerts

## 🧪 Testing Strategy

### **Test Pyramid**
```
    /\     E2E Tests (Integration)
   /  \
  /____\   API Tests (Integration)
 /      \
/________\  Unit Tests (Isolated)
```

### **Testing Guidelines**
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database interactions
- **Security Tests**: Test authentication, authorization, and input validation
- **Performance Tests**: Test response times and throughput under load

### **Test Data Management**
```bash
# Create test database
bun run test:db:create

# Seed test data
bun run test:db:seed

# Clean test data
bun run test:db:clean
```

## 🙏 Acknowledgments

- [Bun](https://bun.sh/) for the amazing JavaScript runtime
- [Hono](https://hono.dev/) for the lightweight web framework
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations
- [Zod](https://zod.dev/) for runtime type validation
- [Redis](https://redis.io/) for high-performance caching
- [PostgreSQL](https://www.postgresql.org/) for reliable data storage

## 📞 Support

- **Documentation**: [API Docs](http://localhost:3000/swagger)
- **Issues**: [GitHub Issues](https://github.com/THXNXKXT/digi-pocket-th/issues)
- **Discussions**: [GitHub Discussions](https://github.com/THXNXKXT/digi-pocket-th/discussions)
- **Wiki**: [Project Wiki](https://github.com/THXNXKXT/digi-pocket-th/wiki)

---

<div align="center">
  <p>Built with ❤️ in Thailand</p>
  <p>© 2024 Digi-Pocket Thailand. All rights reserved.</p>
</div>
