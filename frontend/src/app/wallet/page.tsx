import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import { 
  WalletIcon, 
  PlusIcon, 
  MinusIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

const recentTransactions = [
  {
    id: 1,
    type: 'deposit',
    amount: 1000,
    description: 'ฝากเงินผ่านสลิป',
    date: '2024-08-03T10:30:00',
    status: 'completed'
  },
  {
    id: 2,
    type: 'purchase',
    amount: -250,
    description: 'ซื้อแอปพรีเมียม',
    date: '2024-08-03T09:15:00',
    status: 'completed'
  },
  {
    id: 3,
    type: 'deposit',
    amount: 500,
    description: 'ฝากเงินผ่านสลิป',
    date: '2024-08-02T16:45:00',
    status: 'pending'
  },
]

export default function WalletPage() {
  const balance = 2750

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b sticky top-0 z-30">
        <div className="px-4 py-4">
          <ThaiHeading level={2} className="text-center">
            กระเป๋าเงิน
          </ThaiHeading>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b">
        <div className="container-custom py-8">
          <ThaiHeading level={1} className="text-center mb-4">
            กระเป๋าเงินดิจิทัล
          </ThaiHeading>
          <ThaiText className="text-center text-lg max-w-2xl mx-auto">
            จัดการยอดเงินและธุรกรรมของคุณ
          </ThaiText>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-6 md:py-8 px-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 md:p-8 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <WalletIcon className="w-8 h-8" />
              <ThaiText className="text-white/90 font-medium">
                ยอดเงินคงเหลือ
              </ThaiText>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mb-6">
            <ThaiHeading level={1} className="text-white text-3xl md:text-4xl mb-2">
              ฿{balance.toLocaleString()}
            </ThaiHeading>
            <ThaiText className="text-white/80 text-sm">
              อัพเดทล่าสุด: วันนี้ 14:30 น.
            </ThaiText>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center space-x-2 hover:bg-white/30 transition-colors">
              <PlusIcon className="w-5 h-5" />
              <ThaiText className="font-medium text-white">
                ฝากเงิน
              </ThaiText>
            </button>
            <button className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center space-x-2 hover:bg-white/30 transition-colors">
              <MinusIcon className="w-5 h-5" />
              <ThaiText className="font-medium text-white">
                ถอนเงิน
              </ThaiText>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CreditCardIcon className="w-6 h-6 text-green-600" />
            </div>
            <ThaiText className="text-sm font-medium text-center">
              ฝากด้วยสลิป
            </ThaiText>
          </button>
          
          <button className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BanknotesIcon className="w-6 h-6 text-blue-600" />
            </div>
            <ThaiText className="text-sm font-medium text-center">
              โอนเงิน
            </ThaiText>
          </button>
          
          <button className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ArrowUpIcon className="w-6 h-6 text-purple-600" />
            </div>
            <ThaiText className="text-sm font-medium text-center">
              ประวัติ
            </ThaiText>
          </button>
          
          <button className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <WalletIcon className="w-6 h-6 text-orange-600" />
            </div>
            <ThaiText className="text-sm font-medium text-center">
              ตั้งค่า
            </ThaiText>
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <ThaiHeading level={3} className="text-lg">
              ธุรกรรมล่าสุด
            </ThaiHeading>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 md:p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'deposit' 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    {transaction.type === 'deposit' ? (
                      <ArrowDownIcon className={`w-5 h-5 ${
                        transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    ) : (
                      <ArrowUpIcon className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  
                  <div>
                    <ThaiText className="font-medium text-sm">
                      {transaction.description}
                    </ThaiText>
                    <ThaiText className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </ThaiText>
                  </div>
                </div>
                
                <div className="text-right">
                  <ThaiText className={`font-bold text-sm ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}฿{Math.abs(transaction.amount).toLocaleString()}
                  </ThaiText>
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.status === 'completed' ? 'สำเร็จ' : 'รอดำเนินการ'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 md:p-6 border-t border-gray-100">
            <button className="w-full text-center text-primary-600 font-medium font-thai text-sm hover:text-primary-700 transition-colors">
              ดูธุรกรรมทั้งหมด
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
