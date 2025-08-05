'use client'

import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThaiText } from '@/components/ui/typography'
import { 
  QrCodeIcon, 
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

interface PromptPayQRProps {
  phoneNumber: string
  amount: number
  accountName?: string
  onCopySuccess?: () => void
}

export default function PromptPayQR({ 
  phoneNumber, 
  amount, 
  accountName,
  onCopySuccess 
}: PromptPayQRProps) {
  const [qrData, setQrData] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const promptPayQR = await import('promptpay-qr')
        const generatePayload = promptPayQR.default || promptPayQR.generatePayload

        // Clean phone number (remove spaces, dashes, etc.)
        const cleanPhone = phoneNumber.replace(/[^\d]/g, '')

        // Generate PromptPay QR payload using the exact API format
        // generatePayload('0812345678', { amount: 4.22 })
        const payload = generatePayload(cleanPhone, { amount })

        setQrData(payload)
        setError('')
      } catch (err) {
        console.error('Error generating QR code:', err)
        setError('ไม่สามารถสร้าง QR Code ได้')
      }
    }

    if (phoneNumber && amount > 0) {
      generateQR()
    }
  }, [phoneNumber, amount])

  const handleCopyQR = async () => {
    if (!qrData) return

    try {
      await navigator.clipboard.writeText(qrData)
      setCopied(true)
      onCopySuccess?.()
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy QR data:', err)
    }
  }

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber)
      setCopied(true)
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy phone number:', err)
    }
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <ThaiText className="text-sm">{error}</ThaiText>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!qrData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <ThaiText className="text-gray-600">กำลังสร้าง QR Code...</ThaiText>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCodeIcon className="w-5 h-5" />
          PromptPay QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
            <QRCode
              value={qrData}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox="0 0 256 256"
            />
          </div>
          <ThaiText className="text-xs text-gray-500 mt-2 text-center">
            สแกนด้วยแอปธนาคารของคุณ
          </ThaiText>
        </div>

        {/* Account Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <ThaiText className="text-sm text-blue-700 font-medium">PromptPay:</ThaiText>
              <div className="flex items-center gap-2">
                <ThaiText className="text-sm font-mono text-blue-900">{phoneNumber}</ThaiText>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPhone}
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                >
                  {copied ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {accountName && (
              <div className="flex justify-between">
                <ThaiText className="text-sm text-blue-700 font-medium">ชื่อผู้รับ:</ThaiText>
                <ThaiText className="text-sm text-blue-900">{accountName}</ThaiText>
              </div>
            )}

            <div className="flex justify-between">
              <ThaiText className="text-sm text-blue-700 font-medium">จำนวนเงิน:</ThaiText>
              <ThaiText className="text-sm font-bold text-blue-900">
                ฿{amount.toLocaleString()}
              </ThaiText>
            </div>
          </div>
        </div>



        {/* Copy QR Data Button */}
        <Button
          variant="outline"
          onClick={handleCopyQR}
          className="w-full"
          disabled={copied}
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 mr-2" />
              คัดลอกแล้ว
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
              คัดลอกข้อมูล QR
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
