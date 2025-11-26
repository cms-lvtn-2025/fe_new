'use client'

import React from 'react'

interface PageLoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PageLoading({ text = 'Đang tải...', size = 'md' }: PageLoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  }

  return (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <div
          className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
        />
        {text && <p className="text-gray-600 dark:text-gray-400">{text}</p>}
      </div>
    </div>
  )
}

export default PageLoading
