'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThaiText } from '@/components/ui/typography'
import { 
  BanknotesIcon, 
  ClipboardDocumentIcon,
  CheckIcon 
} from '@heroicons/react/24/outline'

interface BankTransferInfoProps {
  bankName: string
  accountNumber: string
  accountName: string
  amount: number
}

export default function BankTransferInfo({ 
  bankName, 
  accountNumber, 
  accountName, 
  amount 
}: BankTransferInfoProps) {
  const [copiedField, setCopiedField] = useState<string>('')

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedField(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleCopy(text, field)}
      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
    >
      {copiedField === field ? (
        <CheckIcon className="w-4 h-4" />
      ) : (
        <ClipboardDocumentIcon className="w-4 h-4" />
      )}
    </Button>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BanknotesIcon className="w-5 h-5" />
          ข้อมูลการโอนเงินผ่านธนาคาร
        </CardTitle>
        <div className="text-sm text-gray-600">
          สำหรับลูกค้าที่ต้องการโอนเงินแบบปกติผ่านแอปธนาคาร ATM หรือ Internet Banking
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bank Transfer Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <ThaiText className="text-sm text-blue-700 font-medium">ธนาคาร:</ThaiText>
              <div className="flex items-center gap-2">
                <ThaiText className="text-sm font-medium text-blue-900">{bankName}</ThaiText>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <ThaiText className="text-sm text-blue-700 font-medium">เลขบัญชี:</ThaiText>
              <div className="flex items-center gap-2">
                <ThaiText className="text-sm font-mono text-blue-900">{accountNumber}</ThaiText>
                <CopyButton text={accountNumber} field="account" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <ThaiText className="text-sm text-blue-700 font-medium">ชื่อบัญชี:</ThaiText>
              <div className="flex items-center gap-2">
                <ThaiText className="text-sm text-blue-900">{accountName}</ThaiText>
                <CopyButton text={accountName} field="name" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <ThaiText className="text-sm text-blue-700 font-medium">จำนวนเงิน:</ThaiText>
              <div className="flex items-center gap-2">
                <ThaiText className="text-sm font-bold text-blue-900">
                  {amount.toLocaleString()} บาท
                </ThaiText>
                <CopyButton text={amount.toString()} field="amount" />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">วิธีการโอนเงินผ่านธนาคาร:</h4>

          {/* Mobile App Instructions */}
          <div className="mb-4">
            <h5 className="font-medium text-gray-800 mb-2">📱 ผ่านแอปธนาคาร:</h5>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside ml-4">
              <li>เปิดแอปธนาคารของคุณ</li>
              <li>เลือกเมนู "โอนเงิน" หรือ "Transfer"</li>
              <li>เลือก "โอนไปธนาคารอื่น" (หรือ "โอนในธนาคารเดียวกัน" หากเป็นธนาคารเดียวกัน)</li>
              <li>กรอกเลขบัญชีปลายทาง: <strong>{accountNumber}</strong></li>
              <li>ตรวจสอบชื่อบัญชี: <strong>{accountName}</strong></li>
              <li>กรอกจำนวนเงิน: <strong>฿{amount.toLocaleString()}</strong></li>
              <li>ยืนยันการโอนเงิน</li>
              <li>บันทึกสลิปและอัพโหลดด้านล่าง</li>
            </ol>
          </div>

          {/* ATM Instructions */}
          <div className="mb-4">
            <h5 className="font-medium text-gray-800 mb-2">🏧 ผ่าน ATM:</h5>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside ml-4">
              <li>ใส่บัตร ATM และกรอก PIN</li>
              <li>เลือก "โอนเงิน" หรือ "Transfer"</li>
              <li>เลือกธนาคารปลายทาง: <strong>{bankName}</strong></li>
              <li>กรอกเลขบัญชี: <strong>{accountNumber}</strong></li>
              <li>กรอกจำนวนเงิน: <strong>{amount.toLocaleString()}</strong></li>
              <li>ตรวจสอบข้อมูลและยืนยัน</li>
              <li>เก็บใบเสร็จและอัพโหลดด้านล่าง</li>
            </ol>
          </div>

          {/* Internet Banking Instructions */}
          <div>
            <h5 className="font-medium text-gray-800 mb-2">🌐 ผ่าน Internet Banking:</h5>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside ml-4">
              <li>เข้าสู่ระบบ Internet Banking</li>
              <li>เลือกเมนู "โอนเงิน"</li>
              <li>เลือก "โอนไปธนาคารอื่น"</li>
              <li>กรอกข้อมูลผู้รับตามที่ระบุด้านบน</li>
              <li>ยืนยันการโอนและพิมพ์สลิป</li>
              <li>อัพโหลดสลิปด้านล่าง</li>
            </ol>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
            <div>
              <ThaiText className="text-sm text-yellow-800">
                <strong>ข้อควรระวัง:</strong>
              </ThaiText>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• โอนเงินตามจำนวนที่ระบุเท่านั้น: <strong>฿{amount.toLocaleString()}</strong></li>
                <li>• ตรวจสอบเลขบัญชีให้ถูกต้อง: <strong>{accountNumber}</strong></li>
                <li>• ตรวจสอบชื่อบัญชีให้ตรงกัน: <strong>{accountName}</strong></li>
                <li>• เก็บสลิปการโอนเงินไว้เพื่ออัพโหลด</li>
                <li>• หากโอนผิดจำนวนหรือบัญชี อาจทำให้การฝากเงินล้มเหลว</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copy All Info Button */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => {
              const info = `ข้อมูลการโอนเงิน:\nธนาคาร: ${bankName}\nเลขบัญชี: ${accountNumber}\nชื่อบัญชี: ${accountName}\nจำนวนเงิน: ฿${amount.toLocaleString()}\n\n⚠️ กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนโอน`
              handleCopy(info, 'all')
            }}
            className="w-full"
            disabled={copiedField === 'all'}
          >
            {copiedField === 'all' ? (
              <>
                <CheckIcon className="w-4 h-4 mr-2" />
                คัดลอกแล้ว
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                คัดลอกข้อมูลทั้งหมด
              </>
            )}
          </Button>
          <ThaiText className="text-xs text-gray-500 text-center">
            สำหรับแชร์ข้อมูลการโอนเงินไปยังแอปอื่น
          </ThaiText>
        </div>
      </CardContent>
    </Card>
  )
}
