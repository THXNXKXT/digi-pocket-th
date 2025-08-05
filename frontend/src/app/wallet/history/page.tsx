'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useWalletTransactions } from '@/hooks/useWallet'
import { useUserDeposits } from '@/hooks/useDeposit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency, cn } from '@/lib/utils'
import {
  WalletIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  MinusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function WalletHistoryPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  // Load transactions and deposits for history page with pagination
  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useWalletTransactions(50)
  const { data: depositsData, isLoading: depositsLoading, error: depositsError } = useUserDeposits({
    limit: 100,
    page: 1
  })

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
      case 'verified':
        return 'สำเร็จ'
      case 'pending':
      case 'uploaded':
        return 'รอดำเนินการ'
      case 'failed':
      case 'rejected':
        return 'ไม่สำเร็จ'
      case 'expired':
        return 'หมดอายุ'
      default:
        return status
    }
  }

  // Combine transactions and deposits into a unified list
  const getAllActivities = () => {
    const activities: any[] = []

    // Add wallet transactions
    if (transactions) {
      transactions.forEach(transaction => {
        activities.push({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          status: transaction.status,
          description: transaction.description || getTransactionTypeText(transaction.type),
          createdAt: transaction.createdAt,
          source: 'transaction'
        })
      })
    }

    // Add deposit records
    if (depositsData?.deposits) {
      depositsData.deposits.forEach(deposit => {
        activities.push({
          id: deposit.id,
          type: 'deposit',
          amount: deposit.amount,
          status: deposit.status,
          description: `ฝากเงินผ่าน ${deposit.bankName}`,
          createdAt: deposit.createdAt,
          source: 'deposit',
          bankName: deposit.bankName,
          accountNumber: deposit.accountNumber,
          slipId: deposit.slipId
        })
      })
    }

    // Sort by creation date (newest first)
    return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const allActivities = getAllActivities()

  // Filter all activities
  const filteredActivities = allActivities.filter(activity => {
    const matchesSearch = !searchTerm ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTransactionTypeText(activity.type).toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || activity.type === filterType
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Pagination logic
  const totalItems = filteredActivities.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex)

  // Reset to first page when filters change
  const handleFilterChange = (newFilterType?: string, newFilterStatus?: string, newSearchTerm?: string) => {
    if (newFilterType !== undefined) setFilterType(newFilterType)
    if (newFilterStatus !== undefined) setFilterStatus(newFilterStatus)
    if (newSearchTerm !== undefined) setSearchTerm(newSearchTerm)
    setCurrentPage(1)
  }

  const isLoading = transactionsLoading || depositsLoading
  const error = transactionsError || depositsError

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <ThaiText className="text-gray-600">กำลังโหลดประวัติธุรกรรม...</ThaiText>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ThaiText className="text-red-600">เกิดข้อผิดพลาดในการโหลดประวัติธุรกรรม</ThaiText>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-30">
          <div className="container-custom py-4 px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                กลับ
              </Button>
              <div>
                <ThaiHeading level={2} className="text-xl">ประวัติการทำธุรกรรม</ThaiHeading>
                <ThaiText className="text-sm text-gray-600">
                  ดูประวัติการทำธุรกรรมทั้งหมดของคุณ
                </ThaiText>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-custom py-6 px-4 space-y-6">

          {/* Summary Statistics */}
          {allActivities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <ArrowDownIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          allActivities
                            .filter(a => a.type === 'deposit' && a.status === 'verified')
                            .reduce((sum, a) => sum + a.amount, 0)
                        )}
                      </div>
                      <div className="text-sm text-gray-600">ฝากเงินรวม</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <MinusIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(
                          Math.abs(allActivities
                            .filter(a => (a.type === 'purchase' || a.type === 'withdraw') && a.status === 'completed')
                            .reduce((sum, a) => sum + a.amount, 0))
                        )}
                      </div>
                      <div className="text-sm text-gray-600">ใช้จ่ายรวม</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {allActivities.length}
                      </div>
                      <div className="text-sm text-gray-600">กิจกรรมทั้งหมด</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {allActivities.filter(a => a.status === 'pending' || a.status === 'uploaded').length}
                      </div>
                      <div className="text-sm text-gray-600">รอดำเนินการ</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5" />
                  ค้นหาและกรองข้อมูล
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Export functionality
                    const csvContent = [
                      ['วันที่', 'ประเภท', 'รายละเอียด', 'จำนวนเงิน', 'สถานะ'],
                      ...filteredActivities.map(a => [
                        new Date(a.createdAt).toLocaleString('th-TH'),
                        getTransactionTypeText(a.type),
                        a.description || 'ไม่มีรายละเอียด',
                        formatCurrency(a.amount),
                        getStatusText(a.status)
                      ])
                    ].map(row => row.join(',')).join('\n')

                    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = `wallet-history-${new Date().toISOString().split('T')[0]}.csv`
                    link.click()
                  }}
                  className="flex items-center gap-2"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  ส่งออก CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="ค้นหาธุรกรรม..."
                  value={searchTerm}
                  onChange={(e) => handleFilterChange(undefined, undefined, e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">ประเภทธุรกรรม</label>
                  <select
                    value={filterType}
                    onChange={(e) => handleFilterChange(e.target.value, undefined, undefined)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="deposit">ฝากเงิน</option>
                    <option value="withdraw">ถอนเงิน</option>
                    <option value="purchase">ซื้อสินค้า</option>
                    <option value="refund">คืนเงิน</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">สถานะ</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(undefined, e.target.value, undefined)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="completed">สำเร็จ</option>
                    <option value="pending">รอดำเนินการ</option>
                    <option value="failed">ไม่สำเร็จ</option>
                  </select>
                </div>
              </div>
              
              {/* Results count and page size */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  พบ {filteredActivities.length} รายการ จากทั้งหมด {allActivities.length} รายการ
                  {filteredActivities.length > 0 && (
                    <span className="ml-2">
                      (แสดงหน้า {currentPage} จาก {totalPages} หน้า)
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  แสดง {pageSize} รายการต่อหน้า
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                รายการธุรกรรม
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paginatedActivities.length > 0 ? (
                <div className="space-y-3">
                  {paginatedActivities.map((activity) => (
                    <div
                      key={`${activity.source}-${activity.id}`}
                      className="group relative p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Activity Icon */}
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                            activity.type === 'deposit' ? "bg-green-100" :
                            activity.type === 'purchase' ? "bg-blue-100" :
                            activity.type === 'refund' ? "bg-purple-100" :
                            "bg-gray-100"
                          )}>
                            {getTransactionIcon(activity.type)}
                          </div>
                          
                          {/* Activity Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <ThaiText className="font-semibold text-gray-900">
                                {getTransactionTypeText(activity.type)}
                              </ThaiText>
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full font-medium",
                                (activity.status === 'completed' || activity.status === 'verified') ? "bg-green-100 text-green-700" :
                                activity.status === 'failed' ? "bg-red-100 text-red-700" :
                                "bg-yellow-100 text-yellow-700"
                              )}>
                                {getStatusText(activity.status)}
                              </span>
                              {activity.source === 'deposit' && (
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                  ฝากเงิน
                                </span>
                              )}
                            </div>

                            <ThaiText className="text-sm text-gray-600 mb-2">
                              {activity.description || 'ไม่มีรายละเอียด'}
                            </ThaiText>

                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{new Date(activity.createdAt).toLocaleString('th-TH')}</span>
                              {activity.source === 'deposit' && activity.slipId && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600">✅ อัพโหลดสลิปแล้ว</span>
                                </>
                              )}
                              {activity.type === 'deposit' && activity.status === 'verified' && (
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
                            activity.amount > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                          </ThaiText>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        แสดง {startIndex + 1}-{Math.min(endIndex, totalItems)} จาก {totalItems} รายการ
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                          className="px-3"
                        >
                          หน้าแรก
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => prev - 1)}
                          className="px-3"
                        >
                          ก่อนหน้า
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            )
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          className="px-3"
                        >
                          ถัดไป
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-3"
                        >
                          หน้าสุดท้าย
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <ThaiText className="text-gray-500 text-lg mb-2">ไม่พบรายการที่ตรงกับเงื่อนไข</ThaiText>
                  <ThaiText className="text-gray-400 text-sm mb-4">ลองเปลี่ยนเงื่อนไขการค้นหาหรือกรองข้อมูล</ThaiText>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleFilterChange('all', 'all', '')
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ล้างตัวกรอง
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ClockIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <ThaiText className="text-gray-500 text-lg mb-2">ไม่มีประวัติธุรกรรม</ThaiText>
                  <ThaiText className="text-gray-400 text-sm">เริ่มต้นใช้งานด้วยการฝากเงินหรือซื้อสินค้า</ThaiText>
                </div>
              )}
            </CardContent>
          </Card>


        </div>
      </div>
    </ProtectedRoute>
  )
}
