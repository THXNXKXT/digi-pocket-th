import api from '@/lib/api'
import { Order } from '@/types/api'

export interface CreateOrderRequest {
  productId: string
  quantity: number
  unitPrice: number
  uid: string
}

export interface CreateOrderResponse {
  success: boolean
  message: string
  data: Order
}

export const orderService = {
  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const response = await api.post('/orders', orderData)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order')
    }
  },

  /**
   * Get user's orders
   */
  async getUserOrders(): Promise<Order[]> {
    try {
      const response = await api.get('/orders')
      return response.data.data || []
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders')
    }
  },

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await api.get(`/orders/${orderId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order')
    }
  },

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<void> {
    try {
      await api.patch(`/orders/${orderId}/cancel`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order')
    }
  }
}
