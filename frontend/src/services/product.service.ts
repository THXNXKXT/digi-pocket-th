import api, { apiCall } from '@/lib/api'
import type { Product } from '@/types/api'

export const productService = {
  // GET /products/app-premium
  getAppPremiumProducts: async (): Promise<Product[]> => {
    return apiCall(() => api.get('/products/app-premium'))
  },

  // GET /products/preorder
  getPreorderProducts: async (): Promise<Product[]> => {
    return apiCall(() => api.get('/products/preorder'))
  },

  // GET /products/game
  getGameProducts: async (): Promise<Product[]> => {
    return apiCall(() => api.get('/products/game'))
  },

  // GET /products/mobile
  getMobileProducts: async (): Promise<Product[]> => {
    return apiCall(() => api.get('/products/mobile'))
  },

  // GET /products/cashcard
  getCashCardProducts: async (): Promise<Product[]> => {
    return apiCall(() => api.get('/products/cashcard'))
  },

  // Generic function to get products by type
  getProductsByType: async (type: Product['type']): Promise<Product[]> => {
    return apiCall(() => api.get(`/products/${type}`))
  },

  // GET /orders/price/:productId (Auth Required)
  getProductPrice: async (productId: string): Promise<{ price: string }> => {
    return apiCall(() => api.get(`/orders/price/${productId}`))
  },

  // Helper function to get all products
  getAllProducts: async (): Promise<Record<Product['type'], Product[]>> => {
    const [appPremium, preorder, game, mobile, cashcard] = await Promise.all([
      productService.getAppPremiumProducts(),
      productService.getPreorderProducts(),
      productService.getGameProducts(),
      productService.getMobileProducts(),
      productService.getCashCardProducts(),
    ])

    return {
      'app-premium': appPremium,
      preorder,
      game,
      mobile,
      cashcard,
    }
  },

  // Helper function to search products
  searchProducts: async (query: string, type?: Product['type']): Promise<Product[]> => {
    let products: Product[] = []
    
    if (type) {
      products = await productService.getProductsByType(type)
    } else {
      const allProducts = await productService.getAllProducts()
      products = Object.values(allProducts).flat()
    }

    // Simple client-side search
    const searchTerm = query.toLowerCase()
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    )
  },
}
