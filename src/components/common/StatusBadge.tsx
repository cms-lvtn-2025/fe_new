import React from 'react'

interface StatusBadgeProps {
  status: string
  label?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

const STATUS_COLORS: Record<string, string> = {
  // Topic statuses
  SUBMIT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  TOPIC_PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  APPROVED_1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  APPROVED_2: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  TOPIC_COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',

  // Generic statuses
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',

  // Stages
  STAGE_DACN: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  STAGE_LVTN: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
}

const VARIANT_COLORS: Record<string, string> = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
}

export function StatusBadge({ status, label, variant }: StatusBadgeProps) {
  const colorClass = variant
    ? VARIANT_COLORS[variant]
    : STATUS_COLORS[status] || STATUS_COLORS.default

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
      {label || status}
    </span>
  )
}
