'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_ALL_SEMESTERS } from '@/lib/graphql/queries/admin'
import { DELETE_COUNCIL } from '@/lib/graphql/mutations/admin'
import { Plus, Trash2, RefreshCw, Search, Filter, Download } from 'lucide-react'
import Loading from '@/components/common/Loading'
import type { Council } from '@/types/defence'
import { GET_COUNCILS, GET_DEFENCE_SCHEDULE_EXPORT_EXCEL } from '@/lib/graphql/queries/admin/council.queries'
import { councilExport } from '@/lib/utils/export'

interface CouncilsData {
  getAllCouncils: {
    total: number
    data: Council[]
  }
}

export default function CouncilsManagementPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSemester, setSelectedSemester] = useState<string>('all')
  const [selectedMajor, setSelectedMajor] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch semesters
  const { data: semestersData } = useQuery(GET_ALL_SEMESTERS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 100 , sortBy: 'created_at', descending: true },
        filters: [],
      },
    },
  })

  const semesters = useMemo(() => {
    return (semestersData as any)?.affair?.semesters?.data || []
  }, [semestersData])

  // Set default semester to latest when data is loaded
  useEffect(() => {
    if (!isInitialized && semesters.length > 0) {
      setSelectedSemester(semesters[0].id)
      setIsInitialized(true)
    }
  }, [semesters, isInitialized])

  // Build filters
  const buildFilters = () => {
    const filters: any[] = []

    if (selectedSemester !== 'all') {
      filters.push({
        condition: {
          field: 'semester_code',
          operator: 'EQUAL',
          values: [selectedSemester],
        },
      })
    }

    if (selectedMajor !== 'all') {
      filters.push({
        condition: {
          field: 'major_code',
          operator: 'EQUAL',
          values: [selectedMajor],
        },
      })
    }

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

    return filters
  }

  // Fetch councils
  const { data, loading, error, refetch } = useQuery<CouncilsData>(GET_COUNCILS, {
    variables: {
      search: {
        pagination: {
          page: currentPage,
          pageSize: pageSize
        },
        filters: buildFilters(),
      },
    },
    fetchPolicy: 'network-only',
  })

  // Query riêng cho export với tất cả dữ liệu (không phân trang)
  const { data: exportData, loading: exportLoading, refetch: refetchExport } = useQuery(GET_DEFENCE_SCHEDULE_EXPORT_EXCEL, {
    variables: {
      search: {
        filters: buildFilters(),
      },
    },
    skip: true, // Chỉ fetch khi cần export
    fetchPolicy: 'network-only',
  })
  
  const councils: Council[] = (data as any)?.affair?.councils?.data || []
  const total: number = (data as any)?.affair?.councils?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  // Only show error if there's no data
  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400 font-medium mb-2">
          Lỗi khi tải dữ liệu lịch bảo vệ
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {error.message}
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Thử lại
        </button>
      </div>
    )
  }

  // Get unique majors
  const majors = useMemo(() => {
    const majorSet = new Set(councils.map((c) => c.majorCode))
    return Array.from(majorSet).sort()
  }, [councils])

  const handleRefresh = () => {
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const [deleteCouncil] = useMutation(DELETE_COUNCIL, {
    onCompleted: () => {
      refetch()
    },
    onError: (error) => {
      alert(`Lỗi khi xóa hội đồng: ${error.message}`)
    },
  })

  const handleViewDetail = (council: Council) => {
    sessionStorage.setItem('councilDetailData', JSON.stringify({ ...council, backUrl: '/admin/councils' }))
    router.push(`/admin/councils/${council.id}`)
  }

  const handleDelete = async (council: Council) => {
    if (confirm(`Bạn có chắc chắn muốn xóa hội đồng "${council.title}"?`)) {
      try {
        await deleteCouncil({
          variables: {
            id: council.id,
          },
        })
      } catch (error) {
        // Error is handled by onError callback
      }
    }
  }

  const handleExport = async () => {
    try {
      // Kiểm tra học kỳ
      if (selectedSemester === 'all') {
        alert('Vui lòng chọn học kỳ để xuất dữ liệu')
        return
      }

      // Fetch data for export
      const result = await refetchExport()

      if (result.error && !result.data) {
        alert(`Lỗi khi xuất dữ liệu: ${result.error.message}`)
        return
      }

      const councilsData = (result.data as any)?.affair?.councils?.data
      if (!councilsData || councilsData.length === 0) {
        alert('Chưa có dữ liệu để xuất')
        return
      }

      // Export to Excel
      councilExport(councilsData)
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Lỗi khi xuất dữ liệu: ' + (error as Error).message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Quản lý Hội đồng
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý danh sách hội đồng bảo vệ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Xuất Excel
          </button>
          <button
            onClick={() => alert('TODO: Tạo hội đồng mới')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo hội đồng
          </button>
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
              placeholder="Tìm kiếm hội đồng..."
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
              onChange={(e) => {
                setSelectedSemester(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">Tất cả học kỳ</option>
              {semesters.map((semester: any) => (
                <option key={semester.id} value={semester.id}>
                  {semester.title}
                </option>
              ))}
            </select>
          </div>

          {/* Major Filter */}
          <div className="relative">
            <select
              value={selectedMajor}
              onChange={(e) => {
                setSelectedMajor(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">Tất cả ngành</option>
              {majors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
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

      {/* Councils Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mã HĐ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tên hội đồng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ngành
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Số đề tài
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {councils.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm || selectedMajor !== 'all' || selectedSemester !== 'all'
                        ? 'Không tìm thấy hội đồng nào'
                        : 'Chưa có hội đồng nào'}
                    </div>
                  </td>
                </tr>
              ) : (
                councils.map((council) => (
                  <tr key={council.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {council.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        <button
                          onClick={() => handleViewDetail(council)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          {council.title}
                        </button>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {council.majorCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {council.timeStart ? (
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(council.timeStart).toLocaleString('vi-VN')}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          Chưa gán giờ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {council.topicCouncils?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Detail */}
                        

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(council)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Hiển thị {councils.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
          {Math.min(currentPage * pageSize, total)} của {total} hội đồng
        </div>

        <div className="flex items-center gap-4">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Số dòng:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
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
    </div>
  )
}
