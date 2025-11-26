'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { UPDATE_TOPIC } from '@/lib/graphql/mutations/admin'
import { X, RotateCcw } from 'lucide-react'

interface Topic {
  id: string
  title: string
  status: string
}

interface MoveToProgressDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  topic: Topic
}

export function MoveToProgressDialog({ isOpen, onClose, onSuccess, topic }: MoveToProgressDialogProps) {
  const [error, setError] = useState('')

  const [updateTopic, { loading }] = useMutation(UPDATE_TOPIC, {
    onCompleted: () => {
      onSuccess()
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleMove = async () => {
    setError('')
    try {
      await updateTopic({
        variables: {
          id: topic.id,
          input: {
            status: 'IN_PROGRESS',
          },
        },
      })
    } catch (err) {
      // Error handled by onError
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <RotateCcw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Chuyển về đang thực hiện
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bạn có chắc chắn muốn chuyển đề tài này về trạng thái "Đang thực hiện" không?
          </p>

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
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Trạng thái hiện tại:</span>
              <p className="font-medium text-red-600 dark:text-red-400">
                Từ chối
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Trạng thái mới:</span>
              <p className="font-medium text-purple-600 dark:text-purple-400">
                Đang thực hiện
              </p>
            </div>
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
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleMove}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}
