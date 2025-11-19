'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMySupervisedTopicCouncils } from '@/lib/graphql/hooks'
import { FileText, Users, Calendar, Upload, Download } from 'lucide-react'
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

const STAGE_LABELS: Record<string, string> = {
  STAGE_1: 'Giai đoạn 1',
  STAGE_2: 'Giai đoạn 2',
}

export default function TeacherTopicsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const handleImportExcel = () => {
    alert('Chức năng Import Excel điểm sẽ được triển khai sau khi backend hoàn thiện')
  }

  const handleExportExcel = () => {
    alert('Chức năng Export Excel điểm sẽ được triển khai sau khi backend hoàn thiện')
  }

  // Build filters for backend
  const buildFilters = () => {
    const filters: any[] = []

    // Search filter - search in topic title or id
    if (searchTerm.trim()) {
      filters.push({
        group: {
          logic: 'OR',
          filters: [
            {
              condition: {
                field: 'topicCouncil.topic.title',
                operator: 'LIKE',
                values: [searchTerm.trim()],
              },
            },
            {
              condition: {
                field: 'topicCouncil.topic.id',
                operator: 'LIKE',
                values: [searchTerm.trim()],
              },
            },
          ],
        },
      })
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filters.push({
        condition: {
          field: 'topicCouncil.topic.status',
          operator: 'EQUAL',
          values: [selectedStatus],
        },
      })
    }

    return filters
  }

  const { topicCouncils, total, loading, error, refetch } = useMySupervisedTopicCouncils({
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

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
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

  const handleViewDetail = (topicCouncil: any) => {
    const topicCouncilData = {
      id: topicCouncil.id,
      topicCouncilCode: topicCouncil.topicCouncilCode,
      teacherSupervisorCode: topicCouncil.teacherSupervisorCode,
      topicCouncil: topicCouncil.topicCouncil,
      createdAt: topicCouncil.createdAt,
      updatedAt: topicCouncil.updatedAt,
      backUrl: '/teacher/topics'
    }
    sessionStorage.setItem('topicCouncilDetailData', JSON.stringify(topicCouncilData))
    router.push(`/teacher/topics/${topicCouncil.id}`)
  }

  if (error) {
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
          Đề tài đang hướng dẫn
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Quản lý các đề tài bạn đang hướng dẫn
        </p>
      </div>

      {/* Search and Filters */}
      <SearchBar
        onSearch={handleSearchChange}
        onRefresh={handleRefresh}
        placeholder="Tìm kiếm theo tên đề tài hoặc mã..."
        className="mb-6"
      >
        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Import Button */}
        <button
          onClick={handleImportExcel}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Import điểm từ Excel"
        >
          <Upload className="w-5 h-5" />
          Import
        </button>

        {/* Export Button */}
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Export điểm ra Excel"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </SearchBar>

      {/* Topics Table */}
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
                    Giai đoạn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sinh viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tiến độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lịch bảo vệ
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topicCouncils.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-500 dark:text-gray-400">
                        {searchTerm || selectedStatus !== 'all'
                          ? 'Không tìm thấy đề tài nào'
                          : 'Bạn chưa hướng dẫn đề tài nào'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  topicCouncils.map((tc: any) => {
                    const topic = tc.topicCouncil?.topic
                    const topicCouncil = tc.topicCouncil
                    const enrollments = topicCouncil?.enrollments || []

                    return (
                      <tr key={tc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                            {topic?.id || '-'}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 cursor-pointer"
                          onClick={() => handleViewDetail(tc)}
                        >
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            {topic?.title || 'N/A'}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {topic?.major?.title || ''} • {topic?.semester?.title || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                            {STAGE_LABELS[topicCouncil?.stage] || topicCouncil?.stage || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {enrollments.length} sinh viên
                            </span>
                          </div>
                          {enrollments.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {enrollments.slice(0, 2).map((e: any) => e.student?.username).join(', ')}
                              {enrollments.length > 2 && ` +${enrollments.length - 2}`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={topic?.status || 'UNKNOWN'}
                            label={STATUS_LABELS[topic?.status] || topic?.status || 'N/A'}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            <div>Stage 1: {topic?.percentStage1 || 0}%</div>
                            <div>Stage 2: {topic?.percentStage2 || 0}%</div>
                          </div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              alert(`Download file cho đề tài "${topic?.title}"\nAPI sẽ được triển khai sau`)
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                            title="Download file đề tài"
                          >
                            <Download className="w-4 h-4" />
                            File
                          </button>
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
      {!loading && topicCouncils.length > 0 && (
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
