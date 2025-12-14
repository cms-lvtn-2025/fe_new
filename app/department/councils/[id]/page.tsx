'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client/react'
import { createDetailSearch } from '@/lib/graphql/utils/search-helpers'
import { GET_DEPARTMENT_COUNCIL_DETAIL, GET_DEPARTMENT_TEACHERS, GET_DEPARTMENT_TOPICS_FOR_ADDCOUNCIL } from '@/lib/graphql/queries/department'
import { ArrowLeft, Calendar, Clock, Users, BookOpen, User, Award, TrendingUp, Star, Plus, Trash2, UserPlus, X } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ADD_DEFENCE_TO_COUNCIL, REMOVE_DEFENCE_FROM_COUNCIL, ASSIGN_TOPIC_TO_COUNCIL, REMOVE_TOPIC_FROM_COUNCIL } from '@/lib/graphql/mutations/department'
import { GET_LIST_TEACHERS } from '@/lib/graphql/queries/admin'
import { GET_DEPARTMENT_TOPICS } from '@/lib/graphql/queries/department'
import { toast } from '@/components/common/Toast'
import { filter } from 'rxjs'

// Định nghĩa các vị trí trong hội đồng
const DEFENCE_POSITIONS = [
  { value: 'PRESIDENT', label: 'Chủ tịch' },
  { value: 'SECRETARY', label: 'Thư ký' },
  { value: 'REVIEWER', label: 'Phản biện' },
  { value: 'MEMBER', label: 'Thành viên' },
]

interface Council {
  id: string
  title: string
  majorCode: string
  semesterCode: string
  timeStart?: string
  createdAt?: string
  updatedAt?: string
  backUrl?: string
  defences?: Array<{
    id: string
    position: string
    teacher: {
      id: string
      username: string
      email: string
    }
  }>
  topicCouncils?: Array<{
    id: string
    title: string
    topicCode: string
    stage: string
    timeStart: string
    timeEnd: string
    topic?: {
      title: string
    }
    enrollments?: Array<{
      id: string
      studentCode: string
      student?: {
        username: string
      }
    }>
    supervisors?: Array<{
      id: string
      teacher: {
        id: string
        username: string
      }
    }>
  }>
}

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
  const backUrl = new URLSearchParams(window.location.search).get('backUrl') || '/department/councils'
  const [council, setCouncil] = useState<Council | null>(null)

  // Modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showAssignTopicModal, setShowAssignTopicModal] = useState(false)

  // Form states
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [selectedTopicCouncil, setSelectedTopicCouncil] = useState('')

  // GraphQL query for council detail
  const { data: councilData, loading, error } = useQuery(GET_DEPARTMENT_COUNCIL_DETAIL, {
    variables: { search: createDetailSearch(councilId) },
    skip: !councilId,
  })

  // Mutations
  const [addDefence, { loading: addingDefence }] = useMutation(ADD_DEFENCE_TO_COUNCIL)
  const [removeDefence, { loading: removingDefence }] = useMutation(REMOVE_DEFENCE_FROM_COUNCIL)
  const [assignTopic, { loading: assigningTopic }] = useMutation(ASSIGN_TOPIC_TO_COUNCIL)
  const [removeTopic, { loading: removingTopic }] = useMutation(REMOVE_TOPIC_FROM_COUNCIL)

  // Query giáo viên có role TEACHER
  const { data: teachersData } = useQuery(GET_DEPARTMENT_TEACHERS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 200 , sortBy: 'created_at', descending: true },
        
      },
    },
    skip: !showAddMemberModal,
  })


  // Query topics để lấy topic councils
  const { data: topicsData, refetch: refetchTopics } = useQuery(GET_DEPARTMENT_TOPICS_FOR_ADDCOUNCIL, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 200 , sortBy: 'created_at', descending: true },
        filters: [],
      },
    },
  })

  // Lọc giáo viên có role TEACHER
  const allTeachers = (teachersData as any)?.department?.teachers?.data || []
  const teachersWithTeacherRole = allTeachers.filter((teacher: any) =>
    teacher.roles?.some((role: any) => role.role === 'TEACHER')
  )

  // Lấy tất cả topic councils chưa có councilCode từ topics
  const allTopics = (topicsData as any)?.department?.topics?.data || []
  const availableTopicCouncils: any[] = []
  allTopics.forEach((topic: any) => {
    topic.topicCouncils?.forEach((tc: any) => {
      if (!tc.councilCode) {
        availableTopicCouncils.push({
          ...tc,
          topic: { title: topic.title }
        })
      }
    })
  })

  // Initialize council from GraphQL data
  useEffect(() => {
    const fetchedCouncil = (councilData as any)?.department?.councils?.data?.[0]
    if (fetchedCouncil) {
      setCouncil(fetchedCouncil)
    }
  }, [councilData])

  // Kiểm tra có thể chỉnh sửa không (chưa có timeStart)
  const canEdit = !council?.timeStart

  // Thêm thành viên vào hội đồng
  const handleAddMember = async () => {
    if (!selectedTeacher || !selectedPosition || !council) {
      toast.warning('Vui lòng chọn giáo viên và vị trí')
      return
    }

    const teacher = teachersWithTeacherRole.find((t: any) => t.id === selectedTeacher)

    try {
      const result = await addDefence({
        variables: {
          input: {
            title: `${DEFENCE_POSITIONS.find(p => p.value === selectedPosition)?.label} - ${teacher?.username}`,
            councilCode: council.id,
            teacherCode: selectedTeacher,
            position: selectedPosition,
          }
        }
      })

      // Cập nhật local state
      const newDefence = (result.data as any)?.department.addDefence
      if (newDefence) {
        setCouncil({
          ...council,
          defences: [...(council.defences || []), newDefence]
        })
      }

      toast.success('Thêm thành viên thành công!')
      setShowAddMemberModal(false)
      setSelectedTeacher('')
      setSelectedPosition('')
    } catch (error) {
      toast.error('Lỗi: ' + (error as Error).message)
    }
  }

  // Xóa thành viên khỏi hội đồng
  const handleRemoveMember = async (defenceId: string) => {
    if (!confirm('Bạn có chắc muốn xóa thành viên này khỏi hội đồng?')) return
    if (!council) return

    try {
      await removeDefence({
        variables: { id: defenceId }
      })

      // Cập nhật local state
      const updatedDefences = council.defences?.filter(d => d.id !== defenceId) || []
      setCouncil({
        ...council,
        defences: updatedDefences
      })

      toast.success('Xóa thành viên thành công!')
    } catch (error) {
      toast.error('Lỗi: ' + (error as Error).message)
    }
  }

  // Gán topic vào hội đồng
  const handleAssignTopic = async () => {
    if (!selectedTopicCouncil || !council) {
      toast.warning('Vui lòng chọn đề tài')
      return
    }

    try {
      const result = await assignTopic({
        variables: {
          topicCouncilId: selectedTopicCouncil,
          councilId: council.id,
        }
      })

      const assignedTopic = (result.data as any)?.department.assignTopicToCouncil
      if (assignedTopic) {
        // Lấy thêm topic title từ availableTopicCouncils
        const fullTopicCouncil = availableTopicCouncils.find((tc: any) => tc.id === selectedTopicCouncil)
        const newTopicCouncil = {
          ...assignedTopic,
          topic: fullTopicCouncil?.topic || null,
        }
        // Cập nhật local state
        setCouncil({
          ...council,
          topicCouncils: [...(council.topicCouncils || []), newTopicCouncil]
        })
      }

      toast.success('Gán đề tài thành công!')
      setShowAssignTopicModal(false)
      setSelectedTopicCouncil('')
      refetchTopics()
    } catch (error) {
      toast.error('Lỗi: ' + (error as Error).message)
    }
  }

  // Xóa topic khỏi hội đồng
  const handleRemoveTopic = async (topicCouncilId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đề tài này khỏi hội đồng?')) return
    if (!council) return

    try {
      await removeTopic({
        variables: {
          topicCouncilId,
          councilId: council.id,
        }
      })

      // Cập nhật local state
      const updatedTopicCouncils = council.topicCouncils?.filter(tc => tc.id !== topicCouncilId) || []
      setCouncil({
        ...council,
        topicCouncils: updatedTopicCouncils
      })

      toast.success('Xóa đề tài khỏi hội đồng thành công!')
      refetchTopics()
    } catch (error) {
      toast.error('Lỗi: ' + (error as Error).message)
    }
  }

  const handleTopicClick = (topicCode: string) => {
    router.push(`/department/topics/${topicCode}?backUrl=/department/councils/${councilId}`)
  }

  const handleStudentClick = (enrollment: any) => {
    router.push(`/department/students/${enrollment.studentCode}?backUrl=/department/councils/${councilId}`)
  }

  const handleTeacherClick = (teacher: any) => {
    router.push(`/department/teachers/${teacher.id}?backUrl=/department/councils/${councilId}`)
  }

  // Loading state
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

  if (!council) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Lỗi khi tải dữ liệu</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error?.message}</p>
          <button onClick={() => router.push(backUrl)} className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">Quay lại</button>
        </div>
      </div>
    )
  }


  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(backUrl)}
            className="cursor-pointer dark:text-gray-100 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {council.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Mã: {council.id}</p>
          </div>
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
            {council.timeStart && (
              <div className="flex items-center gap-3 md:col-span-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Thời gian bảo vệ
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {format(new Date(council.timeStart), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                  </p>
                </div>
              </div>
            )}
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

        {/* Thông báo không thể chỉnh sửa */}
        {!canEdit && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ Hội đồng đã có thời gian bảo vệ nên không thể chỉnh sửa thành viên hoặc gán đề tài.
            </p>
          </div>
        )}

        {/* Defence Committee Members */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thành viên Hội đồng ({council.defences?.length || 0})
            </h2>
{canEdit && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Thêm thành viên
              </button>
            )}
          </div>
          {council.defences && council.defences.length > 0 ? (
            <div className="space-y-2">
              {council.defences.map((defence: any) => (
                <div
                  key={defence.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <button
                      onClick={() => handleTeacherClick(defence.teacher)}
                      className="cursor-pointer font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                    >
                      {defence.teacher.username}
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {defence.teacher.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {getPositionLabel(defence.position)}
                    </span>
{canEdit && (
                      <button
                        onClick={() => handleRemoveMember(defence.id)}
                        disabled={removingDefence}
                        className="cursor-pointer p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa thành viên"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Chưa có thành viên nào</p>
            </div>
          )}
        </div>

        {/* Topic Councils */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Danh sách đề tài bảo vệ ({council.topicCouncils?.length || 0})
            </h2>
{canEdit && (
              <button
                onClick={() => setShowAssignTopicModal(true)}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Gán đề tài
              </button>
            )}
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
                    <div className="flex items-center gap-2">
                      {topicCouncil.timeStart && topicCouncil.timeEnd && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(new Date(topicCouncil.timeStart), 'HH:mm', { locale: vi })} -{' '}
                            {format(new Date(topicCouncil.timeEnd), 'HH:mm', { locale: vi })}
                          </span>
                        </div>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => handleRemoveTopic(topicCouncil.id)}
                          disabled={removingTopic}
                          className="cursor-pointer p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                          title="Xóa đề tài khỏi hội đồng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleTopicClick(topicCouncil.topicCode)}
                    className="cursor-pointer group text-left w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {topicCouncil.topic?.title || topicCouncil.title}
                    </h3>
                  </button>


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
                            className="cursor-pointer px-3 py-1 text-sm bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
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
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có đề tài nào được gán cho hội đồng này
              </p>
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

      {/* Modal thêm thành viên */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Thêm thành viên hội đồng
              </h3>
              <button
                onClick={() => {
                  setShowAddMemberModal(false)
                  setSelectedTeacher('')
                  setSelectedPosition('')
                }}
                className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Giáo viên <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">-- Chọn giáo viên --</option>
                  {teachersWithTeacherRole.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.username} ({teacher.msgv || teacher.id})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Chỉ hiển thị giáo viên có role TEACHER
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vị trí <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">-- Chọn vị trí --</option>
                  {DEFENCE_POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false)
                    setSelectedTeacher('')
                    setSelectedPosition('')
                  }}
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={addingDefence || !selectedTeacher || !selectedPosition}
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingDefence ? 'Đang thêm...' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal gán đề tài */}
      {showAssignTopicModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Gán đề tài vào hội đồng
              </h3>
              <button
                onClick={() => {
                  setShowAssignTopicModal(false)
                  setSelectedTopicCouncil('')
                }}
                className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chọn đề tài <span className="text-red-600">*</span>
                </label>
                {availableTopicCouncils.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm py-4">
                    Không có đề tài nào chưa được gán hội đồng
                  </p>
                ) : (
                  <select
                    value={selectedTopicCouncil}
                    onChange={(e) => setSelectedTopicCouncil(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">-- Chọn đề tài --</option>
                    {availableTopicCouncils.map((tc: any) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.topic?.title || tc.title} ({tc.stage === 'STAGE_DACN' ? 'GĐ1' : 'GĐ2'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignTopicModal(false)
                    setSelectedTopicCouncil('')
                  }}
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAssignTopic}
                  disabled={assigningTopic || !selectedTopicCouncil}
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigningTopic ? 'Đang gán...' : 'Gán đề tài'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
