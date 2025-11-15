import { TeacherRole } from '@/types/teacher'

interface SystemRolesCardProps {
  roles: TeacherRole[]
}

function getRoleLabel(role: string): string {
  const roleMap: Record<string, string> = {
    TEACHER: 'Giáo viên',
    DEPARTMENT_LECTURER: 'Giáo viên bộ môn',
    ACADEMIC_AFFAIRS_STAFF: 'Giáo vụ',
  }
  return roleMap[role] || role
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'TEACHER':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'DEPARTMENT_LECTURER':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    case 'ACADEMIC_AFFAIRS_STAFF':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

export function SystemRolesCard({ roles }: SystemRolesCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Vai trò hệ thống
      </h2>

      {roles && roles.length > 0 ? (
        <div className="space-y-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {role.title || 'N/A'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Học kỳ: {role.semesterCode || 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass(role.role)}`}
                >
                  {getRoleLabel(role.role)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    role.activate
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  {role.activate ? 'Hoạt động' : 'Ngừng hoạt động'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Chưa có vai trò hệ thống nào được gán
        </p>
      )}
    </div>
  )
}
