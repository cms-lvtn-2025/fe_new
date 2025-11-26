'use client'

import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { UPDATE_COUNCIL } from '@/lib/graphql/mutations/admin'
import { X, Clock, AlertCircle } from 'lucide-react'
import Modal from '@/components/common/Modal'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface AssignTimeDialogProps {
  isOpen: boolean
  onClose: () => void
  councilId: string
  councilTitle: string
  currentTime?: string
  onSuccess?: () => void
}

export function AssignTimeDialog({
  isOpen,
  onClose,
  councilId,
  councilTitle,
  currentTime,
  onSuccess,
}: AssignTimeDialogProps) {
  const [timeStart, setTimeStart] = useState('')
  const [error, setError] = useState('')

  const [updateCouncil, { loading }] = useMutation(UPDATE_COUNCIL, {
    onCompleted: () => {
      onSuccess?.()
      onClose()
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  useEffect(() => {
    if (isOpen && currentTime) {
      // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
      const date = new Date(currentTime)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      setTimeStart(`${year}-${month}-${day}T${hours}:${minutes}`)
    } else if (isOpen) {
      // Set to current time if no time exists
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setTimeStart(`${year}-${month}-${day}T${hours}:${minutes}`)
    }
  }, [isOpen, currentTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!timeStart) {
      setError('Vui lòng chọn thời gian')
      return
    }

    try {
      // Convert datetime-local to ISO string
      const selectedDate = new Date(timeStart)
      await updateCouncil({
        variables: {
          id: councilId,
          input: {
            timeStart: selectedDate.toISOString(),
          },
        },
      })
    } catch (err) {
      // Error is handled by onError
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Gán giờ bảo vệ
        </h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Council Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Hội đồng</p>
          <p className="text-gray-900 dark:text-gray-100 font-medium">{councilTitle}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mã: {councilId}</p>
        </div>

        {/* Time Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thời gian bảo vệ <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={timeStart}
            onChange={(e) => setTimeStart(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {timeStart && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Thời gian đã chọn:{' '}
              {format(new Date(timeStart), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Clock className="w-5 h-5" />
            {loading ? 'Đang lưu...' : 'Lưu thời gian'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
