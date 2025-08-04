'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  HomeIcon, 
  UserPlusIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  acceptTerms?: string
}

interface PasswordStrength {
  score: number
  label: string
  color: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const usernameRef = useRef<HTMLInputElement>(null)

  // Auto-focus first field
  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  // Password strength calculation
  const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    
    if (score <= 2) return { score, label: 'อ่อน', color: 'text-red-500' }
    if (score <= 3) return { score, label: 'ปานกลาง', color: 'text-yellow-500' }
    if (score <= 4) return { score, label: 'ดี', color: 'text-blue-500' }
    return { score, label: 'แข็งแกร่ง', color: 'text-green-500' }
  }

  // Form validation
  const validateField = (name: keyof FormData, value: any): string | undefined => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'กรุณากรอกชื่อผู้ใช้'
        if (value.length < 3) return 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _'
        break
        
      case 'email':
        if (!value.trim()) return 'กรุณากรอกอีเมล'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'รูปแบบอีเมลไม่ถูกต้อง'
        break
        
      case 'password':
        if (!value) return 'กรุณากรอกรหัสผ่าน'
        if (value.length < 8) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
        break
        
      case 'confirmPassword':
        if (!value) return 'กรุณายืนยันรหัสผ่าน'
        if (value !== formData.password) return 'รหัสผ่านไม่ตรงกัน'
        break
        
      case 'acceptTerms':
        if (!value) return 'กรุณายอมรับเงื่อนไขการใช้งาน'
        break
    }
    return undefined
  }

  // Handle input change
  const handleInputChange = (name: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Real-time validation
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
    
    // Re-validate confirm password when password changes
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword)
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors: FormErrors = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key as keyof FormData, formData[key as keyof FormData])
      if (error) newErrors[key as keyof FormErrors] = error
    })
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) return
    
    setIsLoading(true)
    
    try {
      // Mock API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success
      setIsSuccess(true)
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          acceptTerms: false
        })
        setIsSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ email: 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง' })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Enter key navigation
  const handleKeyDown = (e: React.KeyboardEvent, nextFieldRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter' && nextFieldRef?.current) {
      e.preventDefault()
      nextFieldRef.current.focus()
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  if (isSuccess) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-8">
        <div className="container-custom px-4 max-w-md mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <ThaiHeading level={2} className="mb-4 text-green-600">
                สมัครสมาชิกสำเร็จ!
              </ThaiHeading>
              
              <ThaiText className="text-gray-600 mb-6">
                ยินดีต้อนรับเข้าสู่ระบบ Digi Pocket
                <br />
                คุณสามารถเข้าสู่ระบบได้แล้ว
              </ThaiText>
              
              <div className="space-y-3">
                <Button asChild className="w-full font-thai">
                  <Link href="/login">
                    เข้าสู่ระบบ
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full font-thai">
                  <Link href="/">
                    กลับหน้าแรก
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom px-4 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-full">
              <UserPlusIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <ThaiHeading level={1} className="mb-2">
            สมัครสมาชิก
          </ThaiHeading>
          <ThaiText className="text-gray-600">
            สร้างบัญชีใหม่เพื่อเข้าใช้งาน Digi Pocket
          </ThaiText>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center font-thai">
              ข้อมูลสมัครสมาชิก
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-thai mb-1">
                  ชื่อผู้ใช้ *
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 border rounded-md font-thai text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  )}
                  placeholder="กรอกชื่อผู้ใช้"
                />
                {errors.username && (
                  <ThaiText className="text-red-500 text-xs mt-1">
                    {errors.username}
                  </ThaiText>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-thai mb-1">
                  อีเมล *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 border rounded-md font-thai text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  )}
                  placeholder="กรอกอีเมล"
                />
                {errors.email && (
                  <ThaiText className="text-red-500 text-xs mt-1">
                    {errors.email}
                  </ThaiText>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-thai mb-1">
                  รหัสผ่าน *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 pr-10 border rounded-md font-thai text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    )}
                    placeholder="กรอกรหัสผ่าน"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={cn(
                            'h-2 rounded-full transition-all duration-300',
                            passwordStrength.score <= 2 ? 'bg-red-500' :
                            passwordStrength.score <= 3 ? 'bg-yellow-500' :
                            passwordStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                          )}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <ThaiText className={cn('text-xs', passwordStrength.color)}>
                        {passwordStrength.label}
                      </ThaiText>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <ThaiText className="text-red-500 text-xs mt-1">
                    {errors.password}
                  </ThaiText>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-thai mb-1">
                  ยืนยันรหัสผ่าน *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 pr-10 border rounded-md font-thai text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    )}
                    placeholder="ยืนยันรหัสผ่าน"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-1 flex items-center gap-1">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <ThaiText className="text-green-500 text-xs">รหัสผ่านตรงกัน</ThaiText>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                        <ThaiText className="text-red-500 text-xs">รหัสผ่านไม่ตรงกัน</ThaiText>
                      </>
                    )}
                  </div>
                )}

                {errors.confirmPassword && (
                  <ThaiText className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </ThaiText>
                )}
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <ThaiText className="text-sm text-gray-700 leading-relaxed">
                    ฉันยอมรับ{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">
                      เงื่อนไขการใช้งาน
                    </Link>
                    {' '}และ{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                      นโยบายความเป็นส่วนตัว
                    </Link>
                  </ThaiText>
                </label>
                {errors.acceptTerms && (
                  <ThaiText className="text-red-500 text-xs mt-1">
                    {errors.acceptTerms}
                  </ThaiText>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full font-thai"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>กำลังสมัครสมาชิก...</span>
                  </div>
                ) : (
                  'สมัครสมาชิก'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-4">
          <ThaiText className="text-gray-600">
            มีบัญชีอยู่แล้ว?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              เข้าสู่ระบบ
            </Link>
          </ThaiText>

          <div className="flex justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2"
              >
                <HomeIcon className="w-4 h-4 flex-shrink-0" />
                <span className="leading-none">กลับหน้าแรก</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
