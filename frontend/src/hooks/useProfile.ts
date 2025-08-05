import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService, type UpdateProfileData } from '@/services/profile.service'
import { useToast } from '@/components/ui/toast'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProfileStats() {
  return useQuery({
    queryKey: ['profile', 'stats'],
    queryFn: profileService.getStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (data: UpdateProfileData) => profileService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Update the profile cache
      queryClient.setQueryData(['profile'], updatedProfile)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      
      success('อัพเดทโปรไฟล์สำเร็จ', 'ข้อมูลโปรไฟล์ของคุณได้รับการอัพเดทแล้ว')
    },
    onError: (error: any) => {
      console.error('Update profile error:', error)
      error('อัพเดทโปรไฟล์ไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์')
    }
  })
}
