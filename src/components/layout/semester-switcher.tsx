'use client'

import { useState } from 'react'
import { useSemester } from '@/lib/contexts/semester-context'
import { Button, Modal } from '@/components/common'

export default function SemesterSwitcher() {
  const { currentSemester, semesters, setCurrentSemester, loading } = useSemester()
  const [isOpen, setIsOpen] = useState(false)

  if (loading || !currentSemester) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-48"></div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      >
        <span className="text-2xl">📅</span>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {currentSemester.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Click để đổi học kỳ
          </div>
        </div>
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Chọn học kỳ"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Chọn học kỳ để xem thông tin và vai trò tương ứng
          </p>

          {semesters.map((semester) => (
            <button
              key={semester.id}
              onClick={() => {
                setCurrentSemester(semester.id)
                setIsOpen(false)
              }}
              className={`
                w-full p-4 rounded-lg border-2 transition-all text-left cursor-pointer
                ${semester.id === currentSemester.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${
                    semester.id === currentSemester.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {semester.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(semester.startDate).toLocaleDateString('vi-VN')} - {new Date(semester.endDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                {semester.isCurrent && (
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                    Hiện tại
                  </span>
                )}
                {semester.id === currentSemester.id && (
                  <span className="text-blue-600 dark:text-blue-400 text-xl">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Lưu ý:</strong> Khi đổi học kỳ, trang sẽ tự động reload để cập nhật dữ liệu và vai trò mới.
          </p>
        </div>
      </Modal>
    </>
  )
}
