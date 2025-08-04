'use client'

import { useState, useEffect } from 'react'

export function useResponsiveProductCount() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      // md breakpoint is 768px in Tailwind
      setIsMobile(window.innerWidth < 768)
    }

    // Check initial screen size
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Return product count based on screen size
  const getProductCount = () => {
    return isMobile ? 4 : 5
  }

  return {
    isMobile,
    productCount: getProductCount(),
    mobileCount: 4,
    desktopCount: 5
  }
}
