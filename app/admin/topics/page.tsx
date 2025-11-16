'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { GET_ALL_TOPICS, GET_ALL_SEMESTERS } from '@/lib/graphql/queries/admin'
import { Plus, Eye, CheckCircle, XCircle, RefreshCw, Search, Filter, RotateCcw } from 'lucide-react'
import { ViewTopicDialog } from '@/components/admin/topics/view-topic-dialog'
import { ApproveTopicDialog } from '@/components/admin/topics/approve-topic-dialog'
import { RejectTopicDialog } from '@/components/admin/topics/reject-topic-dialog'
import { MoveToProgressDialog } from '@/components/admin/topics/move-to-progress-dialog'

interface Topic {
  id: string
  title: string
  status: string
  description?: string
  percentStage1?: number
  percentStage2?: number
  studentCode?: string
  teacherCode?: string
  createdAt: string
  updatedAt: string
  topicCouncils?: {
    id: string
    stage: string
    timeStart: string
    timeEnd: string
    supervisors?: Array<{
      id: string
      teacherSupervisorCode: string
      teacher: {
        id: string
        username: string
        email: string
      }
    }>
  }[]
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

const STATUS_COLORS: Record<string, string> = {
  SUBMIT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  TOPIC_PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  APPROVED_1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  APPROVED_2: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  TOPIC_COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const STAGE_LABELS: Record<string, string> = {
  STAGE_DACN: 'Giai đoạn 1 (ĐACN)',
  STAGE_LVTN: 'Giai đoạn 2 (LVTN)',
}

const STAGE_COLORS: Record<string, string> = {
  STAGE_DACN: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  STAGE_LVTN: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
}

export default function TopicsManagementPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedSemester, setSelectedSemester] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [viewingTopic, setViewingTopic] = useState<Topic | null>(null)
  const [approvingTopic, setApprovingTopic] = useState<Topic | null>(null)
  const [rejectingTopic, setRejectingTopic] = useState<Topic | null>(null)
  const [movingTopic, setMovingTopic] = useState<Topic | null>(null)

  // Fetch semesters
  const { data: semestersData } = useQuery(GET_ALL_SEMESTERS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 100, sortBy: 'created_at', descending: true },
        filters: [],
      },
    },
  })

  const semesters = useMemo(() => {
    return semestersData?.getAllSemesters?.data || []
  }, [semestersData])

  // Build filters for backend
  const buildFilters = () => {
    const filters: any[] = []

    // Semester filter
    if (selectedSemester !== 'all') {
      filters.push({
        condition: {
          field: 'semester_code',
          operator: 'EQUAL',
          values: [selectedSemester],
        },
      })
    }

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
            {
              condition: {
                field: 'studentCode',
                operator: 'LIKE',
                values: [searchTerm.trim()],
              },
            },
            {
              condition: {
                field: 'teacherCode',
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

  // Fetch topics
  const { data, loading, refetch } = useQuery(GET_ALL_TOPICS, {
    variables: {
      search: {
        pagination: {
          page: currentPage,
          pageSize: pageSize,
          sortBy: 'created_at',
          descending: true
        },
        filters: buildFilters(),
      },
    },
    fetchPolicy: 'network-only',
  })

  const topics: Topic[] = (data as any)?.getAllTopics?.data || []
  const total: number = (data as any)?.getAllTopics?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  const handleRefresh = () => {
    refetch()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    refetch()
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    refetch()
  }

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput)
    setCurrentPage(1)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    setCurrentPage(1)
  }

  const handleSuccess = () => {
    setViewingTopic(null)
    setApprovingTopic(null)
    setRejectingTopic(null)
    setMovingTopic(null)
    refetch()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Quản lý đề tài
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Quản lý và phê duyệt các đề tài luận văn
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm đề tài..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearchSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              Tìm kiếm
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Semester Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">Tất cả học kỳ</option>
                {semesters.map((semester: any) => (
                  <option key={semester.id} value={semester.id}>{semester.title}</option>
                ))}
              </select>
            </div>

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

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="p-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Topics Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
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
                  Giảng viên hướng dẫn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Giai đoạn
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
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm || selectedStatus !== 'all'
                        ? 'Không tìm thấy đề tài nào'
                        : 'Chưa có đề tài nào'}
                    </div>
                  </td>
                </tr>
              ) : (
                topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {topic.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {topic.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {topic.topicCouncils && topic.topicCouncils.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {topic.topicCouncils
                            .flatMap((tc) => tc.supervisors || [])
                            .filter((sup, index, self) =>
                              index === self.findIndex((s) => s.teacher.id === sup.teacher.id)
                            )
                            .map((sup) => (
                              <span
                                key={sup.id}
                                className="text-sm text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded"
                              >
                                {sup.teacher.username}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[topic.status] || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[topic.status] || topic.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {topic.topicCouncils && topic.topicCouncils.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(topic.topicCouncils.map(tc => tc.stage))).map((stage) => (
                            <span
                              key={stage}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${STAGE_COLORS[stage] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {STAGE_LABELS[stage] || stage}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Detail */}
                        <button
                          onClick={() => {
                            const topicData = { ...topic, backUrl: '/admin/topics' }
                            sessionStorage.setItem('topicDetailData', JSON.stringify(topicData))
                            router.push(`/admin/topics/${topic.id}`)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve - Only for TOPIC_PENDING */}
                        {topic.status === 'TOPIC_PENDING' && (
                          <button
                            onClick={() => setApprovingTopic(topic)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Phê duyệt"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Reject - For all statuses */}
                        <button
                          onClick={() => setRejectingTopic(topic)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Từ chối"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>

                        {/* Move to IN_PROGRESS - Only for REJECTED */}
                        {topic.status === 'REJECTED' && (
                          <button
                            onClick={() => setMovingTopic(topic)}
                            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                            title="Chuyển về đang thực hiện"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Hiển thị {topics.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, total)} của {total} đề tài
        </div>

        <div className="flex items-center gap-4">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Số dòng:
            </label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {viewingTopic && (
        <ViewTopicDialog
          isOpen={!!viewingTopic}
          onClose={() => setViewingTopic(null)}
          topic={viewingTopic}
        />
      )}

      {approvingTopic && (
        <ApproveTopicDialog
          isOpen={!!approvingTopic}
          onClose={() => setApprovingTopic(null)}
          onSuccess={handleSuccess}
          topic={approvingTopic}
        />
      )}

      {rejectingTopic && (
        <RejectTopicDialog
          isOpen={!!rejectingTopic}
          onClose={() => setRejectingTopic(null)}
          onSuccess={handleSuccess}
          topic={rejectingTopic}
        />
      )}

      {movingTopic && (
        <MoveToProgressDialog
          isOpen={!!movingTopic}
          onClose={() => setMovingTopic(null)}
          onSuccess={handleSuccess}
          topic={movingTopic}
        />
      )}
    </div>
  )
}
