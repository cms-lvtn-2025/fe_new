import { RoleType } from '@/types/teacher'

interface DynamicRolesCardProps {
  currentTeacherRole: string[] // Can be RoleType or empty
  semesterName?: string
}

function getRoleLabel(role: string): string {
  const roleMap: Record<string, string> = {
    TEACHER: 'Giáo viên',
    DEPARTMENT_LECTURER: 'Giáo viên bộ môn',
    ACADEMIC_AFFAIRS_STAFF: 'Giáo vụ',
  }
  return roleMap[role] || role
}

function getRoleIcon(role: string): string {
  const iconMap: Record<string, string> = {
    TEACHER: '👨‍🏫',
    DEPARTMENT_LECTURER: '👔',
    ACADEMIC_AFFAIRS_STAFF: '📋',
  }
  return iconMap[role] || '📋'
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

export function DynamicRolesCard({ currentTeacherRole, semesterName }: DynamicRolesCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Vai trò trong học kỳ {semesterName || 'hiện tại'}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Vai trò được gán tự động dựa trên công việc thực tế
      </p>

      {currentTeacherRole && currentTeacherRole.length > 0 ? (
        <div className="grid gap-4">
          {currentTeacherRole.map((role) => (
            <div
              key={role}
              className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="text-3xl">{getRoleIcon(role)}</div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {getRoleLabel(role)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {role === 'TEACHER' && 'Giảng viên giảng dạy trong học kỳ này'}
                  {role === 'DEPARTMENT_LECTURER' && 'Quản lý và điều phối công việc bộ môn'}
                  {role === 'ACADEMIC_AFFAIRS_STAFF' && 'Cán bộ phòng đào tạo, hỗ trợ giảng viên và sinh viên'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass(role)}`}>
                {getRoleLabel(role)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có vai trò nào trong học kỳ này
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Vai trò sẽ được gán tự động khi bạn được phân công công việc
          </p>
        </div>
      )}
    </div>
  )
}
