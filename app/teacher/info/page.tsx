'use client'

import { useMemo } from 'react'
import {
  useMyTeacherProfile,
  useMySupervisedTopicCouncils,
  useMyDefences,
  useMyGradeReviews,
} from '@/lib/graphql/hooks'
import { useSemester } from '@/lib/contexts/semester-context'
import { createSemesterSearch } from '@/lib/graphql/utils'
import { ProfileCard, SystemRolesCard, DynamicRolesCard, StatisticsCard } from '@/components/teacher/info'

export default function TeacherInfoPage() {
  const { currentSemester, currentTeacherRole } = useSemester()

  // Lấy thông tin profile
  const { profile, loading: profileLoading } = useMyTeacherProfile()

  // Tạo search variables sử dụng useMemo để tránh re-render không cần thiết
  const semesterSearch = useMemo(
    () => createSemesterSearch(currentSemester?.code),
    [currentSemester?.code]
  )

  // Lấy thống kê từ các hooks
  const { total: supervisedCount } = useMySupervisedTopicCouncils(semesterSearch.search)
  const { total: defencesCount } = useMyDefences(semesterSearch.search)
  const { total: reviewsCount } = useMyGradeReviews(semesterSearch.search)

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Thông tin cá nhân
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Thông tin chi tiết về tài khoản và hoạt động của bạn
        </p>
      </div>

      {/* Profile Card */}
      <ProfileCard profile={profile} />

      {/* Dynamic Roles Card - Vai trò trong học kỳ hiện tại */}
      <DynamicRolesCard
        currentTeacherRole={currentTeacherRole}
        semesterName={currentSemester?.name}
      />

      {/* System Roles Card - Vai trò hệ thống */}
      <SystemRolesCard roles={profile?.roles || []} />

      {/* Statistics Card */}
      <StatisticsCard
        semesterName={currentSemester?.name}
        supervisedCount={supervisedCount}
        defencesCount={defencesCount}
        reviewsCount={reviewsCount}
      />
    </div>
  )
}
