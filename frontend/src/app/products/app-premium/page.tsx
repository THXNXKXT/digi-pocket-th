'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductImage, getProductFallbackIcon } from '@/components/ui/product-image'
import { CategorySectionSkeleton, ProductCategoryError } from '@/components/ui'
import { useProductsByCategory } from '@/hooks/useProducts'
import { HomeIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function AppPremiumCategoriesPage() {
  const { data: appPremiumProducts, isLoading, error, refetch } = useProductsByCategory('app-premium')

  // Group products by type_app and get one preview product per category
  const appPremiumCategories = useMemo(() => {
    if (!appPremiumProducts) return []

    const categoryMap = new Map()

    appPremiumProducts.forEach(product => {
      const category = product.type_app || product.category || 'อื่นๆ'
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
  }, [appPremiumProducts])



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
          
          <ThaiHeading level={1} className="mb-4">
            หมวดหมู่แอปพรีเมียม
          </ThaiHeading>
          <ThaiText className="text-gray-600 mb-6">
            เลือกหมวดหมู่แอปพรีเมียมที่ต้องการ แต่ละหมวดหมู่มีสินค้าหลากหลายให้เลือก
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
        {appPremiumCategories.length > 0 ? (
          <section>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {appPremiumCategories.map((category) => (
                <Card
                  key={category.name}
                  className="group hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="text-center pb-3 md:pb-4">
                    <div className="flex justify-center mb-3 md:mb-4">
                      <ProductImage
                        src={category.previewProduct.img}
                        alt={category.previewProduct.name}
                        fallbackIcon={getProductFallbackIcon(category.previewProduct)}
                        size="lg"
                        className="rounded-lg"
                      />
                    </div>

                    <CardTitle className="text-base md:text-xl font-thai mb-1 md:mb-2 line-clamp-2">
                      {category.name}
                    </CardTitle>
                    <ThaiText className="text-sm md:text-base text-gray-500">
                      {category.productCount} สินค้า
                    </ThaiText>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Button
                      asChild
                      className="w-full font-thai group-hover:bg-primary-700"
                    >
                      <Link
                        href={`/products/app-premium/${encodeURIComponent(category.name)}`}
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
            <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <ThaiHeading level={3} className="text-gray-500 mb-2">
              ไม่พบหมวดหมู่แอปพรีเมียม
            </ThaiHeading>
            <ThaiText className="text-gray-400">
              ขณะนี้ยังไม่มีสินค้าแอปพรีเมียมในระบบ
            </ThaiText>
          </div>
        )}

        {/* Summary */}
        {appPremiumCategories.length > 0 && (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <ThaiText className="text-gray-600">
                รวมทั้งหมด <span className="font-bold text-primary-600">{appPremiumCategories.length}</span> หมวดหมู่ 
                และ <span className="font-bold text-primary-600">{appPremiumProducts?.length || 0}</span> สินค้า
              </ThaiText>
            </div>
          </div>
        )}


      </div>
    </div>
  )
}
