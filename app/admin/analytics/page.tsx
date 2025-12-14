'use client'

import { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import {
  GET_ALL_TOPICS,
  GET_ALL_COUNCILS,
  GET_ALL_SEMESTERS
} from '@/lib/graphql/queries/admin'
import { GET_LIST_STUDENTS, GET_LIST_TEACHERS } from '@/lib/graphql/queries/admin/user.queries'
import {
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  BarChart3,
  Filter
} from 'lucide-react'
import Loading from '@/components/common/Loading'
import { useSemester } from '@/lib/contexts/semester-context'

interface Topic {
  id: string
  status: string
  topicCouncils?: any[]
}

interface Council {
  id: string
  topicCouncils?: any[]
  timeStart?: string
}

export default function AnalyticsPage() {
  const { currentSemester } = useSemester()
  const [selectedSemester, setSelectedSemester] = useState<string>('')

  // Fetch all semesters
  const { data: semestersData } = useQuery(GET_ALL_SEMESTERS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 100 , sortBy: 'created_at', descending: true },
        filters: [],
      },
    },
  })

  const semesters = (semestersData as any)?.affair?.semesters?.data || []

  // Set default selected semester to current semester
  useEffect(() => {
    if (currentSemester && !selectedSemester) {
      setSelectedSemester(currentSemester.code)
    }
  }, [currentSemester, selectedSemester])

  // Build filters for selected semester with useMemo
  const semesterFilters = useMemo(() => {
    if (!selectedSemester) return []
    return [
      {
        condition: {
          field: 'semester_code',
          operator: 'EQUAL',
          values: [selectedSemester],
        },
      },
    ]
  }, [selectedSemester])

  const selectedSemesterData = semesters.find((s: any) => s.id === selectedSemester)

  // Fetch all data
  const { data: topicsData, loading: topicsLoading } = useQuery(GET_ALL_TOPICS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 10000 , sortBy: 'created_at', descending: true },
        filters: semesterFilters,
      },
    },
    skip: !selectedSemester,
    fetchPolicy: 'cache-and-network',
  })

  const { data: councilsData, loading: councilsLoading } = useQuery(GET_ALL_COUNCILS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 10000 , sortBy: 'created_at', descending: true },
        filters: semesterFilters,
      },
    },
    skip: !selectedSemester,
    fetchPolicy: 'cache-and-network',
  })

  const { data: studentsData, loading: studentsLoading } = useQuery(GET_LIST_STUDENTS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 10000 , sortBy: 'created_at', descending: true },
        filters: semesterFilters,
      },
    },
    skip: !selectedSemester,
    fetchPolicy: 'cache-and-network',
  })

  const { data: teachersData, loading: teachersLoading } = useQuery(GET_LIST_TEACHERS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 10000 , sortBy: 'created_at', descending: true },
        filters: semesterFilters,
      },
    },
    skip: !selectedSemester,
    fetchPolicy: 'cache-and-network',
  })

  // Calculate statistics
  const stats = useMemo(() => {
    const topics: Topic[] = (topicsData as any)?.affair?.topics?.data || []
    const councils: Council[] = (councilsData as any)?.affair?.councils?.data || []
    const students = (studentsData as any)?.affair?.students?.data || []
    const teachers = (teachersData as any)?.affair?.teachers?.data || []

    // Topic statistics
    const totalTopics = topics.length
    const topicsByStatus = {
      PENDING: topics.filter((t) => t.status === 'PENDING').length,
      APPROVED: topics.filter((t) => t.status === 'APPROVED').length,
      REJECTED: topics.filter((t) => t.status === 'REJECTED').length,
      IN_PROGRESS: topics.filter((t) => t.status === 'IN_PROGRESS').length,
      COMPLETED: topics.filter((t) => t.status === 'COMPLETED').length,
    }

    // Council statistics
    const totalCouncils = councils.length
    const councilsWithTime = councils.filter((c) => c.timeStart).length
    const councilsWithoutTime = totalCouncils - councilsWithTime

    // Count topics assigned to councils
    let topicsInCouncils = 0
    councils.forEach((c) => {
      if (c.topicCouncils) {
        topicsInCouncils += c.topicCouncils.length
      }
    })

    const topicsWithoutCouncil = totalTopics - topicsInCouncils

    return {
      totalTopics,
      totalCouncils,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      topicsByStatus,
      councilsWithTime,
      councilsWithoutTime,
      topicsInCouncils,
      topicsWithoutCouncil,
    }
  }, [topicsData, councilsData, studentsData, teachersData])

  const loading = topicsLoading || councilsLoading || studentsLoading || teachersLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Phân tích học kỳ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Thống kê tổng quan theo học kỳ
          </p>
        </div>

        {/* Semester Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
          >
            <option value="">-- Chọn học kỳ --</option>
            {semesters.map((semester: any) => (
              <option key={semester.id} value={semester.id}>
                {semester.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedSemester ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Vui lòng chọn học kỳ để xem phân tích
            </p>
          </div>
        </div>
      ) : (
        <>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Topics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng đề tài</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stats.totalTopics}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sinh viên</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stats.totalStudents}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Giảng viên</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stats.totalTeachers}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total Councils */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hội đồng</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stats.totalCouncils}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Topic Status Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Thống kê trạng thái đề tài
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">Chờ duyệt</p>
            </div>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
              {stats.topicsByStatus.PENDING}
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
              {((stats.topicsByStatus.PENDING / stats.totalTopics) * 100 || 0).toFixed(1)}%
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-900 dark:text-green-300">Đã duyệt</p>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-300">
              {stats.topicsByStatus.APPROVED}
            </p>
            <p className="text-xs text-green-700 dark:text-green-500 mt-1">
              {((stats.topicsByStatus.APPROVED / stats.totalTopics) * 100 || 0).toFixed(1)}%
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Đang thực hiện</p>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
              {stats.topicsByStatus.IN_PROGRESS}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
              {((stats.topicsByStatus.IN_PROGRESS / stats.totalTopics) * 100 || 0).toFixed(1)}%
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Hoàn thành</p>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
              {stats.topicsByStatus.COMPLETED}
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-500 mt-1">
              {((stats.topicsByStatus.COMPLETED / stats.totalTopics) * 100 || 0).toFixed(1)}%
            </p>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-900 dark:text-red-300">Từ chối</p>
            </div>
            <p className="text-2xl font-bold text-red-900 dark:text-red-300">
              {stats.topicsByStatus.REJECTED}
            </p>
            <p className="text-xs text-red-700 dark:text-red-500 mt-1">
              {((stats.topicsByStatus.REJECTED / stats.totalTopics) * 100 || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Council and Topic Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Council Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Thống kê hội đồng
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đã gán giờ
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.councilsWithTime}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chưa gán giờ
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.councilsWithoutTime}
              </span>
            </div>
          </div>
        </div>

        {/* Topic Assignment Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Phân công đề tài
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đã gán hội đồng
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.topicsInCouncils}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chưa gán hội đồng
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.topicsWithoutCouncil}
              </span>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
