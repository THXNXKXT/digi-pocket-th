import api from '@/lib/api'

export interface WalletBalance {
  balance: number
}

export interface WalletTransaction {
  id: string
  type: 'deposit' | 'withdraw' | 'purchase' | 'refund'
  amount: number
  description?: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface DepositRequest {
  amount: number
}



export const walletService = {
  async getBalance(): Promise<WalletBalance> {
    const response = await api.get('/wallet/balance')
    return response.data.data
  },

  async getTransactions(limit: number = 20): Promise<WalletTransaction[]> {
    const response = await api.get(`/wallet/transactions?limit=${limit}`)
    return response.data.data
  },

  async getTransactionsWithFilters(params: {
    limit?: number
    page?: number
    type?: string
    status?: string
    search?: string
  } = {}): Promise<WalletTransaction[]> {
    const searchParams = new URLSearchParams()

    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.type && params.type !== 'all') searchParams.append('type', params.type)
    if (params.status && params.status !== 'all') searchParams.append('status', params.status)
    if (params.search) searchParams.append('search', params.search)

    const response = await api.get(`/wallet/transactions?${searchParams.toString()}`)
    return response.data.data
  },

  async deposit(data: DepositRequest): Promise<void> {
    const response = await api.post('/wallet/deposit', data)
    return response.data.data
  }
}
