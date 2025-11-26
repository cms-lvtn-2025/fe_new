'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMyDefences } from '@/lib/graphql/hooks'
import { Calendar, Clock, MapPin, Users, Award } from 'lucide-react'
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

export default function TeacherDefencesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewMode, setViewMode] = useState<'upcoming' | 'all'>('upcoming')

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

    // Note: Upcoming filter is handled client-side because backend may not support nested field filtering
    // if (viewMode === 'upcoming') {
    //   filters.push({
    //     condition: {
    //       field: 'council.timeStart',
    //       operator: 'GREATER_THAN',
    //       values: [new Date().toISOString()],
    //     },
    //   })
    // }

    return filters
  }

  const { defences, total, loading, error, refetch } = useMyDefences({
    pagination: {
      page: currentPage,
      pageSize,
      sortBy: 'created_at',
      descending: false, // Ascending for upcoming events
    },
    filters: buildFilters()
  })

  // Client-side filter for upcoming defences
  const filteredDefences = viewMode === 'upcoming'
    ? defences.filter((d: any) => {
        const timeStart = d.council?.timeStart
        return timeStart && new Date(timeStart) > new Date()
      })
    : defences

  const totalPages = Math.ceil(total / pageSize)

  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
    setCurrentPage(1)
  }

  const handlePositionChange = (position: string) => {
    setSelectedPosition(position)
    setCurrentPage(1)
  }

  const handleViewModeChange = (mode: 'upcoming' | 'all') => {
    setViewMode(mode)
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
      backUrl: '/teacher/defences'
    }
    sessionStorage.setItem('defenceDetailData', JSON.stringify(defenceData))
    router.push(`/teacher/councils/${defence.id}`)
  }

  // Group defences by date
  const groupDefencesByDate = (defenceList: any[]) => {
    const groups: Record<string, any[]> = {}
    defenceList.forEach((defence) => {
      const council = defence.council
      if (council?.timeStart) {
        const date = new Date(council.timeStart).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(defence)
      }
    })
    return groups
  }

  const groupedDefences = groupDefencesByDate(filteredDefences)

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Lỗi: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Lịch hội đồng bảo vệ
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Xem lịch các buổi bảo vệ mà bạn tham gia
        </p>
      </div>

      {/* View Mode Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleViewModeChange('upcoming')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              viewMode === 'upcoming'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Sắp diễn ra
          </button>
          <button
            onClick={() => handleViewModeChange('all')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              viewMode === 'all'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchBar
        onSearch={handleSearchChange}
        onRefresh={handleRefresh}
        placeholder="Tìm kiếm theo tên hội đồng..."
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
      </SearchBar>

      {/* Defences Calendar View */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-600 dark:text-gray-400">Đang tải...</div>
        </div>
      ) : filteredDefences.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 dark:text-gray-400">
            {searchTerm || selectedPosition !== 'all'
              ? 'Không tìm thấy lịch bảo vệ nào'
              : viewMode === 'upcoming'
              ? 'Không có lịch bảo vệ sắp tới'
              : 'Bạn chưa có lịch bảo vệ nào'}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDefences).map(([date, dateDefences]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {date}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({dateDefences.length} buổi)
                </span>
              </div>

              {/* Defence Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dateDefences.map((defence: any) => {
                  const council = defence.council
                  const gradeDefences = defence.gradeDefences || []
                  const gradedCount = gradeDefences.filter((g: any) => g.totalScore !== null && g.totalScore !== undefined).length

                  return (
                    <div
                      key={defence.id}
                      onClick={() => handleViewDetail(defence)}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {council?.title || defence.title || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {council?.id || 'N/A'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${POSITION_COLORS[defence.position] || 'bg-gray-100 dark:bg-gray-700'}`}>
                          {POSITION_LABELS[defence.position] || defence.position || 'N/A'}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <Clock className="w-4 h-4" />
                        <span>
                          {council?.timeStart ? (
                            new Date(council.timeStart).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          ) : (
                            'Chưa có giờ'
                          )}
                        </span>
                        {council?.timeEnd && (
                          <>
                            <span>-</span>
                            <span>
                              {new Date(council.timeEnd).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{council?.majorCode || 'N/A'}</span>
                        <span>•</span>
                        <span>{council?.semesterCode || 'N/A'}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-gray-100">
                            {gradeDefences.length} sinh viên
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-gray-100">
                            Đã chấm: {gradedCount}/{gradeDefences.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Ungrouped defences (no timeStart) */}
          {filteredDefences.filter((d: any) => !d.council?.timeStart).length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Chưa xác định lịch
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDefences
                  .filter((d: any) => !d.council?.timeStart)
                  .map((defence: any) => {
                    const council = defence.council
                    const gradeDefences = defence.gradeDefences || []
                    const gradedCount = gradeDefences.filter((g: any) => g.totalScore !== null && g.totalScore !== undefined).length

                    return (
                      <div
                        key={defence.id}
                        onClick={() => handleViewDetail(defence)}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {council?.title || defence.title || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                              {council?.id || 'N/A'}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${POSITION_COLORS[defence.position] || 'bg-gray-100 dark:bg-gray-700'}`}>
                            {POSITION_LABELS[defence.position] || defence.position || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-gray-100">
                              {gradeDefences.length} sinh viên
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-gray-100">
                              Đã chấm: {gradedCount}/{gradeDefences.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredDefences.length > 0 && (
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
