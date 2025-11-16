'use client'

import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { CREATE_MAJOR, UPDATE_MAJOR } from '@/lib/graphql/mutations/admin.mutations'
import { GET_ALL_FACULTIES } from '@/lib/graphql/queries/admin'
import { X, AlertCircle } from 'lucide-react'
import Modal from '@/components/common/Modal'

interface Major {
  id: string
  title: string
  facultyCode: string
}

interface Faculty {
  id: string
  title: string
}

interface MajorFormDialogProps {
  isOpen: boolean
  onClose: () => void
  major?: Major | null
  onSuccess?: () => void
}

export function MajorFormDialog({ isOpen, onClose, major, onSuccess }: MajorFormDialogProps) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    facultyCode: '',
  })
  const [error, setError] = useState('')

  const isEdit = !!major

  // Fetch faculties for select
  const { data: facultiesData } = useQuery(GET_ALL_FACULTIES, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 100, sortBy: 'created_at', descending: true },
        filters: [],
      },
    },
    skip: !isOpen,
  })

  const faculties: Faculty[] = facultiesData?.getAllFaculties?.data || []

  const [createMajor, { loading: createLoading }] = useMutation(CREATE_MAJOR, {
    onCompleted: () => {
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const [updateMajor, { loading: updateLoading }] = useMutation(UPDATE_MAJOR, {
    onCompleted: () => {
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (major) {
        setFormData({
          id: major.id,
          title: major.title,
          facultyCode: major.facultyCode,
        })
      } else {
        setFormData({
          id: '',
          title: '',
          facultyCode: '',
        })
      }
      setError('')
    }
  }, [isOpen, major])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.id.trim()) {
      setError('Vui lòng nhập mã chuyên ngành')
      return
    }

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tên chuyên ngành')
      return
    }

    if (!formData.facultyCode) {
      setError('Vui lòng chọn khoa')
      return
    }

    try {
      if (isEdit) {
        await updateMajor({
          variables: {
            id: formData.id,
            input: {
              title: formData.title,
              facultyCode: formData.facultyCode,
            },
          },
        })
      } else {
        await createMajor({
          variables: {
            input: {
              id: formData.id,
              title: formData.title,
              facultyCode: formData.facultyCode,
            },
          },
        })
      }
    } catch (err) {
      // Error is handled by onError
    }
  }

  const handleClose = () => {
    setFormData({
      id: '',
      title: '',
      facultyCode: '',
    })
    setError('')
    onClose()
  }

  const loading = createLoading || updateLoading

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isEdit ? 'Chỉnh sửa chuyên ngành' : 'Tạo chuyên ngành mới'}
        </h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Major ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mã chuyên ngành <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            disabled={isEdit}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="VD: MAJ_CNTT_KTPM"
            required
          />
          {isEdit && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Mã chuyên ngành không thể thay đổi
            </p>
          )}
        </div>

        {/* Major Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tên chuyên ngành <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="VD: Kỹ thuật phần mềm"
            required
          />
        </div>

        {/* Faculty Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Khoa <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.facultyCode}
            onChange={(e) => setFormData({ ...formData, facultyCode: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">-- Chọn khoa --</option>
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.title}
              </option>
            ))}
          </select>
        </div>

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
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
