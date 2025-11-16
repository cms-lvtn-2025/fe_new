'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Clock, Users, BookOpen, ChevronDown, ChevronRight, Calendar } from 'lucide-react'
import type { Council, TopicCouncil } from '@/types/defence'

interface DefenceListProps {
  councils: Council[]
  onCouncilClick?: (council: Council) => void
  onTopicClick?: (topicCouncil: TopicCouncil, council: Council) => void
}

export function DefenceList({ councils, onCouncilClick, onTopicClick }: DefenceListProps) {
  const [expandedCouncils, setExpandedCouncils] = useState<Set<string>>(new Set())

  const toggleCouncil = (councilId: string) => {
    const newExpanded = new Set(expandedCouncils)
    if (newExpanded.has(councilId)) {
      newExpanded.delete(councilId)
    } else {
      newExpanded.add(councilId)
    }
    setExpandedCouncils(newExpanded)
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

  if (councils.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <Calendar className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">Chưa có lịch bảo vệ nào</p>
        <p className="text-sm mt-2">Hệ thống chưa có lịch bảo vệ được xếp lịch</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {councils.map((council) => {
        const isExpanded = expandedCouncils.has(council.id)

        return (
          <div
            key={council.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Council Header */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              onClick={() => toggleCouncil(council.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <button
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCouncil(council.id)
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {council.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{council.majorCode}</span>
                        </div>
                        {council.timeStart && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {format(new Date(council.timeStart), 'dd/MM/yyyy HH:mm', {
                                locale: vi,
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{council.topicCouncils?.length || 0} đề tài</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Defence Committee Members */}
                  {council.defences && council.defences.length > 0 && (
                    <div className="mt-3 ml-8">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hội đồng:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {council.defences.map((defence) => (
                          <div
                            key={defence.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            <span className="font-semibold">
                              {getPositionLabel(defence.position)}:
                            </span>
                            <span>{defence.teacher.username}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="ml-4 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCouncilClick?.(council)
                  }}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>

            {/* Topic Councils List */}
            {isExpanded && council.topicCouncils.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Danh sách đề tài bảo vệ:
                  </h4>
                  <div className="space-y-2">
                    {council.topicCouncils.map((topicCouncil) => (
                      <div
                        key={topicCouncil.id}
                        className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
                        onClick={() => onTopicClick?.(topicCouncil, council)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStageColor(topicCouncil.stage)}`}
                              >
                                {getStageLabel(topicCouncil.stage)}
                              </span>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {topicCouncil.topic?.title || topicCouncil.title}
                              </h5>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                  {format(new Date(topicCouncil.timeStart), 'HH:mm', {
                                    locale: vi,
                                  })}{' '}
                                  -{' '}
                                  {format(new Date(topicCouncil.timeEnd), 'HH:mm', {
                                    locale: vi,
                                  })}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">
                                  (
                                  {format(new Date(topicCouncil.timeStart), 'dd/MM/yyyy', {
                                    locale: vi,
                                  })}
                                  )
                                </span>
                              </div>

                              {topicCouncil.enrollments.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  <span>
                                    Sinh viên:{' '}
                                    {topicCouncil.enrollments
                                      .map((e) => e.student.username)
                                      .join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>

                            {topicCouncil.supervisors && topicCouncil.supervisors.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                GVHD:{' '}
                                {topicCouncil.supervisors
                                  .map((s) => s.teacher.username)
                                  .join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
