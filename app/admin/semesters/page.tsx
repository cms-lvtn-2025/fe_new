'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_ALL_SEMESTERS } from '@/lib/graphql/queries/admin'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { CreateSemesterDialog } from '@/components/admin/semesters/create-semester-dialog'
import { UpdateSemesterDialog } from '@/components/admin/semesters/update-semester-dialog'
import { DeleteSemesterDialog } from '@/components/admin/semesters/delete-semester-dialog'

interface Semester {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export default function SemestersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null)
  const [deletingSemester, setDeletingSemester] = useState<Semester | null>(null)

  // Fetch semesters
  const { data, loading, refetch } = useQuery(GET_ALL_SEMESTERS, {
    variables: {
      search: {
        pagination: {
          page: 1,
          pageSize: 100,
          sortBy: 'created_at',
          descending: true,
        },
        filters: [],
      },
    },
    fetchPolicy: 'network-only',
  })

  const semesters: Semester[] = (data as any)?.affair?.semesters?.data || []

  // Filter semesters by search term
  const filteredSemesters = semesters.filter(semester =>
    semester.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    semester.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const handleCreateSuccess = () => {
    setIsCreateOpen(false)
    refetch()
  }

  const handleUpdateSuccess = () => {
    setEditingSemester(null)
    refetch()
  }

  const handleDeleteSuccess = () => {
    setDeletingSemester(null)
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
          Quản lý học kỳ
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tạo, chỉnh sửa và quản lý các học kỳ trong hệ thống
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm học kỳ..."
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

          {/* Create Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo học kỳ mới
          </button>
        </div>
      </div>

      {/* Semesters Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mã học kỳ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tên học kỳ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cập nhật
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSemesters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Không tìm thấy học kỳ nào' : 'Chưa có học kỳ nào'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSemesters.map((semester) => (
                  <tr key={semester.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {semester.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {semester.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(semester.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(semester.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingSemester(semester)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingSemester(semester)}
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

      {/* Stats */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Hiển thị {filteredSemesters.length} / {semesters.length} học kỳ
      </div>

      {/* Dialogs */}
      <CreateSemesterDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {editingSemester && (
        <UpdateSemesterDialog
          isOpen={!!editingSemester}
          onClose={() => setEditingSemester(null)}
          onSuccess={handleUpdateSuccess}
          semester={editingSemester}
        />
      )}

      {deletingSemester && (
        <DeleteSemesterDialog
          isOpen={!!deletingSemester}
          onClose={() => setDeletingSemester(null)}
          onSuccess={handleDeleteSuccess}
          semester={deletingSemester}
        />
      )}
    </div>
  )
}
