'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  src?: string
  alt: string
  fallbackIcon?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6 text-lg',
  md: 'w-8 h-8 md:w-10 md:h-10 text-2xl md:text-3xl',
  lg: 'w-12 h-12 md:w-16 md:h-16 text-3xl md:text-4xl',
  xl: 'w-16 h-16 md:w-20 md:h-20 text-4xl md:text-5xl',
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  fallbackIcon = '📦',
  size = 'md',
  className
}) => {
  const [imageError, setImageError] = React.useState(false)
  const [imageLoading, setImageLoading] = React.useState(true)

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  // If no src provided or image failed to load, show fallback icon
  if (!src || imageError) {
    return (
      <div className={cn(
        'flex items-center justify-center',
        sizeClasses[size],
        className
      )}>
        <span className="select-none">
          {fallbackIcon}
        </span>
      </div>
    )
  }

  return (
    <div className={cn(
      'relative flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      {/* Loading placeholder */}
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded animate-pulse">
          <span className="text-gray-400 text-sm">⏳</span>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={cn(
          'object-cover rounded transition-opacity duration-200',
          imageLoading ? 'opacity-0' : 'opacity-100',
          size === 'sm' && 'w-6 h-6',
          size === 'md' && 'w-8 h-8 md:w-10 md:h-10',
          size === 'lg' && 'w-12 h-12 md:w-16 md:h-16',
          size === 'xl' && 'w-16 h-16 md:w-20 md:h-20'
        )}
      />
    </div>
  )
}

// Helper function to get appropriate fallback icon based on product
export const getProductFallbackIcon = (product: any): string => {
  if (!product) return '📦'
  
  const name = product.name?.toLowerCase() || ''
  
  // App Premium icons
  if (name.includes('netflix')) return '🎬'
  if (name.includes('spotify')) return '🎵'
  if (name.includes('youtube')) return '📺'
  if (name.includes('disney')) return '🏰'
  if (name.includes('adobe')) return '🎨'
  if (name.includes('microsoft')) return '💻'
  if (name.includes('office')) return '📄'
  
  // Game icons
  if (name.includes('steam')) return '🎮'
  if (name.includes('garena')) return '💎'
  if (name.includes('roblox')) return '🎯'
  if (name.includes('mobile legends')) return '⚔️'
  if (name.includes('free fire')) return '🔥'
  if (name.includes('pubg')) return '🎯'
  if (name.includes('valorant')) return '🎮'
  
  // Mobile top-up icons
  if (name.includes('ais')) return '📱'
  if (name.includes('true')) return '📞'
  if (name.includes('dtac')) return '📲'
  if (name.includes('nt')) return '📶'
  if (name.includes('tot')) return '📡'
  
  // Cash card icons
  if (name.includes('true money')) return '💳'
  if (name.includes('rabbit')) return '🐰'
  if (name.includes('line pay')) return '💚'
  if (name.includes('7-eleven')) return '🏪'
  if (name.includes('central')) return '🎁'
  if (name.includes('lotus')) return '🛒'
  if (name.includes('big c')) return '🛍️'
  
  // Default icons by category
  switch (product.type) {
    case 'app-premium': return '🚀'
    case 'game': return '🎮'
    case 'mobile': return '📱'
    case 'cashcard': return '💳'
    default: return '📦'
  }
}
