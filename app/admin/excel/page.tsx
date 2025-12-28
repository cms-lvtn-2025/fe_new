'use client'

import { useState, useEffect, useMemo } from 'react'
import { FileSpreadsheet, RefreshCw, Search, Trash2, CheckCircle, Clock, Loader2, Filter, Download, AlertCircle, X } from 'lucide-react'
import Loading from '@/components/common/Loading'
import { getExcelJobs, deleteFile, downloadFile, type ExcelJob } from '@/lib/api/file'
import { useSemester } from '@/lib/contexts/semester-context'

// Helper to parse date
const parseDate = (date: string): Date => {
  return new Date(date)
}

// Helper to get display status (processing + current === sum => completed)
type DisplayStatus = 'pending' | 'processing' | 'completed'
const getDisplayStatus = (job: ExcelJob): DisplayStatus => {
  if (job.status === 'pending') return 'pending'
  if (job.status === 'processing' && job.current >= job.sum && job.sum > 0) return 'completed'
  return 'processing'
}

// Helper to calculate percentage from current/sum
const calculatePercentage = (current: number, sum: number): number => {
  if (sum === 0) return 0
  return Math.min(100, Math.round((current / sum) * 100))
}

// Helper to check if messages are errors (string[]) or success data (object[])
const hasErrorMessages = (messages: (string | Record<string, unknown>)[]): boolean => {
  if (!messages || messages.length === 0) return false
  return typeof messages[0] === 'string'
}

// Helper to get error messages only
const getErrorMessages = (messages: (string | Record<string, unknown>)[]): string[] => {
  if (!messages || messages.length === 0) return []
  return messages.filter((m): m is string => typeof m === 'string')
}

// Status config (display status, not backend status)
const STATUS_CONFIG: Record<DisplayStatus, { label: string; bgClass: string; textClass: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Chờ xử lý',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-800 dark:text-yellow-300',
    icon: <Clock className="w-4 h-4" />,
  },
  processing: {
    label: 'Đang xử lý',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-800 dark:text-blue-300',
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
  },
  completed: {
    label: 'Hoàn thành',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-800 dark:text-green-300',
    icon: <CheckCircle className="w-4 h-4" />,
  },
}

// Upload type labels
const UPLOAD_TYPE_LABELS: Record<string, string> = {
  'student_for_affair': 'Sinh viên (Admin)',
  'teacher_for_affair': 'Giảng viên (Admin)',
  'student-for-affair': 'Sinh viên (Admin)',
  'teacher-for-affair': 'Giảng viên (Admin)',
  'topic_for_affair': 'Đề tài (Admin)',
  'council_for_affair': 'Hội đồng (Admin)',
}

export default function ExcelManagementPage() {
  const [jobs, setJobs] = useState<ExcelJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [selectedJobErrors, setSelectedJobErrors] = useState<{ title: string; errors: string[] } | null>(null)
  const { currentSemester } = useSemester()
  // Fetch jobs
  const fetchJobs = async (semester_code: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getExcelJobs(semester_code, "affair")
      setJobs(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!currentSemester?.id) return

    fetchJobs(currentSemester.id)
    // Auto refresh every 10 seconds
    const interval = setInterval(() => {
      fetchJobs(currentSemester.id)
    }, 10000)
    return () => clearInterval(interval)
  }, [currentSemester])
  // Filter and search
  const filteredJobs = useMemo(() => {
    let result = [...jobs]

    // Status filter (use display status, not backend status)
    if (statusFilter !== 'all') {
      result = result.filter(job => getDisplayStatus(job) === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(job => job.upload_type === typeFilter)
    }

    // Search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      result = result.filter(job =>
        job.title.toLowerCase().includes(search) ||
        job.file.toLowerCase().includes(search) ||
        job.created_by.toLowerCase().includes(search)
      )
    }

    // Sort by created_at descending
    result.sort((a, b) => parseDate(b.created_at).getTime() - parseDate(a.created_at).getTime())

    return result
  }, [jobs, statusFilter, typeFilter, searchTerm])

  // Get unique upload types for filter
  const uploadTypes = useMemo(() => {
    const types = new Set(jobs.map(job => job.upload_type))
    return Array.from(types)
  }, [jobs])

  // Handlers
  const handleSearch = () => {
    setSearchTerm(searchInput)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Bạn có chắc muốn xóa job này?')) return

    try {
      setDeletingId(jobId)
      await deleteFile(jobId, currentSemester?.id || '', true)
      setJobs(prev => prev.filter(job => job.id !== jobId))
    } catch (err) {
      alert('Lỗi khi xóa: ' + (err as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = async (jobId: string, filename: string) => {
    try {
      setDownloadingId(jobId)
      await downloadFile(jobId, currentSemester?.id || '', filename, true)
    } catch (err) {
      alert('Lỗi khi tải file: ' + (err as Error).message)
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading size="lg" />
      </div>
    )
  }

  if (error && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 font-medium mb-2">
            Lỗi khi tải dữ liệu
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </div>
          <button
            onClick={() => fetchJobs(currentSemester?.id
               || '')}
            className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileSpreadsheet className="w-8 h-8" />
            Quản lý Import Excel
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Theo dõi trạng thái các file Excel đang được xử lý
          </p>
        </div>
        <button
          onClick={() => fetchJobs(currentSemester?.id || '')}
          disabled={loading}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tổng</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{jobs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Chờ xử lý</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {jobs.filter(j => getDisplayStatus(j) === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Đang xử lý</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {jobs.filter(j => getDisplayStatus(j) === 'processing').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hoàn thành</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {jobs.filter(j => getDisplayStatus(j) === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên file, tiêu đề..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            Tìm kiếm
          </button>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">Tất cả loại</option>
            {uploadTypes.map(type => (
              <option key={type} value={type}>
                {UPLOAD_TYPE_LABELS[type] || type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tiến độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Người tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'Không tìm thấy job nào'
                        : 'Chưa có job nào'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const displayStatus = getDisplayStatus(job)
                  const statusConfig = STATUS_CONFIG[displayStatus]
                  const createdAt = parseDate(job.created_at)
                  const percentage = calculatePercentage(job.current, job.sum)
                  const errorMessages = getErrorMessages(job.messages)
                  const hasErrors = errorMessages.length > 0

                  return (
                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {job.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs" title={job.file}>
                            {job.file.split('/').pop()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {UPLOAD_TYPE_LABELS[job.upload_type] || job.upload_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgClass} ${statusConfig.textClass}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">{job.current}/{job.sum}</span>
                            <span className="text-gray-500 dark:text-gray-500">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                displayStatus === 'completed' ? 'bg-green-500' :
                                displayStatus === 'processing' ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {job.created_by.split('_')[0]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {createdAt.toLocaleString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Show error count if any */}
                          {hasErrors && (
                            <button
                              onClick={() => setSelectedJobErrors({ title: job.title, errors: errorMessages })}
                              className="cursor-pointer inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                              title="Xem chi tiết lỗi"
                            >
                              <AlertCircle className="w-4 h-4" />
                              {errorMessages.length}
                            </button>
                          )}
                          {/* Download */}
                          <button
                            onClick={() => handleDownload(job.id, job.file.split('/').pop() || job.title)}
                            disabled={downloadingId === job.id}
                            className="cursor-pointer p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Tải xuống"
                          >
                            {downloadingId === job.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(job.id)}
                            disabled={deletingId === job.id}
                            className="cursor-pointer p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Xóa"
                          >
                            {deletingId === job.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Hiển thị {filteredJobs.length} / {jobs.length} job
      </div>

      {/* Errors Modal */}
      {selectedJobErrors && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Chi tiết lỗi
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedJobErrors.title} - {selectedJobErrors.errors.length} lỗi
                </p>
              </div>
              <button
                onClick={() => setSelectedJobErrors(null)}
                className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {selectedJobErrors.errors.map((error: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-amber-200 dark:bg-amber-800 rounded-full text-xs font-medium text-amber-800 dark:text-amber-200">
                      {index + 1}
                    </span>
                    <p className="text-sm text-amber-800 dark:text-amber-200 break-all">
                      {error}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedJobErrors(null)}
                className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
