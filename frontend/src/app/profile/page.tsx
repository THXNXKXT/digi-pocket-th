import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import { 
  UserIcon,
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  EyeIcon,
  CreditCardIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const menuItems = [
  {
    id: 'edit-profile',
    title: 'แก้ไขโปรไฟล์',
    description: 'เปลี่ยนข้อมูลส่วนตัว',
    icon: PencilIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'security',
    title: 'ความปลอดภัย',
    description: 'รหัสผ่านและการยืนยันตัวตน',
    icon: ShieldCheckIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: 'payment',
    title: 'วิธีการชำระเงิน',
    description: 'จัดการบัญชีธนาคารและบัตร',
    icon: CreditCardIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    id: 'notifications',
    title: 'การแจ้งเตือน',
    description: 'ตั้งค่าการแจ้งเตือน',
    icon: BellIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    id: 'privacy',
    title: 'ความเป็นส่วนตัว',
    description: 'การใช้ข้อมูลและความเป็นส่วนตัว',
    icon: EyeIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  },
  {
    id: 'terms',
    title: 'ข้อกำหนดการใช้งาน',
    description: 'นโยบายและข้อกำหนด',
    icon: DocumentTextIcon,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  },
  {
    id: 'help',
    title: 'ช่วยเหลือ',
    description: 'คำถามที่พบบ่อยและการสนับสนุน',
    icon: QuestionMarkCircleIcon,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100'
  }
]

export default function ProfilePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b sticky top-0 z-30">
        <div className="px-4 py-4">
          <ThaiHeading level={2} className="text-center">
            โปรไฟล์
          </ThaiHeading>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b">
        <div className="container-custom py-8">
          <ThaiHeading level={1} className="text-center mb-4">
            โปรไฟล์ของฉัน
          </ThaiHeading>
          <ThaiText className="text-center text-lg max-w-2xl mx-auto">
            จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี
          </ThaiText>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-6 md:py-8 px-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <ThaiHeading level={2} className="text-xl md:text-2xl mb-2">
                ผู้ใช้งาน
              </ThaiHeading>
              <ThaiText className="text-gray-600 mb-1">
                user@example.com
              </ThaiText>
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  ยืนยันแล้ว
                </div>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  สมาชิกปกติ
                </div>
              </div>
            </div>
            
            {/* Edit Button */}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <PencilIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <ThaiText className="text-2xl font-bold text-gray-900">
                12
              </ThaiText>
              <ThaiText className="text-sm text-gray-500">
                คำสั่งซื้อ
              </ThaiText>
            </div>
            <div className="text-center">
              <ThaiText className="text-2xl font-bold text-gray-900">
                ฿2,750
              </ThaiText>
              <ThaiText className="text-sm text-gray-500">
                ยอดเงินคงเหลือ
              </ThaiText>
            </div>
            <div className="text-center">
              <ThaiText className="text-2xl font-bold text-gray-900">
                3
              </ThaiText>
              <ThaiText className="text-sm text-gray-500">
                เดือนที่ใช้งาน
              </ThaiText>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            
            return (
              <button
                key={item.id}
                className="w-full bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`w-6 h-6 ${item.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <ThaiHeading level={3} className="text-base mb-1">
                      {item.title}
                    </ThaiHeading>
                    <ThaiText className="text-sm text-gray-500">
                      {item.description}
                    </ThaiText>
                  </div>
                  
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button className="w-full bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 hover:bg-red-100 transition-colors group">
            <div className="flex items-center justify-center space-x-3">
              <ArrowRightOnRectangleIcon className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
              <ThaiText className="font-medium text-red-600">
                ออกจากระบบ
              </ThaiText>
            </div>
          </button>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center">
          <ThaiText className="text-sm text-gray-400">
            Digi-Pocket Thailand v1.0.0
          </ThaiText>
          <ThaiText className="text-xs text-gray-400 mt-1">
            © 2024 สงวนลิขสิทธิ์
          </ThaiText>
        </div>
      </div>
    </div>
  )
}
