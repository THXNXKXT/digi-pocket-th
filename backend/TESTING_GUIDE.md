# 🧪 Testing Guide - Digi-Pocket-TH

## 📋 Overview

This guide covers the comprehensive testing strategy for the Digi-Pocket-TH project, including unit tests, integration tests, performance tests, and security tests.

## 🏗️ Test Architecture

### Test Types
- **Unit Tests** - Individual component testing
- **Integration Tests** - API and database integration
- **End-to-End Tests** - Complete user workflows
- **Performance Tests** - Load, stress, and scalability testing
- **Security Tests** - Authentication, authorization, and data protection

### Test Structure
```
backend/tests/
├── setup.ts                           # Test configuration and utilities
├── auth.comprehensive.test.ts         # Authentication system tests
├── device-tracking.comprehensive.test.ts # Device tracking tests
├── security.comprehensive.test.ts     # Security system tests
├── ecommerce.comprehensive.test.ts    # E-commerce functionality tests
├── performance.comprehensive.test.ts  # Performance and load tests
└── legacy/                           # Legacy test files
    ├── auth.enhanced.test.ts
    ├── auth.simple.test.ts
    ├── device-tracking.integration.test.ts
    ├── product.test.ts
    └── users.schema.security.test.ts
```

## 🚀 Quick Start

### Prerequisites
1. **Docker Environment**
   ```bash
   docker-compose up -d
   ```

2. **Database Setup**
   ```bash
   docker-compose exec backend bun run db:push
   ```

3. **Verify API**
   ```bash
   curl http://localhost:3031/health
   ```

### Running Tests

#### All Tests
```bash
cd backend
bun run-tests.ts
```

#### Specific Test Suite
```bash
# Authentication tests
bun test tests/auth.comprehensive.test.ts

# Device tracking tests
bun test tests/device-tracking.comprehensive.test.ts

# Security tests
bun test tests/security.comprehensive.test.ts

# E-commerce tests
bun test tests/ecommerce.comprehensive.test.ts

# Performance tests
bun test tests/performance.comprehensive.test.ts
```

#### Legacy Tests
```bash
bun run-tests.ts --legacy
```

## 📊 Test Coverage

### 🔐 Authentication System Tests
- **User Registration**
  - Valid registration flow
  - Email/username validation
  - Password strength requirements
  - Duplicate prevention
- **User Login**
  - Valid credentials authentication
  - Invalid credentials rejection
  - Device tracking on login
- **Account Security**
  - Account lockout after failed attempts
  - JWT token validation
  - Session management
- **Role-Based Access Control**
  - Admin vs customer permissions
  - Endpoint access restrictions

### 📱 Device Tracking Tests
- **Device Fingerprinting**
  - Unique fingerprint generation
  - Device information extraction
  - Cross-device tracking
- **IP Address Tracking**
  - IP classification (public/private/localhost)
  - Location tracking
  - Multiple IP handling
- **Login Pattern Analysis**
  - Browser usage statistics
  - Device type distribution
  - Account age calculation
- **Security Analysis**
  - Security score calculation
  - Risk factor assessment
  - Recommendation generation

### 🛡️ Security System Tests
- **Input Validation**
  - SQL injection prevention
  - XSS attack prevention
  - Email format validation
  - Password strength enforcement
- **Rate Limiting**
  - Login attempt limiting
  - API request limiting
  - Registration limiting
- **Account Security**
  - Failed login tracking
  - Account locking/unlocking
  - Session invalidation
- **Data Protection**
  - Sensitive data masking
  - Authorization validation
  - Secure password hashing

### 🛒 E-commerce System Tests
- **Product Management**
  - Product listing
  - Product details retrieval
  - Search and filtering
  - Availability checking
- **Order Processing**
  - Order creation
  - Total calculation
  - Stock validation
  - Shipping information validation
- **Inventory Management**
  - Stock updates after orders
  - Concurrent order handling
  - Out-of-stock prevention
- **Order Management**
  - Order retrieval
  - Status updates
  - User authorization
  - Order history

### ⚡ Performance Tests
- **Response Time Tests**
  - Health check < 100ms
  - Authentication < 500ms
  - Product listing < 200ms
  - User profile < 150ms
  - Device tracking < 300ms
- **Load Testing**
  - Concurrent health checks
  - Concurrent authentication
  - Concurrent API requests
  - Concurrent order creation
- **Stress Testing**
  - Increasing load handling
  - Database performance under load
  - Memory usage monitoring
- **Scalability Tests**
  - Multiple concurrent users
  - Mixed workload handling
  - Resource utilization

## 🔧 Test Configuration

### Environment Variables
```bash
# Test database
TEST_DATABASE_URL=postgres://digiuser:qniCrDWiPa@localhost:5435/digipocket_test

# Test Redis
TEST_REDIS_URL=redis://localhost:6380

# Test API
TEST_API_URL=http://localhost:3031
```

### Test Data
- **Test Users**: Admin and customer accounts with predefined credentials
- **Test Products**: Sample products with various configurations
- **Test Headers**: Different device types (desktop, mobile, suspicious)

## 📈 Performance Benchmarks

### Response Time Targets
| Endpoint | Target | Acceptable |
|----------|--------|------------|
| Health Check | < 100ms | < 200ms |
| Authentication | < 500ms | < 1000ms |
| Product Listing | < 200ms | < 400ms |
| User Profile | < 150ms | < 300ms |
| Device Tracking | < 300ms | < 600ms |

### Load Testing Targets
| Metric | Target | Minimum |
|--------|--------|---------|
| Success Rate | > 95% | > 80% |
| Concurrent Users | 50+ | 20+ |
| Requests/Second | 100+ | 50+ |
| Error Rate | < 5% | < 20% |

## 🛠️ Test Utilities

### TestAPI Class
```typescript
// Authentication
await TestAPI.login(credentials, headers);
await TestAPI.register(userData, headers);

// Authenticated requests
await TestAPI.authenticatedRequest('GET', '/endpoint', token);

// Generic requests
await TestAPI.request('POST', '/endpoint', options);
```

### TestDatabase Class
```typescript
// Database cleanup
await TestDatabase.cleanup();

// Create test data
await TestDatabase.createTestUser(userData);
await TestDatabase.createTestProduct(productData);
```

### PerformanceTest Class
```typescript
// Measure response time
const { result, duration } = await PerformanceTest.measureResponseTime(fn);

// Load testing
const results = await PerformanceTest.loadTest(fn, concurrency, iterations);

// Stress testing
const results = await PerformanceTest.stressTest(fn, maxConcurrency, duration);
```

## 🐛 Debugging Tests

### Common Issues
1. **Database Connection**
   - Ensure PostgreSQL container is running
   - Check DATABASE_URL configuration
   - Verify database permissions

2. **API Connectivity**
   - Confirm backend server is running
   - Check port 3031 availability
   - Verify Docker network connectivity

3. **Test Isolation**
   - Database cleanup between tests
   - Unique test data generation
   - Session management

### Debug Commands
```bash
# Check container status
docker-compose ps

# View backend logs
docker-compose logs -f backend

# Check database connectivity
docker-compose exec db pg_isready -U digiuser

# Manual API testing
curl -X GET http://localhost:3031/health
```

## 📊 Test Reports

### Running with Reports
```bash
# Generate detailed test report
bun run-tests.ts > test-report.txt 2>&1

# Run specific suite with verbose output
bun test tests/auth.comprehensive.test.ts --verbose
```

### Interpreting Results
- **✅ Green**: Tests passed successfully
- **❌ Red**: Tests failed, requires investigation
- **⚠️ Yellow**: Warnings or partial failures
- **📊 Blue**: Information and metrics

## 🔄 Continuous Integration

### GitHub Actions Integration
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: docker-compose up -d
      - run: cd backend && bun install
      - run: cd backend && bun run-tests.ts
```

### Pre-commit Hooks
```bash
# Install pre-commit hook
echo "cd backend && bun run-tests.ts" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 📝 Writing New Tests

### Test Structure
```typescript
import { describe, it, expect, beforeEach } from 'bun:test';
import { setupTestEnvironment, TestAPI } from './setup';

setupTestEnvironment();

describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup test data
  });

  it('should do something', async () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Best Practices
1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after each test
3. **Assertions**: Use descriptive assertions
4. **Error Handling**: Test both success and failure cases
5. **Performance**: Include performance expectations
6. **Security**: Test security boundaries

## 🎯 Test Maintenance

### Regular Tasks
- Update test data when schema changes
- Review performance benchmarks quarterly
- Update security test scenarios
- Maintain test documentation
- Monitor test execution times

### Test Health Metrics
- Test execution time trends
- Flaky test identification
- Coverage gap analysis
- Performance regression detection
