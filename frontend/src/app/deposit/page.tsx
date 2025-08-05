'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThaiHeading, ThaiText } from '@/components/ui/typography'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useStoreAccounts, useCreateDepositRequest, useUploadSlip } from '@/hooks/useDeposit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency, cn } from '@/lib/utils'
import {
  BanknotesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import PromptPayQR from '@/components/ui/PromptPayQR'

const AMOUNT_OPTIONS = [50, 100, 200, 500, 1000, 2000, 5000, 10000]

export default function DepositPage() {
  const router = useRouter()
  const { data: storeAccounts, isLoading: accountsLoading } = useStoreAccounts()
  const createDepositRequest = useCreateDepositRequest()
  const uploadSlip = useUploadSlip()

  const [step, setStep] = useState<'amount' | 'account' | 'upload'>('amount')
  const [selectedAmount, setSelectedAmount] = useState<number>(0)
  const [customAmount, setCustomAmount] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [depositRequestId, setDepositRequestId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [depositRequestData, setDepositRequestData] = useState<any>(null)
  const [copiedField, setCopiedField] = useState<string>('')

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(0)
  }

  const getFinalAmount = () => {
    return selectedAmount > 0 ? selectedAmount : parseFloat(customAmount) || 0
  }

  const handleNextFromAmount = () => {
    const amount = getFinalAmount()
    if (amount >= 1) {
      setStep('account')
    }
  }

  const handleAccountSelect = async (accountId: string) => {
    setSelectedAccountId(accountId)

    try {
      const result = await createDepositRequest.mutateAsync({
        store_account_id: accountId,
        amount: getFinalAmount()
      })

      setDepositRequestId(result.request_id)
      setDepositRequestData(result)
      setStep('upload')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUploadSlip = async () => {
    if (selectedFile && depositRequestId) {
      try {
        await uploadSlip.mutateAsync({
          depositRequestId,
          file: selectedFile
        })
        // Success handling is done in the mutation hook
        // which will redirect to wallet page
      } catch (error) {
        // Error handling is done in the mutation hook
        // which will show appropriate error message and redirect to wallet page
      }
    }
  }

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

  const selectedAccount = depositRequestData?.account_info || storeAccounts?.find(acc => acc.id === selectedAccountId)

  return (
    <ProtectedRoute>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <ThaiHeading level={2}>ฝากเงิน</ThaiHeading>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white border-b px-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            <div className={cn(
              "flex items-center space-x-2",
              step === 'amount' ? "text-primary-600" : "text-gray-400"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === 'amount' ? "bg-primary-600 text-white" : "bg-gray-200"
              )}>
                1
              </div>
              <span className="text-sm font-medium">เลือกจำนวน</span>
            </div>
            
            <div className="w-8 h-px bg-gray-300"></div>
            
            <div className={cn(
              "flex items-center space-x-2",
              step === 'account' ? "text-primary-600" : "text-gray-400"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === 'account' ? "bg-primary-600 text-white" : "bg-gray-200"
              )}>
                2
              </div>
              <span className="text-sm font-medium">เลือกบัญชี</span>
            </div>
            
            <div className="w-8 h-px bg-gray-300"></div>
            
            <div className={cn(
              "flex items-center space-x-2",
              step === 'upload' ? "text-primary-600" : "text-gray-400"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === 'upload' ? "bg-primary-600 text-white" : "bg-gray-200"
              )}>
                3
              </div>
              <span className="text-sm font-medium">อัพโหลดสลิป</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-custom py-6 px-4 space-y-6">
          
          {/* Step 1: Amount Selection */}
          {step === 'amount' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BanknotesIcon className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">เลือกจำนวนเงินที่ต้องการฝาก</h1>
                <p className="text-gray-600">เลือกจำนวนเงินหรือระบุจำนวนที่ต้องการ (ขั้นต่ำ 50 บาท)</p>
              </div>

              {/* Quick Amount Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">จำนวนยอดนิยม</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {AMOUNT_OPTIONS.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAmountSelect(amount)}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                          selectedAmount === amount
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                        )}
                      >
                        {selectedAmount === amount && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="text-center">
                          <div className={cn(
                            "text-lg font-bold mb-1",
                            selectedAmount === amount ? "text-blue-700" : "text-gray-900"
                          )}>
                            ฿{amount.toLocaleString()}
                          </div>
                          {amount >= 1000 && (
                            <div className="text-xs text-gray-500">
                              {amount === 1000 && "แนะนำ"}
                              {amount === 5000 && "ยอดนิยม"}
                              {amount === 10000 && "สูงสุด"}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Amount */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ระบุจำนวนเอง</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        ฿
                      </div>
                      <Input
                        id="customAmount"
                        type="number"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        placeholder="0"
                        min="50"
                        className="pl-8 text-lg h-14 text-center font-medium"
                      />
                    </div>
                    <div className="text-center text-sm text-gray-500">
                      จำนวนขั้นต่ำ 50 บาท
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Amount Display */}
              {getFinalAmount() > 0 && (
                <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">จำนวนเงินที่เลือก</div>
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {formatCurrency(getFinalAmount())}
                      </div>
                      <div className="text-sm text-gray-500">
                        พร้อมดำเนินการฝากเงิน
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Button */}
              <div className="sticky bottom-4">
                <Button
                  onClick={handleNextFromAmount}
                  disabled={getFinalAmount() < 50}
                  className="w-full h-14 text-lg font-medium"
                  size="lg"
                >
                  {getFinalAmount() < 50 ? (
                    "กรุณาเลือกจำนวนเงิน"
                  ) : (
                    <>
                      ถัดไป
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Account Selection */}
          {step === 'account' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep('amount')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    กลับ
                  </Button>
                </div>
                <CardTitle className="text-xl">เลือกบัญชีที่จะโอนเงิน</CardTitle>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">จำนวนเงินที่จะฝาก</p>
                      <p className="text-2xl font-bold text-blue-900">{formatCurrency(getFinalAmount())}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <BanknotesIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>

                {accountsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <ThaiText className="text-gray-600">กำลังโหลดบัญชี...</ThaiText>
                  </div>
                ) : storeAccounts && storeAccounts.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      เลือกบัญชีที่ต้องการโอนเงินเข้า ({storeAccounts.length} บัญชี)
                    </div>
                    {storeAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="group relative border-2 border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-200 cursor-pointer hover:shadow-md"
                        onClick={() => handleAccountSelect(account.id)}
                      >
                        {createDepositRequest.isPending && (
                          <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          {/* Bank Icon */}
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <BanknotesIcon className="w-7 h-7 text-blue-600" />
                          </div>

                          {/* Account Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{account.bank_name}</h3>
                              {account.promptpay_number && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  📱 PromptPay
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">เลขบัญชี:</span>
                                <span className="font-mono text-sm text-gray-900">{account.account_number}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">ชื่อบัญชี:</span>
                                <span className="text-sm text-gray-900">{account.account_name}</span>
                              </div>
                              {account.promptpay_number && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">PromptPay:</span>
                                  <span className="font-mono text-sm text-green-700">{account.promptpay_number}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {account.promptpay_number ? (
                              <>
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                  QR Code สแกนได้
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                  โอนทันที 24/7
                                </span>
                              </>
                            ) : (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                โอนผ่านธนาคาร
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BanknotesIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <ThaiText className="text-gray-500 text-lg">ไม่มีบัญชีที่ใช้งานได้</ThaiText>
                    <ThaiText className="text-gray-400 text-sm mt-1">กรุณาติดต่อเจ้าหน้าที่</ThaiText>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Upload Slip */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Back Button */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => setStep('account')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  กลับไปเลือกบัญชี
                </Button>
              </div>
              {/* Request Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    สรุปคำขอฝากเงิน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Amount */}
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700 font-medium">จำนวนเงิน:</span>
                      <span className="font-bold text-xl text-green-600">{formatCurrency(getFinalAmount())}</span>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">ข้อมูลบัญชีปลายทาง:</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">ธนาคาร:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-blue-900">{selectedAccount?.bank_name}</span>
                            <button
                              onClick={() => handleCopy(selectedAccount?.bank_name || '', 'bank')}
                              className="p-1 text-blue-600 hover:text-blue-800 rounded"
                            >
                              {copiedField === 'bank' ? (
                                <CheckCircleIcon className="w-4 h-4" />
                              ) : (
                                <ClipboardDocumentIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">เลขบัญชี:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-blue-900">{selectedAccount?.account_number}</span>
                            <button
                              onClick={() => handleCopy(selectedAccount?.account_number || '', 'account')}
                              className="p-1 text-blue-600 hover:text-blue-800 rounded"
                            >
                              {copiedField === 'account' ? (
                                <CheckCircleIcon className="w-4 h-4" />
                              ) : (
                                <ClipboardDocumentIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">ชื่อบัญชี:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-blue-900">{selectedAccount?.account_name}</span>
                            <button
                              onClick={() => handleCopy(selectedAccount?.account_name || '', 'name')}
                              className="p-1 text-blue-600 hover:text-blue-800 rounded"
                            >
                              {copiedField === 'name' ? (
                                <CheckCircleIcon className="w-4 h-4" />
                              ) : (
                                <ClipboardDocumentIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        {selectedAccount?.promptpay_number && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">PromptPay:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-blue-900">{selectedAccount.promptpay_number}</span>
                              <button
                                onClick={() => handleCopy(selectedAccount.promptpay_number || '', 'promptpay')}
                                className="p-1 text-blue-600 hover:text-blue-800 rounded"
                              >
                                {copiedField === 'promptpay' ? (
                                  <CheckCircleIcon className="w-4 h-4" />
                                ) : (
                                  <ClipboardDocumentIcon className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>



                    {/* Expiry */}
                    {depositRequestData?.expires_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">หมดอายุ:</span>
                        <span className="font-medium text-red-600">
                          {new Date(depositRequestData.expires_at).toLocaleString('th-TH')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* PromptPay QR Code */}
              {selectedAccount?.promptpay_number && (
                <PromptPayQR
                  phoneNumber={selectedAccount.promptpay_number}
                  amount={getFinalAmount()}
                  accountName={selectedAccount.account_name}
                  onCopySuccess={() => {
                    // Optional: Show toast notification when QR data is copied
                  }}
                />
              )}

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">ข้อควรระวังสำคัญ</h4>
                    <div className="space-y-3">
                      {/* General warnings */}
                      <div>
                        <h5 className="font-medium text-yellow-800 text-sm mb-1">การโอนเงิน:</h5>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• โอนเงินตามจำนวนที่ระบุเท่านั้น: <strong>{formatCurrency(getFinalAmount())}</strong></li>
                          <li>• ตรวจสอบข้อมูลบัญชีให้ถูกต้อง</li>
                          <li>• อัพโหลดสลิปภายในเวลาที่กำหนด</li>
                        </ul>
                      </div>

                      {/* PromptPay specific warnings */}
                      {selectedAccount?.promptpay_number && (
                        <div>
                          <h5 className="font-medium text-yellow-800 text-sm mb-1">PromptPay QR Code:</h5>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• สแกน QR Code ด้วยแอปธนาคารเท่านั้น</li>
                            <li>• ตรวจสอบจำนวนเงินที่แสดงในแอป</li>
                            <li>• ตรวจสอบชื่อผู้รับก่อนยืนยัน</li>
                          </ul>
                        </div>
                      )}

                      {/* Processing warnings */}
                      <div>
                        <h5 className="font-medium text-yellow-800 text-sm mb-1">การประมวลผล:</h5>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• เงินจะเข้าบัญชีภายใน 5-10 นาที หลังตรวจสอบ</li>
                          <li>• ห้ามใช้สลิปซ้ำ แต่ละสลิปใช้ได้เพียงครั้งเดียว</li>
                          <li>• หากมีปัญหา กรุณาติดต่อเจ้าหน้าที่พร้อมรหัสอ้างอิง</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>



              {/* Upload Slip */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudArrowUpIcon className="w-5 h-5" />
                    อัพโหลดสลิปการโอนเงิน
                  </CardTitle>
                  <div className="text-sm text-gray-600 mt-2">
                    {selectedAccount?.promptpay_number ? (
                      <>หลังจากสแกน QR Code และโอนเงินเรียบร้อยแล้ว กรุณาอัพโหลดสลิปเพื่อยืนยันการโอน</>
                    ) : (
                      <>หลังจากโอนเงินเข้าบัญชีเรียบร้อยแล้ว กรุณาอัพโหลดสลิปเพื่อยืนยันการโอน</>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="slip-upload"
                    />
                    <label htmlFor="slip-upload" className="cursor-pointer">
                      <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">คลิกเพื่อเลือกไฟล์สลิป</p>
                      <p className="text-sm text-gray-500">รองรับไฟล์ภาพ (JPG, PNG)</p>
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">เลือกไฟล์แล้ว:</span>
                        <span className="text-green-700">{selectedFile.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {uploadSlip.isError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-red-800 mb-2">เกิดข้อผิดพลาด</h4>
                          <p className="text-sm text-red-700 mb-3">
                            การอัพโหลดสลิปไม่สำเร็จ กรุณาตรวจสอบและลองใหม่อีกครั้ง
                          </p>
                          <div className="bg-red-100 rounded-lg p-3">
                            <h5 className="font-medium text-red-800 text-sm mb-1">วิธีแก้ไข:</h5>
                            <ul className="text-xs text-red-700 space-y-1">
                              <li>• ตรวจสอบว่าสลิปชัดเจนและอ่านได้</li>
                              <li>• ตรวจสอบจำนวนเงินและบัญชีปลายทาง</li>
                              <li>• ใช้สลิปใหม่ที่ยังไม่เคยใช้งาน</li>
                              <li>• หากยังมีปัญหา กรุณาติดต่อเจ้าหน้าที่</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleUploadSlip}
                    disabled={!selectedFile || uploadSlip.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {uploadSlip.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        กำลังอัพโหลดและตรวจสอบ...
                      </div>
                    ) : (
                      'อัพโหลดสลิป'
                    )}
                  </Button>

                  {/* Recovery Token */}
                  {depositRequestData?.recovery_token && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">รหัสอ้างอิง (สำหรับติดต่อเจ้าหน้าที่):</p>
                      <p className="text-sm font-mono text-gray-800 break-all">
                        {depositRequestData.recovery_token}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 เก็บรหัสนี้ไว้เพื่อใช้ในการติดต่อเจ้าหน้าที่หากมีปัญหา
                      </p>
                    </div>
                  )}

                  {/* Success Message */}
                  {uploadSlip.isSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-green-800 mb-1">อัพโหลดสำเร็จ!</h4>
                          <p className="text-sm text-green-700">
                            สลิปของคุณได้รับการตรวจสอบแล้ว กำลังเปลี่ยนเส้นทางไปยังหน้ากระเป๋าเงิน...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
