import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse rounded-md bg-gray-200',
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'

// Product Card Skeleton
const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-100">
      <div className="text-center">
        {/* Icon/Image skeleton */}
        <Skeleton className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 rounded-full" />
        
        {/* Product name skeleton */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-3 w-3/4 mx-auto mb-2" />
        
        {/* Price and button skeleton */}
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-10 rounded" />
        </div>
      </div>
    </div>
  )
}

// Category Section Skeleton
const CategorySectionSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Category Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded" />
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, ProductCardSkeleton, CategorySectionSkeleton }
