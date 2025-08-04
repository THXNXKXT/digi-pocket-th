'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductDetailModal } from '@/components/ui/modal'
import { ProductImage, getProductFallbackIcon } from '@/components/ui/product-image'
import { CategorySectionSkeleton, ProductCategoryError } from '@/components/ui'
import { useProductsByCategory } from '@/hooks/useProducts'
import { formatCurrency, cn } from '@/lib/utils'
import { HomeIcon, ArrowRightIcon, CreditCardIcon } from '@heroicons/react/24/outline'

export default function CashCardCategoriesPage() {
  const { data: cashCardProducts, isLoading, error, refetch } = useProductsByCategory('cashcard')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Group products by category and get one preview product per category
  const cashCardCategories = useMemo(() => {
    if (!cashCardProducts) return []

    const categoryMap = new Map()
    
    cashCardProducts.forEach(product => {
      const category = product.category || 'อื่นๆ'
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          name: category,
          previewProduct: product,
          productCount: 1
        })
      } else {
        const existing = categoryMap.get(category)
        existing.productCount += 1
      }
    })

    return Array.from(categoryMap.values()).sort((a, b) => 
      b.productCount - a.productCount // Sort by product count descending
    )
  }, [cashCardProducts])

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
            categoryName="บัตรเงินสด"
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
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full">
              <CreditCardIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <ThaiHeading level={1} className="mb-4">
            หมวดหมู่บัตรเงินสด
          </ThaiHeading>
          <ThaiText className="text-gray-600 mb-6">
            เลือกหมวดหมู่บัตรเงินสดที่ต้องการ แต่ละหมวดหมู่มีสินค้าหลากหลายให้เลือก
          </ThaiText>
          
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link 
                href="/"
                className="inline-flex items-center justify-center gap-2"
              >
                <HomeIcon className="w-4 h-4 flex-shrink-0" />
                <span className="leading-none">กลับหน้าแรก</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link 
                href="/products"
                className="inline-flex items-center justify-center gap-2"
              >
                <span className="leading-none">สินค้าทั้งหมด</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Categories Grid */}
        {cashCardCategories.length > 0 ? (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cashCardCategories.map((category) => (
                <Card
                  key={category.name}
                  className="group hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-thai text-center">
                      {category.name}
                    </CardTitle>
                    <ThaiText className="text-sm text-gray-500 text-center">
                      {category.productCount} สินค้า
                    </ThaiText>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Preview Product */}
                    <div 
                      className="text-center mb-4 cursor-pointer"
                      onClick={() => handleProductClick(category.previewProduct)}
                    >
                      <div className="mb-3 transition-transform group-hover:scale-105 flex justify-center">
                        <ProductImage
                          src={category.previewProduct.img}
                          alt={category.previewProduct.name}
                          fallbackIcon={getProductFallbackIcon(category.previewProduct)}
                          size="xl"
                        />
                      </div>
                      
                      <ThaiText className="font-medium text-sm mb-2 line-clamp-2">
                        {category.previewProduct.name}
                      </ThaiText>
                      
                      <ThaiText className="font-bold text-primary-600 text-sm">
                        {formatCurrency(
                          category.previewProduct.recommendedPrice || 
                          category.previewProduct.price
                        )}
                      </ThaiText>
                    </div>

                    {/* View Category Button */}
                    <Button 
                      asChild 
                      className="w-full font-thai group-hover:bg-primary-700"
                    >
                      <Link 
                        href={`/products/cashcard/${encodeURIComponent(category.name)}`}
                        className="inline-flex items-center justify-center gap-2"
                      >
                        <span>ดูสินค้าทั้งหมด</span>
                        <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-12">
            <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <ThaiHeading level={3} className="text-gray-500 mb-2">
              ไม่พบหมวดหมู่บัตรเงินสด
            </ThaiHeading>
            <ThaiText className="text-gray-400">
              ขณะนี้ยังไม่มีสินค้าบัตรเงินสดในระบบ
            </ThaiText>
          </div>
        )}

        {/* Summary */}
        {cashCardCategories.length > 0 && (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <ThaiText className="text-gray-600">
                รวมทั้งหมด <span className="font-bold text-primary-600">{cashCardCategories.length}</span> หมวดหมู่ 
                และ <span className="font-bold text-primary-600">{cashCardProducts?.length || 0}</span> สินค้า
              </ThaiText>
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
