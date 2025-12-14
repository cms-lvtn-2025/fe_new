import React, { useState } from 'react'
import { Search, RefreshCw } from 'lucide-react'

interface SearchBarProps {
  onSearch: (searchTerm: string) => void
  onRefresh?: () => void
  placeholder?: string
  className?: string
  children?: React.ReactNode // For additional filters
}

export function SearchBar({
  onSearch,
  onRefresh,
  placeholder = 'Tìm kiếm...',
  className = '',
  children
}: SearchBarProps) {
  const [searchInput, setSearchInput] = useState('')

  const handleSearchSubmit = () => {
    onSearch(searchInput)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearchSubmit}
            className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            Tìm kiếm
          </button>
        </div>

        {/* Filters and Refresh */}
        <div className="flex flex-wrap gap-2">
          {children}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="cursor-pointer p-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
