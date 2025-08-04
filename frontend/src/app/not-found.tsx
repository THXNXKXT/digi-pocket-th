import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-6xl font-bold text-primary-600 mb-4">404</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          ไม่พบหน้าที่ต้องการ
        </h2>
        <p className="text-gray-600 mb-6">
          ขออภัย เราไม่พบหน้าที่คุณกำลังมองหา กรุณาตรวจสอบ URL หรือกลับไปหน้าหลัก
        </p>
        <div className="space-y-3">
          <Link href="/" className="w-full">
            <Button className="w-full">กลับหน้าหลัก</Button>
          </Link>
          <Link href="/products" className="w-full">
            <Button variant="outline" className="w-full">ดูสินค้า</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
