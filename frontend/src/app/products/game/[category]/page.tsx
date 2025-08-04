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
import { HomeIcon, ArrowLeftIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline'

export default function GameCategoryPage() {
  const params = useParams()
  const categoryName = decodeURIComponent(params.category as string)
  
  const { data: gameProducts, isLoading, error, refetch } = useProductsByCategory('game')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter products by category
  const categoryProducts = useMemo(() => {
    if (!gameProducts) return []
    
    return gameProducts.filter(product => 
      (product.category || 'อื่นๆ') === categoryName
    )
  }, [gameProducts, categoryName])

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
            categoryName="เกม"
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
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full">
              <PuzzlePieceIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <ThaiHeading level={1} className="mb-2">
            {categoryName}
          </ThaiHeading>
          <ThaiText className="text-gray-600 mb-6">
            สินค้าเกมในหมวดหมู่ {categoryName} ทั้งหมด {categoryProducts.length} รายการ
          </ThaiText>
          
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link 
                href="/products/game"
                className="inline-flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4 flex-shrink-0" />
                <span className="leading-none">กลับหมวดหมู่เกม</span>
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
              {categoryProducts.map((product) => (
                <Card
                  key={product.id}
                  className="transition-shadow cursor-pointer group hover:shadow-md"
                  onClick={() => handleProductClick(product)}
                >
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
                      
                      <ThaiText className="font-medium text-sm md:text-base mb-2 line-clamp-2">
                        {product.name}
                      </ThaiText>
                      
                      <ThaiText className="font-bold text-primary-600 text-sm mb-3">
                        {formatCurrency(
                          product.recommendedPrice || product.price
                        )}
                      </ThaiText>
                      
                      <Button
                        size="sm"
                        className="w-full text-xs font-thai"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProductClick(product)
                        }}
                      >
                        ดูรายละเอียด
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-12">
            <PuzzlePieceIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <ThaiHeading level={3} className="text-gray-500 mb-2">
              ไม่พบสินค้าในหมวดหมู่นี้
            </ThaiHeading>
            <ThaiText className="text-gray-400 mb-6">
              ขณะนี้ยังไม่มีสินค้าเกมในหมวดหมู่ "{categoryName}"
            </ThaiText>
            <Button variant="outline" asChild>
              <Link href="/products/game">
                กลับไปดูหมวดหมู่อื่น
              </Link>
            </Button>
          </div>
        )}

        {/* Category Info */}
        {categoryProducts.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
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
                    {Math.min(...categoryProducts.map(p => 
                      parseFloat(p.recommendedPrice || p.price || '0')
                    )).toLocaleString()}
                  </ThaiText>
                  <ThaiText className="text-gray-600 text-sm">
                    ราคาเริ่มต้น (บาท)
                  </ThaiText>
                </div>
                <div>
                  <ThaiText className="text-2xl font-bold text-orange-600">
                    {Math.max(...categoryProducts.map(p => 
                      parseFloat(p.recommendedPrice || p.price || '0')
                    )).toLocaleString()}
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
