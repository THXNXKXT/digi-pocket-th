'use client'

import { useState } from 'react'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductDetailModal } from '@/components/ui/modal'
import Link from 'next/link'
import { HomeIcon } from '@heroicons/react/24/outline'

// Test products with different HTML content
const testProducts = [
  {
    id: 'test-1',
    name: 'สินค้าทดสอบ HTML Tags',
    type: 'game',
    price: '100',
    img: '',
    info: `<b>ข้อมูลสำคัญ:</b> สินค้านี้มีคุณภาพสูง
<br />
<strong>คุณสมบัติ:</strong>
<br />• <i>ใช้งานง่าย</i>
<br />• <u>ราคาประหยัด</u>
<br />• <em>คุณภาพดี</em>

<p>รายละเอียดเพิ่มเติม:</p>
<div>- สามารถใช้งานได้ทันที</div>
<div>- รับประกัน 30 วัน</div>`,
    category: 'ทดสอบ'
  },
  {
    id: 'test-2',
    name: 'สินค้าทดสอบ Plain Text',
    type: 'mobile',
    price: '50',
    img: '',
    info: `ข้อมูลสำคัญ: สินค้านี้มีคุณภาพสูง

คุณสมบัติ:
• ใช้งานง่าย
• ราคาประหยัด
• คุณภาพดี

รายละเอียดเพิ่มเติม:
- สามารถใช้งานได้ทันที
- รับประกัน 30 วัน`,
    category: 'ทดสอบ'
  },
  {
    id: 'test-3',
    name: 'สินค้าทดสอบ Mixed Content',
    type: 'cashcard',
    price: '200',
    img: '',
    info: `<b>โปรโมชั่นพิเศษ!</b>

ซื้อวันนี้ได้รับ:
<br />• <strong>ส่วนลด 20%</strong>
<br />• <i>ของแถมฟรี</i>

เงื่อนไข:
- ใช้ได้ถึง 31 ธันวาคม
- <u>ไม่สามารถใช้ร่วมกับโปรอื่น</u>

<p><em>*เงื่อนไขเป็นไปตามที่บริษัทกำหนด</em></p>`,
    category: 'ทดสอบ'
  },
  {
    id: 'test-4',
    name: 'แอปพรีเมียม ทดสอบ des field',
    type: 'app-premium',
    price: '350',
    stock: 5,
    img: '',
    des: `✔️ สามารถรับชมผ่านทีวีได้
❌ ห้ามฝ่าฝืนกฎหรือสลับอุปกรณ์
✔️ สามารถเปลี่ยนชื่อโปรไฟล์และ PIN ได้
✔️ บัญชีต่างประเทศ (International Account) 100%

⚠️ กรุณารอตามเวลาที่แจ้ง

ข้อแตกต่าง:
แอคนอก - ตัดสกุลเงินต่างประเทศ
แอคไทย - ตัดเงินไทย`,
    type_app: 'Netflix',
    category: 'Streaming'
  }
]

export default function TestHtmlModalPage() {
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
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <ThaiHeading level={1} className="mb-4">
            ทดสอบ HTML Rendering ใน Modal
          </ThaiHeading>
          <ThaiText className="text-gray-600 mb-6">
            ทดสอบการแสดงผล HTML tags ในรายละเอียดสินค้า
          </ThaiText>
          <Button variant="outline" size="sm" asChild>
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2"
            >
              <HomeIcon className="w-4 h-4 flex-shrink-0" />
              <span className="leading-none">กลับหน้าแรก</span>
            </Link>
          </Button>
        </div>

        {/* Test Products */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleProductClick(product)}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-thai">
                    {product.name}
                  </CardTitle>
                  <ThaiText className="text-sm text-gray-500">
                    ประเภท: {product.type} | ราคา: ฿{product.price}
                  </ThaiText>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <ThaiText className="font-medium text-sm mb-2">
                        ตัวอย่างเนื้อหา:
                      </ThaiText>
                      <div className="bg-gray-100 p-3 rounded text-xs max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-mono">
                          {product.type === 'app-premium' ? product.des : product.info}
                        </pre>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      className="w-full font-thai"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleProductClick(product)
                      }}
                    >
                      ทดสอบ Modal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">คำแนะนำการทดสอบ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <ThaiText className="font-medium mb-2">🎯 สิ่งที่ต้องตรวจสอบ:</ThaiText>
                  <ul className="space-y-1 text-sm text-gray-600 ml-4">
                    <li>• <strong>HTML Tags:</strong> `&lt;b&gt;`, `&lt;strong&gt;`, `&lt;i&gt;`, `&lt;em&gt;`, `&lt;u&gt;` แสดงผลถูกต้อง</li>
                    <li>• <strong>Line Breaks:</strong> `&lt;br /&gt;` ขึ้นบรรทัดใหม่</li>
                    <li>• <strong>Paragraphs:</strong> `&lt;p&gt;` และ `&lt;div&gt;` มี spacing ที่เหมาะสม</li>
                    <li>• <strong>Plain Text:</strong> ข้อความธรรมดายังคง whitespace และ line breaks</li>
                    <li>• <strong>App Premium:</strong> ใช้ `des` field (plain text)</li>
                    <li>• <strong>Other Types:</strong> ใช้ `info` field (HTML support)</li>
                  </ul>
                </div>
                
                <div>
                  <ThaiText className="font-medium mb-2">🔒 ความปลอดภัย:</ThaiText>
                  <ul className="space-y-1 text-sm text-gray-600 ml-4">
                    <li>• Script tags ถูกลบออก</li>
                    <li>• Event handlers ถูกลบออก</li>
                    <li>• เฉพาะ HTML tags ที่ปลอดภัยเท่านั้น</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <ThaiText className="font-medium text-blue-800 mb-1">💡 Expected Results:</ThaiText>
                  <ThaiText className="text-blue-700 text-sm">
                    สินค้าที่มี HTML tags ควรแสดงผลเป็น formatted text (bold, italic, underline) 
                    ส่วนสินค้าที่เป็น plain text ควรแสดงผลปกติพร้อม line breaks
                  </ThaiText>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
