'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSemester } from '@/lib/contexts/semester-context'
import { useMyTeacherProfile } from '@/lib/graphql/hooks'
import { RoleNavigation } from '@/components/teacher/navigation'
import { RoleType } from '@/types/teacher'
import {
  LayoutDashboard, FileText, UserCircle, Calendar, FileStack, User
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
}

// Student menu items - fixed
const studentMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Tổng quan', href: '/student/dashboard', icon: LayoutDashboard },
  { id: 'thesis', label: 'Luận văn của tôi', href: '/student/thesis', icon: FileText },
  { id: 'advisor', label: 'Giảng viên hướng dẫn', href: '/student/advisor', icon: UserCircle },
  { id: 'schedule', label: 'Lịch bảo vệ', href: '/student/schedule', icon: Calendar },
  { id: 'documents', label: 'Tài liệu', href: '/student/documents', icon: FileStack },
  { id: 'profile', label: 'Thông tin cá nhân', href: '/student/profile', icon: User },
]

interface SidebarProps {
  userRole: 'student' | 'teacher'
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  // Only fetch teacher profile if user is a teacher
  const { profile } = userRole === 'teacher' ? useMyTeacherProfile() : { profile: null }

  // Lấy unique roles từ profile (chỉ roles đang hoạt động)
  const userRoles = userRole === 'teacher' && profile?.roles
    ? Array.from(new Set(profile.roles.filter(r => r.activate).map(r => r.role as RoleType)))
    : []

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            BK
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-gray-100">HCMUT</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {userRole === 'student' ? 'Sinh viên' : 'Giảng viên'}
            </p>
          </div>
        </Link>
      </div>

      {/* Menu Items */}
      {userRole === 'student' ? (
        <nav className="p-4 space-y-1">
          {studentMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const ItemIcon = item.icon

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer
                  ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <ItemIcon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      ) : (
        <div className="p-4">
          <RoleNavigation roles={userRoles} />
        </div>
      )}
    </aside>
  )
}
