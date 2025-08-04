'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/services/auth.service'

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'customer'
  status: 'active' | 'suspended' | 'banned' | 'pending'
}

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    setIsLoading(true)
    const authenticated = authService.isAuthenticated()
    setIsAuthenticated(authenticated)
    
    if (authenticated) {
      // In a real app, you would fetch user data from API
      // For now, we'll use mock data
      setUser({
        id: '1',
        username: 'ผู้ใช้งาน',
        email: 'user@example.com',
        role: 'customer',
        status: 'active'
      })
    } else {
      setUser(null)
    }
    
    setIsLoading(false)
  }

  const login = (userData: User) => {
    setIsAuthenticated(true)
    setUser(userData)
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    checkAuthStatus
  }
}
