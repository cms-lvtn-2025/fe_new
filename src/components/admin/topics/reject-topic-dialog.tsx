'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { REJECT_TOPIC } from '@/lib/graphql/mutations/admin'
import { X, XCircle } from 'lucide-react'

interface Topic {
  id: string
  title: string
  status: string
}

interface RejectTopicDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  topic: Topic
}

export function RejectTopicDialog({ isOpen, onClose, onSuccess, topic }: RejectTopicDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const [rejectTopic, { loading }] = useMutation(REJECT_TOPIC, {
    onCompleted: () => {
      onSuccess()
      setReason('')
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleReject = async () => {
    setError('')

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do từ chối')
      return
    }

    try {
      await rejectTopic({
        variables: {
          id: topic.id,
          reason: reason.trim(),
        },
      })
    } catch (err) {
      // Error handled by onError
    }
  }

  const handleClose = () => {
    setReason('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Từ chối đề tài
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Topic Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Mã đề tài:</span>
              <p className="font-mono font-medium text-gray-900 dark:text-gray-100">
                {topic.id}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Tên đề tài:</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {topic.title}
              </p>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do từ chối đề tài..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Từ chối'}
          </button>
        </div>
      </div>
    </div>
  )
}
