'use client'

import * as React from 'react'
import { cn, formatCurrency } from '@/lib/utils'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ProductImage, getProductFallbackIcon } from './product-image'

// Safe HTML sanitization function for basic tags
const sanitizeHtml = (html: string): string => {
  // Allow only safe HTML tags and remove potentially dangerous content
  const allowedTags = ['b', 'strong', 'i', 'em', 'br', 'p', 'div', 'span', 'u']

  // Simple HTML sanitization - remove script tags and dangerous attributes
  let sanitized = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data: URLs

  // Only allow specific tags
  sanitized = sanitized.replace(/<(\/?)([\w]+)([^>]*)>/gi, (_, slash, tag) => {
    const tagLower = tag.toLowerCase()
    if (allowedTags.includes(tagLower)) {
      // For br tags, ensure they're self-closing
      if (tagLower === 'br') {
        return '<br />'
      }
      // Remove all attributes for simplicity and security
      return `<${slash}${tagLower}>`
    }
    return '' // Remove disallowed tags
  })

  return sanitized
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  className
}) => {
  // Handle ESC key press
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full bg-white rounded-lg shadow-xl transform transition-all',
            sizeClasses[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
              <h3 id="modal-title" className="text-lg font-semibold text-gray-900 font-thai">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                aria-label="ปิด"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {/* Close button (when no title) */}
          {!title && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100 z-10"
              aria-label="ปิด"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}

          {/* Content */}
          <div className={cn(
            'p-4 md:p-6',
            !title && 'pt-12' // Add top padding when no title
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Product Detail Modal specific component
interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: any
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  if (!product) return null



  // Determine if product is out of stock (check stock field directly)
  const isOutOfStock = product.stock !== undefined &&
    (product.stock === 0 || product.stock === '0' || product.stock === null)

  // Get appropriate price
  const getProductPrice = () => {
    // Prefer recommendedPrice if available, fallback to price
    return product.recommendedPrice || product.price
  }

  const getPriceLabel = () => {
    return product.recommendedPrice ? 'ราคาแนะนำ:' : 'ราคา:'
  }

  const getProductDescription = () => {
    // Check for des field first (app-premium products)
    if (product.des) {
      return product.des.trim()
    }

    // Check for info field (other product types)
    if (product.info) {
      return product.info.trim()
    }

    // Fallback to description field
    if (product.description) {
      return product.description.trim()
    }

    return ''
  }

  const getProductTypeDisplay = () => {
    // Check for type_app field first (app-premium products)
    if (product.type_app) {
      return product.type_app
    }

    // Check for category field
    if (product.category) {
      return product.category
    }

    // Fallback based on product type if available
    if (product.type) {
      switch (product.type) {
        case 'app-premium': return 'แอปพรีเมียม'
        case 'game': return 'เกม'
        case 'mobile': return 'เติมเงินมือถือ'
        case 'cashcard': return 'บัตรเงินสด'
        case 'preorder': return 'สินค้าพรีออเดอร์'
        default: return product.type
      }
    }

    // Final fallback
    return 'สินค้า'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      className="max-w-md mx-auto"
    >
      <div className="text-center space-y-4">
        {/* Product Image */}
        <div className="flex justify-center">
          <ProductImage
            src={product.img}
            alt={product.name}
            fallbackIcon={getProductFallbackIcon(product)}
            size="xl"
            className="rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          {/* Product Name */}
          <h3 className={cn(
            'text-xl md:text-2xl font-bold font-thai',
            isOutOfStock ? 'text-gray-500' : 'text-gray-900'
          )}>
            {product.name}
          </h3>

          {/* Product Description */}
          <div className="bg-gray-50 rounded-lg p-3 text-left">
            <h4 className="font-medium text-gray-700 font-thai text-sm mb-2">
              รายละเอียดสินค้า
            </h4>
            {(() => {
              const description = getProductDescription()
              if (!description) {
                return (
                  <div className="text-gray-600 font-thai text-sm leading-relaxed">
                    ไม่มีรายละเอียดสินค้า
                  </div>
                )
              }

              // Check if description contains HTML tags
              const hasHtmlTags = /<[^>]*>/g.test(description)

              if (hasHtmlTags) {
                // Sanitize and render HTML safely
                const sanitizedHtml = sanitizeHtml(description)
                return (
                  <div
                    className="text-gray-600 font-thai text-sm leading-relaxed [&>b]:font-bold [&>strong]:font-bold [&>i]:italic [&>em]:italic [&>u]:underline [&>p]:mb-2 [&>div]:mb-1"
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                  />
                )
              } else {
                // Render as plain text with whitespace preservation
                return (
                  <div className="text-gray-600 font-thai text-sm leading-relaxed whitespace-pre-line">
                    {description}
                  </div>
                )
              }
            })()}
          </div>

          {/* Stock Status for app-premium */}
          {product.type === 'app-premium' && product.stock !== undefined && product.stock !== null && (
            <div className={cn(
              'border rounded-lg p-3',
              isOutOfStock
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            )}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 font-thai text-sm">
                  สถานะสินค้า:
                </span>
                <span className={cn(
                  'font-thai text-sm font-medium',
                  isOutOfStock
                    ? 'text-red-800'
                    : 'text-blue-800'
                )}>
                  {isOutOfStock ? 'สินค้าหมด' : `คงเหลือ: ${product.stock} ชิ้น`}
                </span>
              </div>
            </div>
          )}

          {/* Product Type Badge */}
          <div className="flex justify-center">
            <span className={cn(
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-thai',
              product.type === 'app-premium' && 'bg-blue-100 text-blue-800',
              product.type === 'game' && 'bg-purple-100 text-purple-800',
              product.type === 'mobile' && 'bg-green-100 text-green-800',
              product.type === 'cashcard' && 'bg-orange-100 text-orange-800'
            )}>
              {getProductTypeDisplay()}
            </span>
          </div>

          {/* Price */}
          <div className={cn(
            'rounded-lg p-4',
            isOutOfStock
              ? 'bg-gray-100 border border-gray-200'
              : 'bg-primary-50 border border-primary-200'
          )}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 font-thai text-sm">
                {getPriceLabel()}
              </span>
              <p className={cn(
                'text-2xl md:text-3xl font-bold font-thai',
                isOutOfStock
                  ? 'text-gray-400'
                  : 'text-primary-600'
              )}>
                {formatCurrency(getProductPrice())}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-thai font-medium"
          >
            ปิด
          </button>
          <button
            className={cn(
              'flex-1 px-4 py-3 rounded-lg transition-colors font-thai font-medium',
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
            )}
            disabled={isOutOfStock}
            onClick={() => {
              if (isOutOfStock) return
              // Handle purchase logic here
              alert(`ซื้อ ${product.name} - ${formatCurrency(getProductPrice())}`)
              onClose()
            }}
          >
            {isOutOfStock ? 'สินค้าหมด' : 'ซื้อเลย'}
          </button>
        </div>
      </div>
    </Modal>
  )
}


