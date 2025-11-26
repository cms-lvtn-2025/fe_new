import type { Teacher } from '@/types/graphql'

interface ProfileCardProps {
  profile: Teacher | null | undefined
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Thông tin cá nhân
      </h2>

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
            {profile?.gender === 'male' ? 'Nam' : profile?.gender === 'female' ? 'Nữ' : 'N/A'}
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
            {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString('vi-VN')
              : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}
