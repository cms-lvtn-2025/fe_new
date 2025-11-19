'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMyEnrollments } from '@/lib/graphql/hooks'
import { FileText, User, Award, Calendar } from 'lucide-react'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge'

const STATUS_LABELS: Record<string, string> = {
  SUBMIT: 'Đã nộp',
  TOPIC_PENDING: 'Chờ duyệt',
  APPROVED_1: 'Duyệt lần 1',
  APPROVED_2: 'Duyệt lần 2',
  IN_PROGRESS: 'Đang thực hiện',
  TOPIC_COMPLETED: 'Hoàn thành',
  REJECTED: 'Từ chối',
}

export default function StudentThesisPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Build filters for backend
  const buildFilters = () => {
    const filters: any[] = []

    // Search filter
    if (searchTerm.trim()) {
      filters.push({
        group: {
          logic: 'OR',
          filters: [
            {
              condition: {
                field: 'topic.title',
                operator: 'LIKE',
                values: [searchTerm.trim()],
              },
            },
            {
              condition: {
                field: 'topic.id',
                operator: 'LIKE',
                values: [searchTerm.trim()],
              },
            },
          ],
        },
      })
    }

    return filters
  }

  const { enrollments, total, loading, error, refetch } = useMyEnrollments({
    pagination: {
      page: currentPage,
      pageSize,
      sortBy: 'created_at',
      descending: true
    },
    filters: buildFilters()
  })

  const totalPages = Math.ceil(total / pageSize)

  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleViewDetail = (enrollment: any) => {
    const enrollmentData = {
      id: enrollment.id,
      studentCode: enrollment.studentCode,
      topicCouncilCode: enrollment.topicCouncilCode,
      midtermFile: enrollment.midtermFile,
      finalFile: enrollment.finalFile,
      topic: enrollment.topicCouncil?.topic,
      topicCouncil: enrollment.topicCouncil,
      student: enrollment.student,
      gradeTopicCouncils: enrollment.gradeTopicCouncils,
      gradeDefences: enrollment.gradeDefences,
      gradeReview: enrollment.gradeReview,
      midterm: enrollment.midterm,
      final: enrollment.final,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      backUrl: '/student/thesis'
    }
    sessionStorage.setItem('enrollmentDetailData', JSON.stringify(enrollmentData))
    router.push(`/student/thesis/${enrollment.id}`)
  }

  if (error && !enrollments) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Lỗi: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Luận văn của tôi
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Xem thông tin luận văn, nộp file và xem điểm
        </p>
      </div>

      {/* Search and Filters */}
      <SearchBar
        onSearch={handleSearchChange}
        onRefresh={handleRefresh}
        placeholder="Tìm kiếm theo tên đề tài..."
        className="mb-6"
      />

      {/* Enrollments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="text-gray-600 dark:text-gray-400">Đang tải...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mã đề tài
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tên đề tài
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Giảng viên HD
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Điểm giữa kỳ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Điểm cuối kỳ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lịch bảo vệ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-500 dark:text-gray-400">
                        {searchTerm
                          ? 'Không tìm thấy luận văn nào'
                          : 'Bạn chưa đăng ký luận văn nào'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  enrollments.map((enrollment: any) => {
                    const topic = enrollment.topicCouncil?.topic
                    const topicCouncil = enrollment.topicCouncil
                    const supervisors = topicCouncil?.supervisors || []
                    const gradeTopicCouncils = enrollment.gradeTopicCouncils || []

                    // Calculate average midterm and final scores
                    const midtermGrades = gradeTopicCouncils.filter((g: any) => g.midtermScore !== null && g.midtermScore !== undefined)
                    const finalGrades = gradeTopicCouncils.filter((g: any) => g.finalScore !== null && g.finalScore !== undefined)
                    const avgMidterm = midtermGrades.length > 0
                      ? (midtermGrades.reduce((sum: number, g: any) => sum + g.midtermScore, 0) / midtermGrades.length).toFixed(2)
                      : null
                    const avgFinal = finalGrades.length > 0
                      ? (finalGrades.reduce((sum: number, g: any) => sum + g.finalScore, 0) / finalGrades.length).toFixed(2)
                      : null

                    return (
                      <tr key={enrollment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                            {topic?.id || 'N/A'}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 cursor-pointer"
                          onClick={() => handleViewDetail(enrollment)}
                        >
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            {topic?.title || 'N/A'}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {topic?.major?.title || ''} • {topic?.semester?.title || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {supervisors.length > 0 ? (
                            <div>
                              {supervisors.slice(0, 2).map((s: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-900 dark:text-gray-100">
                                    {s.teacher?.fullname || s.teacher?.username || 'N/A'}
                                  </span>
                                </div>
                              ))}
                              {supervisors.length > 2 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  +{supervisors.length - 2} giảng viên khác
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">Chưa có</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={topic?.status || 'UNKNOWN'}
                            label={STATUS_LABELS[topic?.status] || topic?.status || 'N/A'}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {avgMidterm !== null ? (
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {avgMidterm}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">Chưa có</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {avgFinal !== null ? (
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {avgFinal}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">Chưa có</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {topicCouncil?.timeStart ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-gray-900 dark:text-gray-100">
                                  {new Date(topicCouncil.timeStart).toLocaleDateString('vi-VN')}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(topicCouncil.timeStart).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">Chưa có lịch</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && enrollments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}
