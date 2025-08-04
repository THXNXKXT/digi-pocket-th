import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import { 
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

const orders = [
  {
    id: 'ORD-001',
    productName: 'Netflix Premium 1 เดือน',
    amount: 350,
    status: 'success',
    date: '2024-08-03T10:30:00',
    code: 'NF-XXXX-XXXX-XXXX'
  },
  {
    id: 'ORD-002',
    productName: 'เติมเงิน AIS 100 บาท',
    amount: 100,
    status: 'pending',
    date: '2024-08-03T09:15:00',
    code: null
  },
  {
    id: 'ORD-003',
    productName: 'Steam Wallet 500 บาท',
    amount: 500,
    status: 'failed',
    date: '2024-08-02T16:45:00',
    code: null
  },
  {
    id: 'ORD-004',
    productName: 'Spotify Premium 1 เดือน',
    amount: 129,
    status: 'success',
    date: '2024-08-02T14:20:00',
    code: 'SP-XXXX-XXXX-XXXX'
  },
]

const statusConfig = {
  success: {
    label: 'สำเร็จ',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
    iconColor: 'text-green-600'
  },
  pending: {
    label: 'รอดำเนินการ',
    color: 'bg-yellow-100 text-yellow-800',
    icon: ClockIcon,
    iconColor: 'text-yellow-600'
  },
  failed: {
    label: 'ล้มเหลว',
    color: 'bg-red-100 text-red-800',
    icon: XCircleIcon,
    iconColor: 'text-red-600'
  },
  refunded: {
    label: 'คืนเงินแล้ว',
    color: 'bg-blue-100 text-blue-800',
    icon: ArrowPathIcon,
    iconColor: 'text-blue-600'
  }
}

export default function OrdersPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b sticky top-0 z-30">
        <div className="px-4 py-4">
          <ThaiHeading level={2} className="text-center">
            คำสั่งซื้อ
          </ThaiHeading>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b">
        <div className="container-custom py-8">
          <ThaiHeading level={1} className="text-center mb-4">
            คำสั่งซื้อของฉัน
          </ThaiHeading>
          <ThaiText className="text-center text-lg max-w-2xl mx-auto">
            ติดตามสถานะและประวัติการสั่งซื้อของคุณ
          </ThaiText>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-6 md:py-8 px-4">
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          <button className="flex-1 py-2 px-4 rounded-md bg-white shadow-sm font-thai font-medium text-sm text-gray-900">
            ทั้งหมด
          </button>
          <button className="flex-1 py-2 px-4 rounded-md font-thai font-medium text-sm text-gray-600 hover:text-gray-900">
            สำเร็จ
          </button>
          <button className="flex-1 py-2 px-4 rounded-md font-thai font-medium text-sm text-gray-600 hover:text-gray-900">
            รอดำเนินการ
          </button>
          <button className="flex-1 py-2 px-4 rounded-md font-thai font-medium text-sm text-gray-600 hover:text-gray-900">
            ล้มเหลว
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status as keyof typeof statusConfig]
            const StatusIcon = config.icon

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <ThaiText className="font-medium text-sm text-gray-900">
                        {order.id}
                      </ThaiText>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon className={`w-3 h-3 mr-1 ${config.iconColor}`} />
                        {config.label}
                      </div>
                    </div>
                    
                    <ThaiHeading level={3} className="text-base mb-2">
                      {order.productName}
                    </ThaiHeading>
                    
                    <ThaiText className="text-sm text-gray-500 mb-3">
                      {new Date(order.date).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </ThaiText>
                  </div>
                  
                  <div className="text-right">
                    <ThaiText className="font-bold text-lg text-gray-900">
                      ฿{order.amount.toLocaleString()}
                    </ThaiText>
                  </div>
                </div>

                {/* Order Code */}
                {order.code && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <ThaiText className="text-xs text-gray-600 mb-1">
                      รหัสสินค้า:
                    </ThaiText>
                    <div className="flex items-center justify-between">
                      <ThaiText className="font-mono text-sm font-medium">
                        {order.code}
                      </ThaiText>
                      <button className="text-primary-600 text-xs font-medium hover:text-primary-700 transition-colors">
                        คัดลอก
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-thai font-medium text-sm hover:bg-gray-200 transition-colors">
                    ดูรายละเอียด
                  </button>
                  
                  {order.status === 'success' && (
                    <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-thai font-medium text-sm hover:bg-primary-700 transition-colors">
                      ซื้อซ้ำ
                    </button>
                  )}
                  
                  {order.status === 'failed' && (
                    <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-thai font-medium text-sm hover:bg-red-700 transition-colors">
                      ลองใหม่
                    </button>
                  )}
                  
                  {order.status === 'pending' && (
                    <button className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg font-thai font-medium text-sm hover:bg-yellow-700 transition-colors">
                      ติดตาม
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State (if no orders) */}
        {orders.length === 0 && (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <ThaiHeading level={3} className="text-gray-500 mb-2">
              ยังไม่มีคำสั่งซื้อ
            </ThaiHeading>
            <ThaiText className="text-gray-400 mb-6">
              เริ่มช้อปปิ้งเพื่อดูคำสั่งซื้อของคุณที่นี่
            </ThaiText>
            <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-thai font-medium hover:bg-primary-700 transition-colors">
              เริ่มช้อปปิ้ง
            </button>
          </div>
        )}

        {/* Load More */}
        {orders.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-thai font-medium hover:bg-gray-50 transition-colors">
              โหลดเพิ่มเติม
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
