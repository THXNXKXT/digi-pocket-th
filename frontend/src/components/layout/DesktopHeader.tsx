'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BellIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { ThaiText } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Avatar, getInitials } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect, useRef } from 'react'

const navItems = [
  { href: '/', label: 'หน้าหลัก' },
  { href: '/products', label: 'สินค้า' },
  { href: '/wallet', label: 'กระเป๋าเงิน' },
  { href: '/orders', label: 'คำสั่งซื้อ' },
]

export default function DesktopHeader() {
  const pathname = usePathname()
  const { isAuthenticated, user, logout, isLoading } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  // Don't show on auth pages
  if (pathname === '/login' || pathname === '/register' || pathname.includes('/auth/')) {
    return null
  }

  return (
    <header className="hidden md:block bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <Image
                src="/logos/digi-pocket-logo1.png"
                alt="Digi Pocket Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-thai">Digi Pocket</h1>
              <p className="text-sm text-gray-500 font-thai">Thailand</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'font-thai font-medium transition-colors duration-200',
                    isActive
                      ? 'text-primary-600 border-b-2 border-primary-600 pb-1'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              // Loading state - show skeleton
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : isAuthenticated ? (
              // Authenticated user UI
              <>
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="hidden sm:block text-right">
                      <ThaiText className="text-sm font-medium text-gray-900">{user?.username || 'ผู้ใช้งาน'}</ThaiText>
                      <ThaiText className="text-xs text-gray-500">{user?.email || 'user@example.com'}</ThaiText>
                    </div>
                    <Avatar
                      size="md"
                      fallback={user?.username ? getInitials(user.username) : 'U'}
                    />
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* User dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-thai"
                        onClick={() => setShowUserMenu(false)}
                      >
                        โปรไฟล์
                      </Link>
                      <Link
                        href="/wallet"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-thai"
                        onClick={() => setShowUserMenu(false)}
                      >
                        กระเป๋าเงิน
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-thai"
                        onClick={() => setShowUserMenu(false)}
                      >
                        คำสั่งซื้อ
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          logout()
                          setShowUserMenu(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-thai"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Guest user UI
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-thai">
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm" className="font-thai">
                    สมัครสมาชิก
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
