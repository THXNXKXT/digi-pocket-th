# 🏪 Digi-Pocket Thailand - Frontend

แพลตฟอร์ม Frontend สำหรับตลาดดิจิทัลของประเทศไทย สร้างด้วย Next.js 15, TypeScript, และ TailwindCSS

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Bundler**: Turbopack
- **State Management**: Zustand + React Query
- **UI Components**: Headless UI + Custom Components
- **Icons**: Heroicons + Lucide React
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

## 📦 Installation

```bash
# ติดตั้ง dependencies ด้วย Bun
bun install

# รัน development server
bun run dev

# Build สำหรับ production
bun run build

# รัน production server
bun run start
```

## 🌐 Environment Variables

สร้างไฟล์ `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3031
NEXT_PUBLIC_APP_NAME=Digi-Pocket Thailand
NEXT_PUBLIC_APP_VERSION=1.0.0

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Development
NODE_ENV=development
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication routes
│   ├── (customer)/        # Customer dashboard
│   ├── (admin)/           # Admin dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── loading.tsx        # Loading UI
│   ├── error.tsx          # Error UI
│   ├── not-found.tsx      # 404 page
│   └── providers.tsx      # App providers
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                  # Utility libraries
│   ├── api.ts           # API client
│   └── utils.ts         # Utility functions
├── services/            # API services
│   ├── auth.service.ts  # Authentication
│   ├── product.service.ts # Products
│   ├── order.service.ts   # Orders
│   └── wallet.service.ts  # Wallet
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores
├── types/               # TypeScript types
└── utils/               # Helper functions
```

## 🔗 API Integration

Frontend เชื่อมต่อกับ Backend API ที่ `http://localhost:3031`

### Available Endpoints:
- **Authentication**: `/auth/*`
- **Products**: `/products/*`
- **Orders**: `/orders/*`
- **Wallet**: `/wallet/*`
- **Announcements**: `/announcements/*`
- **User Tracking**: `/user/tracking/*`
- **Admin**: `/admin/*`

## 🎨 UI Components

### Base Components:
- `Button` - ปุ่มพร้อม variants และ loading state
- `Input` - Input field พร้อม validation
- `Card` - Card component สำหรับ layout
- `Modal` - Modal dialog
- `Toast` - Notification system

### Usage Example:
```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

function MyComponent() {
  return (
    <Card>
      <Input label="ชื่อผู้ใช้" placeholder="กรอกชื่อผู้ใช้" />
      <Button variant="primary" size="lg">
        ส่ง
      </Button>
    </Card>
  )
}
```

## 🔐 Authentication

ระบบ Authentication ใช้ JWT tokens:

```tsx
import { useAuth } from '@/hooks/useAuth'

function LoginForm() {
  const { login, isLoading } = useAuth()
  
  const handleLogin = async (credentials) => {
    await login(credentials)
  }
  
  return (
    // Login form JSX
  )
}
```

## 📱 Features

### Customer Features:
- 🛒 Product catalog browsing
- 💰 Digital wallet management
- 📋 Order history and tracking
- 🔔 Announcements and notifications
- 👤 Profile management
- 🔒 Security settings

### Admin Features:
- 📊 Analytics dashboard
- 👥 User management
- 📦 Product management
- 💳 Order management
- 🏦 Deposit approval
- 🛡️ Security monitoring

## 🧪 Testing

```bash
# รัน tests
bun test

# รัน tests ในโหมด watch
bun run test:watch

# Type checking
bun run type-check
```

## 🚀 Deployment

### Build for Production:
```bash
bun run build
```

### Docker Deployment:
```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN bun run build

# Start application
EXPOSE 3000
CMD ["bun", "run", "start"]
```

## 📝 Development Guidelines

### Code Style:
- ใช้ TypeScript สำหรับ type safety
- ใช้ Prettier สำหรับ code formatting
- ใช้ ESLint สำหรับ code linting
- ใช้ Tailwind CSS สำหรับ styling

### Component Guidelines:
- สร้าง reusable components ใน `components/ui/`
- ใช้ TypeScript interfaces สำหรับ props
- ใช้ forwardRef สำหรับ ref passing
- เขียน JSDoc comments สำหรับ complex components

### API Guidelines:
- ใช้ React Query สำหรับ server state
- ใช้ Zustand สำหรับ client state
- Handle loading และ error states
- ใช้ TypeScript types จาก backend

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ for Thailand's digital marketplace ecosystem**
