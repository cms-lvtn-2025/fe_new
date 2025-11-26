'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { createDetailSearch } from '@/lib/graphql/utils/search-helpers'
import { GET_TEACHER_DETAIL } from '@/lib/graphql/queries/admin'
import { ArrowLeft, Mail, User, BookOpen, Calendar, Shield } from 'lucide-react'

interface TeacherDetail {
  id: string
  email: string
  username: string
  gender: string
  majorCode: string
  semesterCode: string
  createdAt: string
  updatedAt: string
  backUrl?: string
  roles?: Array<{
    id: string
    title: string
    role: string
    semesterCode: string
    activate: boolean
  }>
}

const GENDER_LABELS: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  TEACHER: 'Giảng viên',
  STUDENT: 'Sinh viên',
  DEPARTMENT_HEAD: 'Trưởng khoa',
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  TEACHER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  STUDENT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  DEPARTMENT_HEAD: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
}

export default function TeacherDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teacherId = params.id as string

  const { data, loading, error } = useQuery(GET_TEACHER_DETAIL, {
    variables: { search: createDetailSearch(teacherId) },
    skip: !teacherId,
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Lỗi khi tải dữ liệu</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  const teacher = (data as any)?.affair?.teachers?.data?.[0]

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">
            Không tìm thấy thông tin giảng viên
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Giảng viên với ID {teacherId} không tồn tại
          </p>
          <button
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(teacher.backUrl || '/admin/users')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {teacher.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Mã GV: {teacher.id}</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Thông tin cơ bản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </label>
                <p className="text-gray-900 dark:text-gray-100">{teacher.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Giới tính
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {GENDER_LABELS[teacher.gender] || teacher.gender}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mã ngành
                </label>
                <p className="text-gray-900 dark:text-gray-100">{teacher.majorCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Học kỳ
                </label>
                <p className="text-gray-900 dark:text-gray-100">{teacher.semesterCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Roles */}
        {teacher.roles && teacher.roles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Vai trò
            </h2>
            <div className="space-y-3">
              {teacher.roles.map((role: any) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                          ROLE_COLORS[role.role] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ROLE_LABELS[role.role] || role.role}
                      </span>
                      {!role.activate && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                          Chưa kích hoạt
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {role.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Học kỳ: {role.semesterCode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Thông tin hệ thống
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Ngày tạo:</span>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {new Date(teacher.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Cập nhật lần cuối:</span>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {new Date(teacher.updatedAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
