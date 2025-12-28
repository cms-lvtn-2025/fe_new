'use client'

import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { CREATE_TEACHER, UPDATE_TEACHER } from '@/lib/graphql/mutations/admin'
import { GET_ALL_MAJORS, GET_ALL_SEMESTERS } from '@/lib/graphql/queries/admin'
import { X, AlertCircle } from 'lucide-react'

interface TeacherRole {
  id: string
  role: string
  activate: boolean
}

interface Teacher {
  id: string
  email: string
  username: string
  gender: string
  majorCode: string
  semesterCode: string
  msgv: string
  roles?: TeacherRole[]
}

interface Major {
  id: string
  title: string
}

interface Semester {
  id: string
  title: string
}

interface TeacherFormDialogProps {
  isOpen: boolean
  onClose: () => void
  teacher?: Teacher | null
  onSuccess?: () => void
}

export function TeacherFormDialog({ isOpen, onClose, teacher, onSuccess }: TeacherFormDialogProps) {
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    username: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    majorCode: '',
    semesterCode: '',
    msgv: '',
    roles: [] as string[],
  })
  const [error, setError] = useState('')

  const isEdit = !!teacher

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

  const majors: Major[] = (majorsData as any)?.affair?.majors?.data || []
  const semesters: Semester[] = (semestersData as any)?.affair?.semesters?.data || []

  const [createTeacher, { loading: createLoading }] = useMutation(CREATE_TEACHER, {
    onCompleted: () => {
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const [updateTeacher, { loading: updateLoading }] = useMutation(UPDATE_TEACHER, {
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
      if (teacher) {
        setFormData({
          id: teacher.id,
          email: teacher.email,
          username: teacher.username,
          gender: teacher.gender as 'MALE' | 'FEMALE' | 'OTHER',
          majorCode: teacher.majorCode,
          semesterCode: teacher.semesterCode,
          msgv: teacher.msgv,
          roles: teacher.roles?.map(r => r.role) || [],
        })
      } else {
        setFormData({
          id: '',
          email: '',
          username: '',
          gender: 'MALE',
          majorCode: '',
          semesterCode: '',
          msgv: '',
          roles: [],
        })
      }
      setError('')
    }
  }, [isOpen, teacher])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    

    if (!formData.email.trim()) {
      setError('Vui lòng nhập email')
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

    if (formData.roles.length === 0) {
      setError('Vui lòng chọn ít nhất một vai trò')
      return
    }

    try {
      if (isEdit) {
        if (!formData.id.trim()) {
      setError('Vui lòng nhập id giảng viên')
      return
    }
        await updateTeacher({
          variables: {
            id: formData.id,
            input: {
              email: formData.email,
              username: formData.username,
              gender: formData.gender,
              majorCode: formData.majorCode,
              semesterCode: formData.semesterCode,
              roles: formData.roles,
            },
          },
        })
      } else {
        if (!formData.msgv.trim()) {
      setError('Vui lòng nhập mã giảng viên')
      return
    }
        await createTeacher({
          variables: {
            input: {
              id: formData.msgv,
              msgv: formData.msgv,
              email: formData.email,
              username: formData.username,
              gender: formData.gender,
              majorCode: formData.majorCode,
              semesterCode: formData.semesterCode,
              roles: formData.roles,
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
      username: '',
      gender: 'MALE',
      majorCode: '',
      semesterCode: '',
      msgv: '',
      roles: [],
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
            {isEdit ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên mới'}
          </h2>
          <button
            onClick={handleClose}
            className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Teacher ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mã giảng viên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.msgv}
              onChange={(e) => setFormData({ ...formData, msgv: e.target.value })}
              disabled={isEdit || loading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="VD: GV001"
            />
            {isEdit && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Mã giảng viên không thể thay đổi
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
              placeholder="VD: nguyenvana@example.com"
            />
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

          {/* Roles */}
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: 'TEACHER', label: 'Giảng viên' },
                  { value: 'DEPARTMENT_LECTURER', label: 'Giảng viên khoa' },
                  { value: 'ACADEMIC_AFFAIRS_STAFF', label: 'Nhân viên đào tạo' },
                ].map((role) => (
                  <label key={role.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, roles: [...formData.roles, role.value] })
                        } else {
                          setFormData({ ...formData, roles: formData.roles.filter(r => r !== role.value) })
                        }
                      }}
                      disabled={loading}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{role.label}</span>
                  </label>
                ))}
              </div>
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
              className="cursor-pointer flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="cursor-pointer flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
