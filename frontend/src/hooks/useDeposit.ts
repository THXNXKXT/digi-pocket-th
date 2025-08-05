import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { depositService, type CreateDepositRequest, type DepositListParams } from '@/services/deposit.service'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'

export function useStoreAccounts() {
  return useQuery({
    queryKey: ['deposit', 'accounts'],
    queryFn: depositService.getStoreAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateDepositRequest() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (data: CreateDepositRequest) => depositService.createDepositRequest(data),
    onSuccess: () => {
      success('สร้างคำขอฝากเงินสำเร็จ', 'กรุณาอัพโหลดสลิปการโอนเงิน')
    },
    onError: (error: any) => {
      console.error('Create deposit request error:', error)
      error('สร้างคำขอฝากเงินไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาดในการสร้างคำขอฝากเงิน')
    }
  })
}

export function useUploadSlip() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const router = useRouter()

  return useMutation({
    mutationFn: ({ depositRequestId, file }: { depositRequestId: string; file: File }) =>
      depositService.uploadSlip(depositRequestId, file),
    onSuccess: (data) => {
      // Invalidate wallet data to refresh balance
      queryClient.invalidateQueries({ queryKey: ['wallet'] })

      let successMessage = 'การตรวจสอบสลิปเสร็จสิ้น เงินได้เข้าสู่บัญชีของคุณแล้ว'

      // Show verification details if available
      if (data?.verification_result) {
        const { amount_match, account_match, verification_score } = data.verification_result
        if (amount_match && account_match) {
          successMessage = `การตรวจสอบสลิปสำเร็จ (คะแนน: ${Math.round((verification_score || 1) * 100)}%) เงินได้เข้าสู่บัญชีของคุณแล้ว`
        }
      }

      if (data?.new_balance) {
        successMessage += ` ยอดเงินปัจจุบัน: ${data.new_balance.toLocaleString()} บาท`
      }

      success('อัพโหลดสลิปสำเร็จ', successMessage)

      // Redirect to wallet page after successful upload
      setTimeout(() => {
        router.push('/wallet')
      }, 3000) // Wait 3 seconds to show the success message
    },
    onError: (error: any) => {
      console.error('Upload slip error:', error)

      // Parse error details for better user experience
      let errorTitle = 'อัพโหลดสลิปไม่สำเร็จ'
      let errorMessage = 'เกิดข้อผิดพลาดในการอัพโหลดสลิป'

      if (error.message) {
        if (error.message.includes('Duplicate slip detected')) {
          errorTitle = 'สลิปซ้ำ'
          errorMessage = 'สลิปนี้เคยถูกใช้งานแล้ว กรุณาใช้สลิปใหม่'
        } else if (error.message.includes('Invalid slip format')) {
          errorTitle = 'รูปแบบสลิปไม่ถูกต้อง'
          errorMessage = 'กรุณาตรวจสอบรูปแบบของสลิปและลองใหม่อีกครั้ง'
        } else if (error.message.includes('Amount mismatch')) {
          errorTitle = 'จำนวนเงินไม่ตรงกัน'
          errorMessage = 'จำนวนเงินในสลิปไม่ตรงกับจำนวนที่ระบุ'
        } else if (error.message.includes('Account mismatch')) {
          errorTitle = 'บัญชีไม่ตรงกัน'
          errorMessage = 'บัญชีปลายทางในสลิปไม่ตรงกับบัญชีที่เลือก'
        } else if (error.message.includes('Slip verification failed')) {
          errorTitle = 'ตรวจสอบสลิปไม่สำเร็จ'
          errorMessage = 'ไม่สามารถตรวจสอบสลิปได้ กรุณาตรวจสอบความชัดเจนของภาพและลองใหม่'
        } else {
          errorMessage = error.message
        }
      }

      error(errorTitle, errorMessage)

      // Redirect to wallet page to show transaction history after error
      setTimeout(() => {
        router.push('/wallet')
      }, 3000) // Wait 3 seconds to show the error message
    }
  })
}

export function useUserDeposits(params: DepositListParams = {}) {
  return useQuery({
    queryKey: ['deposits', 'user', params],
    queryFn: () => depositService.getUserDeposits(params),
    staleTime: 30 * 1000, // 30 seconds
  })
}
