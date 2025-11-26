'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Info, Wifi, WifiOff } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'network'

interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// Helper functions
export const toast = {
  success: (message: string, title?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'success', message, title, duration: 3000 }
      }))
    }
  },
  error: (message: string, title?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'error', message, title, duration: 5000 }
      }))
    }
  },
  warning: (message: string, title?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'warning', message, title, duration: 4000 }
      }))
    }
  },
  info: (message: string, title?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'info', message, title, duration: 3000 }
      }))
    }
  },
  network: (message: string, title?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'network', message, title: title || 'Lỗi kết nối', duration: 5000 }
      }))
    }
  },
}

const ToastIcon = ({ type }: { type: ToastType }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    network: <WifiOff className="w-5 h-5 text-orange-500" />,
  }
  return icons[type]
}

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    network: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  }

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(onClose, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration, onClose])

  return (
    <div
      className={`${bgColors[toast.type]} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px] animate-slide-in`}
    >
      <div className="flex items-start gap-3">
        <ToastIcon type={toast.type} />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {toast.title}
            </h4>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Listen for toast events
  useEffect(() => {
    const handleToast = (e: CustomEvent) => {
      showToast(e.detail)
    }
    window.addEventListener('toast', handleToast as EventListener)
    return () => window.removeEventListener('toast', handleToast as EventListener)
  }, [showToast])

  // Network status listener
  useEffect(() => {
    const handleOnline = () => {
      showToast({ type: 'success', message: 'Đã khôi phục kết nối mạng', title: 'Kết nối', duration: 3000 })
    }
    const handleOffline = () => {
      showToast({ type: 'network', message: 'Mất kết nối mạng. Vui lòng kiểm tra lại.', title: 'Lỗi kết nối', duration: 0 })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 left-4 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => hideToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
