/**
 * Example Component: Type-Safe Semester List
 *
 * Đây là ví dụ về cách sử dụng TypeScript types và parsers
 * để tạo component type-safe, tránh bugs
 */

'use client'

import { useState } from 'react'
import { useAllSemesters } from '@/lib/graphql/hooks'
import type { Semester, SearchRequestInput } from '@/types/graphql'

export default function TypeSafeSemesterList() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  // Build search request
  const search: SearchRequestInput = {
    pagination: {
      page,
      pageSize,
      sortBy: 'created_at',
      descending: true,
    },
  }

  // Use hook - fully typed!
  const { semesters, total, loading, error, refetch } = useAllSemesters(search)

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Có lỗi xảy ra</h3>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    )
  }

  // Handle empty state
  if (semesters.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Không có học kỳ nào</p>
      </div>
    )
  }

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Danh sách học kỳ
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Tổng số: <strong>{total}</strong> học kỳ
          </span>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {semesters.map((semester: Semester) => (
          <SemesterCard key={semester.id} semester={semester} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            Trang {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Semester Card Component
 * Type-safe card component for displaying semester info
 */
function SemesterCard({ semester }: { semester: Semester }) {
  // All properties are fully typed and autocompleted!
  const { id, title, createdAt, updatedAt } = semester

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
      <h3 className="font-semibold text-lg text-gray-800 mb-2">{title}</h3>

      <div className="space-y-1 text-sm text-gray-600">
        <div>
          <span className="font-medium">ID:</span>
          <code className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">
            {id}
          </code>
        </div>

        <div>
          <span className="font-medium">Ngày tạo:</span>
          <span className="ml-2">{formatDate(createdAt)}</span>
        </div>

        <div>
          <span className="font-medium">Cập nhật:</span>
          <span className="ml-2">{formatDate(updatedAt)}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
          Xem chi tiết
        </button>
        <button className="flex-1 px-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100">
          Chỉnh sửa
        </button>
      </div>
    </div>
  )
}

/**
 * Example của việc sử dụng filter
 */
export function SemesterListWithFilter() {
  const [searchTerm, setSearchTerm] = useState('')

  const search: SearchRequestInput = {
    pagination: { page: 1, pageSize: 100, sortBy: 'created_at', descending: true },
    filters: searchTerm
      ? [
          {
            condition: {
              field: 'title',
              operator: 'LIKE',
              values: [searchTerm],
            },
          },
        ]
      : [],
  }

  const { semesters, loading } = useAllSemesters(search)

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Tìm kiếm học kỳ..."
        className="w-full px-4 py-2 border rounded-lg mb-4"
      />

      {loading ? (
        <p>Đang tìm kiếm...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {semesters.map((semester: Semester) => (
            <SemesterCard key={semester.id} semester={semester} />
          ))}
        </div>
      )}
    </div>
  )
}
