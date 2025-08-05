import api from '@/lib/api'

export interface StoreAccount {
  id: string
  bank_name: string
  account_number: string
  account_name: string
  promptpay_number?: string
}

export interface DepositRequest {
  request_id: string
  amount: number
  status: string
  account_info: {
    account_number: string
    account_name: string
    bank_name: string
    promptpay_number?: string
  }
  recovery_token: string
  expires_at: string
  instructions: string[]
}

export interface SlipUploadResponse {
  success: boolean
  message: string
  verification_result?: {
    amount_match: boolean
    account_match: boolean
    name_match?: boolean
    verification_score?: number
  }
  balance_updated?: boolean
  new_balance?: number
}

export interface CreateDepositRequest {
  store_account_id: string
  amount: number
}

export interface UserDeposit {
  id: string
  amount: number
  status: string
  storeAccountId: string
  expiresAt: string
  createdAt: string
  updatedAt: string
  bankName: string
  accountNumber: string
  accountName: string
  promptpayNumber?: string
  slipId?: string
  slipTransactionId?: string
  slipStatus?: string
  slipCreatedAt?: string
  slipVerificationScore?: number
}

export interface DepositListParams {
  limit?: number
  page?: number
  status?: string
}

export interface DepositListResponse {
  deposits: UserDeposit[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const depositService = {
  async getStoreAccounts(): Promise<StoreAccount[]> {
    const response = await api.get('/wallet/deposit/accounts')
    return response.data.data.accounts
  },

  async createDepositRequest(data: CreateDepositRequest): Promise<DepositRequest> {
    const response = await api.post('/wallet/deposit/request', data)
    return response.data.data
  },

  async uploadSlip(depositRequestId: string, file: File): Promise<SlipUploadResponse> {
    const formData = new FormData()
    formData.append('slip_image', file)

    const response = await api.post(`/wallet/deposit/request/${depositRequestId}/slip`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data.data
  },

  async getUserDeposits(params: DepositListParams = {}): Promise<DepositListResponse> {
    const searchParams = new URLSearchParams()

    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.status && params.status !== 'all') searchParams.append('status', params.status)

    const response = await api.get(`/wallet/deposit?${searchParams.toString()}`)
    return response.data.data
  }
}
