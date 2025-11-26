'use client'

import React from 'react'
import { WifiOff, RefreshCw, Home } from 'lucide-react'

interface NetworkErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  onBack?: () => void
  showHomeButton?: boolean
}

export function NetworkError({
  title = 'Lỗi kết nối',
  message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
  onRetry,
  onBack,
  showHomeButton = true,
}: NetworkErrorProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
          <WifiOff className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              Quay lại
            </button>
          )}
          {showHomeButton && (
            <button
              onClick={() => (window.location.href = '/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Trang chủ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Inline network error for smaller sections
export function NetworkErrorInline({
  message = 'Lỗi kết nối. Vui lòng thử lại.',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
      <WifiOff className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      <span className="text-sm text-orange-700 dark:text-orange-300">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Thử lại
        </button>
      )}
    </div>
  )
}

export default NetworkError
