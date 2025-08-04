'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  ShoppingBagIcon,
  WalletIcon,
  ClipboardDocumentListIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  WalletIcon as WalletIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  activeIcon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'หน้าหลัก',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    href: '/products',
    label: 'สินค้า',
    icon: ShoppingBagIcon,
    activeIcon: ShoppingBagIconSolid,
  },
  {
    href: '/wallet',
    label: 'กระเป๋าเงิน',
    icon: WalletIcon,
    activeIcon: WalletIconSolid,
  },
  {
    href: '/orders',
    label: 'คำสั่งซื้อ',
    icon: ClipboardDocumentListIcon,
    activeIcon: ClipboardDocumentListIconSolid,
  },
  {
    href: '/profile',
    label: 'โปรไฟล์',
    icon: UserIcon,
    activeIcon: UserIconSolid,
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  // Don't show on auth pages
  if (pathname.includes('/login') || pathname.includes('/register')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      {/* Safe area padding for iOS */}
      <div className="pb-safe">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            const IconComponent = isActive ? item.activeIcon : item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center min-w-0 flex-1 px-1 py-2 text-xs font-medium transition-colors duration-200',
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <div className="relative">
                  <IconComponent className="w-6 h-6 mb-1" />
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                  )}
                </div>
                <span className={cn(
                  'font-thai truncate',
                  isActive ? 'font-semibold' : 'font-normal'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
