import api, { apiCall } from '@/lib/api'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/api'

export const authService = {
  // POST /auth/login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiCall(() => api.post('/auth/login', credentials))
  },

  // POST /auth/register
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    return apiCall(() => api.post('/auth/register', userData))
  },

  // POST /auth/logout (Auth Required)
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } finally {
      // Always clear local storage even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('sessionToken')
      }
    }
  },

  // Helper functions for token management
  setTokens: (tokens: { token: string; sessionToken: string }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', tokens.token)
      localStorage.setItem('sessionToken', tokens.sessionToken)
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },

  getSessionToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sessionToken')
    }
    return null
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('sessionToken')
    }
  },

  isAuthenticated: (): boolean => {
    return !!authService.getToken()
  },
}
