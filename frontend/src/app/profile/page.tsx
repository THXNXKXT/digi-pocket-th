'use client'

import { useState } from 'react'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile, useProfileStats, useUpdateProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Avatar, getInitials } from '@/components/ui/avatar'
import { formatCurrency, cn } from '@/lib/utils'
import {
  UserIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile()
  const { data: stats, isLoading: statsLoading } = useProfileStats()

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (profileLoading) {
    return (
      <ProtectedRoute>
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <ThaiText className="text-gray-600">กำลังโหลดข้อมูลโปรไฟล์...</ThaiText>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (profileError) {
    return (
      <ProtectedRoute>
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ThaiText className="text-red-600">เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์</ThaiText>
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
            <ThaiHeading level={2} className="text-center">โปรไฟล์</ThaiHeading>
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
      <div className="container-custom py-6 md:py-8 px-4 space-y-6">

        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar
                  size="xl"
                  fallback={profile?.username ? getInitials(profile.username) : 'U'}
                  className="w-24 h-24 md:w-32 md:h-32"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-thai">
                    {profile?.username || 'ผู้ใช้งาน'}
                  </h1>
                  <p className="text-gray-600 font-thai">@{profile?.username}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      profile?.status === 'active'
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    )}>
                      {profile?.status === 'active' ? 'ใช้งานได้' : 'ระงับการใช้งาน'}
                    </div>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {profile?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4" />
                  <span>สมาชิกตั้งแต่ {formatMemberSince(profile?.createdAt || '')}</span>
                </div>
              </div>


            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Orders Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.orders.total}</p>
                    <p className="text-sm text-gray-600">คำสั่งซื้อทั้งหมด</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">ยอดซื้อรวม</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(stats.orders.totalSpent)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CreditCardIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.transactions.total}</p>
                    <p className="text-sm text-gray-600">ธุรกรรมทั้งหมด</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">มูลค่ารวม</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(stats.transactions.totalAmount)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Member Since */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">สมาชิก</p>
                    <p className="text-sm text-gray-600">ตั้งแต่ {formatMemberSince(stats.memberSince)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">สถานะ</p>
                  <p className="text-lg font-semibold text-green-600">ใช้งานปกติ</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Basic Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              ข้อมูลบัญชี
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  ชื่อผู้ใช้
                </Label>
                <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                  {profile?.username}
                </p>
                <p className="text-xs text-gray-500">ไม่สามารถแก้ไขชื่อผู้ใช้ได้</p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  อีเมล
                </Label>
                <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                  {profile?.email}
                </p>
                <p className="text-xs text-gray-500">ไม่สามารถแก้ไขอีเมลได้</p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  บทบาท
                </Label>
                <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                  {profile?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  สถานะ
                </Label>
                <p className={cn(
                  "py-2 px-3 rounded-md",
                  profile?.status === 'active'
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                )}>
                  {profile?.status === 'active' ? 'ใช้งานได้' : 'ระงับการใช้งาน'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-thai">ออกจากระบบ</h3>
                <p className="text-sm text-gray-600">ออกจากบัญชีผู้ใช้ปัจจุบัน</p>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                ออกจากระบบ
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
