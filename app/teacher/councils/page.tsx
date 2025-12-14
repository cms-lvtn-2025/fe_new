'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMyDefences } from '@/lib/graphql/hooks'
import { Users, Calendar, Award, Upload, Download, User } from 'lucide-react'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'

const POSITION_LABELS: Record<string, string> = {
  PRESIDENT: 'Chủ tịch',
  SECRETARY: 'Thư ký',
  MEMBER: 'Ủy viên',
  REVIEWER: 'Phản biện',
}

const POSITION_COLORS: Record<string, string> = {
  PRESIDENT: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  SECRETARY: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  MEMBER: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  REVIEWER: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
}

export default function TeacherCouncilsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Build filters for backend
  const buildFilters = () => {
    const filters: any[] = []

    // Search filter - search in council title or id
    if (searchTerm.trim()) {
      filters.push({
        group: {
          logic: 'OR',
          filters: [
            {
              condition: {
                field: 'council.title',
                operator: 'LIKE',
                values: [searchTerm.trim()],
              },
            },
            {
              condition: {
                field: 'council.id',
                operator: 'LIKE',
                values: [searchTerm.trim()],
              },
            },
          ],
        },
      })
    }

    // Position filter
    if (selectedPosition !== 'all') {
      filters.push({
        condition: {
          field: 'position',
          operator: 'EQUAL',
          values: [selectedPosition],
        },
      })
    }

    return filters
  }

  const { defences, total, loading, error, refetch } = useMyDefences({
    pagination: {
      page: currentPage,
      pageSize,
      sortBy: 'created_at',
      descending: true,
    },
    filters: buildFilters()
  })

  const totalPages = Math.ceil(total / pageSize)

  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
    setCurrentPage(1)
  }

  const handlePositionChange = (position: string) => {
    setSelectedPosition(position)
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

  const handleViewDetail = (defence: any) => {
    const defenceData = {
      id: defence.id,
      title: defence.title,
      councilCode: defence.councilCode,
      teacherCode: defence.teacherCode,
      position: defence.position,
      council: defence.council,
      teacher: defence.teacher,
      gradeDefences: defence.gradeDefences,
      createdAt: defence.createdAt,
      updatedAt: defence.updatedAt,
      backUrl: '/teacher/councils'
    }
    sessionStorage.setItem('defenceDetailData', JSON.stringify(defenceData))
    router.push(`/teacher/councils/${defence.id}`)
  }

  const handleImportExcel = () => {
    alert('Chức năng Import Excel điểm sẽ được triển khai sau khi backend hoàn thiện')
  }

  const handleExportExcel = () => {
    alert('Chức năng Export Excel điểm sẽ được triển khai sau khi backend hoàn thiện')
  }

  if (error && !defences) {
  const handlePageChange = (page: number) => {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Lỗi: {error.message}</p>
      </div>
    )
  }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Hội đồng chấm điểm
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Quản lý hội đồng chấm điểm mà bạn tham gia
        </p>
      </div>

      {/* Search and Filters */}
      <SearchBar
        onSearch={handleSearchChange}
        onRefresh={handleRefresh}
        placeholder="Tìm kiếm theo tên hội đồng hoặc mã..."
        className="mb-6"
      >
        {/* Position Filter */}
        <div className="relative">
          <select
            value={selectedPosition}
            onChange={(e) => handlePositionChange(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">Tất cả chức vụ</option>
            {Object.entries(POSITION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Import Button */}
        <button
          onClick={handleImportExcel}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Import điểm từ Excel"
        >
          <Upload className="w-5 h-5" />
          Import
        </button>

        {/* Export Button */}
        <button
          onClick={handleExportExcel}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Export điểm ra Excel"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </SearchBar>

      {/* Councils Table */}
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
                    Mã hội đồng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tên hội đồng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Chức vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Số sinh viên đã chấm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thời gian bảo vệ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {defences.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-500 dark:text-gray-400">
                        {searchTerm || selectedPosition !== 'all'
                          ? 'Không tìm thấy hội đồng nào'
                          : 'Bạn chưa tham gia hội đồng nào'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  defences.map((defence: any) => {
                    const council = defence.council
                    const gradeDefences = defence.gradeDefences || []
                    const gradedCount = gradeDefences.filter((g: any) => g.totalScore !== null && g.totalScore !== undefined).length

                    return (
                      <tr key={defence.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                            {council?.id || 'N/A'}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 cursor-pointer"
                          onClick={() => handleViewDetail(defence)}
                        >
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            {council?.title || defence.title || 'N/A'}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {council?.majorCode || 'N/A'} • {council?.semesterCode || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${POSITION_COLORS[defence.position] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                            {POSITION_LABELS[defence.position] || defence.position || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {gradedCount} / {gradeDefences.length}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {council?.timeStart ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-gray-900 dark:text-gray-100">
                                  {new Date(council.timeStart).toLocaleDateString('vi-VN')}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(council.timeStart).toLocaleTimeString('vi-VN', {
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
      {!loading && defences.length > 0 && (
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
