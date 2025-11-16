'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_UNASSIGNED_TOPIC_COUNCILS } from '@/lib/graphql/queries/admin/topic.queries'
import { ASSIGN_TOPIC_TO_COUNCIL } from '@/lib/graphql/mutations/admin.mutations'
import { X, BookOpen, AlertCircle, Search, Users, User } from 'lucide-react'
import Modal from '@/components/common/Modal'
import Loading from '@/components/common/Loading'

interface TopicCouncil {
  id: string
  title: string
  stage: string
  topicCode: string
  councilCode: string | null
  timeStart: string
  timeEnd: string
  enrollments?: Array<{
    id: string
    studentCode: string
    student?: {
      id: string
      username: string
    }
  }>
  supervisors?: Array<{
    id: string
    teacherSupervisorCode: string
    teacher: {
      id: string
      username: string
    }
  }>
}

interface Topic {
  id: string
  title: string
  majorCode: string
  semesterCode: string
  topicCouncils: TopicCouncil[]
}

interface AssignTopicsDialogProps {
  isOpen: boolean
  onClose: () => void
  councilId: string
  councilTitle: string
  councilMajorCode: string
  councilSemesterCode: string
  onSuccess?: () => void
}

const getStageLabel = (stage: string) => {
  switch (stage) {
    case 'STAGE_DACN':
      return 'ĐACN'
    case 'STAGE_LVTN':
      return 'LVTN'
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

export function AssignTopicsDialog({
  isOpen,
  onClose,
  councilId,
  councilTitle,
  councilMajorCode,
  councilSemesterCode,
  onSuccess,
}: AssignTopicsDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTopicCouncils, setSelectedTopicCouncils] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [successCount, setSuccessCount] = useState(0)

  // Query to get all topics with their topic councils
  const { data, loading: queryLoading } = useQuery(GET_UNASSIGNED_TOPIC_COUNCILS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 1000, sortBy: 'created_at', descending: true },
        filters: [
          {
            condition: {
              field: 'major_code',
              operator: 'EQUAL',
              values: [councilMajorCode],
            },
          },
          {
            condition: {
              field: 'semester_code',
              operator: 'EQUAL',
              values: [councilSemesterCode],
            },
          },
        ],
      },
    },
    skip: !isOpen,
  })

  const [assignTopicToCouncil, { loading: mutationLoading }] = useMutation(ASSIGN_TOPIC_TO_COUNCIL)

  // Extract unassigned topic councils (prefer stage 2, fallback to stage 1)
  const unassignedTopicCouncils = useMemo(() => {
    if (!data?.getAllTopics?.data) return []

    const topics: Topic[] = data.getAllTopics.data
    const unassigned: TopicCouncil[] = []

    topics.forEach((topic) => {
      if (topic.topicCouncils && topic.topicCouncils.length > 0) {
        // Find unassigned topic councils for this topic
        const unassignedForTopic = topic.topicCouncils.filter(
          (tc) => !tc.councilCode || tc.councilCode === null
        )

        if (unassignedForTopic.length > 0) {
          // Check if there's a stage 2 (STAGE_LVTN)
          const stage2 = unassignedForTopic.find((tc) => tc.stage === 'STAGE_LVTN')

          if (stage2) {
            // If stage 2 exists and is unassigned, use it
            unassigned.push(stage2)
          } else {
            // Otherwise, use stage 1 (STAGE_DACN) if available
            const stage1 = unassignedForTopic.find((tc) => tc.stage === 'STAGE_DACN')
            if (stage1) {
              unassigned.push(stage1)
            }
          }
        }
      }
    })

    return unassigned
  }, [data])

  // Filter by search term
  const filteredTopicCouncils = useMemo(() => {
    if (!searchTerm.trim()) return unassignedTopicCouncils

    const search = searchTerm.toLowerCase()
    return unassignedTopicCouncils.filter(
      (tc) =>
        tc.title.toLowerCase().includes(search) ||
        tc.topicCode.toLowerCase().includes(search) ||
        tc.enrollments?.some((e) => e.student?.username.toLowerCase().includes(search)) ||
        tc.supervisors?.some((s) => s.teacher.username.toLowerCase().includes(search))
    )
  }, [unassignedTopicCouncils, searchTerm])

  const handleToggleSelect = (topicCouncilId: string) => {
    setSelectedTopicCouncils((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(topicCouncilId)) {
        newSet.delete(topicCouncilId)
      } else {
        newSet.add(topicCouncilId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedTopicCouncils.size === filteredTopicCouncils.length) {
      setSelectedTopicCouncils(new Set())
    } else {
      setSelectedTopicCouncils(new Set(filteredTopicCouncils.map((tc) => tc.id)))
    }
  }

  const handleSubmit = async () => {
    setError('')
    setSuccessCount(0)

    if (selectedTopicCouncils.size === 0) {
      setError('Vui lòng chọn ít nhất một đề tài')
      return
    }

    try {
      let successfulAssignments = 0

      for (const topicCouncilId of Array.from(selectedTopicCouncils)) {
        try {
          await assignTopicToCouncil({
            variables: {
              topicCouncilId,
              councilId,
            },
          })
          successfulAssignments++
        } catch (err) {
          console.error(`Failed to assign topic council ${topicCouncilId}:`, err)
        }
      }

      setSuccessCount(successfulAssignments)

      if (successfulAssignments > 0) {
        setTimeout(() => {
          onSuccess?.()
          handleClose()
        }, 1500)
      } else {
        setError('Không thể gán đề tài. Vui lòng thử lại.')
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi gán đề tài')
    }
  }

  const handleClose = () => {
    setSearchTerm('')
    setSelectedTopicCouncils(new Set())
    setError('')
    setSuccessCount(0)
    onClose()
  }

  const loading = queryLoading || mutationLoading

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Gán đề tài cho hội đồng
        </h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Council Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Hội đồng</p>
          <p className="text-gray-900 dark:text-gray-100 font-medium">{councilTitle}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mã: {councilId}</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm đề tài, sinh viên, giảng viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Select All */}
        {filteredTopicCouncils.length > 0 && (
          <div className="flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {selectedTopicCouncils.size === filteredTopicCouncils.length
                ? 'Bỏ chọn tất cả'
                : 'Chọn tất cả'}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đã chọn: {selectedTopicCouncils.size}/{filteredTopicCouncils.length}
            </p>
          </div>
        )}

        {/* Topic Councils List */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="max-h-96 overflow-y-auto">
            {queryLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loading size="md" />
              </div>
            ) : filteredTopicCouncils.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? 'Không tìm thấy đề tài phù hợp'
                    : 'Không có đề tài chưa được gán hội đồng'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTopicCouncils.map((tc) => (
                  <div
                    key={tc.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                      selectedTopicCouncils.has(tc.id)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                        : ''
                    }`}
                    onClick={() => handleToggleSelect(tc.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedTopicCouncils.has(tc.id)}
                        onChange={() => handleToggleSelect(tc.id)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {tc.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Mã đề tài: {tc.topicCode}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${getStageColor(tc.stage)}`}
                          >
                            {getStageLabel(tc.stage)}
                          </span>
                        </div>

                        {/* Students */}
                        {tc.enrollments && tc.enrollments.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Sinh viên:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {tc.enrollments.map((enr) => (
                                <span
                                  key={enr.id}
                                  className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                                >
                                  {enr.student?.username || enr.studentCode}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Supervisors */}
                        {tc.supervisors && tc.supervisors.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              GVHD:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {tc.supervisors.map((sup) => (
                                <span
                                  key={sup.id}
                                  className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
                                >
                                  {sup.teacher.username}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {successCount > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="w-5 h-5 text-green-600 dark:text-green-400">✓</div>
            <p className="text-sm text-green-600 dark:text-green-400">
              Đã gán thành công {successCount} đề tài!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || selectedTopicCouncils.size === 0}
          >
            <BookOpen className="w-5 h-5" />
            {loading ? 'Đang gán...' : `Gán ${selectedTopicCouncils.size} đề tài`}
          </button>
        </div>
      </div>
    </Modal>
  )
}
