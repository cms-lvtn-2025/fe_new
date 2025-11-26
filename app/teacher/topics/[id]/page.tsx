'use client'

import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { createDetailSearch } from '@/lib/graphql/utils/search-helpers'
import { GET_TOPIC_COUNCIL_DETAIL } from '@/lib/graphql/queries/teacher'
import {
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  Download,
  Upload,
  User,
  Mail,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge'

const STATUS_LABELS: Record<string, string> = {
  SUBMIT: 'Đã nộp',
  TOPIC_PENDING: 'Chờ duyệt',
  APPROVED_1: 'Duyệt lần 1',
  APPROVED_2: 'Duyệt lần 2',
  IN_PROGRESS: 'Đang thực hiện',
  TOPIC_COMPLETED: 'Hoàn thành',
  REJECTED: 'Từ chối',
}

const STAGE_LABELS: Record<string, string> = {
  STAGE_1: 'Giai đoạn 1',
  STAGE_2: 'Giai đoạn 2',
}

export default function TeacherTopicDetailPage() {
  const router = useRouter()
  const params = useParams()
  const topicCouncilId = params.id as string

  const { data, loading, error } = useQuery(GET_TOPIC_COUNCIL_DETAIL, {
    variables: { search: createDetailSearch(topicCouncilId) },
    skip: !topicCouncilId,
  })

  const handleBack = () => {
    router.push('/teacher/topics')
  }

  const handleImportExcel = () => {
    alert('Chức năng Import Excel điểm sẽ được triển khai sau khi backend hoàn thiện')
  }

  const handleExportExcel = () => {
    const topic = topicCouncilData?.topic
    alert(`Export điểm đề tài "${topic?.title}" sẽ được triển khai sau khi backend hoàn thiện`)
  }

  const handleGradeStudent = (enrollment: any) => {
    alert(`Chấm điểm cho sinh viên ${enrollment.student?.username} sẽ được triển khai sau`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 font-medium mb-2">Lỗi khi tải dữ liệu</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
        <button onClick={() => router.push('/teacher/topics')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">Quay lại</button>
      </div>
    )
  }

  const topicCouncilData = (data as any)?.teacher?.supervisor?.topicCouncils?.data?.[0]

  if (!topicCouncilData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Không tìm thấy thông tin đề tài</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">TopicCouncil với ID {topicCouncilId} không tồn tại</p>
        <button
          onClick={() => router.push('/teacher/topics')}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    )
  }

  const topic = topicCouncilData.topic
  const enrollments = topicCouncilData.enrollments || []
  const supervisors = topicCouncilData.supervisors || []

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {topic?.title || 'Chi tiết đề tài'}
              </h1>
              <StatusBadge
                status={topic?.status || 'UNKNOWN'}
                label={STATUS_LABELS[topic?.status] || topic?.status || 'N/A'}
              />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Mã: {topic?.id || 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {topic?.major?.title || 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {topic?.semester?.title || 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert(`Download file đề tài "${topic?.title}"\nAPI sẽ được triển khai sau`)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              title="Download file đề tài"
            >
              <Download className="w-5 h-5" />
              Download File
            </button>
            <button
              onClick={handleImportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              title="Import điểm từ Excel"
            >
              <Upload className="w-5 h-5" />
              Import Excel
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Export điểm ra Excel"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Topic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topic Council Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Thông tin Hội đồng
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Giai đoạn</label>
                <div className="mt-1">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded">
                    {STAGE_LABELS[topicCouncilData.stage] || topicCouncilData.stage || 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Mã hội đồng</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100 font-mono">
                  {topicCouncilData.councilCode || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Thời gian bắt đầu</label>
                <div className="mt-1 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {topicCouncilData.timeStart ? (
                    <div>
                      {new Date(topicCouncilData.timeStart).toLocaleDateString('vi-VN')}{' '}
                      {new Date(topicCouncilData.timeStart).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-400">Chưa có lịch</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Thời gian kết thúc</label>
                <div className="mt-1 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {topicCouncilData.timeEnd ? (
                    <div>
                      {new Date(topicCouncilData.timeEnd).toLocaleDateString('vi-VN')}{' '}
                      {new Date(topicCouncilData.timeEnd).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-400">Chưa có lịch</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tiến độ thực hiện
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Giai đoạn 1</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {topic?.percentStage1 || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${topic?.percentStage1 || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Giai đoạn 2</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {topic?.percentStage2 || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${topic?.percentStage2 || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Danh sách sinh viên ({enrollments.length})
              </h2>
            </div>
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Chưa có sinh viên nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment: any) => {
                  const student = enrollment.student
                  const midterm = enrollment.midterm
                  const final = enrollment.final

                  return (
                    <div
                      key={enrollment.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {student?.username || 'N/A'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span className="font-mono">{student?.id || 'N/A'}</span>
                              <span>•</span>
                              <Mail className="w-4 h-4" />
                              <span>{student?.email || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleGradeStudent(enrollment)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Chấm điểm
                        </button>
                      </div>

                      {/* Grades */}
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {/* Midterm */}
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Điểm giữa kỳ</label>
                          <div className="flex items-center gap-2 mt-1">
                            {midterm?.grade !== null && midterm?.grade !== undefined ? (
                              <>
                                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {midterm.grade}
                                </span>
                                {midterm.status === 'APPROVED' && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">Chưa chấm</span>
                            )}
                          </div>
                        </div>

                        {/* Final */}
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Điểm cuối kỳ</label>
                          <div className="flex items-center gap-2 mt-1">
                            {final?.supervisorGrade !== null && final?.supervisorGrade !== undefined ? (
                              <>
                                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {final.supervisorGrade}
                                </span>
                                {final.status === 'APPROVED' && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">Chưa chấm</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Supervisors & Additional Info */}
        <div className="space-y-6">
          {/* Supervisors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Giảng viên hướng dẫn
            </h2>
            {supervisors.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có thông tin</p>
            ) : (
              <div className="space-y-3">
                {supervisors.map((supervisor: any) => {
                  const teacher = supervisor.teacher
                  return (
                    <div
                      key={supervisor.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {teacher?.username || 'N/A'}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{teacher?.email || 'N/A'}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                          {teacher?.id || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Thông tin khác
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-500 dark:text-gray-400">Ngày tạo</label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {topicCouncilData.createdAt
                    ? new Date(topicCouncilData.createdAt).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-gray-500 dark:text-gray-400">Cập nhật lần cuối</label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {topicCouncilData.updatedAt
                    ? new Date(topicCouncilData.updatedAt).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
