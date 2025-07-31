# 🏪 Digi-Pocket Thailand

> A comprehensive digital marketplace platform for Thailand, built with modern web technologies and enterprise-grade security.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![Hono](https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## 🌟 Features

### 🔐 **Security & Authentication**
- **Multi-factor Authentication** with JWT tokens and session management
- **Advanced Security Utils** with 54+ security functions tested
- **Device Tracking & Fingerprinting** for fraud prevention
- **Rate Limiting & Account Lockout** protection
- **IP Analysis & Geolocation** tracking
- **CSRF Protection** and input sanitization

### 🛒 **E-commerce Platform**
- **Multi-category Products** (App Premium, Games, Mobile, Cash Cards)
- **Dynamic Pricing** with VIP and agent pricing tiers
- **Real-time Stock Management** with upstream integration
- **Order Processing** with callback handling
- **Wallet System** with deposit and withdrawal features

### 👥 **User Management**
- **Role-based Access Control** (Customer, Agent, Admin)
- **Comprehensive User Profiles** with activity tracking
- **Session Management** with concurrent session support
- **Account Status Management** (Active, Suspended, Banned)

### 📊 **Analytics & Monitoring**
- **User Activity Logging** with detailed metadata
- **Security Alert System** for suspicious activities
- **Performance Monitoring** with comprehensive test suite
- **Device & Browser Analytics** for user insights

## 🏗️ Architecture

### **Backend Stack**
- **Runtime**: [Bun](https://bun.sh/) - Ultra-fast JavaScript runtime
- **Framework**: [Hono](https://hono.dev/) - Lightweight web framework
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Cache**: [Redis](https://redis.io/) for session and data caching
- **Validation**: [Zod](https://zod.dev/) for type-safe validation

### **Security Features**
- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Redis-backed session storage
- **Input Sanitization**: XSS and injection prevention
- **Rate Limiting**: IP-based request throttling

### **Database Schema**
```
├── users (Authentication & Profiles)
├── user_sessions (Session Management)
├── user_activity_logs (Activity Tracking)
├── security_alerts (Security Monitoring)
├── products (Product Catalog)
├── product_prices (Dynamic Pricing)
├── orders (Order Management)
├── wallets (Financial Transactions)
└── announcements (System Notifications)
```

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
