'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RoleType } from '@/types/teacher'
import {
  User, Users, BookOpen, ClipboardCheck, Calendar,
  LayoutDashboard, UserCog, ClipboardList, FileText,
  CalendarDays, Scale, GraduationCap, Building2, BarChart3, Settings,
  ChevronDown
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface NavigationItem {
  label: string
  href: string
  icon?: LucideIcon
}

interface RoleNavigationProps {
  roles: RoleType[] // Danh sách roles của user
}

// Định nghĩa các tab cho từng role
const ROLE_NAVIGATION: Record<RoleType, NavigationItem[]> = {
  TEACHER: [
    { label: 'Thông tin cá nhân', href: '/teacher/profile', icon: User },
    { label: 'Danh sách sinh viên', href: '/teacher/students', icon: Users },
    { label: 'Hướng dẫn luận văn', href: '/teacher/supervisions', icon: BookOpen },
    { label: 'Chấm điểm', href: '/teacher/grading', icon: ClipboardCheck },
    { label: 'Lịch bảo vệ', href: '/teacher/defences', icon: Calendar },
  ],
  DEPARTMENT_LECTURER: [
    { label: 'Dashboard bộ môn', href: '/department/dashboard', icon: LayoutDashboard },
    { label: 'Quản lý giảng viên', href: '/department/lecturers', icon: UserCog },
    { label: 'Phân công công việc', href: '/department/assignments', icon: ClipboardList },
    { label: 'Báo cáo bộ môn', href: '/department/reports', icon: FileText },
  ],
  ACADEMIC_AFFAIRS_STAFF: [
    { label: 'Quản lý học kỳ', href: '/admin/semesters', icon: CalendarDays },
    { label: 'Quản lý người dùng', href: '/admin/users', icon: Users },
    { label: 'Quản lý topic', href: '/admin/topics', icon: FileText },
    { label: 'Quản lý lịch bảo vệ', href: '/admin/defences', icon: Calendar },
    { label: 'Quản lý hội đồng', href: '/admin/councils', icon: Scale },
    { label: 'Quản lý chuyên nghành', href: '/admin/majors', icon: GraduationCap },
    { label: 'Quản lý khoa', href: '/admin/faculties', icon: Building2 },
    { label: 'Phân tích học kỳ', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Cài đặt chung', href: '/admin/settings', icon: Settings },
  ],
}

// Labels cho các role
const ROLE_LABELS: Record<RoleType, string> = {
  TEACHER: 'Giáo viên',
  DEPARTMENT_LECTURER: 'Giáo viên bộ môn',
  ACADEMIC_AFFAIRS_STAFF: 'Giáo vụ',
}

// Icons cho các role
const ROLE_ICONS: Record<RoleType, LucideIcon> = {
  TEACHER: GraduationCap,
  DEPARTMENT_LECTURER: UserCog,
  ACADEMIC_AFFAIRS_STAFF: Building2,
}

// Full color classes cho Tailwind (không dùng dynamic classes)
const ROLE_COLOR_CLASSES: Record<RoleType, {
  bg: string
  border: string
  text: string
  hover: string
  active: string
}> = {
  TEACHER: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    active: 'bg-blue-100 dark:bg-blue-900/40 border-blue-500',
  },
  DEPARTMENT_LECTURER: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-700',
    text: 'text-purple-700 dark:text-purple-300',
    hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
    active: 'bg-purple-100 dark:bg-purple-900/40 border-purple-500',
  },
  ACADEMIC_AFFAIRS_STAFF: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-700',
    text: 'text-green-700 dark:text-green-300',
    hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
    active: 'bg-green-100 dark:bg-green-900/40 border-green-500',
  },
}

export function RoleNavigation({ roles }: RoleNavigationProps) {
  const pathname = usePathname()
  const [expandedRole, setExpandedRole] = useState<RoleType | null>(null)

  const toggleRole = (role: RoleType) => {
    setExpandedRole(expandedRole === role ? null : role)
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Bạn chưa có vai trò nào trong hệ thống
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {roles.map((role) => {
        const navigation = ROLE_NAVIGATION[role]
        const isExpanded = expandedRole === role
        const colors = ROLE_COLOR_CLASSES[role]

        const RoleIcon = ROLE_ICONS[role]

        return (
          <div
            key={role}
            className={`border rounded-lg overflow-hidden ${colors.border} ${colors.bg}`}
          >
            {/* Role Header - Clickable to expand/collapse */}
            <button
              onClick={() => toggleRole(role)}
              className={`w-full px-4 py-3 flex items-center justify-between ${colors.hover} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isExpanded ? colors.active : 'bg-white dark:bg-gray-800'}`}>
                  <RoleIcon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold ${colors.text}`}>
                    {ROLE_LABELS[role]}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {navigation.length} chức năng
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 ${colors.text} transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Navigation Items - Expandable */}
            {isExpanded && (
              <div className="border-t dark:border-gray-700">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const ItemIcon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        isActive
                          ? `${colors.active} font-medium`
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {ItemIcon && (
                        <ItemIcon
                          className={`w-4 h-4 ${
                            isActive ? colors.text : 'text-gray-500 dark:text-gray-400'
                          }`}
                        />
                      )}
                      <span
                        className={
                          isActive
                            ? colors.text
                            : 'text-gray-700 dark:text-gray-300'
                        }
                      >
                        {item.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
