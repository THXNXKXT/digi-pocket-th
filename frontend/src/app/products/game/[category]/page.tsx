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
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { Product } from '@/types/api'
import { orderService, CreateOrderRequest } from '@/services/order.service'

interface PriceOption {
  id: string
  productId: string
  productName: string
  amount: number
  price: number // ราคาขาย (recommendedPrice)
  discount?: number
  isRecommended?: boolean // ไม่ใช้แล้ว
  product: Product
}

export default function GameCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryName = decodeURIComponent(params.category as string)
  
  const { data: gameProducts, isLoading, error, refetch } = useProductsByCategory('game')
  const [selectedPriceOption, setSelectedPriceOption] = useState<PriceOption | null>(null)
  const [uid, setUid] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc') // asc = ต่ำไปสูง, desc = สูงไปต่ำ

  // Filter products by category
  const categoryProducts = useMemo(() => {
    if (!gameProducts) return []
    
    return gameProducts.filter(product => 
      (product.category || 'อื่นๆ') === categoryName
    )
  }, [gameProducts, categoryName])

  // Generate price options from all products in category (เฉพาะ recommendedPrice)
  const priceOptions = useMemo((): PriceOption[] => {
    if (!categoryProducts) return []

    const options: PriceOption[] = []

    categoryProducts.forEach(product => {
      // แสดงเฉพาะ recommendedPrice (ราคาขาย)
      if (product.recommendedPrice) {
        options.push({
          id: `${product.id}-recommended`,
          productId: product.id,
          productName: product.name,
          amount: parseFloat(product.recommendedPrice),
          price: parseFloat(product.recommendedPrice),
          discount: product.discount ? parseFloat(product.discount) : undefined,
          isRecommended: false, // ไม่แสดง badge
          product
        })
      }
    })

    // Sort by price based on sortOrder
    return options.sort((a, b) => {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    })
  }, [categoryProducts, sortOrder])

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
    if (!selectedPriceOption) return
    
    if (!validateUid(uid)) return
    
    setIsSubmitting(true)
    
    try {
      const orderData: CreateOrderRequest = {
        productId: selectedPriceOption.productId,
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

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom px-4 max-w-4xl mx-auto">
          <ProductCategoryError
            categoryName={categoryName}
            onRetry={refetch}
          />
        </div>
      </div>
    )
  }

  if (categoryProducts.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom px-4 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <PuzzlePieceIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <ThaiHeading level={3} className="text-gray-500 mb-2">
              ไม่พบสินค้าในหมวดหมู่ {categoryName}
            </ThaiHeading>
            <ThaiText className="text-gray-400 mb-6">
              ขณะนี้ยังไม่มีสินค้าเกมในหมวดหมู่นี้
            </ThaiText>
            <Button variant="outline" asChild>
              <Link href="/products/game">
                กลับไปดูหมวดหมู่อื่น
              </Link>
            </Button>
          </div>
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
                href="/products/game"
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
          
          <div className="text-center">
            {/* แสดงรูปจากสินค้าตัวแรกในหมวดหมู่ */}
            {categoryProducts.length > 0 && (
              <div className="flex justify-center mb-4">
                <ProductImage
                  src={categoryProducts[0].img}
                  alt={categoryName}
                  fallbackIcon={getProductFallbackIcon(categoryProducts[0])}
                  size="xl"
                />
              </div>
            )}

            <ThaiHeading level={1} className="mb-2">
              {categoryName}
            </ThaiHeading>
            <ThaiText className="text-gray-600 mb-6">
              กรอก UID และเลือกแพ็กเกจที่ต้องการ
            </ThaiText>
          </div>
        </div>

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

        {/* วิธีการเติมเกม */}
        <Card className="mb-8 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-thai text-amber-800 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              วิธีการเติมเกม
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-base leading-none mt-0.5">•</span>
                <ThaiText className="text-amber-900 leading-relaxed">
                  กรุณาใส่เลข ID กดดูได้ที่ (ตัวอย่างเลข UID)
                </ThaiText>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-base leading-none mt-0.5">•</span>
                <ThaiText className="text-amber-900 leading-relaxed">
                  <span className="font-semibold text-red-700">หากลูกค้ากรอกเลข ID มาผิด</span> ทางเราจะไม่รับผิดชอบและไม่มีการคืนเงินใดๆทั้งสิ้น
                </ThaiText>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-base leading-none mt-0.5">•</span>
                <ThaiText className="text-amber-900 leading-relaxed">
                  บริการนี้เป็นระบบอัตโนมัติ ระบบอาจใช้เวลาดำเนินการ <span className="font-semibold">1 - 2 นาที</span>
                </ThaiText>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-base leading-none mt-0.5">•</span>
                <ThaiText className="text-amber-900 leading-relaxed">
                  <span className="font-semibold text-red-700">ไม่มีการยกเลิกรายการ</span> หรือ ขอคืนเครดิตหลังการทำรายการแล้ว
                </ThaiText>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Options */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-thai">
                  เลือกแพ็กเกจ
                </CardTitle>
                <ThaiText className="text-sm text-gray-500 mt-1">
                  พบ {priceOptions.length} แพ็กเกจ
                </ThaiText>
              </div>

              {/* Filter Icon */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="filter-icon-container flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                title={sortOrder === 'asc' ? 'เรียงราคาต่ำไปสูง (กดเพื่อเปลี่ยน)' : 'เรียงราคาสูงไปต่ำ (กดเพื่อเปลี่ยน)'}
              >
                <div className="relative">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                  <span className="absolute -top-1 -right-1 text-xs font-bold text-primary-600">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                </div>
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {priceOptions.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    "cursor-pointer transition-all border-2",
                    selectedPriceOption?.id === option.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => setSelectedPriceOption(option)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <ThaiText className="font-bold text-primary-600 text-xl">
                          {formatCurrency(option.amount)}
                        </ThaiText>
                        {selectedPriceOption?.id === option.id && (
                          <CheckCircleIcon className="w-6 h-6 text-primary-600 ml-2 flex-shrink-0" />
                        )}
                      </div>

                      {/* Product Info/Description */}
                      {option.product.info && (
                        <div
                          className="text-gray-600 text-sm line-clamp-4"
                          dangerouslySetInnerHTML={{ __html: option.product.info }}
                        />
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
