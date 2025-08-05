import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { walletService, type DepositRequest } from '@/services/wallet.service'
import { useToast } from '@/components/ui/toast'

export function useWalletBalance() {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletService.getBalance,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

export function useWalletTransactions(limit: number = 20) {
  return useQuery({
    queryKey: ['wallet', 'transactions', limit],
    queryFn: () => walletService.getTransactions(limit),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useWalletTransactionsWithFilters(params: {
  limit?: number
  page?: number
  type?: string
  status?: string
  search?: string
} = {}) {
  return useQuery({
    queryKey: ['wallet', 'transactions', 'filtered', params],
    queryFn: () => walletService.getTransactionsWithFilters(params),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useDeposit() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (data: DepositRequest) => walletService.deposit(data),
    onSuccess: () => {
      // Invalidate and refetch wallet data
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      
      success('ฝากเงินสำเร็จ', 'ยอดเงินในกระเป๋าของคุณได้รับการอัพเดทแล้ว')
    },
    onError: (error: any) => {
      console.error('Deposit error:', error)
      error('ฝากเงินไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาดในการฝากเงิน')
    }
  })
}


