'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductDetailModal } from '@/components/ui/modal'
import { ProductImage, getProductFallbackIcon } from '@/components/ui/product-image'
import { CategorySectionSkeleton, ProductCategoryError } from '@/components/ui'
import { useProductsByCategory } from '@/hooks/useProducts'
import { formatCurrency, cn } from '@/lib/utils'
import { HomeIcon, ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function AppPremiumCategoryPage() {
  const params = useParams()
  const categoryName = decodeURIComponent(params.category as string)
  
  const { data: appPremiumProducts, isLoading, error, refetch } = useProductsByCategory('app-premium')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter products by type_app or category
  const categoryProducts = useMemo(() => {
    if (!appPremiumProducts) return []
    
    return appPremiumProducts.filter(product => 
      (product.type_app || product.category || 'อื่นๆ') === categoryName
    )
  }, [appPremiumProducts, categoryName])

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom px-4 max-w-6xl mx-auto">
          <CategorySectionSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom px-4 max-w-6xl mx-auto">
          <ProductCategoryError
            categoryName="แอปพรีเมียม"
            onRetry={refetch}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <ThaiHeading level={1} className="mb-2">
            {categoryName}
          </ThaiHeading>
          <ThaiText className="text-gray-600 mb-6">
            สินค้าแอปพรีเมียมในหมวดหมู่ {categoryName} ทั้งหมด {categoryProducts.length} รายการ
          </ThaiText>
          
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link 
                href="/products/app-premium"
                className="inline-flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4 flex-shrink-0" />
                <span className="leading-none">กลับหมวดหมู่แอปพรีเมียม</span>
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

        {/* Products Grid */}
        {categoryProducts.length > 0 ? (
          <section>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categoryProducts.map((product) => {
                const isOutOfStock = product.stock === 0 || product.stock === '0' || !product.stock

                return (
                  <Card
                    key={product.id}
                    className={cn(
                      "transition-shadow cursor-pointer group relative",
                      isOutOfStock ? "opacity-60 hover:shadow-sm" : "hover:shadow-md"
                    )}
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Out of stock overlay */}
                    {isOutOfStock && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-thai">
                          หมด
                        </span>
                      </div>
                    )}

                    <CardContent className="p-3 md:p-4">
                      <div className="text-center">
                        <div className="mb-3 transition-transform group-hover:scale-110 flex justify-center">
                          <ProductImage
                            src={product.img}
                            alt={product.name}
                            fallbackIcon={getProductFallbackIcon(product)}
                            size="xl"
                          />
                        </div>
                        
                        <ThaiText className={cn(
                          "font-medium text-sm md:text-base mb-2 line-clamp-2",
                          isOutOfStock && "text-gray-500"
                        )}>
                          {product.name}
                        </ThaiText>

                        {/* Stock Status */}
                        {product.stock !== undefined && product.stock !== null && (
                          <ThaiText className={cn(
                            'text-xs mb-2',
                            isOutOfStock ? 'text-red-500 font-medium' : 'text-gray-500'
                          )}>
                            {isOutOfStock ? 'สินค้าหมด' : `คงเหลือ: ${product.stock} ชิ้น`}
                          </ThaiText>
                        )}
                        
                        <ThaiText className={cn(
                          "font-bold text-sm mb-3",
                          isOutOfStock ? "text-gray-400" : "text-primary-600"
                        )}>
                          {formatCurrency(product.price)}
                        </ThaiText>
                        
                        <Button
                          size="sm"
                          className="w-full text-xs font-thai"
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleProductClick(product)
                          }}
                        >
                          {isOutOfStock ? 'สินค้าหมด' : 'ดูรายละเอียด'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        ) : (
          <div className="text-center py-12">
            <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <ThaiHeading level={3} className="text-gray-500 mb-2">
              ไม่พบสินค้าในหมวดหมู่นี้
            </ThaiHeading>
            <ThaiText className="text-gray-400 mb-6">
              ขณะนี้ยังไม่มีสินค้าแอปพรีเมียมในหมวดหมู่ "{categoryName}"
            </ThaiText>
            <Button variant="outline" asChild>
              <Link href="/products/app-premium">
                กลับไปดูหมวดหมู่อื่น
              </Link>
            </Button>
          </div>
        )}

        {/* Category Info */}
        {categoryProducts.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <ThaiText className="text-2xl font-bold text-primary-600">
                    {categoryProducts.length}
                  </ThaiText>
                  <ThaiText className="text-gray-600 text-sm">
                    สินค้าทั้งหมด
                  </ThaiText>
                </div>
                <div>
                  <ThaiText className="text-2xl font-bold text-green-600">
                    {categoryProducts.filter(p => p.stock > 0).length}
                  </ThaiText>
                  <ThaiText className="text-gray-600 text-sm">
                    สินค้าพร้อมขาย
                  </ThaiText>
                </div>
                <div>
                  <ThaiText className="text-2xl font-bold text-orange-600">
                    {Math.min(...categoryProducts.map(p => parseFloat(p.price || '0'))).toLocaleString()}
                  </ThaiText>
                  <ThaiText className="text-gray-600 text-sm">
                    ราคาเริ่มต้น (บาท)
                  </ThaiText>
                </div>
                <div>
                  <ThaiText className="text-2xl font-bold text-purple-600">
                    {Math.max(...categoryProducts.map(p => parseFloat(p.price || '0'))).toLocaleString()}
                  </ThaiText>
                  <ThaiText className="text-gray-600 text-sm">
                    ราคาสูงสุด (บาท)
                  </ThaiText>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Detail Modal */}
        <ProductDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={selectedProduct}
        />
      </div>
    </div>
  )
}
