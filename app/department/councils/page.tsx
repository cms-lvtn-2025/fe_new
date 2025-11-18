'use client'

import { useState } from 'react'
import {
  useDepartmentCouncils,
  useCreateCouncil,
  useDepartmentMajors,
  useDepartmentSemesters
} from '@/lib/graphql/hooks'
import { BookOpen, Plus, Users, Calendar, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'

export default function DepartmentCouncilsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState({
    title: '',
    majorCode: '',
    semesterCode: '',
  })

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

    return filters
  }

  const { councils, total, loading, error, refetch } = useDepartmentCouncils({
    pagination: {
      page: currentPage,
      pageSize,
      sortBy: 'created_at',
      descending: true
    },
    filters: buildFilters()
  })

  const { majors } = useDepartmentMajors({ pagination: { page: 1, pageSize: 100 } })
  const { semesters } = useDepartmentSemesters({ pagination: { page: 1, pageSize: 100 } })
  const { createCouncil, loading: creating } = useCreateCouncil()

  const totalPages = Math.ceil(total / pageSize)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.majorCode || !formData.semesterCode) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      await createCouncil({
        variables: {
          input: {
            title: formData.title,
            majorCode: formData.majorCode,
            semesterCode: formData.semesterCode,
          }
        }
      })
      alert('Tạo hội đồng thành công!')
      setShowCreateModal(false)
      setFormData({ title: '', majorCode: '', semesterCode: '' })
      refetch()
    } catch (error) {
      alert('Lỗi khi tạo hội đồng: ' + (error as Error).message)
    }
  }

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

  const handleViewDetail = (council: any) => {
    const councilData = {
      id: council.id,
      title: council.title,
      majorCode: council.majorCode,
      semesterCode: council.semesterCode,
      timeStart: council.timeStart,
      createdAt: council.createdAt,
      updatedAt: council.updatedAt,
      defences: council.defences,
      topicCouncils: council.topicCouncils,
      backUrl: '/department/councils'
    }
    sessionStorage.setItem('councilDetailData', JSON.stringify(councilData))
    router.push(`/department/councils/${council.id}`)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Lỗi: {error.message}</p>
      </div>
    )
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Quản lý Hội đồng
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tạo và quản lý hội đồng bảo vệ
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo hội đồng
        </button>
      </div>

      {/* Search and Filters */}
      <SearchBar
        onSearch={handleSearchChange}
        onRefresh={handleRefresh}
        placeholder="Tìm kiếm hội đồng..."
        className="mb-6"
      />

      {/* Councils Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
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
                  Khoa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thành viên
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
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Không tìm thấy hội đồng nào' : 'Chưa có hội đồng nào'}
                    </div>
                  </td>
                </tr>
              ) : (
                councils.map((council: any) => (
                  <tr key={council.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {council.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {council.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                        {council.majorCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                        <Users className="w-4 h-4" />
                        {council.defences?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                        <Calendar className="w-4 h-4" />
                        {council.topicCouncils?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Detail */}
                        <button
                          onClick={() => handleViewDetail(council)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
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
      {!loading && councils.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tạo hội đồng mới
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên hội đồng <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="VD: Hội đồng LVTN 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Khoa <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.majorCode}
                  onChange={(e) => setFormData({ ...formData, majorCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Chọn khoa</option>
                  {majors.map((major: any) => (
                    <option key={major.id} value={major.id}>
                      {major.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Học kỳ <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.semesterCode}
                  onChange={(e) => setFormData({ ...formData, semesterCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Chọn học kỳ</option>
                  {semesters.map((semester: any) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ title: '', majorCode: '', semesterCode: '' })
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Đang tạo...' : 'Tạo hội đồng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
