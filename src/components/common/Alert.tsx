'use client'

import React, { useState } from 'react'

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  dismissible?: boolean
  onClose?: () => void
}

export default function Alert({
  type = 'info',
  title,
  message,
  dismissible = true,
  onClose,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  const typeStyles = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  }

  const iconStyles = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  return (
    <div className={`${typeStyles[type]} border-l-4 p-4 rounded-lg shadow-sm relative`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 text-xl mr-3">{iconStyles[type]}</div>
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        {dismissible && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-3 text-xl hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
