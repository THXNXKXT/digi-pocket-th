'use client'

import { usePathname } from 'next/navigation'
import BottomNavigation from './BottomNavigation'
import { cn } from '@/lib/utils'

interface MobileLayoutProps {
  children: React.ReactNode
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname()
  
  // Check if we're on auth pages
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register')
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area */}
      <main 
        className={cn(
          'relative',
          // Add bottom padding on mobile to account for bottom navigation
          !isAuthPage && 'pb-16 md:pb-0',
          // Full height on mobile
          'min-h-screen md:min-h-0'
        )}
      >
        {children}
      </main>

      {/* Bottom Navigation - only on mobile */}
      <BottomNavigation />
    </div>
  )
}
