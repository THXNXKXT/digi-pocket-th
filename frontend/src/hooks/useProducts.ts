'use client'

import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/product.service'
import type { Product } from '@/types/api'

// Hook for fetching all product categories with responsive count
export function useProducts(maxCount?: number) {
  return useQuery({
    queryKey: ['products', 'all', maxCount],
    queryFn: async () => {
      const [appPremium, game, mobile, cashcard] = await Promise.all([
        productService.getAppPremiumProducts(),
        productService.getGameProducts(),
        productService.getMobileProducts(),
        productService.getCashCardProducts(),
      ])

      const count = maxCount || 5 // Default to 5 items

      return {
        'app-premium': appPremium.slice(0, count),
        game: game.slice(0, count),
        mobile: mobile.slice(0, count),
        cashcard: cashcard.slice(0, count),
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for fetching specific product category
export function useProductsByCategory(category: Product['type']) {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      switch (category) {
        case 'app-premium':
          return productService.getAppPremiumProducts()
        case 'game':
          return productService.getGameProducts()
        case 'mobile':
          return productService.getMobileProducts()
        case 'cashcard':
          return productService.getCashCardProducts()
        default:
          throw new Error(`Unknown category: ${category}`)
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Hook for fetching featured/popular products
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      // Get a mix of products from all categories
      const [appPremium, game, mobile, cashcard] = await Promise.all([
        productService.getAppPremiumProducts(),
        productService.getGameProducts(),
        productService.getMobileProducts(),
        productService.getCashCardProducts(),
      ])

      // Take 2 products from each category for featured section
      const featured: Product[] = []
      featured.push(...appPremium.slice(0, 2))
      featured.push(...game.slice(0, 2))
      featured.push(...mobile.slice(0, 2))
      featured.push(...cashcard.slice(0, 2))

      return featured.slice(0, 8) // Limit to 8 featured products
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
