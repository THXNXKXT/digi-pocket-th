'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductImage, getProductFallbackIcon } from '@/components/ui/product-image'
import { CategorySectionSkeleton, ProductCategoryError } from '@/components/ui'
import { useProductsByCategory } from '@/hooks/useProducts'
import { formatCurrency, cn } from '@/lib/utils'
import { 
  HomeIcon, 
  ArrowLeftIcon, 
  PuzzlePieceIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Product } from '@/types/api'
import { orderService, CreateOrderRequest } from '@/services/order.service'

interface PriceOption {
  id: string
  amount: number
  price: number
  discount?: number
  isRecommended?: boolean
}

export default function GameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const categoryName = decodeURIComponent(params.category as string)
  const productId = params.productId as string
  
  const { data: gameProducts, isLoading, error, refetch } = useProductsByCategory('game')
  const [selectedPriceOption, setSelectedPriceOption] = useState<PriceOption | null>(null)
  const [uid, setUid] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Find the specific product
  const product = useMemo(() => {
    if (!gameProducts) return null
    return gameProducts.find(p => p.id === productId) || null
  }, [gameProducts, productId])

  // Generate price options from product data
  const priceOptions = useMemo((): PriceOption[] => {
    if (!product) return []
    
    const options: PriceOption[] = []
    
    // Main price option
    if (product.price) {
      options.push({
        id: 'main',
        amount: parseFloat(product.price),
        price: parseFloat(product.price),
        discount: product.discount ? parseFloat(product.discount) : undefined,
        isRecommended: true
      })
    }
    
    // Recommended price option (if different from main price)
    if (product.recommendedPrice && product.recommendedPrice !== product.price) {
      options.push({
        id: 'recommended',
        amount: parseFloat(product.recommendedPrice),
        price: parseFloat(product.recommendedPrice),
        isRecommended: false
      })
    }
    
    // VIP price option
    if (product.priceVip) {
      options.push({
        id: 'vip',
        amount: parseFloat(product.priceVip),
        price: parseFloat(product.priceVip),
        isRecommended: false
      })
    }
    
    // Agent price option
    if (product.agentPrice) {
      options.push({
        id: 'agent',
        amount: parseFloat(product.agentPrice),
        price: parseFloat(product.agentPrice),
        isRecommended: false
      })
    }
    
    // Sort by price (lowest to highest)
    return options.sort((a, b) => a.price - b.price)
  }, [product])

  const validateUid = (value: string): boolean => {
    if (!value.trim()) {
      setValidationError('กรุณากรอก UID/Game ID')
      return false
    }
    
    if (value.length < 3) {
      setValidationError('UID/Game ID ต้องมีอย่างน้อย 3 ตัวอักษร')
      return false
    }
    
    setValidationError('')
    return true
  }

  const handleUidChange = (value: string) => {
    setUid(value)
    if (validationError) {
      validateUid(value)
    }
  }

  const handleSubmitOrder = async () => {
    if (!selectedPriceOption || !product) return
    
    if (!validateUid(uid)) return
    
    setIsSubmitting(true)
    
    try {
      const orderData: CreateOrderRequest = {
        productId: product.id,
        quantity: 1,
        unitPrice: selectedPriceOption.price,
        uid: uid.trim()
      }

      console.log('Creating order:', orderData)

      // Create order via API
      const response = await orderService.createOrder(orderData)

      if (response.success) {
        // Redirect to order confirmation or orders page
        router.push(`/orders/${response.data.id}`)
      } else {
        throw new Error(response.message || 'Failed to create order')
      }

    } catch (error: any) {
      console.error('Failed to create order:', error)
      setValidationError(error.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom px-4 max-w-4xl mx-auto">
          <CategorySectionSkeleton />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom px-4 max-w-4xl mx-auto">
          <ProductCategoryError
            categoryName="เกม"
            onRetry={refetch}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom px-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-center gap-2 mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link 
                href={`/products/game/${encodeURIComponent(categoryName)}`}
                className="inline-flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4 flex-shrink-0" />
                <span className="leading-none">กลับหมวดหมู่</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link 
                href="/"
                className="inline-flex items-center justify-center gap-2"
              >
                <HomeIcon className="w-4 h-4 flex-shrink-0" />
                <span className="leading-none">หน้าแรก</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Product Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ProductImage
                src={product.img}
                alt={product.name}
                fallbackIcon={getProductFallbackIcon(product)}
                size="2xl"
              />
            </div>
            <CardTitle className="text-xl md:text-2xl font-thai">
              {product.name}
            </CardTitle>
            {product.info && (
              <div 
                className="text-gray-600 text-sm mt-2"
                dangerouslySetInnerHTML={{ __html: product.info }}
              />
            )}
          </CardHeader>
        </Card>

        {/* UID Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-thai">
              ข้อมูลผู้เล่น
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="uid" className="text-sm font-medium">
                  UID/Game ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="uid"
                  type="text"
                  placeholder="กรอก UID หรือ Game ID ของคุณ"
                  value={uid}
                  onChange={(e) => handleUidChange(e.target.value)}
                  className={cn(
                    "mt-1",
                    validationError && "border-red-500 focus:border-red-500"
                  )}
                />
                {validationError && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-thai">
              เลือกแพ็กเกจ
            </CardTitle>
            <ThaiText className="text-gray-600">
              เลือกแพ็กเกจที่ต้องการ (เรียงจากราคาต่ำไปสูง)
            </ThaiText>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {priceOptions.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    "cursor-pointer transition-all border-2",
                    selectedPriceOption?.id === option.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300",
                    option.isRecommended && "ring-2 ring-primary-200"
                  )}
                  onClick={() => setSelectedPriceOption(option)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <ThaiText className="font-medium">
                            {formatCurrency(option.amount)}
                          </ThaiText>
                          {option.isRecommended && (
                            <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
                              แนะนำ
                            </span>
                          )}
                        </div>
                        {option.discount && (
                          <ThaiText className="text-green-600 text-sm">
                            ส่วนลด {option.discount}%
                          </ThaiText>
                        )}
                      </div>
                      {selectedPriceOption?.id === option.id && (
                        <CheckCircleIcon className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="text-center space-y-4">
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="text-sm">{validationError}</span>
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full md:w-auto px-8 font-thai min-w-[200px]"
            disabled={!selectedPriceOption || !uid.trim() || isSubmitting}
            onClick={handleSubmitOrder}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                กำลังดำเนินการ...
              </>
            ) : (
              <>
                สั่งซื้อ {selectedPriceOption ? formatCurrency(selectedPriceOption.price) : ''}
                {selectedPriceOption && (
                  <span className="ml-2 text-xs opacity-90">
                    ({selectedPriceOption.isRecommended ? 'แนะนำ' : 'ปกติ'})
                  </span>
                )}
              </>
            )}
          </Button>

          {!selectedPriceOption && (
            <ThaiText className="text-gray-500 text-sm">
              กรุณาเลือกแพ็กเกจก่อนสั่งซื้อ
            </ThaiText>
          )}
        </div>
      </div>
    </div>
  )
}
