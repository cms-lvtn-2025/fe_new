'use client'

import { useState } from 'react'
import { useDepartmentDefenceSchedule } from '@/lib/graphql/hooks'
import { Calendar, Clock, MapPin, Users, FileText, Search, RefreshCw } from 'lucide-react'

export default function DepartmentDefencesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { councils, loading, error, refetch } = useDepartmentDefenceSchedule({
    pagination: { page: 1, pageSize: 100, sortBy: 'created_at', descending: true },
    filters: []
  })

  // Create events list from councils
  const events = councils.flatMap((council: any) =>
    council.topicCouncils?.map((tc: any) => ({
      id: tc.id,
      title: tc.title || tc.topic?.title || 'Bảo vệ đề tài',
      councilTitle: council.title,
      timeStart: tc.timeStart,
      timeEnd: tc.timeEnd,
      topic: tc.topic,
      enrollments: tc.enrollments,
      supervisors: tc.supervisors,
      defences: council.defences,
    })) || []
  ).filter((e: any) => e.timeStart)

  // Sort events by time
  const sortedEvents = events.sort((a: any, b: any) =>
    new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime()
  )

  // Filter by search term
  const filteredEvents = sortedEvents.filter((event: any) =>
    !searchTerm ||
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.councilTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group events by date
  const groupedEvents = filteredEvents.reduce((groups: any, event: any) => {
    const date = new Date(event.timeStart).toLocaleDateString('vi-VN')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(event)
    return groups
  }, {})

  const handleRefresh = () => {
    refetch()
  }

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
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
          Lịch Bảo vệ
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Xem lịch bảo vệ của tất cả hội đồng
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng buổi bảo vệ</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredEvents.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hội đồng</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {councils.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đề tài</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {filteredEvents.reduce((sum: number, e: any) => sum + (e.enrollments?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên đề tài hoặc hội đồng..."
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
      </div>

      {/* Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Không tìm thấy lịch bảo vệ nào' : 'Chưa có lịch bảo vệ nào'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(groupedEvents).map(([date, events]: [string, any]) => (
              <div key={date} className="p-6">
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {date}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({events.length} buổi)
                  </span>
                </div>

                {/* Events for this date */}
                <div className="space-y-4">
                  {events.map((event: any) => (
                    <div
                      key={event.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Hội đồng: {event.councilTitle}
                          </p>
                        </div>
                        {event.topic?.status && (
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded">
                            {event.topic.status}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {/* Time */}
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(event.timeStart).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {event.timeEnd && ` - ${new Date(event.timeEnd).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}`}
                          </span>
                        </div>

                        {/* Students */}
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.enrollments?.length || 0} sinh viên
                          </span>
                        </div>
                      </div>

                      {/* Students List */}
                      {event.enrollments && event.enrollments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex flex-wrap gap-2">
                            {event.enrollments.map((enrollment: any) => (
                              <span
                                key={enrollment.id}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                              >
                                {enrollment.student?.username || 'N/A'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Defence Committee */}
                      {event.defences && event.defences.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Hội đồng bảo vệ:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {event.defences.map((defence: any) => (
                              <span
                                key={defence.id}
                                className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded"
                              >
                                {defence.teacher?.username || 'N/A'} ({defence.position})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
