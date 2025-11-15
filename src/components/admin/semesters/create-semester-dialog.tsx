'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { CREATE_SEMESTER } from '@/lib/graphql/mutations/admin.mutations'
import { X } from 'lucide-react'

interface CreateSemesterDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateSemesterDialog({ isOpen, onClose, onSuccess }: CreateSemesterDialogProps) {
  const [semesterId, setSemesterId] = useState('')
  const [semesterTitle, setSemesterTitle] = useState('')
  const [error, setError] = useState('')

  const [createSemester, { loading }] = useMutation(CREATE_SEMESTER, {
    onCompleted: () => {
      onSuccess()
      resetForm()
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const resetForm = () => {
    setSemesterId('')
    setSemesterTitle('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!semesterId.trim()) {
      setError('Vui lòng nhập mã học kỳ')
      return
    }

    if (!semesterTitle.trim()) {
      setError('Vui lòng nhập tên học kỳ')
      return
    }

    try {
      await createSemester({
        variables: {
          input: {
            id: semesterId.trim(),
            title: semesterTitle.trim(),
          },
        },
      })
    } catch (err) {
      // Error handled by onError
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Tạo học kỳ mới
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Semester ID */}
          <div>
            <label htmlFor="semesterId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mã học kỳ <span className="text-red-500">*</span>
            </label>
            <input
              id="semesterId"
              type="text"
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              placeholder="VD: SEM_2024_1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Semester Title */}
          <div>
            <label htmlFor="semesterTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên học kỳ <span className="text-red-500">*</span>
            </label>
            <input
              id="semesterTitle"
              type="text"
              value={semesterTitle}
              onChange={(e) => setSemesterTitle(e.target.value)}
              placeholder="VD: Học kỳ 1 năm 2024"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo học kỳ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
