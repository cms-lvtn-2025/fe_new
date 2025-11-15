'use client'

import { useMyTeacherProfile } from '@/lib/graphql/hooks'
import { ProfileCard, SystemRolesCard } from '@/components/teacher/info'

export default function TeacherProfilePage() {
  // Fetch profile using hook
  const { profile, loading } = useMyTeacherProfile()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Thông tin cá nhân
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Thông tin tài khoản của bạn
        </p>
      </div>

      {/* Profile Card */}
      <ProfileCard profile={profile} />

      {/* Roles Section */}
      <div className="mt-6">
        <SystemRolesCard roles={profile?.roles || []} />
      </div>
    </div>
  )
}
