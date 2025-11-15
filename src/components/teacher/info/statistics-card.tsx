interface StatisticsCardProps {
  semesterName: string | undefined
  supervisedCount: number
  defencesCount: number
  reviewsCount: number
}

interface StatItemProps {
  label: string
  count: number
  colorClass: string
}

function StatItem({ label, count, colorClass }: StatItemProps) {
  return (
    <div className={`text-center p-6 rounded-lg ${colorClass}`}>
      <div className={`text-3xl font-bold ${colorClass.replace('bg-', 'text-').replace('/20', '')}`}>
        {count}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{label}</div>
    </div>
  )
}

export function StatisticsCard({
  semesterName,
  supervisedCount,
  defencesCount,
  reviewsCount,
}: StatisticsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Thống kê học kỳ {semesterName || 'hiện tại'}
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        <StatItem
          label="Đề tài hướng dẫn"
          count={supervisedCount}
          colorClass="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatItem
          label="Hội đồng tham gia"
          count={defencesCount}
          colorClass="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatItem
          label="Phản biện được gán"
          count={reviewsCount}
          colorClass="bg-green-50 dark:bg-green-900/20"
        />
      </div>
    </div>
  )
}
