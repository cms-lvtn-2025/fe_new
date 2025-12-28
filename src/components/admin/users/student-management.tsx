'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useLazyQuery } from '@apollo/client/react'
import { GET_LIST_STUDENTS, GET_ALL_SEMESTERS } from '@/lib/graphql/queries/admin'
import { Plus, Pencil, Trash2, Search, RefreshCw, Upload, Download, Filter, Eye } from 'lucide-react'
import { Pagination } from '@/components/common/Pagination'
import { StudentFormDialog } from './student-form-dialog'
import { DeleteStudentDialog } from './delete-student-dialog'
import { exportStudents } from '@/lib/utils/export'
import { uploadFileExcel } from '@/lib/api/file'
import { useSemester } from '@/lib/contexts/semester-context'

export interface Student {
  id: string
  email: string
  username: string
  phone?: string
  gender: string
  majorCode: string
  classCode: string
  semesterCode: string
  createdAt: string
  updatedAt: string
  mssv: string
}

export function StudentManagement() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedMajor, setSelectedMajor] = useState<string>('all')
  const [selectedSemester, setSelectedSemester] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { currentSemester } = useSemester()
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

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

  // Build filters for backend with useMemo to prevent unnecessary re-fetches
  const filters = useMemo(() => {
    const result: any[] = []

    // Semester filter
    if (selectedSemester !== 'all') {
      result.push({
        condition: {
          field: 'semester_code',
          operator: 'EQUAL',
          values: [selectedSemester],
        },
      })
    }

    // Search filter
    if (searchTerm.trim()) {
      result.push({
        group: {
          logic: 'OR',
          filters: [{
            condition: {
              field: 'email',
              operator: 'LIKE',
              values: [searchTerm.trim()],
            },
          }, {
            condition: {
              field: 'id',
              operator: 'LIKE',
              values: [searchTerm.trim()],
            },
          },{
            condition: {
              field: 'username',
              operator: 'LIKE',
              values: [searchTerm.trim()],
            },
          }
        ]
        }
      })
    }

    // Class filter
    if (selectedClass !== 'all') {
      result.push({
        condition: {
          field: 'class_code',
          operator: 'EQUAL',
          values: [selectedClass],
        },
      })
    }

    // Major filter
    if (selectedMajor !== 'all') {
      result.push({
        condition: {
          field: 'major_code',
          operator: 'EQUAL',
          values: [selectedMajor],
        },
      })
    }

    return result
  }, [selectedSemester, searchTerm, selectedClass, selectedMajor])

  // Fetch students
  const { data, loading, refetch } = useQuery(GET_LIST_STUDENTS, {
    variables: {
      search: {
        pagination: {
          page: currentPage,
          pageSize: pageSize,
          sortBy: 'created_at',
          descending: true,
        },
        filters,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
  const students: Student[] = (data as any)?.affair?.students?.data || []
  const total: number = (data as any)?.affair?.students?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  // Fetch all students for filter options (without pagination)
  const { data: allData } = useQuery(GET_LIST_STUDENTS, {
    variables: {
      search: {
        pagination: {
          page: 1,
          pageSize: 1000,
          sortBy: 'created_at',
          descending: true,
        },
        filters: [],
      },
    },
    fetchPolicy: 'cache-first',
  })

  const allStudents: Student[] = (allData as any)?.affair?.students?.data || []

  // Get unique classes and majors for filters
  const classes = Array.from(new Set(allStudents.map(s => s.classCode))).filter(Boolean)
  const majors = Array.from(new Set(allStudents.map(s => s.majorCode))).filter(Boolean)

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

  // Handle search submit
  const handleSearchSubmit = () => {
    setSearchTerm(searchInput)
    setCurrentPage(1)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const handleClassChange = (value: string) => {
    setSelectedClass(value)
    setCurrentPage(1)
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
        currentSemester ? currentSemester.id : '',
        'student-for-affair',
        'Danh sách sinh viên'
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


  const handleExport = async (allStudents: Student[]) => {
    try {      
      if (allStudents.length === 0) {
        alert('Không có dữ liệu để xuất')
        return
      }

      exportStudents(allStudents)
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
            placeholder="Tìm kiếm sinh viên theo tên, email, MSSV..."
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

        {/* Class Filter */}
        <div className="relative">
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">Tất cả lớp</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
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
            input.accept = '.xlsx,.xls'
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement
              if (target.files && target.files.length > 0 && selectedSemester !== 'all') {
                handleImport(target.files[0], selectedSemester)
              }

              if (selectedSemester === 'all') {
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
          onClick={() => handleExport(students)}
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
          <span className="hidden sm:inline">Thêm sinh viên</span>
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  MSSV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Họ tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  SĐT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Lớp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Khoa
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      {searchTerm || selectedClass !== 'all' || selectedMajor !== 'all'
                        ? 'Không tìm thấy sinh viên nào'
                        : 'Chưa có sinh viên nào'}
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        <button
                          onClick={() => {
                            const studentData = { ...student, backUrl: '/admin/users' }
                            sessionStorage.setItem('studentDetailData', JSON.stringify(studentData))
                            router.push(`/admin/students/${student.id}`)
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          {student.mssv}
                        </button>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {student.username}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {student.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {student.phone || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {student.classCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {student.majorCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsEditDialogOpen(true)
                          }}
                          className="cursor-pointer p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="cursor-pointer p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Dialogs */}
      <StudentFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          refetch()
        }}
      />

      <StudentFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedStudent(null)
        }}
        student={selectedStudent}
        onSuccess={() => {
          setIsEditDialogOpen(false)
          setSelectedStudent(null)
          refetch()
        }}
      />

      {selectedStudent && (
        <DeleteStudentDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedStudent(null)
          }}
          student={selectedStudent}
          onSuccess={() => {
            setIsDeleteDialogOpen(false)
            setSelectedStudent(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}
