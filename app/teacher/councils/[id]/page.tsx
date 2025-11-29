'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { createDetailSearch } from '@/lib/graphql/utils/search-helpers'
import { GET_DEFENCE_DETAIL } from '@/lib/graphql/queries/teacher'
import {
  ArrowLeft,
  Users,
  Calendar,
  Download,
  Upload,
  User,
  Mail,
  Award,
  Clock,
  Edit,
  CheckCircle
} from 'lucide-react'
import { GradeDefenceDialog } from '@/components/teacher/grade-defence-dialog'

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

export default function TeacherCouncilDetailPage() {
  const router = useRouter()
  const params = useParams()
  const defenceId = params.id as string
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const [selectedGradeDefence, setSelectedGradeDefence] = useState<any>(null)

  const { data, loading, error, refetch } = useQuery(GET_DEFENCE_DETAIL, {
    variables: { search: createDetailSearch(defenceId) },
    skip: !defenceId,
  })

  const handleBack = () => {
    router.push('/teacher/councils')
  }

  const handleImportExcel = () => {
    alert('Chức năng Import Excel điểm sẽ được triển khai sau khi backend hoàn thiện')
  }

  const handleExportExcel = () => {
    const defenceData = (data as any)?.teacher?.council?.defences?.data?.[0]
    const council = defenceData?.council
    alert(`Export điểm hội đồng "${council?.title}" sẽ được triển khai sau khi backend hoàn thiện`)
  }

  const handleGradeStudent = (gradeDefence: any) => {
    setSelectedGradeDefence(gradeDefence)
    setIsGradeDialogOpen(true)
  }

  const handleGradeSuccess = () => {
    // Refetch data after successful grade submission
    refetch()
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

  if (error && !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Lỗi: {error.message}</p>
        <button
          onClick={() => router.push('/teacher/councils')}
          className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    )
  }

  const defenceData = (data as any)?.teacher?.council?.defences?.data?.[0]

  if (!defenceData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Không tìm thấy thông tin hội đồng {defenceId}</p>
        <button
          onClick={() => router.push('/teacher/councils')}
          className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    )
  }

  const council = defenceData.council
  const gradeDefences = defenceData.gradeDefences || []
  const topicCouncils = council?.topicCouncils || []

  // Lấy tất cả enrollments từ topicCouncils
  const allEnrollments = topicCouncils.flatMap((tc: any) =>
    (tc.enrollments || []).map((enrollment: any) => ({
      ...enrollment,
      topicCouncilTitle: tc.title,
      topicCouncilStage: tc.stage,
    }))
  )

  // Tạo map để tra cứu gradeDefence theo enrollmentCode
  const gradeDefenceMap = new Map(
    gradeDefences.map((gd: any) => [gd.enrollmentCode, gd])
  )

  // Kết hợp enrollments với gradeDefences
  const studentsWithGrades = allEnrollments.map((enrollment: any) => ({
    enrollment,
    gradeDefence: gradeDefenceMap.get(enrollment.id) || null,
  }))

  const gradedCount = studentsWithGrades.filter((s: any) =>
    s.gradeDefence?.totalScore !== null && s.gradeDefence?.totalScore !== undefined
  ).length

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
                {council?.title || defenceData.title || 'Chi tiết hội đồng'}
              </h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${POSITION_COLORS[defenceData.position] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                {POSITION_LABELS[defenceData.position] || defenceData.position || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Mã: {council?.id || 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                Đã chấm: {gradedCount}/{studentsWithGrades.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
        {/* Left Column - Grade Defences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grade Defences List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Danh sách sinh viên cần chấm ({studentsWithGrades.length})
              </h2>
            </div>
            {studentsWithGrades.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Chưa có sinh viên nào trong hội đồng</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentsWithGrades.map((item: any, index: number) => {
                  const { enrollment, gradeDefence } = item
                  const hasScore = gradeDefence?.totalScore !== null && gradeDefence?.totalScore !== undefined
                  const criteria = gradeDefence?.criteria || []

                  return (
                    <div
                      key={enrollment.id || index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                            {hasScore ? (
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {enrollment.student?.username || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                              MSSV: {enrollment.student?.mssv || enrollment.studentCode}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {enrollment.title}
                            </p>
                            {gradeDefence?.note && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                                📝 {gradeDefence.note}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleGradeStudent(gradeDefence || { enrollmentCode: enrollment.id, defenceCode: defenceData.id })}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          {hasScore ? 'Sửa điểm' : 'Chấm điểm'}
                        </button>
                      </div>

                      {/* Total Score */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tổng điểm
                          </span>
                          {hasScore ? (
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {gradeDefence.totalScore}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">Chưa chấm</span>
                          )}
                        </div>

                        {/* Criteria */}
                        {criteria.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              Chi tiết tiêu chí
                            </h4>
                            {criteria.map((criterion: any, idx: number) => (
                              <div
                                key={criterion.id || idx}
                                className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 rounded px-3 py-2"
                              >
                                <span className="text-gray-700 dark:text-gray-300">
                                  {criterion.name || `Tiêu chí ${idx + 1}`}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {criterion.score !== null && criterion.score !== undefined
                                    ? `${criterion.score}/${criterion.maxScore || 10}`
                                    : '-'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Council Info */}
        <div className="space-y-6">
          {/* Council Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Thông tin hội đồng
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Mã hội đồng</label>
                <p className="text-gray-900 dark:text-gray-100 mt-1 font-mono">
                  {council?.id || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Tên hội đồng</label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {council?.title || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Mã khoa</label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {council?.majorCode || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Mã học kỳ</label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {council?.semesterCode || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Lịch bảo vệ
            </h2>
            {council?.timeStart ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ngày bảo vệ</p>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {new Date(council.timeStart).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Thời gian</p>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {new Date(council.timeStart).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có lịch bảo vệ</p>
            )}
          </div>

          {/* My Role */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Vai trò của bạn
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Chức vụ</label>
                <div className="mt-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${POSITION_COLORS[defenceData.position] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                    {POSITION_LABELS[defenceData.position] || defenceData.position || 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Mã giảng viên</label>
                <p className="text-gray-900 dark:text-gray-100 mt-1 font-mono">
                  {defenceData.teacherCode || 'N/A'}
                </p>
              </div>
            </div>
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
                  {defenceData.createdAt
                    ? new Date(defenceData.createdAt).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-gray-500 dark:text-gray-400">Cập nhật lần cuối</label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {defenceData.updatedAt
                    ? new Date(defenceData.updatedAt).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Defence Dialog */}
      <GradeDefenceDialog
        isOpen={isGradeDialogOpen}
        onClose={() => setIsGradeDialogOpen(false)}
        gradeDefence={selectedGradeDefence}
        defenceId={defenceData?.id || ''}
        onSuccess={handleGradeSuccess}
      />
    </div>
  )
}
