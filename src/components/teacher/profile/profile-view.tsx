interface ProfileViewProps {
  profile: {
    id?: string
    username?: string
    email?: string
    gender?: string
    majorCode?: string
    createdAt?: string
  } | null
  onEdit: () => void
}

export function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Mã giảng viên
          </label>
          <p className="text-gray-900 dark:text-gray-100 mt-1">{profile?.id || 'N/A'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Họ và tên</label>
          <p className="text-gray-900 dark:text-gray-100 mt-1">{profile?.username || 'N/A'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
          <p className="text-gray-900 dark:text-gray-100 mt-1">{profile?.email || 'N/A'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Giới tính</label>
          <p className="text-gray-900 dark:text-gray-100 mt-1">
            {profile?.gender === 'male'
              ? 'Nam'
              : profile?.gender === 'female'
                ? 'Nữ'
                : 'Khác'}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Mã chuyên ngành
          </label>
          <p className="text-gray-900 dark:text-gray-100 mt-1">{profile?.majorCode || 'N/A'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Ngày tạo tài khoản
          </label>
          <p className="text-gray-900 dark:text-gray-100 mt-1">
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Chỉnh sửa thông tin
        </button>
      </div>
    </div>
  )
}
