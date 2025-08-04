'use client'

import Link from 'next/link'
import {
  ShoppingBagIcon,
  WalletIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  GiftIcon
} from '@heroicons/react/24/outline'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCategoryIcons, CategorySectionSkeleton, ProductCategoryError, ProductDetailModal } from '@/components/ui'
import { ProductImage, getProductFallbackIcon } from '@/components/ui/product-image'
import { useProducts, useResponsiveProductCount } from '@/hooks'
import { formatCurrency, cn } from '@/lib/utils'
import { useState } from 'react'

// Category configuration
const categories = [
  {
    id: 'app-premium' as const,
    name: 'แอปพรีเมียม',
    description: 'แอปพลิเคชันพรีเมียมยอดนิยม',
    icon: ProductCategoryIcons.appPremium,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'game' as const,
    name: 'เกม',
    description: 'เกมและไอเทมในเกม',
    icon: ProductCategoryIcons.game,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'mobile' as const,
    name: 'เติมเงินมือถือ',
    description: 'เติมเงินมือถือทุกเครือข่าย',
    icon: ProductCategoryIcons.mobile,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'cashcard' as const,
    name: 'บัตรเงินสด',
    description: 'บัตรเงินสดและบัตรของขวัญ',
    icon: ProductCategoryIcons.cashCard,
    color: 'from-orange-500 to-orange-600',
  },
]



export default function HomePage() {
  const { productCount } = useResponsiveProductCount()
  const { data: productsData, isLoading, error, refetch } = useProducts(productCount)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Mobile Header - only show on mobile */}
      <header className="md:hidden bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 font-thai">Digi-Pocket</h1>
                <p className="text-xs text-gray-500 font-thai">Thailand</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium font-thai px-2 py-1"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header - handled by DesktopHeader component */}

      {/* Promotional Banner - Below headers */}
      <section className="py-3 md:py-4 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="container-custom px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <ThaiText className="text-white font-semibold text-xs md:text-base">
                  🎉 โปรโมชั่นพิเศษ! ลดราคา 10% สำหรับสมาชิกใหม่
                </ThaiText>
                <ThaiText className="text-white/80 text-xs md:text-sm">
                  ใช้โค้ด WELCOME10 รับส่วนลดทันที
                </ThaiText>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="font-thai hidden sm:flex text-xs md:text-sm">
              รับโค้ด
            </Button>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-8 md:py-20">
        <div className="container-custom text-center px-4">
          <ThaiHeading level={1} className="mb-4 md:mb-6 text-3xl md:text-5xl lg:text-6xl">
            ตลาดดิจิทัลครบครัน
            <span className="text-primary-600 block">สำหรับคนไทย</span>
          </ThaiHeading>
          <ThaiText className="text-base md:text-xl mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
            ซื้อแอปพรีเมียม เกม เติมเงินมือถือ และบัตรเงินสด
            ได้ง่ายๆ ปลอดภัย ราคาดี พร้อมส่งทันที
          </ThaiText>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Button size="lg" className="font-thai" asChild>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span className="leading-none">เริ่มช้อปปิ้ง</span>
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="font-thai" asChild>
              <Link
                href="/wallet"
                className="inline-flex items-center justify-center gap-2"
              >
                <WalletIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span className="leading-none">เติมเงิน</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Product Categories Showcase */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container-custom px-4">
          <div className="text-center mb-8 md:mb-12">
            <ThaiHeading level={2} className="mb-4">
              สินค้ายอดนิยม
            </ThaiHeading>
            <ThaiText className="text-lg max-w-2xl mx-auto text-gray-600">
              เลือกซื้อสินค้าดิจิทัลคุณภาพสูงจากหมวดหมู่ต่างๆ ส่งทันที ราคาดี
            </ThaiText>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-8 md:space-y-12">
              {categories.map((category) => (
                <CategorySectionSkeleton key={category.id} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <ProductCategoryError
              categoryName="สินค้า"
              onRetry={refetch}
            />
          )}

          {/* Products Data */}
          {productsData && (
            <div className="space-y-8 md:space-y-12">
              {categories.map((category) => {
                const IconComponent = category.icon
                const categoryProducts = productsData[category.id] || []

                return (
                  <div key={category.id} className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <ThaiHeading level={3} className="text-lg md:text-xl">
                            {category.name}
                          </ThaiHeading>
                          <ThaiText className="text-sm text-gray-500">
                            {category.description}
                          </ThaiText>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="font-thai" asChild>
                        <Link
                          href="/products"
                          className="inline-flex items-center justify-center gap-1.5"
                        >
                          <span className="leading-none">ดูเพิ่มเติม</span>
                          <ArrowRightIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        </Link>
                      </Button>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                      {categoryProducts.length > 0 ? (
                        categoryProducts.map((product) => {
                          const isOutOfStock = category.id === 'app-premium' &&
                            (product.stock === 0 || product.stock === '0' || !product.stock)

                          return (
                            <Card
                              key={product.id}
                              className={cn(
                                'transition-shadow cursor-pointer group relative',
                                isOutOfStock
                                  ? 'opacity-60 hover:shadow-sm'
                                  : 'hover:shadow-md'
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
                                  <div className={cn(
                                    'mb-3 transition-transform flex justify-center',
                                    !isOutOfStock && 'group-hover:scale-110'
                                  )}>
                                    <ProductImage
                                      src={product.img}
                                      alt={product.name}
                                      fallbackIcon={getProductFallbackIcon(product)}
                                      size="xl"
                                    />
                                  </div>
                                  <ThaiText className={cn(
                                    'font-medium text-sm md:text-base mb-1 line-clamp-2',
                                    isOutOfStock && 'text-gray-500'
                                  )}>
                                    {product.name}
                                  </ThaiText>

                                  {/* Stock display for app-premium */}
                                  {category.id === 'app-premium' && product.stock !== undefined && product.stock !== null && (
                                    <ThaiText className={cn(
                                      'text-xs mb-2',
                                      isOutOfStock
                                        ? 'text-red-500 font-medium'
                                        : 'text-gray-500'
                                    )}>
                                      {isOutOfStock ? 'สินค้าหมด' : `คงเหลือ: ${product.stock} ชิ้น`}
                                    </ThaiText>
                                  )}

                                  <div className="flex items-center justify-between mt-2">
                                    <ThaiText className={cn(
                                      'font-bold text-sm md:text-base',
                                      isOutOfStock
                                        ? 'text-gray-400'
                                        : 'text-primary-600'
                                    )}>
                                      {formatCurrency(
                                        category.id === 'app-premium'
                                          ? product.price
                                          : (product.recommendedPrice || product.price)
                                      )}
                                    </ThaiText>
                                    <Button
                                      size="sm"
                                      className={cn(
                                        'text-xs font-thai px-2 py-1 h-6 min-w-[40px]',
                                        isOutOfStock && 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                                      )}
                                      disabled={isOutOfStock}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (!isOutOfStock) {
                                          handleProductClick(product)
                                        }
                                      }}
                                    >
                                      {isOutOfStock ? 'หมด' : 'ซื้อ'}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <ThaiText className="text-gray-500">
                            ไม่มีสินค้าในหมวดนี้ในขณะนี้
                          </ThaiText>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* View All Products CTA */}
          <div className="text-center mt-8 md:mt-12">
            <Button size="lg" className="font-thai" asChild>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span className="leading-none">ดูสินค้าทั้งหมด</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container-custom px-4">
          <div className="text-center mb-8 md:mb-12">
            <ThaiHeading level={2} className="mb-4">
              ทำไมต้องเลือกเรา?
            </ThaiHeading>
            <ThaiText className="text-lg max-w-2xl mx-auto text-gray-600">
              เราคือตลาดดิจิทัลที่ใหญ่ที่สุดในประเทศไทย
            </ThaiText>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {/* Fast Delivery */}
            <div className="text-center p-4 md:p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
              </div>
              <ThaiHeading level={4} className="text-sm md:text-base mb-2">
                ส่งทันที
              </ThaiHeading>
              <ThaiText className="text-xs md:text-sm text-gray-600">
                รับสินค้าภายใน 5 นาที
              </ThaiText>
            </div>

            {/* Secure Payment */}
            <div className="text-center p-4 md:p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <ThaiHeading level={4} className="text-sm md:text-base mb-2">
                ปลอดภัย 100%
              </ThaiHeading>
              <ThaiText className="text-xs md:text-sm text-gray-600">
                ระบบรักษาความปลอดภัยระดับสูง
              </ThaiText>
            </div>

            {/* 24/7 Support */}
            <div className="text-center p-4 md:p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <UserGroupIcon className="w-6 h-6 text-purple-600" />
              </div>
              <ThaiHeading level={4} className="text-sm md:text-base mb-2">
                ช่วยเหลือ 24/7
              </ThaiHeading>
              <ThaiText className="text-xs md:text-sm text-gray-600">
                ทีมงานพร้อมช่วยเหลือตลอดเวลา
              </ThaiText>
            </div>

            {/* Best Price */}
            <div className="text-center p-4 md:p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <GiftIcon className="w-6 h-6 text-orange-600" />
              </div>
              <ThaiHeading level={4} className="text-sm md:text-base mb-2">
                ราคาดีที่สุด
              </ThaiHeading>
              <ThaiText className="text-xs md:text-sm text-gray-600">
                รับประกันราคาถูกที่สุด
              </ThaiText>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-primary-600">
        <div className="container-custom px-4">
          <div className="text-center mb-8">
            <ThaiHeading level={2} className="text-white mb-2">
              ตัวเลขที่น่าประทับใจ
            </ThaiHeading>
            <ThaiText className="text-primary-100">
              ความไว้วางใจจากลูกค้าหลายแสนคน
            </ThaiText>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center text-white">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">50,000+</div>
              <ThaiText className="text-primary-100 text-sm md:text-base">ลูกค้าที่ไว้วางใจ</ThaiText>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">1,000+</div>
              <ThaiText className="text-primary-100 text-sm md:text-base">สินค้าดิจิทัล</ThaiText>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <ThaiText className="text-primary-100 text-sm md:text-base">บริการลูกค้า</ThaiText>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">99.9%</div>
              <ThaiText className="text-primary-100 text-sm md:text-base">ความพึงพอใจ</ThaiText>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <WalletIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Digi-Pocket Thailand</span>
              </div>
              <p className="text-gray-400 text-sm">
                แพลตฟอร์มตลาดดิจิทัลที่ครบครันสำหรับประเทศไทย
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">ผลิตภัณฑ์</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/products/app-premium" className="hover:text-white">แอปพรีเมียม</Link></li>
                <li><Link href="/products/game" className="hover:text-white">เกม</Link></li>
                <li><Link href="/products/mobile" className="hover:text-white">เติมเงินมือถือ</Link></li>
                <li><Link href="/products/cashcard" className="hover:text-white">บัตรเงินสด</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">บริการ</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/wallet" className="hover:text-white">กระเป๋าเงิน</Link></li>
                <li><Link href="/orders" className="hover:text-white">คำสั่งซื้อ</Link></li>
                <li><Link href="/support" className="hover:text-white">ช่วยเหลือ</Link></li>
                <li><Link href="/api-docs" className="hover:text-white">API Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">ติดต่อเรา</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>อีเมล: support@digi-pocket-th.com</li>
                <li>โทร: +66-XXX-XXX-XXXX</li>
                <li>เวลาทำการ: 9:00 - 18:00 น.</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Digi-Pocket Thailand. สงวนลิขสิทธิ์.</p>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </div>
  )
}
