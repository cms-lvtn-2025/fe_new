'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_ALL_FACULTIES } from '@/lib/graphql/queries/admin'
import { DELETE_FACULTY } from '@/lib/graphql/mutations/admin.mutations'
import { Plus, Edit, Trash2, RefreshCw, Search, ChevronDown, ChevronRight } from 'lucide-react'
import Loading from '@/components/common/Loading'
import { FacultyFormDialog } from '@/components/admin/faculties/faculty-form-dialog'

interface Major {
  id: string
  title: string
  facultyCode: string
}

interface Faculty {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  majors?: Major[]
}

interface FacultiesData {
  getAllFaculties: {
    total: number
    data: Faculty[]
  }
}

export default function FacultiesManagementPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(new Set())
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)

  // Build filters
  const buildFilters = () => {
    const filters: any[] = []

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

  // Fetch faculties
  const { data, loading, refetch } = useQuery<FacultiesData>(GET_ALL_FACULTIES, {
    variables: {
      search: {
        pagination: {
          page: currentPage,
          pageSize: pageSize,
          sortBy: 'created_at',
          descending: true,
        },
        filters: buildFilters(),
      },
    },
    fetchPolicy: 'network-only',
  })

  const faculties: Faculty[] = data?.getAllFaculties?.data || []
  const total: number = data?.getAllFaculties?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  const [deleteFaculty] = useMutation(DELETE_FACULTY, {
    onCompleted: () => {
      refetch()
    },
    onError: (error) => {
      alert(`Lỗi khi xóa khoa: ${error.message}`)
    },
  })

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

  const handleCreate = () => {
    setSelectedFaculty(null)
    setIsFormDialogOpen(true)
  }

  const handleEdit = (faculty: Faculty) => {
    setSelectedFaculty(faculty)
    setIsFormDialogOpen(true)
  }

  const handleDelete = async (faculty: Faculty) => {
    if (confirm(`Bạn có chắc chắn muốn xóa khoa "${faculty.title}"?`)) {
      try {
        await deleteFaculty({
          variables: {
            id: faculty.id,
          },
        })
      } catch (error) {
        // Error is handled by onError callback
      }
    }
  }

  const toggleExpanded = (facultyId: string) => {
    setExpandedFaculties((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(facultyId)) {
        newSet.delete(facultyId)
      } else {
        newSet.add(facultyId)
      }
      return newSet
    })
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý Khoa</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý danh sách khoa</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo khoa
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khoa..."
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

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="p-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Làm mới"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Faculties List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {faculties.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Không tìm thấy khoa nào' : 'Chưa có khoa nào'}
              </div>
            </div>
          ) : (
            faculties.map((faculty) => (
              <div key={faculty.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {/* Faculty Row */}
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Expand/Collapse Button */}
                    {faculty.majors && faculty.majors.length > 0 && (
                      <button
                        onClick={() => toggleExpanded(faculty.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        {expandedFaculties.has(faculty.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                          {faculty.id}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {faculty.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {faculty.majors?.length || 0} chuyên ngành
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(faculty)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faculty)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Majors List (Expandable) */}
                {expandedFaculties.has(faculty.id) &&
                  faculty.majors &&
                  faculty.majors.length > 0 && (
                    <div className="px-6 pb-4 pl-16 bg-gray-50 dark:bg-gray-700">
                      <div className="space-y-2">
                        {faculty.majors.map((major) => (
                          <div
                            key={major.id}
                            className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                          >
                            <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                              {major.id}
                            </span>
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {major.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Hiển thị {faculties.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
          {Math.min(currentPage * pageSize, total)} của {total} khoa
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

      {/* Faculty Form Dialog */}
      <FacultyFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        faculty={selectedFaculty}
        onSuccess={refetch}
      />
    </div>
  )
}
