'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { DELETE_SEMESTER } from '@/lib/graphql/mutations/admin'
import { X, AlertTriangle } from 'lucide-react'

interface Semester {
  id: string
  title: string
}

interface DeleteSemesterDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  semester: Semester
}

export function DeleteSemesterDialog({ isOpen, onClose, onSuccess, semester }: DeleteSemesterDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  const [deleteSemester, { loading }] = useMutation(DELETE_SEMESTER, {
    onCompleted: () => {
      onSuccess()
      setConfirmText('')
      setError('')
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (confirmText !== semester.id) {
      setError('Mã học kỳ không khớp. Vui lòng nhập chính xác để xác nhận xóa.')
      return
    }

    try {
      await deleteSemester({
        variables: {
          id: semester.id,
        },
      })
    } catch (err) {
      // Error handled by onError
    }
  }

  const handleClose = () => {
    setConfirmText('')
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
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Xóa học kỳ
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 mb-2">
              <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              Xóa học kỳ sẽ xóa tất cả dữ liệu liên quan bao gồm sinh viên, giáo viên, đề tài,
              và hội đồng trong học kỳ này.
            </p>
          </div>

          {/* Semester Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Mã học kỳ:</span>
              <p className="font-mono font-medium text-gray-900 dark:text-gray-100">
                {semester.id}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Tên học kỳ:</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {semester.title}
              </p>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nhập mã học kỳ <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-red-600 dark:text-red-400">{semester.id}</code> để xác nhận
            </label>
            <input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Nhập mã học kỳ"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || confirmText !== semester.id}
            >
              {loading ? 'Đang xóa...' : 'Xóa học kỳ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
