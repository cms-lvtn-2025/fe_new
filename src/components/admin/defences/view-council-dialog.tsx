'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { X, Calendar, Clock, Users, BookOpen, ExternalLink } from 'lucide-react'
import Modal from '@/components/common/Modal'
import type { Council } from '@/types/defence'

interface ViewCouncilDialogProps {
  isOpen: boolean
  onClose: () => void
  council: Council | null
}

export function ViewCouncilDialog({ isOpen, onClose, council }: ViewCouncilDialogProps) {
  const router = useRouter()

  if (!council) return null

  const handleTopicClick = (topicCouncil: any) => {
    // Lưu data vào sessionStorage
    const topicData = {
      id: topicCouncil.topicCode,
      title: topicCouncil.topic?.title || topicCouncil.title,
      majorCode: council.majorCode,
      semesterCode: council.semesterCode,
      status: 'IN_PROGRESS',
      percentStage1: 0,
      percentStage2: 0,
      createdAt: council.createdAt,
      updatedAt: council.updatedAt,
      topicCouncils: [topicCouncil],
      backUrl: '/admin/defences',
    }
    sessionStorage.setItem('topicDetailData', JSON.stringify(topicData))
    router.push(`/admin/topics/${topicCouncil.topicCode}?backUrl=/admin/defences`)
    onClose()
  }

  const handleStudentClick = (enrollment: any) => {
    // Lưu data vào sessionStorage
    const studentData = {
      id: enrollment.studentCode,
      email: enrollment.student.email,
      phone: '',
      username: enrollment.student.username,
      gender: 'male',
      majorCode: council.majorCode,
      classCode: '',
      semesterCode: council.semesterCode,
      createdAt: council.createdAt || new Date().toISOString(),
      updatedAt: council.updatedAt || new Date().toISOString(),
      enrollments: [enrollment],
      backUrl: '/admin/defences',
    }
    sessionStorage.setItem('studentDetailData', JSON.stringify(studentData))
    router.push(`/admin/students/${enrollment.studentCode}`)
    onClose()
  }

  const handleTeacherClick = (teacher: any) => {
    // Lưu data vào sessionStorage
    const teacherData = {
      id: teacher.id,
      email: teacher.email,
      username: teacher.username,
      gender: 'male',
      majorCode: council.majorCode,
      semesterCode: council.semesterCode,
      createdAt: council.createdAt || new Date().toISOString(),
      updatedAt: council.updatedAt || new Date().toISOString(),
      backUrl: '/admin/defences',
    }
    sessionStorage.setItem('teacherDetailData', JSON.stringify(teacherData))
    router.push(`/admin/teachers/${teacher.id}`)
    onClose()
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Chi tiết Hội đồng
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Council Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {council.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <BookOpen className="w-4 h-4" />
              <span>
                <strong>Ngành:</strong> {council.majorCode}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>
                <strong>Học kỳ:</strong> {council.semesterCode}
              </span>
            </div>
            {council.timeStart && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  <strong>Thời gian:</strong>{' '}
                  {format(new Date(council.timeStart), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>
                <strong>Số đề tài:</strong> {council.topicCouncils.length}
              </span>
            </div>
          </div>
        </div>

        {/* Defence Committee Members */}
        {council.defences && council.defences.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Thành viên Hội đồng
            </h4>
            <div className="space-y-2">
              {council.defences.map((defence) => (
                <div
                  key={defence.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {defence.teacher.username}
                    </p>
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
        {council.topicCouncils && council.topicCouncils.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Danh sách đề tài bảo vệ ({council.topicCouncils.length})
            </h4>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {council.topicCouncils.map((topicCouncil, index) => (
                <div
                  key={topicCouncil.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
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
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(topicCouncil.timeStart), 'HH:mm', { locale: vi })} -{' '}
                        {format(new Date(topicCouncil.timeEnd), 'HH:mm', { locale: vi })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTopicClick(topicCouncil)}
                    className="group text-left w-full"
                  >
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {topicCouncil.topic?.title || topicCouncil.title}
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h5>
                  </button>

                  {topicCouncil.enrollments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sinh viên:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {topicCouncil.enrollments.map((enrollment) => (
                          <button
                            key={enrollment.id}
                            onClick={() => handleStudentClick(enrollment)}
                            className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                          >
                            {enrollment.student.username}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {topicCouncil.supervisors && topicCouncil.supervisors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        GVHD:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {topicCouncil.supervisors.map((sup) => (
                          <button
                            key={sup.id}
                            onClick={() => handleTeacherClick(sup.teacher)}
                            className="px-2 py-1 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
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
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
        >
          Đóng
        </button>
      </div>
    </Modal>
  )
}
