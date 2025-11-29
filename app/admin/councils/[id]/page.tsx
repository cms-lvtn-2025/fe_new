'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { createDetailSearch } from '@/lib/graphql/utils/search-helpers'
import { GET_COUNCIL_DETAIL } from '@/lib/graphql/queries/admin'
import { ArrowLeft, Calendar, Clock, Users, BookOpen, User, Edit, Trash2, Award, TrendingUp, Star } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { Council } from '@/types/defence'
import { AssignTopicsDialog } from '@/components/admin/councils/assign-topics-dialog'
import { DELETE_COUNCIL, UPDATE_COUNCIL } from '@/lib/graphql/mutations/admin'
import { ASSIGN_TOPIC_TO_COUNCIL, REMOVE_TOPIC_FROM_COUNCIL } from '@/lib/graphql/mutations/department'

const getPositionLabel = (position: string) => {
  switch (position) {
    case 'PRESIDENT':
      return 'Chủ tịch'
    case 'SECRETARY':
      return 'Thư ký'
    case 'REVIEWER':
      return 'Phản biện'
    case 'MEMBER':
      return 'Thành viên'
    default:
      return position
  }
}

const getStageLabel = (stage: string) => {
  switch (stage) {
    case 'STAGE_DACN':
      return 'Giai đoạn 1 (ĐACN)'
    case 'STAGE_LVTN':
      return 'Giai đoạn 2 (LVTN)'
    default:
      return stage
  }
}

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'STAGE_DACN':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'STAGE_LVTN':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

export default function CouncilDetailPage() {
  const params = useParams()
  const router = useRouter()
  const councilId = params.id as string
  const [isAssignTopicsDialogOpen, setIsAssignTopicsDialogOpen] = useState(false)
  const [timeStart, setTimeStart] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const { data, loading, error } = useQuery(GET_COUNCIL_DETAIL, {
    variables: { search: createDetailSearch(councilId) },
    skip: !councilId,
  })

  useEffect(() => {
    const council = (data as any)?.affair?.councils?.data?.[0]
    if (council?.timeStart) {
      const date = new Date(council.timeStart)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      setTimeStart(`${year}-${month}-${day}T${hours}:${minutes}`)
    }
  }, [data])

  const [updateCouncil, { loading: updateLoading }] = useMutation(UPDATE_COUNCIL, {
    onCompleted: () => {
      alert('Đã lưu thành công!')
      setHasChanges(false)
      window.location.reload()
    },
    onError: (error) => {
      alert(`Lỗi khi cập nhật: ${error.message}`)
    },
  })

  const [deleteCouncil, { loading: deleteLoading }] = useMutation(DELETE_COUNCIL, {
    onCompleted: () => {
      router.push('/admin/councils')
    },
    onError: (error) => {
      alert(`Lỗi khi xóa hội đồng: ${error.message}`)
    },
  })

  const [assignTopicToCouncil] = useMutation(ASSIGN_TOPIC_TO_COUNCIL, {
    onError: (error) => {
      alert(`Lỗi khi gán đề tài: ${error.message}`)
    },
  })
  const [removeTopicFromCouncil] = useMutation(REMOVE_TOPIC_FROM_COUNCIL, {
    onError: (error) => {
      alert(`Lỗi khi gán đề tài: ${error.message}`)
    },
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Lỗi khi tải dữ liệu</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
          <button onClick={() => router.push('/admin/councils')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">Quay lại</button>
        </div>
      </div>
    )
  }

  const council = (data as any)?.affair?.councils?.data?.[0]

  if (!council) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">
            Không tìm thấy thông tin hội đồng
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Hội đồng với ID {councilId} không tồn tại
          </p>
          <button
            onClick={() => router.push('/admin/councils')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  const handleTopicClick = (topicCode: string) => {
    router.push(`/admin/topics/${topicCode}`)
  }

  const handleStudentClick = (enrollment: any) => {
    router.push(`/admin/students/${enrollment.studentCode}`)
  }

  const handleTeacherClick = (teacher: any) => {
    router.push(`/admin/teachers/${teacher.id}`)
  }

  const handleTimeChange = (newTime: string) => {
    setTimeStart(newTime)
    setHasChanges(true)
  }

  const handleRemoveTopicFromCouncil = async (topicCouncilId: string, councilId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đề tài này khỏi hội đồng?')) {
      try {
        // Assign null to remove from council
        await removeTopicFromCouncil({
          variables: {
            topicCouncilId,
            councilId: councilId,
          },
        })
        window.location.reload()
      } catch (error) {
        // Error is handled by onError callback
      }
    }
  }

  const handleAddTopics = () => {
    setIsAssignTopicsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!hasChanges) {
      alert('Không có thay đổi nào để lưu')
      return
    }

    try {
      await updateCouncil({
        variables: {
          id: council.id,
          input: {
            timeStart: timeStart ? new Date(timeStart).toISOString() : null,
          },
        },
      })
    } catch (error) {
      // Error is handled by onError callback
    }
  }

  const handleDelete = async () => {
    if (confirm(`Bạn có chắc chắn muốn xóa hội đồng "${council.title}"?`)) {
      try {
        await deleteCouncil({
          variables: {
            id: council.id,
          },
        })
      } catch (error) {
        // Error is handled by onError callback
      }
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/admin/councils')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {council.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Mã: {council.id}</p>
          </div>

          {/* Action Buttons */}
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={updateLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateLoading ? 'Đang lưu...' : 'Lưu'}
            </button>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Thông tin cơ bản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mã ngành
                </label>
                <p className="text-gray-900 dark:text-gray-100">{council.majorCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Học kỳ
                </label>
                <p className="text-gray-900 dark:text-gray-100">{council.semesterCode}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 md:col-span-2">
              <Clock className="w-5 h-5 text-gray-400 mt-2" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                  Thời gian bảo vệ
                </label>
                <input
                  type="datetime-local"
                  value={timeStart}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {timeStart && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {format(new Date(timeStart), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Số đề tài
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {council.topicCouncils?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Defence Committee Members */}
        {council.defences && council.defences.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thành viên Hội đồng
            </h2>
            <div className="space-y-2">
              {council.defences.map((defence: any) => (
                <div
                  key={defence.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <button
                      onClick={() => handleTeacherClick(defence.teacher)}
                      className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {defence.teacher.username}
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {defence.teacher.email}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {getPositionLabel(defence.position)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topic Councils */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Danh sách đề tài bảo vệ ({council.topicCouncils?.length || 0})
            </h2>
            <button
              onClick={handleAddTopics}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Thêm đề tài
            </button>
          </div>

          {council.topicCouncils && council.topicCouncils.length > 0 ? (
            <div className="space-y-3">
              {council.topicCouncils.map((topicCouncil: any, index: number) => (
                <div
                  key={topicCouncil.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        #{index + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStageColor(topicCouncil.stage)}`}
                      >
                        {getStageLabel(topicCouncil.stage)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(new Date(topicCouncil.timeStart), 'HH:mm', { locale: vi })} -{' '}
                          {format(new Date(topicCouncil.timeEnd), 'HH:mm', { locale: vi })}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveTopicFromCouncil(topicCouncil.id, council.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Xóa khỏi hội đồng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTopicClick(topicCouncil.topicCode)}
                    className="group text-left w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {topicCouncil.topic?.title || topicCouncil.title}
                    </h3>
                  </button>

                  {topicCouncil.enrollments && topicCouncil.enrollments.length > 0 && (
                    <div className="mb-3 space-y-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sinh viên thực hiện:
                      </p>
                      {topicCouncil.enrollments.map((enrollment: any) => (
                        <div
                          key={enrollment.id}
                          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          {/* Student Info */}
                          <div className="flex items-center justify-between mb-3">
                            <button
                              onClick={() => handleStudentClick(enrollment)}
                              className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <Users className="w-4 h-4" />
                              {enrollment.student?.username || enrollment.studentCode}
                            </button>
                          </div>

                          {/* Grades Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Midterm Grade */}
                            {enrollment.midterm && (
                              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-2 mb-1">
                                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Điểm giữa kỳ
                                  </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                  {enrollment.midterm.grade !== null ? enrollment.midterm.grade : '--'}
                                </p>
                              </div>
                            )}

                            {/* Final Grades */}
                            {enrollment.final && (
                              <>
                

                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-300 dark:border-green-700">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                      Điểm cuối kỳ
                                    </span>
                                  </div>
                                  <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                                     {enrollment.final.supervisorGrade !== null ? enrollment.final.supervisorGrade : '--'}
                                  </p>
                                </div>
                              </>
                            )}

                            
                          </div>

                          {/* Grade Defences (Council Grades) */}
                          {enrollment.gradeDefences && enrollment.gradeDefences.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Điểm bảo vệ từ hội đồng
                              </p>
                              <div className="space-y-3">
                                {enrollment.gradeDefences.map((gd: any) => (
                                  <div
                                    key={gd.id}
                                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                                  >
                                    {/* Header: Teacher Info + Total Score */}
                                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {gd.defence?.teacher?.username || 'N/A'}
                                          </p>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                                          {gd.defence?.position === 'PRESIDENT'
                                            ? 'Chủ tịch hội đồng'
                                            : gd.defence?.position === 'SECRETARY'
                                            ? 'Thư ký hội đồng'
                                            : gd.defence?.position === 'REVIEWER'
                                            ? 'Phản biện'
                                            : 'Thành viên hội đồng'}
                                        </p>
                                        {gd.defence?.teacher?.email && (
                                          <p className="text-xs text-gray-400 dark:text-gray-500 ml-6">
                                            {gd.defence.teacher.email}
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tổng điểm</p>
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                          {gd.totalScore !== null ? gd.totalScore.toFixed(2) : '--'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Criteria Breakdown */}
                                    {gd.criteria && gd.criteria.length > 0 && (
                                      <div className="mb-3">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                          Chi tiết tiêu chí chấm:
                                        </p>
                                        <div className="space-y-2">
                                          {gd.criteria.map((criterion: any) => (
                                            <div
                                              key={criterion.id}
                                              className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded"
                                            >
                                              <div className="flex-1">
                                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                  {criterion.name}
                                                </p>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                  {criterion.score}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                  / {criterion.maxScore}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Notes */}
                                    {gd.note && (
                                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                        <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                                          Ghi chú:
                                        </p>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-400 italic">
                                          {gd.note}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {topicCouncil.supervisors && topicCouncil.supervisors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        GVHD:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {topicCouncil.supervisors.map((sup: any) => (
                          <button
                            key={sup.id}
                            onClick={() => handleTeacherClick(sup.teacher)}
                            className="px-3 py-1 text-sm bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                          >
                            {sup.teacher.username}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Chưa có đề tài nào được gán cho hội đồng này
              </p>
              <button
                onClick={handleAddTopics}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Thêm đề tài đầu tiên
              </button>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Thông tin hệ thống
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {council.createdAt && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Ngày tạo:</span>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {new Date(council.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
            {council.updatedAt && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Cập nhật lần cuối:</span>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {new Date(council.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {council && (
        <AssignTopicsDialog
          isOpen={isAssignTopicsDialogOpen}
          onClose={() => setIsAssignTopicsDialogOpen(false)}
          councilId={council.id}
          councilTitle={council.title}
          councilMajorCode={council.majorCode}
          councilSemesterCode={council.semesterCode}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
