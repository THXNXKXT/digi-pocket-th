'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useUserDeposits } from '@/hooks/useDeposit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, cn } from '@/lib/utils'
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CalendarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

export default function DepositHistoryPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  
  // ดึงข้อมูลทั้งหมดก่อน แล้วกรองใน frontend
  const { data: allData, isLoading, error } = useUserDeposits({
    limit: 1000, // ดึงข้อมูลทั้งหมด
    page: 1,
    status: 'all'
  })

  // กรองข้อมูลใน frontend
  const filteredDeposits = allData?.deposits?.filter(deposit => {
    if (statusFilter === 'all') return true
    return deposit.status === statusFilter
  }) || []

  // Pagination ใน frontend
  const itemsPerPage = 20
  const totalItems = filteredDeposits.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDeposits = filteredDeposits.slice(startIndex, endIndex)

  // สร้าง data object ใหม่สำหรับแสดงผล
  const data = allData ? {
    deposits: paginatedDeposits,
    pagination: {
      page,
      limit: itemsPerPage,
      total: totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  } : null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />
      case 'uploaded':
        return <DocumentTextIcon className="w-5 h-5 text-blue-600" />
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-gray-600" />
      case 'expired':
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'สำเร็จ'
      case 'pending':
        return 'รอดำเนินการ'
      case 'uploaded':
        return 'อัพโหลดสลิปแล้ว'
      case 'rejected':
        return 'ไม่สำเร็จ'
      case 'cancelled':
        return 'ยกเลิก'
      case 'expired':
        return 'หมดอายุ'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'uploaded':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <ThaiText className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</ThaiText>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <ThaiText className="text-red-600 text-lg">เกิดข้อผิดพลาดในการโหลดข้อมูล</ThaiText>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                ลองใหม่
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-4 space-y-6">
          {/* Header */}
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
              <ThaiHeading level={1} className="text-2xl font-bold text-gray-900">
                ประวัติการฝากเงิน
              </ThaiHeading>
              <ThaiText className="text-gray-600">
                ดูประวัติและสถานะการฝากเงินทั้งหมด
              </ThaiText>
            </div>
          </div>

          {/* Summary Stats - ใช้ข้อมูลทั้งหมดจาก allData */}
          {allData?.deposits && allData.deposits.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {allData.deposits.filter(d => d.status === 'verified').length}
                      </div>
                      <div className="text-sm text-gray-600">สำเร็จ</div>
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
                        {allData.deposits.filter(d => d.status === 'pending' || d.status === 'uploaded').length}
                      </div>
                      <div className="text-sm text-gray-600">รอดำเนินการ</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {allData.deposits.filter(d => d.status === 'rejected' || d.status === 'cancelled' || d.status === 'expired').length}
                      </div>
                      <div className="text-sm text-gray-600">ไม่สำเร็จ</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BanknotesIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(
                          allData.deposits
                            .filter(d => d.status === 'verified')
                            .reduce((sum, d) => sum + d.amount, 0)
                        )}
                      </div>
                      <div className="text-sm text-gray-600">ยอดรวม</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Deposit List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  รายการฝากเงิน
                  {data?.pagination && (
                    <span className="text-sm font-normal text-gray-500">
                      ({statusFilter === 'all' ? allData?.deposits?.length || 0 : filteredDeposits.length} รายการ
                      {statusFilter !== 'all' && ` จากทั้งหมด ${allData?.deposits?.length || 0} รายการ`})
                    </span>
                  )}
                </CardTitle>

                {/* Filter in header */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">กรอง:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setPage(1)
                    }}
                    className="text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="verified">สำเร็จ</option>
                    <option value="pending">รอดำเนินการ</option>
                    <option value="uploaded">อัพโหลดสลิปแล้ว</option>
                    <option value="rejected">ไม่สำเร็จ</option>
                    <option value="cancelled">ยกเลิก</option>
                    <option value="expired">หมดอายุ</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data?.deposits && data.deposits.length > 0 ? (
                <div className="space-y-4">
                  {data.deposits.map((deposit) => (
                    <div
                      key={deposit.id}
                      className="group relative p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Status Icon */}
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                            deposit.status === 'verified' ? "bg-green-100" :
                            deposit.status === 'pending' ? "bg-yellow-100" :
                            deposit.status === 'uploaded' ? "bg-blue-100" :
                            "bg-red-100"
                          )}>
                            {getStatusIcon(deposit.status)}
                          </div>

                          {/* Deposit Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <ThaiText className="font-semibold text-gray-900">
                                ฝากเงินผ่าน {deposit.bankName}
                              </ThaiText>
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full font-medium border",
                                getStatusColor(deposit.status)
                              )}>
                                {getStatusText(deposit.status)}
                              </span>
                            </div>

                            <div className="space-y-1 mb-3">
                              <ThaiText className="text-sm text-gray-600">
                                หมายเลขบัญชี: {deposit.accountNumber}
                              </ThaiText>
                              {deposit.slipId && (
                                <ThaiText className="text-sm text-blue-600">
                                  ✅ อัพโหลดสลิปแล้ว
                                </ThaiText>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{new Date(deposit.createdAt).toLocaleString('th-TH')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right ml-4">
                          <ThaiText className="font-bold text-xl text-green-600">
                            +{formatCurrency(deposit.amount)}
                          </ThaiText>
                          {deposit.status === 'verified' && (
                            <div className="text-xs text-green-600 mt-1">
                              ✅ เข้าบัญชีแล้ว
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {data.pagination && data.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!data.pagination.hasPrev}
                        onClick={() => setPage(page - 1)}
                      >
                        ก่อนหน้า
                      </Button>
                      <span className="flex items-center px-4 text-sm text-gray-600">
                        หน้า {data.pagination.page} จาก {data.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!data.pagination.hasNext}
                        onClick={() => setPage(page + 1)}
                      >
                        ถัดไป
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <ThaiText className="text-gray-500 text-lg mb-2">ไม่มีประวัติการฝากเงิน</ThaiText>
                  <ThaiText className="text-gray-400 text-sm mb-6">เริ่มต้นใช้งานด้วยการฝากเงินเข้ากระเป๋า</ThaiText>
                  <Button
                    onClick={() => router.push('/deposit')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <BanknotesIcon className="w-4 h-4 mr-2" />
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
