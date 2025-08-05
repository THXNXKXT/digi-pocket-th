import api from '@/lib/api'

export interface UserProfile {
  id: string
  username: string
  email: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  orders: {
    total: number
    totalSpent: number
    recent: Array<{
      id: string
      totalAmount: number
      status: string
      createdAt: string
    }>
  }
  transactions: {
    total: number
    totalAmount: number
  }
  memberSince: string
}

export interface UpdateProfileData {
  // Currently no additional profile fields to update
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/profile')
    return response.data.data
  },

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await api.put('/profile', data)
    return response.data.data
  },

  async getStats(): Promise<UserStats> {
    const response = await api.get('/profile/stats')
    return response.data.data
  }
}
