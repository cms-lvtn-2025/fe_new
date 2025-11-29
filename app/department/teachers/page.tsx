'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDepartmentTeachers } from '@/lib/graphql/hooks'
import { UserCog, Mail } from 'lucide-react'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'

export default function DepartmentTeachersPage() {
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

  const { teachers, total, loading, error, refetch } = useDepartmentTeachers({
    pagination: {
      page: currentPage,
      pageSize
    , sortBy: 'created_at', descending: true },
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

  const handleViewDetail = (teacher: any) => {
    const teacherData = {
      id: teacher.id,
      username: teacher.username,
      email: teacher.email,
      gender: teacher.gender,
      roles: teacher.roles,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
      backUrl: '/department/teachers'
    }
    sessionStorage.setItem('teacherDetailData', JSON.stringify(teacherData))
    router.push(`/department/teachers/${teacher.id}`)
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
          Quản lý Giảng viên
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Danh sách giảng viên trong khoa
        </p>
      </div>

      {/* Search and Filters */}
      <SearchBar
        onSearch={handleSearchChange}
        onRefresh={handleRefresh}
        placeholder="Tìm kiếm theo tên hoặc email..."
        className="mb-6"
      />

      {/* Teachers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mã GV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Họ tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Giới tính
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vai trò
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Không tìm thấy giảng viên nào' : 'Chưa có giảng viên nào'}
                    </div>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher: any) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {teacher.msgv}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => handleViewDetail(teacher)}
                    >
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        {teacher.username}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {teacher.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {teacher.gender === 'MALE' ? 'Nam' : teacher.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {teacher.roles && teacher.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.roles.filter((role: any) => role.activate).map((role: any) => (
                            <span
                              key={role.id}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                            >
                              {role.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && teachers.length > 0 && (
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
