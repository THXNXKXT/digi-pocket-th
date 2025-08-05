import { Context } from 'hono'
import { profileService } from '../services/profile.service'
import { ok, badRequest, unauthorized } from '../utils/response'
import { z } from 'zod'

const updateProfileSchema = z.object({
  // Currently no additional profile fields to update
})

export const profileController = {
  // Get user profile
  async getProfile(c: Context) {
    try {
      const userId = c.get('userId')
      if (!userId) {
        const { body, status } = unauthorized('Authentication required')
        return c.json(body, status as any)
      }

      const profile = await profileService.getProfile(userId)
      const { body, status } = ok('Profile retrieved successfully', profile)
      return c.json(body, status as any)
    } catch (error: any) {
      console.error('Get profile error:', error)
      const { body, status } = badRequest(error.message || 'Failed to get profile')
      return c.json(body, status as any)
    }
  },

  // Update user profile
  async updateProfile(c: Context) {
    try {
      const userId = c.get('userId')
      if (!userId) {
        const { body, status } = unauthorized('Authentication required')
        return c.json(body, status as any)
      }

      const body = await c.req.json()
      const validatedData = updateProfileSchema.parse(body)

      const updatedProfile = await profileService.updateProfile(userId, validatedData)
      const { body: responseBody, status } = ok('Profile updated successfully', updatedProfile)
      return c.json(responseBody, status as any)
    } catch (error: any) {
      console.error('Update profile error:', error)
      if (error.name === 'ZodError') {
        const { body, status } = badRequest('Invalid input data')
        return c.json(body, status as any)
      }
      const { body, status } = badRequest(error.message || 'Failed to update profile')
      return c.json(body, status as any)
    }
  },

  // Get user statistics
  async getStats(c: Context) {
    try {
      const userId = c.get('userId')
      if (!userId) {
        const { body, status } = unauthorized('Authentication required')
        return c.json(body, status as any)
      }

      const stats = await profileService.getUserStats(userId)
      const { body, status } = ok('User statistics retrieved successfully', stats)
      return c.json(body, status as any)
    } catch (error: any) {
      console.error('Get stats error:', error)
      const { body, status } = badRequest(error.message || 'Failed to get user statistics')
      return c.json(body, status as any)
    }
  }
}
