'use client'

import { X } from 'lucide-react'

interface Topic {
  id: string
  title: string
  status: string
  description?: string
  percentStage1?: number
  percentStage2?: number
  studentCode?: string
  teacherCode?: string
  createdAt: string
  updatedAt: string
}

interface ViewTopicDialogProps {
  isOpen: boolean
  onClose: () => void
  topic: Topic
}

const STATUS_LABELS: Record<string, string> = {
  SUBMIT: 'Đã nộp',
  TOPIC_PENDING: 'Chờ duyệt',
  APPROVED_1: 'Duyệt lần 1',
  APPROVED_2: 'Duyệt lần 2',
  IN_PROGRESS: 'Đang thực hiện',
  TOPIC_COMPLETED: 'Hoàn thành',
  REJECTED: 'Từ chối',
}

export function ViewTopicDialog({ isOpen, onClose, topic }: ViewTopicDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Chi tiết đề tài
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mã đề tài
              </label>
              <p className="text-sm font-mono text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {topic.id}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {STATUS_LABELS[topic.status] || topic.status}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sinh viên
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {topic.studentCode || '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Giảng viên hướng dẫn
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {topic.teacherCode || '-'}
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên đề tài
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded">
              {topic.title}
            </p>
          </div>

          {/* Description */}
          {topic.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mô tả
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded whitespace-pre-wrap">
                {topic.description}
              </p>
            </div>
          )}

          {/* Progress */}
          {(topic.percentStage1 !== undefined || topic.percentStage2 !== undefined) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.percentStage1 !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tiến độ giai đoạn 1
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${topic.percentStage1}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {topic.percentStage1}%
                    </span>
                  </div>
                </div>
              )}

              {topic.percentStage2 !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tiến độ giai đoạn 2
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all"
                        style={{ width: `${topic.percentStage2}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {topic.percentStage2}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ngày tạo
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(topic.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cập nhật lần cuối
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(topic.updatedAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
