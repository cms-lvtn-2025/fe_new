'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useLazyQuery } from '@apollo/client/react'
import { GET_LIST_TEACHERS, GET_ALL_SEMESTERS } from '@/lib/graphql/queries/admin'
import { Plus, Pencil, Trash2, Search, RefreshCw, Upload, Download, Filter, Eye } from 'lucide-react'
import { TeacherFormDialog } from './teacher-form-dialog'
import { DeleteTeacherDialog } from './delete-teacher-dialog'
import { exportTeachers } from '@/lib/utils/export'
import { uploadFileExcel } from '@/lib/api/file'

export interface TeacherRole {
  id: string
  title: string
  role: string
  semesterCode: string
  activate: boolean
}

export interface Teacher {
  id: string
  email: string
  msgv: string
  username: string
  gender: string
  majorCode: string
  semesterCode: string
  createdAt: string
  updatedAt: string
  roles?: TeacherRole[]
}

// Map role to display name and color classes for dark mode
const getRoleDisplay = (role: string) => {
  const roleMap: Record<string, { label: string; bgClass: string; textClass: string }> = {
    'HEAD_OF_DEPARTMENT': {
      label: 'Trưởng khoa',
      bgClass: 'bg-purple-100 dark:bg-purple-900/40',
      textClass: 'text-purple-800 dark:text-purple-300'
    },
    'DEPUTY_HEAD': {
      label: 'Phó trưởng khoa',
      bgClass: 'bg-indigo-100 dark:bg-indigo-900/40',
      textClass: 'text-indigo-800 dark:text-indigo-300'
    },
    'SUPERVISOR': {
      label: 'GVHD',
      bgClass: 'bg-blue-100 dark:bg-blue-900/40',
      textClass: 'text-blue-800 dark:text-blue-300'
    },
    'REVIEWER': {
      label: 'Phản biện',
      bgClass: 'bg-orange-100 dark:bg-orange-900/40',
      textClass: 'text-orange-800 dark:text-orange-300'
    },
    'COUNCIL_MEMBER': {
      label: 'TV Hội đồng',
      bgClass: 'bg-teal-100 dark:bg-teal-900/40',
      textClass: 'text-teal-800 dark:text-teal-300'
    },
    'PRESIDENT': {
      label: 'Chủ tịch HĐ',
      bgClass: 'bg-rose-100 dark:bg-rose-900/40',
      textClass: 'text-rose-800 dark:text-rose-300'
    },
    'SECRETARY': {
      label: 'Thư ký HĐ',
      bgClass: 'bg-cyan-100 dark:bg-cyan-900/40',
      textClass: 'text-cyan-800 dark:text-cyan-300'
    },
    'TEACHER': {
      label: 'Giảng viên',
      bgClass: 'bg-gray-100 dark:bg-gray-700',
      textClass: 'text-gray-800 dark:text-gray-300'
    },
  }
  return roleMap[role] || {
    label: role,
    bgClass: 'bg-gray-100 dark:bg-gray-700',
    textClass: 'text-gray-800 dark:text-gray-300'
  }
}

export function TeacherManagement() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMajor, setSelectedMajor] = useState<string>('all')
  const [selectedSemester, setSelectedSemester] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)

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
    return (semestersData as any)?.affair?.semesters?.data || []
  }, [semestersData])

  // Build filters for backend - Updated for Backend Schema v2
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

    // Search filter - search in username only (OR logic needs backend support)
    if (searchTerm.trim()) {
      filters.push({
        condition: {
          field: 'username',
          operator: 'LIKE',
          values: [searchTerm.trim()],
        },
      })
    }

    // Major filter
    if (selectedMajor !== 'all') {
      filters.push({
        condition: {
          field: 'major_code',
          operator: 'EQUAL',
          values: [selectedMajor],
        },
      })
    }

    return filters
  }

  // Fetch teachers
  const { data, loading, refetch } = useQuery(GET_LIST_TEACHERS, {
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

  const teachers: Teacher[] = (data as any)?.affair?.teachers?.data || []
  const total: number = (data as any)?.affair?.teachers?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  // Fetch all teachers for filter options
  const { data: allData } = useQuery(GET_LIST_TEACHERS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 1000, sortBy: 'created_at', descending: true },
        filters: [],
      },
    },
    fetchPolicy: 'cache-first',
  })

  const allTeachers: Teacher[] = (allData as any)?.affair?.teachers?.data || []
  const majors = Array.from(new Set(allTeachers.map(t => t.majorCode))).filter(Boolean)

  // Lazy query for export

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

  const handleMajorChange = (value: string) => {
    setSelectedMajor(value)
    setCurrentPage(1)
  }

  const handleImport = (file: File, semesterCode: string) => {
      // TODO: Implement import dialog
      try {
        uploadFileExcel(
          file,
          semesterCode === 'all' ? '' : semesterCode,
          'teacher-for-affair',
          'Danh sách giảng viên'
        ).then(() => {
          alert('Upload file thành công (giả lập)')
          refetch()
        }).catch((error) => {
          alert('Lỗi khi upload file: ' + error.message)
        })
      } catch (error) {
        alert('Lỗi khi upload file: ' + (error as Error).message)
      }
    }

  const handleExport = async (allTeachers: Teacher[]) => {
    try {
      
      
      if (allTeachers.length === 0) {
        alert('Không có dữ liệu để xuất')
        return
      }

      exportTeachers(allTeachers)
    } catch (error) {
      alert('Lỗi khi xuất dữ liệu: ' + (error as Error).message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm giảng viên theo tên, email, mã GV..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearchSubmit}
          className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex flex-wrap items-center gap-2">
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

        {/* Major Filter */}
        <div className="relative">
          <select
            value={selectedMajor}
            onChange={(e) => handleMajorChange(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">Tất cả khoa</option>
            {majors.map(major => (
              <option key={major} value={major}>{major}</option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="cursor-pointer p-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Làm mới"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Import Button */}
        <button
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.xlsx, .xls'
            input.onchange = (e: any) => {
              const target = e.target as HTMLInputElement
              if (target.files && target.files.length > 0 && selectedSemester !== 'all') {
                handleImport(target.files[0], selectedSemester)
              } else {
                alert('Vui lòng chọn học kỳ trước khi import')
              }
            }
            input.click()
          }}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Upload className="w-5 h-5" />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Export Button */}
        <button
          onClick={() => handleExport(teachers)}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Create Button */}
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Thêm giảng viên</span>
        </button>
      </div>

      {/* Teachers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
                  Khoa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm || selectedMajor !== 'all'
                        ? 'Không tìm thấy giảng viên nào'
                        : 'Chưa có giảng viên nào'}
                    </div>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                         <button
                          onClick={() => {
                            const teacherData = { ...teacher, backUrl: '/admin/users' }
                            sessionStorage.setItem('teacherDetailData', JSON.stringify(teacherData))
                            router.push(`/admin/teachers/${teacher.id}`)
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          {teacher.msgv}
                        </button>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {teacher.username}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {teacher.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {teacher.gender === 'MALE' ? 'Nam' : teacher.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {teacher.majorCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.roles && teacher.roles.length > 0 ? (
                          teacher.roles
                            .filter(r => r.activate)
                            .map((role) => {
                              const display = getRoleDisplay(role.role)
                              return (
                                <span
                                  key={role.id}
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${display.bgClass} ${display.textClass}`}
                                  title={role.title || role.role}
                                >
                                  {display.label}
                                </span>
                              )
                            })
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher)
                            setIsEditDialogOpen(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher)
                            setIsDeleteDialogOpen(true)
                          }}
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
          Hiển thị {teachers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, total)} của {total} giảng viên
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
              className="cursor-pointer px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    className={`cursor-pointer px-3 py-1 rounded-lg transition-colors ${
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
              className="cursor-pointer px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <TeacherFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          refetch()
        }}
      />

      <TeacherFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedTeacher(null)
        }}
        teacher={selectedTeacher}
        onSuccess={() => {
          setIsEditDialogOpen(false)
          setSelectedTeacher(null)
          refetch()
        }}
      />

      {selectedTeacher && (
        <DeleteTeacherDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedTeacher(null)
          }}
          teacher={selectedTeacher}
          onSuccess={() => {
            setIsDeleteDialogOpen(false)
            setSelectedTeacher(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}
