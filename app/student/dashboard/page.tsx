export default function StudentDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Dashboard Sinh viên
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Luận văn của tôi
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Tiến độ
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">75%</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Thông báo
          </h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">5</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Chào mừng bạn đến với hệ thống quản lý luận văn
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Sử dụng sidebar bên trái để điều hướng đến các chức năng khác nhau.
        </p>
      </div>
    </div>
  )
}
