'use client'

import { useState } from 'react'
import { Users, GraduationCap } from 'lucide-react'
import { StudentManagement } from '@/components/admin/users/student-management'
import { TeacherManagement } from '@/components/admin/users/teacher-management'

type TabType = 'students' | 'teachers'

export default function UsersManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('students')

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Quản lý người dùng
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Quản lý sinh viên và giảng viên trong hệ thống
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('students')}
              className={`
                flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'students'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              <GraduationCap className="w-5 h-5" />
              Sinh viên
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`
                flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'teachers'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              <Users className="w-5 h-5" />
              Giảng viên
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'students' && <StudentManagement />}
          {activeTab === 'teachers' && <TeacherManagement />}
        </div>
      </div>
    </div>
  )
}
