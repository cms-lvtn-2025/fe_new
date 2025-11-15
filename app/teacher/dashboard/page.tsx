'use client'

import { useMyTeacherProfile } from '@/lib/graphql/hooks'
import { useSemester } from '@/lib/contexts/semester-context'
import { RoleNavigation } from '@/components/teacher/navigation'
import { RoleType } from '@/types/teacher'

export default function TeacherDashboard() {
  const { profile, loading: profileLoading } = useMyTeacherProfile()
  const { currentSemester, loading: semesterLoading } = useSemester()

  const loading = profileLoading || semesterLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  // Lấy danh sách unique roles từ profile (chỉ lấy roles đang hoạt động)
  const userRoles: RoleType[] = profile?.roles
    ? Array.from(new Set(profile.roles.filter((r: any) => r.activate).map((r: any) => r.role as RoleType)))
    : []

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard Giảng viên
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Chào mừng {profile?.username || 'bạn'} trở lại - Học kỳ: {currentSemester?.name || 'N/A'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Role Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Vai trò của bạn
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Click vào từng vai trò để xem các chức năng
            </p>
            <RoleNavigation roles={userRoles} />
          </div>
        </div>

        {/* Right: Quick Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="text-4xl">👨‍🎓</div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sinh viên hướng dẫn
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    -
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="text-4xl">📝</div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bài cần chấm
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    -
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="text-4xl">📅</div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lịch bảo vệ
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    -
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🔔</div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Thông báo mới
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    3
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Hoạt động gần đây
            </h2>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-4">📋</div>
              <p>Chưa có hoạt động nào</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
