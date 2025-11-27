'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { createDetailSearch } from '@/lib/graphql/utils/search-helpers'
import { GET_DEPARTMENT_STUDENT_DETAIL } from '@/lib/graphql/queries/department'
import { ArrowLeft, Mail, Phone, BookOpen, Award, Calendar, User } from 'lucide-react'

interface StudentDetail {
  id: string
  email: string
  phone: string
  username: string
  gender: string
  majorCode: string
  classCode: string
  semesterCode: string
  createdAt: string
  updatedAt: string
  backUrl?: string
  enrollments?: Array<{
    id: string
    title: string
    studentCode: string
    topicCouncilCode: string
    finalCode?: string
    gradeReviewCode?: string
    midtermCode?: string
    createdAt: string
    updatedAt: string
    midterm?: {
      id: string
      title: string
      grade: number
      status: string
      feedback: string
    } | null
    final?: {
      id: string
      title: string
      supervisorGrade: number
      departmentGrade: number
      finalGrade: number
      status: string
      notes: string
    } | null
    
  }>
}

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const { data, loading, error } = useQuery(GET_DEPARTMENT_STUDENT_DETAIL, {
    variables: { search: createDetailSearch(studentId) },
    skip: !studentId,
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
          <button onClick={() => router.push('/department/students')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">Quay lại</button>
        </div>
      </div>
    )
  }

  const student = (data as any)?.department?.students?.data?.[0]

  if (!student) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">
            Không tìm thấy thông tin sinh viên
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Sinh viên với ID {studentId} không tồn tại
          </p>
          <button
            onClick={() => router.push('/department/students')}
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
            onClick={() => router.push('/department/students')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {student.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">MSSV: {student.id}</p>
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
                <p className="text-gray-900 dark:text-gray-100">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Số điện thoại
                </label>
                <p className="text-gray-900 dark:text-gray-100">{student.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Giới tính
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {GENDER_LABELS[student.gender] || student.gender}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mã ngành
                </label>
                <p className="text-gray-900 dark:text-gray-100">{student.majorCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Lớp
                </label>
                <p className="text-gray-900 dark:text-gray-100">{student.classCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Học kỳ
                </label>
                <p className="text-gray-900 dark:text-gray-100">{student.semesterCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollments */}
        {student.enrollments && student.enrollments.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Đề tài đăng ký
            </h2>
            <div className="space-y-4">
              {student.enrollments.map((enrollment: any) => (
                <div
                  key={enrollment.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {enrollment.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Mã đề tài: {enrollment.topicCouncilCode}</span>
                      <span>•</span>
                      <span>
                        Ngày đăng ký: {new Date(enrollment.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Grades */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Midterm */}
                    {enrollment.midterm && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                            Điểm giữa kỳ
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {enrollment.midterm.grade}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {enrollment.midterm.status}
                        </p>
                        {enrollment.midterm.feedback && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            {enrollment.midterm.feedback}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Final */}
                    {enrollment.final && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <p className="text-sm font-medium text-green-900 dark:text-green-300">
                            Điểm cuối kỳ
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {enrollment.final.finalGrade}
                        </p>
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1 space-y-1">
                          <p>GVHD: {enrollment.final.supervisorGrade}</p>
                          <p>Khoa: {enrollment.final.departmentGrade}</p>
                          <p>{enrollment.final.status}</p>
                        </div>
                        {enrollment.final.notes && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            {enrollment.final.notes}
                          </p>
                        )}
                      </div>
                    )}

                    
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
                {new Date(student.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Cập nhật lần cuối:</span>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {new Date(student.updatedAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
