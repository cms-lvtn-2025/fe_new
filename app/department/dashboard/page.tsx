'use client'

import { useDepartmentTopics, useDepartmentStudents, useDepartmentCouncils } from '@/lib/graphql/hooks'
import { useSemester } from '@/lib/contexts/semester-context'
import { useRouter } from 'next/navigation'
import { BookOpen, Users, FileText, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function DepartmentDashboard() {
  const router = useRouter()
  const { currentSemester } = useSemester()

  const { topics, loading: topicsLoading } = useDepartmentTopics({
    pagination: { page: 1, pageSize: 100 }
  })

  const { students, loading: studentsLoading } = useDepartmentStudents({
    pagination: { page: 1, pageSize: 100 }
  })

  const { councils, loading: councilsLoading } = useDepartmentCouncils({
    pagination: { page: 1, pageSize: 100 }
  })

  const loading = topicsLoading || studentsLoading || councilsLoading

  // Thống kê đề tài theo trạng thái
  const pendingTopics = topics.filter((t: any) => t.status === 'TOPIC_PENDING').length
  const approvedTopics = topics.filter((t: any) => t.status === 'APPROVED_1' || t.status === 'APPROVED_2').length
  const rejectedTopics = topics.filter((t: any) => t.status === 'REJECTED').length

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard Giáo viên Bộ môn
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Quản lý khoa - Học kỳ: {currentSemester?.name || 'N/A'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/department/topics')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : topics.length}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Tổng đề tài
          </h3>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/department/students')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : students.length}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Sinh viên
          </h3>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/department/councils')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : councils.length}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Hội đồng
          </h3>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/department/defences')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : councils.length}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Lịch bảo vệ
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Thống kê đề tài
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Chờ duyệt
                </span>
              </div>
              <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {loading ? '...' : pendingTopics}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Đã duyệt
                </span>
              </div>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : approvedTopics}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Từ chối
                </span>
              </div>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                {loading ? '...' : rejectedTopics}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/department/topics')}
              className="p-4 text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Duyệt đề tài
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {pendingTopics} đề tài chờ duyệt
              </div>
            </button>

            <button
              onClick={() => router.push('/department/councils')}
              className="p-4 text-left bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Quản lý hội đồng
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Tạo và phân công
              </div>
            </button>

            <button
              onClick={() => router.push('/department/students')}
              className="p-4 text-left bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Users className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Sinh viên
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Xem danh sách
              </div>
            </button>

            <button
              onClick={() => router.push('/department/defences')}
              className="p-4 text-left bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Lịch bảo vệ
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Xem lịch trình
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
