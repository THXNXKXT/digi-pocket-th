import * as React from 'react'
import { cn } from '@/lib/utils'
import { UserIcon } from '@heroicons/react/24/outline'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
}

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)

    const handleImageError = () => {
      setImageError(true)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full bg-gray-200',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
            onError={handleImageError}
          />
        ) : fallback ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 text-white font-medium text-sm">
            {fallback}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <UserIcon className={cn('text-gray-600', iconSizeClasses[size])} />
          </div>
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

// Helper function to get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
