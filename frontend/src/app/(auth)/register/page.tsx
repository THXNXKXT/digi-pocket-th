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
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import type { RegisterRequest } from '@/types/api'

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { success, error: showToastError } = useToast()
  const [formData, setFormData] = useState<Omit<RegisterRequest, 'confirmPassword'>>({
    username: '',
    email: '',
    password: ''
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof RegisterRequest | 'confirmPassword', value: string) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(value)
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear errors when user types
    if (error) setError('')
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'กรุณากรอกชื่อผู้ใช้'
    } else if (formData.username.length < 3) {
      errors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'
    } else if (formData.username.length > 20) {
      errors.username = 'ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _'
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'กรุณากรอกอีเมล'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    }

    // Password validation (ตรงกับ backend requirements)
    if (!formData.password) {
      errors.password = 'กรุณากรอกรหัสผ่าน'
    } else if (formData.password.length < 8) {
      errors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    } else if (formData.password.length > 128) {
      errors.password = 'รหัสผ่านต้องไม่เกิน 128 ตัวอักษร'
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'รหัสผ่านต้องมีตัวอักษรเล็กอย่างน้อย 1 ตัว'
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'รหัสผ่านต้องมีตัวอักษรใหญ่อย่างน้อย 1 ตัว'
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว'
    } else if (!/[^a-zA-Z0-9]/.test(formData.password)) {
      errors.password = 'รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว'
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'กรุณายืนยันรหัสผ่าน'
    } else if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError('')

    try {
      // Add confirmPassword to the request
      const registerData = {
        ...formData,
        confirmPassword: confirmPassword
      }

      const response = await authService.register(registerData)

      // Use Auth Context to store auth state
      login(response.token, response.sessionToken, response.user)

      // Show success notification
      success('สมัครสมาชิกสำเร็จ', `ยินดีต้อนรับ ${response.user.username} เข้าสู่ Digi Pocket`)

      // Redirect to home page
      router.push('/')

    } catch (error: any) {
      console.error('Register error:', error)
      const errorMessage = error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
      setError(errorMessage)
      showToastError('สมัครสมาชิกไม่สำเร็จ', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string): { strength: number; text: string; color: string } => {
    if (!password) return { strength: 0, text: '', color: '' }

    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    const levels = [
      { text: 'อ่อนแอมาก', color: 'text-red-500' },
      { text: 'อ่อนแอ', color: 'text-orange-500' },
      { text: 'ปานกลาง', color: 'text-yellow-500' },
      { text: 'แข็งแรง', color: 'text-blue-500' },
      { text: 'แข็งแรงมาก', color: 'text-green-500' }
    ]

    return { strength, ...levels[Math.min(strength, 4)] }
  }

  const passwordStrength = getPasswordStrength(formData.password)

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
              สมัครสมาชิก
            </CardTitle>
            <ThaiText className="text-gray-600 mt-2">
              เริ่มต้นใช้งาน Digi Pocket วันนี้
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
                  placeholder="กรอกชื่อผู้ใช้ (a-z, 0-9, _)"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={cn(
                    "h-12",
                    fieldErrors.username && "border-red-500 focus:border-red-500"
                  )}
                  disabled={isLoading}
                  autoComplete="username"
                />
                {fieldErrors.username && (
                  <p className="text-red-500 text-sm">{fieldErrors.username}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  อีเมล <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="กรอกอีเมล"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={cn(
                    "h-12",
                    fieldErrors.email && "border-red-500 focus:border-red-500"
                  )}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm">{fieldErrors.email}</p>
                )}
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
                    placeholder="กรอกรหัสผ่าน (อย่างน้อย 8 ตัวอักษร, A-z, 0-9, !@#)"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={cn(
                      "h-12 pr-12",
                      fieldErrors.password && "border-red-500 focus:border-red-500"
                    )}
                    disabled={isLoading}
                    autoComplete="new-password"
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
                
                {/* Password Strength */}
                {formData.password && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all",
                          passwordStrength.strength === 1 && "bg-red-500 w-1/5",
                          passwordStrength.strength === 2 && "bg-orange-500 w-2/5",
                          passwordStrength.strength === 3 && "bg-yellow-500 w-3/5",
                          passwordStrength.strength === 4 && "bg-blue-500 w-4/5",
                          passwordStrength.strength === 5 && "bg-green-500 w-full"
                        )}
                      />
                    </div>
                    <span className={cn("text-xs", passwordStrength.color)}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
                
                {fieldErrors.password && (
                  <p className="text-red-500 text-sm">{fieldErrors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    value={confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={cn(
                      "h-12 pr-12",
                      fieldErrors.confirmPassword && "border-red-500 focus:border-red-500",
                      confirmPassword && formData.password === confirmPassword && "border-green-500 focus:border-green-500"
                    )}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                  
                  {/* Password Match Indicator */}
                  {confirmPassword && formData.password === confirmPassword && (
                    <CheckCircleIcon className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-red-500 text-sm">{fieldErrors.confirmPassword}</p>
                )}
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
                    กำลังสมัครสมาชิก...
                  </>
                ) : (
                  'สมัครสมาชิก'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <ThaiText className="text-gray-600">
                มีบัญชีอยู่แล้ว?{' '}
                <Link 
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  เข้าสู่ระบบ
                </Link>
              </ThaiText>
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
