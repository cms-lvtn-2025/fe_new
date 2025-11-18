'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDepartmentTopics, useApproveTopicStage1, useRejectTopicStage1 } from '@/lib/graphql/hooks'
import { FileText, CheckCircle, XCircle, AlertCircle, Upload, Download } from 'lucide-react'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge'

interface Topic {
  id: string
  title: string
  status: string
  majorCode: string
  semesterCode: string
  percentStage1?: number
  percentStage2?: number
  createdAt: string
  updatedAt: string
  files?: any[]
  topicCouncils?: any[]
}

const STATUS_LABELS: Record<string, string> = {
  SUBMIT: 'Đã nộp',
  TOPIC_PENDING: 'Chờ duyệt',
  APPROVED_1: 'Duyệt lần 1',
  APPROVED_2: 'Duyệt lần 2',
  IN_PROGRESS: 'Đang thực hiện',
  TOPIC_COMPLETED: 'Hoàn thành',
  REJECTED: 'Từ chối',
}

export default function DepartmentTopicsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingTopicId, setRejectingTopicId] = useState<string | null>(null)

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
                field: 'title',
                operator: 'LIKE',
                values: [searchTerm.trim()],
              },
            },
            {
              condition: {
                field: 'id',
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
          field: 'status',
          operator: 'EQUAL',
          values: [selectedStatus],
        },
      })
    }

    return filters
  }

  const { topics, total, loading, error, refetch } = useDepartmentTopics({
    pagination: {
      page: currentPage,
      pageSize,
      sortBy: 'created_at',
      descending: true
    },
    filters: buildFilters()
  })

  const { approveTopicStage1, loading: approving } = useApproveTopicStage1()
  const { rejectTopicStage1, loading: rejecting } = useRejectTopicStage1()

  const handleApprove = async (topicId: string) => {
    if (!confirm('Bạn có chắc muốn duyệt đề tài này?')) return

    try {
      await approveTopicStage1({
        variables: { id: topicId }
      })
      alert('Đã duyệt đề tài thành công!')
      refetch()
    } catch (error) {
      alert('Lỗi khi duyệt đề tài: ' + (error as Error).message)
    }
  }

  const handleReject = async (topicId: string) => {
    setRejectingTopicId(topicId)
  }

  const confirmReject = async () => {
    if (!rejectingTopicId) return
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối')
      return
    }

    try {
      await rejectTopicStage1({
        variables: {
          id: rejectingTopicId,
          reason: rejectReason
        }
      })
      alert('Đã từ chối đề tài!')
      setRejectingTopicId(null)
      setRejectReason('')
      refetch()
    } catch (error) {
      alert('Lỗi khi từ chối đề tài: ' + (error as Error).message)
    }
  }

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

  const handleViewDetail = (topic: Topic) => {
    const topicData = {
      id: topic.id,
      title: topic.title,
      majorCode: topic.majorCode,
      semesterCode: topic.semesterCode,
      status: topic.status,
      percentStage1: topic.percentStage1,
      percentStage2: topic.percentStage2,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      files: topic.files,
      topicCouncils: topic.topicCouncils,
      backUrl: '/department/topics'
    }
    sessionStorage.setItem('topicDetailData', JSON.stringify(topicData))
    router.push(`/department/topics/${topic.id}`)
  }

  if (error && !topics) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Lỗi: {error.message}</p>
      </div>
    )
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Quản lý Đề tài
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Duyệt và quản lý đề tài của khoa
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Chức năng Import Excel sẽ được triển khai sau khi backend hoàn thiện')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            title="Import điểm từ Excel"
          >
            <Upload className="w-5 h-5" />
            Import Excel
          </button>
          <button
            onClick={() => alert('Chức năng Export Excel sẽ được triển khai sau khi backend hoàn thiện')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Export điểm ra Excel"
          >
            <Download className="w-5 h-5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchBar
        onSearch={handleSearchChange}
        onRefresh={handleRefresh}
        placeholder="Tìm kiếm theo tên đề tài..."
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
                    Mã khoa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tiến độ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topics.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-500 dark:text-gray-400">
                        {searchTerm || selectedStatus !== 'all'
                          ? 'Không tìm thấy đề tài nào'
                          : 'Chưa có đề tài nào'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  topics.map((topic: any) => (
                    <tr key={topic.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                          {topic.id}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => handleViewDetail(topic)}
                      >
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                          {topic.title}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {topic.majorCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={topic.status}
                          label={STATUS_LABELS[topic.status] || topic.status}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          <div>Stage 1: {topic.percentStage1 || 0}%</div>
                          <div>Stage 2: {topic.percentStage2 || 0}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Approve - Only for TOPIC_PENDING */}
                          {topic.status === 'TOPIC_PENDING' && (
                            <button
                              onClick={() => handleApprove(topic.id)}
                              disabled={approving}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Phê duyệt"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reject */}
                          <button
                            onClick={() => handleReject(topic.id)}
                            disabled={rejecting}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Từ chối"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && topics.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Reject Modal */}
      {rejectingTopicId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Từ chối đề tài
              </h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lý do từ chối <span className="text-red-600">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Nhập lý do từ chối đề tài..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRejectingTopicId(null)
                  setRejectReason('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                disabled={rejecting || !rejectReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejecting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
