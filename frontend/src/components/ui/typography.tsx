import * as React from 'react'
import { cn } from '@/lib/utils'

// Typography components with Kanit font

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'lead' | 'large' | 'small' | 'muted'
  as?: React.ElementType
}

const typographyVariants = {
  h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
  h6: 'scroll-m-20 text-base font-semibold tracking-tight',
  p: 'leading-7 [&:not(:first-child)]:mt-6',
  lead: 'text-xl text-muted-foreground',
  large: 'text-lg font-semibold',
  small: 'text-sm font-medium leading-none',
  muted: 'text-sm text-muted-foreground',
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = 'p', as, ...props }, ref) => {
    const Component = as || (variant.startsWith('h') ? variant : 'p')
    
    return (
      <Component
        ref={ref}
        className={cn(typographyVariants[variant], className)}
        {...props}
      />
    )
  }
)
Typography.displayName = 'Typography'

// Specific typography components for common use cases

export const Heading1 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn('text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl', className)}
      {...props}
    />
  )
)
Heading1.displayName = 'Heading1'

export const Heading2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl', className)}
      {...props}
    />
  )
)
Heading2.displayName = 'Heading2'

export const Heading3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold tracking-tight text-gray-900', className)}
      {...props}
    />
  )
)
Heading3.displayName = 'Heading3'

export const BodyText = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-base leading-relaxed text-gray-600', className)}
      {...props}
    />
  )
)
BodyText.displayName = 'BodyText'

export const LeadText = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-lg leading-relaxed text-gray-600 sm:text-xl', className)}
      {...props}
    />
  )
)
LeadText.displayName = 'LeadText'

export const SmallText = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500', className)}
      {...props}
    />
  )
)
SmallText.displayName = 'SmallText'

// Thai-specific typography helpers
export const ThaiHeading = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }>(
  ({ className, level = 1, ...props }, ref) => {
    const Component = `h${level}` as keyof JSX.IntrinsicElements
    const sizeClasses = {
      1: 'text-4xl font-bold sm:text-5xl lg:text-6xl',
      2: 'text-3xl font-bold sm:text-4xl',
      3: 'text-2xl font-semibold',
      4: 'text-xl font-semibold',
      5: 'text-lg font-semibold',
      6: 'text-base font-semibold',
    }
    
    return (
      <Component
        ref={ref}
        className={cn('font-thai tracking-tight text-gray-900', sizeClasses[level], className)}
        {...props}
      />
    )
  }
)
ThaiHeading.displayName = 'ThaiHeading'

export const ThaiText = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('font-thai text-base leading-relaxed text-gray-600', className)}
      {...props}
    />
  )
)
ThaiText.displayName = 'ThaiText'
