import axios, { AxiosResponse, AxiosError } from 'axios'

// API Response Types
export interface ApiSuccess<T = any> {
  success: true
  message: string
  data: T
  timestamp: string
}

export interface ApiError {
  success: false
  message: string
  errors?: any
  timestamp: string
}

// Create API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3031',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = crypto.randomUUID()
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors and responses
api.interceptors.response.use(
  (response: AxiosResponse<ApiSuccess>) => {
    return response
  },
  (error: AxiosError<ApiError>) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - clear tokens and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('sessionToken')
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login'
            }
          }
          break

        case 403:
          // Forbidden - show access denied message
          console.error('Access denied:', data?.message)
          break

        case 404:
          // Not found
          console.error('Resource not found:', data?.message)
          break

        case 429:
          // Rate limit exceeded
          console.error('Rate limit exceeded:', data?.message)
          break

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error('Server error:', data?.message)
          break

        default:
          console.error('API Error:', data?.message)
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message)
    } else {
      // Other error
      console.error('Error:', error.message)
    }

    return Promise.reject(error)
  }
)

// Helper function to handle API calls with proper typing
export async function apiCall<T>(
  apiFunction: () => Promise<AxiosResponse<ApiSuccess<T>>>
): Promise<T> {
  try {
    const response = await apiFunction()
    return response.data.data
  } catch (error) {
    throw error
  }
}

// Helper function for file uploads
export async function uploadFile<T>(
  url: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }

  const response = await api.post<ApiSuccess<T>>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}

export default api
