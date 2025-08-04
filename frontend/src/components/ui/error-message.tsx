import * as React from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { ThaiText } from './typography'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
  variant?: 'default' | 'compact'
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'เกิดข้อผิดพลาด',
  message = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
  onRetry,
  className,
  variant = 'default'
}) => {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center justify-center p-4 text-center', className)}>
        <div className="space-y-2">
          <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 mx-auto" />
          <ThaiText className="text-sm text-gray-600">{message}</ThaiText>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry} className="font-thai">
              <ArrowPathIcon className="w-3 h-3 flex-shrink-0" />
              <span className="leading-none">ลองใหม่</span>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center p-8 text-center', className)}>
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
          <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
        </div>
        <div>
          <ThaiText className="text-lg font-medium text-gray-900 mb-2">
            {title}
          </ThaiText>
          <ThaiText className="text-gray-600">
            {message}
          </ThaiText>
        </div>
        {onRetry && (
          <Button onClick={onRetry} className="font-thai">
            <ArrowPathIcon className="w-4 h-4 flex-shrink-0" />
            <span className="leading-none">ลองใหม่</span>
          </Button>
        )}
      </div>
    </div>
  )
}

// Product Category Error Component
export const ProductCategoryError: React.FC<{
  categoryName: string
  onRetry?: () => void
}> = ({ categoryName, onRetry }) => {
  return (
    <ErrorMessage
      variant="compact"
      title={`ไม่สามารถโหลด${categoryName}ได้`}
      message="กรุณาลองใหม่อีกครั้ง"
      onRetry={onRetry}
      className="bg-gray-50 rounded-lg border border-gray-200"
    />
  )
}
