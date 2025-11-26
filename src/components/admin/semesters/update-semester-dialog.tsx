'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { UPDATE_SEMESTER } from '@/lib/graphql/mutations/admin'
import { X } from 'lucide-react'

interface Semester {
  id: string
  title: string
}

interface UpdateSemesterDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  semester: Semester
}

export function UpdateSemesterDialog({ isOpen, onClose, onSuccess, semester }: UpdateSemesterDialogProps) {
  const [semesterTitle, setSemesterTitle] = useState(semester.title)
  const [error, setError] = useState('')

  useEffect(() => {
    setSemesterTitle(semester.title)
  }, [semester])

  const [updateSemester, { loading }] = useMutation(UPDATE_SEMESTER, {
    onCompleted: () => {
      onSuccess()
      setError('')
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!semesterTitle.trim()) {
      setError('Vui lòng nhập tên học kỳ')
      return
    }

    if (semesterTitle.trim() === semester.title) {
      setError('Tên học kỳ không thay đổi')
      return
    }

    try {
      await updateSemester({
        variables: {
          id: semester.id,
          input: {
            title: semesterTitle.trim(),
          },
        },
      })
    } catch (err) {
      // Error handled by onError
    }
  }

  const handleClose = () => {
    setError('')
    setSemesterTitle(semester.title)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Chỉnh sửa học kỳ
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
          {/* Semester ID (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mã học kỳ
            </label>
            <input
              type="text"
              value={semester.id}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Mã học kỳ không thể thay đổi
            </p>
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
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
