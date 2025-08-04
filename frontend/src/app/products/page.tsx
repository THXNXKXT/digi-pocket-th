import Link from 'next/link'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import {
  ShoppingBagIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

const productCategories = [
  {
    id: 'app-premium',
    name: 'แอปพรีเมียม',
    description: 'แอปพลิเคชันพรีเมียมคุณภาพสูง',
    icon: RocketLaunchIcon,
    color: 'bg-blue-500',
    count: '50+ แอป',
    href: '/products/app-premium',
    available: true,
  },
  {
    id: 'game',
    name: 'เกม',
    description: 'เกมและไอเทมในเกม',
    icon: PuzzlePieceIcon,
    color: 'bg-purple-500',
    count: '100+ เกม',
    href: '/products/game',
    available: true,
  },
  {
    id: 'mobile',
    name: 'เติมเงินมือถือ',
    description: 'เติมเงินมือถือทุกเครือข่าย',
    icon: DevicePhoneMobileIcon,
    color: 'bg-green-500',
    count: 'ทุกเครือข่าย',
    href: '/products/mobile',
    available: true,
  },
  {
    id: 'cashcard',
    name: 'บัตรเงินสด',
    description: 'บัตรเงินสดและบัตรของขวัญ',
    icon: CreditCardIcon,
    color: 'bg-orange-500',
    count: '20+ ประเภท',
    href: '/products/cashcard',
    available: true,
  },
]

export default function ProductsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b sticky top-0 z-30">
        <div className="px-4 py-4">
          <ThaiHeading level={2} className="text-center">
            สินค้า
          </ThaiHeading>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b">
        <div className="container-custom py-8">
          <ThaiHeading level={1} className="text-center mb-4">
            สินค้าและบริการ
          </ThaiHeading>
          <ThaiText className="text-center text-lg max-w-2xl mx-auto">
            เลือกซื้อสินค้าดิจิทัลคุณภาพสูงจากหมวดหมู่ต่างๆ
          </ThaiText>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-6 md:py-8 px-4">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-thai"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Product Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {productCategories.map((category) => {
            const IconComponent = category.icon

            const CategoryCard = (
              <div
                className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all cursor-pointer group ${
                  category.available
                    ? 'hover:shadow-md'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center mb-4 transition-transform ${
                    category.available ? 'group-hover:scale-110' : ''
                  }`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <ThaiHeading level={3} className="text-lg mb-2">
                    {category.name}
                  </ThaiHeading>

                  <ThaiText className="text-sm text-gray-600 mb-3">
                    {category.description}
                  </ThaiText>

                  <div className={`px-3 py-1 rounded-full ${
                    category.available ? 'bg-gray-100' : 'bg-gray-50'
                  }`}>
                    <ThaiText className={`text-xs font-medium ${
                      category.available ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      {category.available ? category.count : 'เร็วๆ นี้'}
                    </ThaiText>
                  </div>
                </div>
              </div>
            )

            return (
              <div key={category.id}>
                {category.available ? (
                  <Link href={category.href}>
                    {CategoryCard}
                  </Link>
                ) : (
                  CategoryCard
                )}
              </div>
            )
          })}
        </div>

        {/* Popular Products Section */}
        <div className="mt-8 md:mt-12">
          <ThaiHeading level={2} className="mb-6">
            สินค้ายอดนิยม
          </ThaiHeading>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                </div>
                <ThaiText className="font-medium text-sm mb-1 line-clamp-2">
                  สินค้าตัวอย่าง {item}
                </ThaiText>
                <ThaiText className="text-xs text-gray-500 mb-2">
                  หมวดหมู่สินค้า
                </ThaiText>
                <div className="flex items-center justify-between">
                  <ThaiText className="font-bold text-primary-600 text-sm">
                    ฿99
                  </ThaiText>
                  <button className="bg-primary-600 text-white px-3 py-1 rounded text-xs font-thai hover:bg-primary-700 transition-colors">
                    ซื้อ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
