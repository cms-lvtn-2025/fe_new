'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDepartmentStudents } from '@/lib/graphql/hooks'
import { Users, Mail, Phone } from 'lucide-react'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'

export default function DepartmentStudentsPage() {
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
                field: 'username',
                operator: 'LIKE',
                values: [searchTerm.trim()],
              },
            },
            {
              condition: {
                field: 'email',
                operator: 'LIKE',
                values: [searchTerm.trim()],
              },
            },
            {
              condition: {
                field: 'classCode',
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

  const { students, total, loading, error, refetch } = useDepartmentStudents({
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

  const handleViewDetail = (student: any) => {
    router.push(`/department/students/${student.id}`)
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Quản lý Sinh viên
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Danh sách sinh viên trong khoa
        </p>
      </div>

      {/* Search and Filters */}
      <SearchBar
        onSearch={handleSearchChange}
        onRefresh={handleRefresh}
        placeholder="Tìm kiếm theo tên, email hoặc lớp..."
        className="mb-6"
      />

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mã SV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Họ tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Lớp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Giới tính
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Không tìm thấy sinh viên nào' : 'Chưa có sinh viên nào'}
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student: any) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {student.mssv}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => handleViewDetail(student)}
                    >
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        {student.username}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {student.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {student.phone || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">
                        {student.classCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {student.gender === 'MALE' ? 'Nam' : student.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && students.length > 0 && (
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
