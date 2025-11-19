'use client'

import { useState, useEffect } from 'react'
import { useMyProfile } from '@/lib/graphql/hooks'
import { User, Mail, Phone, GraduationCap, Calendar, BookOpen, Users } from 'lucide-react'

const GENDER_LABELS: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
}

export default function StudentProfilePage() {
  const { profile, loading, error } = useMyProfile()

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Lỗi: {error.message}</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Không tìm thấy thông tin</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Thông tin cá nhân
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Xem thông tin tài khoản và hồ sơ sinh viên
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Header Section with Avatar */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {profile.fullname || profile.username || 'N/A'}
              </h2>
              <p className="text-blue-100 text-sm">
                MSSV: {profile.username || profile.id}
              </p>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
                <div className="text-gray-900 dark:text-gray-100 font-medium">
                  {profile.email || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Số điện thoại</div>
                <div className="text-gray-900 dark:text-gray-100 font-medium">
                  {profile.phone || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            {/* Gender */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Giới tính</div>
                <div className="text-gray-900 dark:text-gray-100 font-medium">
                  {GENDER_LABELS[profile.gender] || profile.gender || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            {/* Major */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <GraduationCap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mã ngành</div>
                <div className="text-gray-900 dark:text-gray-100 font-medium">
                  {profile.majorCode || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            {/* Class */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mã lớp</div>
                <div className="text-gray-900 dark:text-gray-100 font-medium">
                  {profile.classCode || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            {/* Semester */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mã học kỳ</div>
                <div className="text-gray-900 dark:text-gray-100 font-medium">
                  {profile.semesterCode || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ngày tạo tài khoản</div>
                <div className="text-gray-900 dark:text-gray-100 font-medium">
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </div>
              </div>
            </div>

            {/* Updated At */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cập nhật lần cuối</div>
                <div className="text-gray-900 dark:text-gray-100 font-medium">
                  {profile.updatedAt
                    ? new Date(profile.updatedAt).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Lưu ý:</strong> Nếu cần cập nhật thông tin cá nhân, vui lòng liên hệ với phòng đào tạo hoặc giáo vụ khoa.
        </p>
      </div>
    </div>
  )
}
