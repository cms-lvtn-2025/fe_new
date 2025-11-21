'use client'

import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { CREATE_STUDENT, UPDATE_STUDENT } from '@/lib/graphql/mutations/admin.mutations'
import { GET_ALL_MAJORS, GET_ALL_SEMESTERS } from '@/lib/graphql/queries/admin.queries'
import { X, AlertCircle } from 'lucide-react'

interface Student {
  id: string
  email: string
  phone?: string
  username: string
  gender: string
  majorCode: string
  classCode: string
  semesterCode: string
}

interface Major {
  id: string
  title: string
}

interface Semester {
  id: string
  title: string
}

interface StudentFormDialogProps {
  isOpen: boolean
  onClose: () => void
  student?: Student | null
  onSuccess?: () => void
}

export function StudentFormDialog({ isOpen, onClose, student, onSuccess }: StudentFormDialogProps) {
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    phone: '',
    username: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    majorCode: '',
    classCode: '',
    semesterCode: '',
  })
  const [error, setError] = useState('')

  const isEdit = !!student

  // Fetch majors
  const { data: majorsData } = useQuery(GET_ALL_MAJORS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 100, sortBy: 'created_at', descending: true },
        filters: [],
      },
    },
    skip: !isOpen,
  })

  // Fetch semesters
  const { data: semestersData } = useQuery(GET_ALL_SEMESTERS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 100, sortBy: 'created_at', descending: true },
        filters: [],
      },
    },
    skip: !isOpen,
  })

  const majors: Major[] = (majorsData as any)?.getAllMajors?.data || []
  const semesters: Semester[] = (semestersData as any)?.getAllSemesters?.data || []

  const [createStudent, { loading: createLoading }] = useMutation(CREATE_STUDENT, {
    onCompleted: () => {
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const [updateStudent, { loading: updateLoading }] = useMutation(UPDATE_STUDENT, {
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
      if (student) {
        setFormData({
          id: student.id,
          email: student.email,
          phone: student.phone || '',
          username: student.username,
          gender: student.gender as 'MALE' | 'FEMALE' | 'OTHER',
          majorCode: student.majorCode,
          classCode: student.classCode,
          semesterCode: student.semesterCode,
        })
      } else {
        setFormData({
          id: '',
          email: '',
          phone: '',
          username: '',
          gender: 'MALE',
          majorCode: '',
          classCode: '',
          semesterCode: '',
        })
      }
      setError('')
    }
  }, [isOpen, student])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.id.trim()) {
      setError('Vui lòng nhập mã sinh viên')
      return
    }

    if (!formData.email.trim()) {
      setError('Vui lòng nhập email')
      return
    }

    if (!formData.phone.trim()) {
      setError('Vui lòng nhập số điện thoại')
      return
    }

    if (!formData.username.trim()) {
      setError('Vui lòng nhập họ tên')
      return
    }

    if (!formData.majorCode) {
      setError('Vui lòng chọn khoa')
      return
    }

    if (!formData.semesterCode) {
      setError('Vui lòng chọn học kỳ')
      return
    }

    try {
      if (isEdit) {
        await updateStudent({
          variables: {
            id: formData.id,
            input: {
              email: formData.email,
              phone: formData.phone,
              username: formData.username,
              gender: formData.gender,
              majorCode: formData.majorCode,
              classCode: formData.classCode || null,
              semesterCode: formData.semesterCode,
            },
          },
        })
      } else {
        await createStudent({
          variables: {
            input: {
              id: formData.id,
              email: formData.email,
              phone: formData.phone,
              username: formData.username,
              gender: formData.gender,
              majorCode: formData.majorCode,
              classCode: formData.classCode || null,
              semesterCode: formData.semesterCode,
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
      email: '',
      phone: '',
      username: '',
      gender: 'MALE',
      majorCode: '',
      classCode: '',
      semesterCode: '',
    })
    setError('')
    onClose()
  }

  const loading = createLoading || updateLoading

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {isEdit ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới'}
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
          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mã sinh viên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              disabled={isEdit || loading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="VD: 2021001234"
            />
            {isEdit && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Mã sinh viên không thể thay đổi
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: Nguyễn Văn A"
            />
          </div>

          {/* Email & Phone in row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: student@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: 0901234567"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Giới tính <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          {/* Major & Class in row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Major */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Khoa <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.majorCode}
                onChange={(e) => setFormData({ ...formData, majorCode: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Chọn khoa --</option>
                {majors.map((major) => (
                  <option key={major.id} value={major.id}>
                    {major.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lớp
              </label>
              <input
                type="text"
                value={formData.classCode}
                onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: KTPM2021"
              />
            </div>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Học kỳ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.semesterCode}
              onChange={(e) => setFormData({ ...formData, semesterCode: e.target.value })}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn học kỳ --</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.title}
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
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
