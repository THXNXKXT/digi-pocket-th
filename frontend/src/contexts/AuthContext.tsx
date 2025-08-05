'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import type { User } from '@/types/api'

interface AuthContextType {
  user: User | null
  token: string | null
  sessionToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, sessionToken: string, user: User) => void
  logout: () => Promise<void>
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!token

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token')
          const storedSessionToken = localStorage.getItem('sessionToken')
          const storedUser = localStorage.getItem('user')

          if (storedToken && storedSessionToken && storedUser) {
            const parsedUser = JSON.parse(storedUser)

            // Set state synchronously to prevent flash
            setToken(storedToken)
            setSessionToken(storedSessionToken)
            setUser(parsedUser)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear corrupted data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('sessionToken')
          localStorage.removeItem('user')
        }
      } finally {
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => setIsLoading(false), 0)
      }
    }

    initAuth()
  }, [])

  const login = (newToken: string, newSessionToken: string, newUser: User) => {
    // Store in localStorage first
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken)
      localStorage.setItem('sessionToken', newSessionToken)
      localStorage.setItem('user', JSON.stringify(newUser))
    }

    // Update state (this will trigger re-renders)
    setToken(newToken)
    setSessionToken(newSessionToken)
    setUser(newUser)
  }

  const logout = async () => {
    try {
      // Call logout API
      await authService.logout()
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with local logout even if API fails
    } finally {
      // Clear state
      setToken(null)
      setSessionToken(null)
      setUser(null)

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('sessionToken')
        localStorage.removeItem('user')
      }

      // Redirect to home page
      router.push('/')
    }
  }

  const refreshAuth = () => {
    // Re-read from localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token')
      const storedSessionToken = localStorage.getItem('sessionToken')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedSessionToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setToken(storedToken)
          setSessionToken(storedSessionToken)
          setUser(parsedUser)
        } catch (error) {
          console.error('Error parsing stored user:', error)
          logout()
        }
      } else {
        setToken(null)
        setSessionToken(null)
        setUser(null)
      }
    }
  }

  const value: AuthContextType = {
    user,
    token,
    sessionToken,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes
export function useRequireAuth() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/auth/login')
    }
  }, [auth.isLoading, auth.isAuthenticated, router])

  return auth
}
