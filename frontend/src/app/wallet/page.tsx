'use client'

import { useRouter } from 'next/navigation'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useWalletBalance, useWalletTransactions } from '@/hooks/useWallet'
import { useUserDeposits } from '@/hooks/useDeposit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { formatCurrency, cn } from '@/lib/utils'
import {
  WalletIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  MinusIcon,
  ClockIcon,
  ArrowPathIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

export default function WalletPage() {
  const router = useRouter()
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useWalletBalance()
  const { data: transactions, isLoading: transactionsLoading } = useWalletTransactions(10)
  const { data: depositsData } = useUserDeposits({ limit: 50 })

  const handleDepositClick = () => {
    router.push('/deposit')
  }



  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownIcon className="w-5 h-5 text-green-600" />
      case 'withdraw':
        return <ArrowUpIcon className="w-5 h-5 text-red-600" />
      case 'purchase':
        return <MinusIcon className="w-5 h-5 text-red-600" />
      case 'refund':
        return <ArrowPathIcon className="w-5 h-5 text-blue-600" />
      default:
        return <WalletIcon className="w-5 h-5 text-gray-600" />
    }
  }



  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'ฝากเงิน'
      case 'withdraw':
        return 'ถอนเงิน'
      case 'purchase':
        return 'ซื้อสินค้า'
      case 'refund':
        return 'คืนเงิน'
      default:
        return 'ธุรกรรม'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'สำเร็จ'
      case 'failed':
        return 'ไม่สำเร็จ'
      case 'pending':
        return 'รอดำเนินการ'
      default:
        return status
    }
  }

  if (balanceLoading) {
    return (
      <ProtectedRoute>
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <ThaiText className="text-gray-600">กำลังโหลดข้อมูลกระเป๋าเงิน...</ThaiText>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (balanceError) {
    return (
      <ProtectedRoute>
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ThaiText className="text-red-600">เกิดข้อผิดพลาดในการโหลดข้อมูลกระเป๋าเงิน</ThaiText>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="bg-gray-50 min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b sticky top-0 z-30">
          <div className="px-4 py-4">
            <ThaiHeading level={2} className="text-center">กระเป๋าเงิน</ThaiHeading>
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
        <div className="container-custom py-6 md:py-8 px-4 space-y-6">

          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            <CardContent className="p-6 md:p-8 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <WalletIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <ThaiText className="text-white/90 text-sm">
                      ยอดเงินคงเหลือ
                    </ThaiText>
                    <ThaiText className="text-white font-medium">
                      กระเป๋าเงินดิจิทัล
                    </ThaiText>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <BanknotesIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <ThaiHeading level={1} className="text-white text-4xl md:text-5xl mb-2 font-bold">
                  {formatCurrency(balance?.balance || 0)}
                </ThaiHeading>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <ThaiText className="text-white/80 text-sm">
                    อัพเดทล่าสุด: {new Date().toLocaleString('th-TH')}
                  </ThaiText>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleDepositClick}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 h-14 font-medium transition-all duration-200 hover:scale-105"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  ฝากเงิน
                </Button>
                <Button
                  variant="ghost"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 h-14 font-medium transition-all duration-200 hover:scale-105"
                  onClick={() => router.push('/orders')}
                >
                  <BanknotesIcon className="w-5 h-5 mr-2" />
                  ซื้อสินค้า
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {(transactions && transactions.length > 0) || (depositsData?.deposits && depositsData.deposits.length > 0) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ArrowDownIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {depositsData?.deposits ?
                        depositsData.deposits.filter(d => d.status === 'verified').length :
                        transactions?.filter(t => t.type === 'deposit' && t.status === 'completed').length || 0
                      }
                    </div>
                    <div className="text-sm text-gray-600">ฝากเงินสำเร็จ</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MinusIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {transactions?.filter(t => t.type === 'purchase' && t.status === 'completed').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">ซื้อสินค้า</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {depositsData?.deposits ?
                        depositsData.deposits.filter(d => d.status === 'pending' || d.status === 'uploaded').length :
                        transactions?.filter(t => t.status === 'pending').length || 0
                      }
                    </div>
                    <div className="text-sm text-gray-600">รอดำเนินการ</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BanknotesIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(
                        depositsData?.deposits ?
                          depositsData.deposits
                            .filter(d => d.status === 'verified')
                            .reduce((sum, d) => sum + d.amount, 0) :
                          0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">ฝากเงินรวม</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Recent Deposits */}
          {depositsData?.deposits && depositsData.deposits.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <ArrowDownIcon className="w-5 h-5 text-green-600" />
                    </div>
                    การฝากเงินล่าสุด
                  </CardTitle>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {Math.min(depositsData.deposits.length, 5)} รายการล่าสุด
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-green-600 hover:text-green-800"
                      onClick={() => router.push('/deposit/history')}
                    >
                      ดูทั้งหมด
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {depositsData.deposits.slice(0, 5).map((deposit) => (
                    <div
                      key={deposit.id}
                      className="group relative p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Deposit Icon */}
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                            deposit.status === 'verified' ? "bg-green-100" :
                            deposit.status === 'pending' || deposit.status === 'uploaded' ? "bg-yellow-100" :
                            "bg-red-100"
                          )}>
                            <ArrowDownIcon className={cn(
                              "w-5 h-5",
                              deposit.status === 'verified' ? "text-green-600" :
                              deposit.status === 'pending' || deposit.status === 'uploaded' ? "text-yellow-600" :
                              "text-red-600"
                            )} />
                          </div>

                          {/* Deposit Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <ThaiText className="font-semibold text-gray-900">
                                ฝากเงิน
                              </ThaiText>
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full font-medium",
                                deposit.status === 'verified' ? "bg-green-100 text-green-700" :
                                deposit.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                                deposit.status === 'uploaded' ? "bg-blue-100 text-blue-700" :
                                "bg-red-100 text-red-700"
                              )}>
                                {deposit.status === 'verified' ? 'สำเร็จ' :
                                 deposit.status === 'pending' ? 'รอดำเนินการ' :
                                 deposit.status === 'uploaded' ? 'รอตรวจสอบ' :
                                 deposit.status === 'rejected' ? 'ไม่สำเร็จ' :
                                 deposit.status === 'cancelled' ? 'ยกเลิก' :
                                 deposit.status === 'expired' ? 'หมดอายุ' :
                                 'ไม่ทราบสถานะ'}
                              </span>
                            </div>

                            <ThaiText className="text-sm text-gray-600 mb-2">
                              {deposit.bankName} - {deposit.accountNumber}
                            </ThaiText>

                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{new Date(deposit.createdAt).toLocaleString('th-TH')}</span>
                              {deposit.slipId && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600">✅ อัพโหลดสลิปแล้ว</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right ml-4">
                          <ThaiText className="font-bold text-xl text-green-600">
                            +{formatCurrency(deposit.amount)}
                          </ThaiText>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction History */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  ประวัติการทำธุรกรรม
                </CardTitle>
                {transactions && transactions.length > 0 && (
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {transactions.length} รายการล่าสุด
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      onClick={() => router.push('/wallet/history')}
                    >
                      ดูทั้งหมด
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                  <ThaiText className="text-gray-600">กำลังโหลดประวัติ...</ThaiText>
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="group relative p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Transaction Icon */}
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                            transaction.type === 'deposit' ? "bg-green-100" :
                            transaction.type === 'purchase' ? "bg-blue-100" :
                            transaction.type === 'refund' ? "bg-purple-100" :
                            "bg-gray-100"
                          )}>
                            {getTransactionIcon(transaction.type)}
                          </div>

                          {/* Transaction Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <ThaiText className="font-semibold text-gray-900">
                                {getTransactionTypeText(transaction.type)}
                              </ThaiText>
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full font-medium",
                                transaction.status === 'completed' ? "bg-green-100 text-green-700" :
                                transaction.status === 'failed' ? "bg-red-100 text-red-700" :
                                "bg-yellow-100 text-yellow-700"
                              )}>
                                {getStatusText(transaction.status)}
                              </span>
                            </div>

                            <ThaiText className="text-sm text-gray-600 mb-2">
                              {transaction.description || 'ไม่มีรายละเอียด'}
                            </ThaiText>

                            {/* Status Messages */}
                            {transaction.status === 'failed' && transaction.type === 'deposit' && (
                              <div className="flex items-center gap-1 text-xs text-red-600 mb-1">
                                <span>💡</span>
                                <span>หากมีปัญหาการฝากเงิน กรุณาติดต่อเจ้าหน้าที่</span>
                              </div>
                            )}
                            {transaction.status === 'pending' && transaction.type === 'deposit' && (
                              <div className="flex items-center gap-1 text-xs text-yellow-600 mb-1">
                                <span>⏳</span>
                                <span>กำลังตรวจสอบการโอนเงิน โปรดรอสักครู่</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{new Date(transaction.createdAt).toLocaleString('th-TH')}</span>
                              {transaction.type === 'deposit' && transaction.status === 'completed' && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600">✅ เข้าบัญชีแล้ว</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right ml-4">
                          <ThaiText className={cn(
                            "font-bold text-xl",
                            transaction.amount > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </ThaiText>
                        </div>
                      </div>

                      {/* Hover indicator */}
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <WalletIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <ThaiText className="text-gray-500 text-lg mb-2">ยังไม่มีประวัติการทำธุรกรรม</ThaiText>
                  <ThaiText className="text-gray-400 text-sm mb-6">เริ่มต้นใช้งานด้วยการฝากเงินเข้ากระเป๋า</ThaiText>
                  <Button
                    onClick={handleDepositClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    ฝากเงินครั้งแรก
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
