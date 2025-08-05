'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import type { LoginRequest } from '@/types/api'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { success, error: showToastError } = useToast()
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('') // Clear error when user types
  }

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้')
      return false
    }
    
    if (!formData.password) {
      setError('กรุณากรอกรหัสผ่าน')
      return false
    }

    if (formData.username.length < 3) {
      setError('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
      return false
    }

    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await authService.login(formData)

      // Use Auth Context to store auth state
      login(response.token, response.sessionToken, response.user)

      // Show success notification
      success('เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับ ${response.user.username}`)

      // Redirect to home page
      router.push('/')

    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      setError(errorMessage)
      showToastError('เข้าสู่ระบบไม่สำเร็จ', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/" className="inline-flex items-center gap-2">
              <ArrowLeftIcon className="w-4 h-4" />
              <span>กลับหน้าแรก</span>
            </Link>
          </Button>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden">
                <Image 
                  src="/logos/digi-pocket-logo1.png" 
                  alt="Digi Pocket Logo" 
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-thai text-gray-900">
              เข้าสู่ระบบ
            </CardTitle>
            <ThaiText className="text-gray-600 mt-2">
              ยินดีต้อนรับกลับสู่ Digi Pocket
            </ThaiText>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  ชื่อผู้ใช้ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="กรอกชื่อผู้ใช้"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={cn(
                    "h-12",
                    error && !formData.username && "border-red-500 focus:border-red-500"
                  )}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="กรอกรหัสผ่าน"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={cn(
                      "h-12 pr-12",
                      error && !formData.password && "border-red-500 focus:border-red-500"
                    )}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 font-thai text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <ThaiText className="text-gray-600">
                ยังไม่มีบัญชี?{' '}
                <Link 
                  href="/register"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  สมัครสมาชิก
                </Link>
              </ThaiText>
            </div>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <ThaiText className="text-sm text-gray-500">
            © 2024 Digi Pocket Thailand. สงวนลิขสิทธิ์
          </ThaiText>
        </div>
      </div>
    </div>
  )
}
