'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { Calendar, List, Search, Filter, RefreshCw } from 'lucide-react'
import { GET_DEFENCE_SCHEDULE, GET_ALL_SEMESTERS } from '@/lib/graphql/queries/admin'
import { DefenceCalendar, DefenceList, ViewCouncilDialog } from '@/components/admin/defences'
import Loading from '@/components/common/Loading'
import type { Council } from '@/types/defence'

type ViewMode = 'calendar' | 'list'

interface DefenceScheduleData {
  getAllCouncils: {
    total: number
    data: Council[]
  }
}

export default function DefenceSchedulePage() {
  const { data: semestersData } = useQuery(GET_ALL_SEMESTERS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 100, sortBy: 'created_at', descending: true },
        filters: [],
      },
    },
  })
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMajor, setSelectedMajor] = useState<string>('all')
  const [selectedSemester, setSelectedSemester] = useState<string>(semestersData ? (semestersData as any).getAllSemesters.data[0]?.id : 'all')
  const [selectedCouncil, setSelectedCouncil] = useState<Council | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // Fetch semesters
  

  const semesters = useMemo(() => {
    return (semestersData as any)?.getAllSemesters?.data || []
  }, [semestersData])

  // Build filters for query
  const filters = useMemo(() => {
    const filterArray: any[] = []

    if (selectedSemester !== 'all') {
      filterArray.push({
        condition: {
          field: 'semester_code',
          operator: 'EQUAL',
          values: [selectedSemester],
        },
      })
    }

    return filterArray
  }, [selectedSemester])

  // Fetch defence schedule data
  const { data, loading, error, refetch } = useQuery<DefenceScheduleData>(GET_DEFENCE_SCHEDULE, {
    variables: {
      search: {
        pagination: {
          page: 1,
          pageSize: 1000,
          sortBy: 'time_start',
          descending: false,
        },
        filters,
      },
    },
    fetchPolicy: 'network-only',
  })

  // Refetch when semester changes
  useEffect(() => {
    refetch()
  }, [selectedSemester, refetch])

  // Extract councils from data
  const councils: Council[] = useMemo(() => {
    return data?.getAllCouncils?.data || []
  }, [data])

  // Get unique majors for filter
  const majors = useMemo(() => {
    const majorSet = new Set(councils.map((c) => c.majorCode))
    return Array.from(majorSet).sort()
  }, [councils])

  // Filter councils based on search and major
  const filteredCouncils = useMemo(() => {
    return councils.filter((council) => {
      const matchesSearch =
        searchTerm === '' ||
        council.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (council.topicCouncils && council.topicCouncils.some(
          (tc) =>
            tc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tc.topic?.title.toLowerCase().includes(searchTerm.toLowerCase())
        ))

      const matchesMajor = selectedMajor === 'all' || council.majorCode === selectedMajor

      return matchesSearch && matchesMajor
    })
  }, [councils, searchTerm, selectedMajor])

  // Handlers
  const handleViewCouncil = (council: Council) => {
    setSelectedCouncil(council)
    setIsDetailDialogOpen(true)
  }

  const handleRefresh = () => {
    refetch()
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading size="lg" />
      </div>
    )
  }

  // Error state
  if (error && data === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">
            Lỗi khi tải dữ liệu lịch bảo vệ
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Quản lý Lịch Bảo vệ
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Xem và quản lý lịch bảo vệ đồ án và luận văn
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm hội đồng, đề tài..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Semester Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="flex items-center gap-2">
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả ngành</option>
            {majors.map((major) => (
              <option key={major} value={major}>
                {major}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="hidden sm:inline">Lịch</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <List className="w-5 h-5" />
            <span className="hidden sm:inline">Danh sách</span>
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
            Tổng số hội đồng
          </p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {filteredCouncils.length}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
            Tổng đề tài
          </p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {filteredCouncils.reduce((sum, c) => sum + (c.topicCouncils?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
            Sinh viên bảo vệ
          </p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {filteredCouncils.reduce(
              (sum, c) =>
                sum + (c.topicCouncils?.reduce((s, tc) => s + (tc.enrollments?.length || 0), 0) || 0),
              0
            )}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'calendar' ? (
          <DefenceCalendar
            councils={filteredCouncils}
            onEventClick={(event) => {
              // Find council by ID
              const council = filteredCouncils.find((c) => c.id === event.councilId)
              if (council) {
                handleViewCouncil(council)
              }
            }}
          />
        ) : (
          <div className="h-full">
            <DefenceList councils={filteredCouncils} onCouncilClick={handleViewCouncil} />
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <ViewCouncilDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        council={selectedCouncil}
      />
    </div>
  )
}
