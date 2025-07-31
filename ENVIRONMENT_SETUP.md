# 🔧 Environment Setup Guide

## 📋 Prerequisites

- **Docker** and **Docker Compose**
- **Bun** runtime (for local development)
- **PostgreSQL** 15+
- **Redis** 7+

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd digi-pocket-th
```

### 2. Environment Configuration
```bash
# Copy environment template
cp backend/.env.example backend/.env.docker

# Edit environment variables
nano backend/.env.docker
```

### 3. Start Services
```bash
# Start all services with Docker
docker-compose up -d

# Run database migrations
docker-compose exec backend bun run db:push
```

### 4. Verify Installation
```bash
# Check service status
docker-compose ps

# Test API
curl http://localhost:3031/health

# Access database admin
open http://localhost:8085
```

## 🔐 Environment Variables

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret | `your-super-secret-key` |
| `DATABASE_URL` | PostgreSQL connection | `postgres://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |

### Security Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_FAILED_ATTEMPTS` | 5 | Account lock threshold |
| `LOCKOUT_DURATION_MINUTES` | 15 | Lock duration in minutes |
| `RATE_LIMIT_WINDOW_MINUTES` | 15 | Rate limit window |
| `MAX_REQUESTS_PER_WINDOW` | 100 | Max requests per window |

### External Services
| Variable | Description | Required |
|----------|-------------|----------|
| `PEAMSUB_KEY` | Peamsub API key | Yes |
| `SMTP_*` | Email configuration | Optional |
| `PAYMENT_*` | Payment gateway | Optional |

## 🐳 Docker Configuration

### Development
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f backend

# Restart specific service
docker-compose restart backend
```

### Production
```bash
# Use production compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale backend service
docker-compose up -d --scale backend=3
```

## 🗄️ Database Setup

### Initial Setup
```bash
# Run migrations
docker-compose exec backend bun run db:push

# Seed data (if available)
docker-compose exec backend bun run db:seed
```

### Backup & Restore
```bash
# Backup database
docker-compose exec db pg_dump -U digiuser digipocket > backup.sql

# Restore database
docker-compose exec -T db psql -U digiuser digipocket < backup.sql
```

## 🔧 Development Tools

### Database Admin
- **URL:** http://localhost:8085
- **Username:** digiuser
- **Password:** (from env.docker)

### API Documentation
- **Swagger UI:** http://localhost:3031/swagger
- **Health Check:** http://localhost:3031/health

### Testing
```bash
# Run all tests
cd backend && bun test

# Run specific test
bun test tests/auth.enhanced.test.ts

# Run device tracking test
node test-device-tracking.js
```

## 🚨 Security Considerations

### Production Checklist
- [ ] Change default JWT_SECRET
- [ ] Use strong database passwords
- [ ] Configure CORS properly
- [ ] Set up SSL/TLS certificates
- [ ] Enable firewall rules
- [ ] Configure monitoring and logging
- [ ] Set up backup procedures

### Environment Files
- ✅ `.env.example` - Template (safe to commit)
- ❌ `.env.docker` - Contains secrets (ignored)
- ❌ `env.production` - Production secrets (ignored)
- ❌ Any file with real credentials

## 📊 Monitoring

### Health Checks
```bash
# API health
curl http://localhost:3031/health

# Database health
docker-compose exec db pg_isready -U digiuser

# Redis health
docker-compose exec redis redis-cli ping
```

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Follow new logs only
docker-compose logs -f --tail=0 backend
```

## 🔄 Updates and Maintenance

### Update Dependencies
```bash
# Update backend dependencies
cd backend && bun update

# Rebuild containers
docker-compose up --build -d
```

### Database Migrations
```bash
# Generate migration
cd backend && bun run db:generate

# Apply migrations
bun run db:push

# Check migration status
bun run db:check
```

## 🆘 Troubleshooting

### Common Issues
1. **Port conflicts:** Change ports in docker-compose.yml
2. **Permission errors:** Check Docker permissions
3. **Database connection:** Verify DATABASE_URL
4. **Redis connection:** Check Redis service status

### Reset Everything
```bash
# Stop and remove all containers
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up --build -d
```
