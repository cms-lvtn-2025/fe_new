'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save, AlertCircle } from 'lucide-react'
import Modal from '@/components/common/Modal'
import { toast } from '@/components/common/Toast'
import {
  useCreateGradeDefence,
  useUpdateGradeDefence,
  useAddGradeDefenceCriterion,
  useUpdateGradeDefenceCriterion,
  useDeleteGradeDefenceCriterion,
} from '@/lib/graphql/hooks'

interface Criterion {
  id?: string
  name: string
  score: string
  maxScore: string
  isNew?: boolean
  isDeleted?: boolean
}

interface GradeDefence {
  id?: string
  defenceCode: string
  enrollmentCode: string
  note?: string
  totalScore?: number | null
  criteria?: Array<{
    id: string
    name: string
    score: number
    maxScore: number
  }>
}

interface GradeDefenceDialogProps {
  isOpen: boolean
  onClose: () => void
  gradeDefence: GradeDefence | null
  defenceId: string
  onSuccess?: () => void
}

// Tiêu chí mặc định cho hội đồng bảo vệ
const DEFAULT_CRITERIA = [
  { name: 'Nội dung đề tài', maxScore: '30' },
  { name: 'Phương pháp nghiên cứu', maxScore: '20' },
  { name: 'Kết quả đạt được', maxScore: '30' },
  { name: 'Trình bày và trả lời câu hỏi', maxScore: '20' },
]

export function GradeDefenceDialog({
  isOpen,
  onClose,
  gradeDefence,
  defenceId,
  onSuccess,
}: GradeDefenceDialogProps) {
  const [note, setNote] = useState('')
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [error, setError] = useState('')

  const isEdit = !!gradeDefence?.id

  // Mutations
  const { createGradeDefence, loading: creating } = useCreateGradeDefence()
  const { updateGradeDefence, loading: updating } = useUpdateGradeDefence()
  const { addCriterion, loading: addingCriterion } = useAddGradeDefenceCriterion()
  const { updateCriterion, loading: updatingCriterion } = useUpdateGradeDefenceCriterion()
  const { deleteCriterion, loading: deletingCriterion } = useDeleteGradeDefenceCriterion()

  const loading = creating || updating || addingCriterion || updatingCriterion || deletingCriterion

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (gradeDefence) {
        setNote(gradeDefence.note || '')
        if (gradeDefence.criteria && gradeDefence.criteria.length > 0) {
          setCriteria(
            gradeDefence.criteria.map((c) => ({
              id: c.id,
              name: c.name,
              score: c.score?.toString() || '',
              maxScore: c.maxScore?.toString() || '10',
            }))
          )
        } else {
          // Set default criteria for new grade
          setCriteria(
            DEFAULT_CRITERIA.map((c) => ({
              name: c.name,
              score: '',
              maxScore: c.maxScore,
              isNew: true,
            }))
          )
        }
      } else {
        setNote('')
        setCriteria(
          DEFAULT_CRITERIA.map((c) => ({
            name: c.name,
            score: '',
            maxScore: c.maxScore,
            isNew: true,
          }))
        )
      }
      setError('')
    }
  }, [isOpen, gradeDefence])

  // Calculate total score
  const calculateTotalScore = () => {
    return criteria
      .filter((c) => !c.isDeleted)
      .reduce((sum, c) => {
        const score = parseFloat(c.score) || 0
        return sum + score
      }, 0)
  }

  // Calculate max possible score
  const calculateMaxScore = () => {
    return criteria
      .filter((c) => !c.isDeleted)
      .reduce((sum, c) => {
        const maxScore = parseFloat(c.maxScore) || 0
        return sum + maxScore
      }, 0)
  }

  // Add new criterion
  const handleAddCriterion = () => {
    setCriteria([
      ...criteria,
      { name: '', score: '', maxScore: '10', isNew: true },
    ])
  }

  // Remove criterion
  const handleRemoveCriterion = (index: number) => {
    const criterion = criteria[index]
    if (criterion.id) {
      // Mark for deletion
      setCriteria(
        criteria.map((c, i) => (i === index ? { ...c, isDeleted: true } : c))
      )
    } else {
      // Remove from list
      setCriteria(criteria.filter((_, i) => i !== index))
    }
  }

  // Update criterion
  const handleCriterionChange = (
    index: number,
    field: 'name' | 'score' | 'maxScore',
    value: string
  ) => {
    setCriteria(
      criteria.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    )
  }

  // Validate form
  const validateForm = () => {
    const activeCriteria = criteria.filter((c) => !c.isDeleted)

    for (const c of activeCriteria) {
      if (!c.name.trim()) {
        setError('Vui lòng nhập tên cho tất cả tiêu chí')
        return false
      }
      if (c.score && (parseFloat(c.score) < 0 || parseFloat(c.score) > parseFloat(c.maxScore))) {
        setError(`Điểm của "${c.name}" phải từ 0 đến ${c.maxScore}`)
        return false
      }
    }
    return true
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    try {
      let gradeDefenceId = gradeDefence?.id

      // Create or update grade defence
      const totalScore = calculateTotalScore()

      if (!gradeDefenceId) {
        // Create new grade defence
        const result = await createGradeDefence({
          variables: {
            input: {
              defenceCode: defenceId,
              enrollmentCode: gradeDefence?.enrollmentCode,
              note: note || null,
              totalScore: Math.round(totalScore),
            },
          },
        })
        gradeDefenceId = (result.data as any)?.createGradeDefence?.id
      } else {
        // Update existing
        await updateGradeDefence({
          variables: {
            id: gradeDefenceId,
            input: {
              note: note || null,
              totalScore: Math.round(totalScore),
            },
          },
        })
      }

      // Handle criteria
      for (const criterion of criteria) {
        if (criterion.isDeleted && criterion.id) {
          // Delete criterion
          await deleteCriterion({ variables: { id: criterion.id } })
        } else if (criterion.isNew && !criterion.isDeleted) {
          // Add new criterion
          if (criterion.name.trim() && gradeDefenceId) {
            await addCriterion({
              variables: {
                input: {
                  gradeDefenceCode: gradeDefenceId,
                  name: criterion.name,
                  score: criterion.score || '0',
                  maxScore: criterion.maxScore || '10',
                },
              },
            })
          }
        } else if (criterion.id && !criterion.isDeleted) {
          // Update existing criterion
          await updateCriterion({
            variables: {
              id: criterion.id,
              input: {
                name: criterion.name,
                score: criterion.score || '0',
                maxScore: criterion.maxScore || '10',
              },
            },
          })
        }
      }

      toast.success('Lưu điểm thành công!')
      onSuccess?.()
      onClose()
    } catch (err) {
      setError((err as Error).message)
      toast.error('Lỗi: ' + (err as Error).message)
    }
  }

  const handleClose = () => {
    setNote('')
    setCriteria([])
    setError('')
    onClose()
  }

  const totalScore = calculateTotalScore()
  const maxScore = calculateMaxScore()

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isEdit ? 'Chỉnh sửa điểm' : 'Chấm điểm sinh viên'}
        </h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mã enrollment: <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{gradeDefence?.enrollmentCode}</span>
          </p>
        </div>

        {/* Criteria */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tiêu chí chấm điểm
            </label>
            <button
              type="button"
              onClick={handleAddCriterion}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm tiêu chí
            </button>
          </div>

          <div className="space-y-3">
            {criteria
              .filter((c) => !c.isDeleted)
              .map((criterion, index) => {
                const actualIndex = criteria.findIndex((c) => c === criterion)
                return (
                  <div
                    key={actualIndex}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        value={criterion.name}
                        onChange={(e) =>
                          handleCriterionChange(actualIndex, 'name', e.target.value)
                        }
                        placeholder="Tên tiêu chí"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={criterion.score}
                        onChange={(e) =>
                          handleCriterionChange(actualIndex, 'score', e.target.value)
                        }
                        placeholder="Điểm"
                        min="0"
                        max={criterion.maxScore}
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm text-center"
                      />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">/</span>
                    <div className="w-20">
                      <input
                        type="number"
                        value={criterion.maxScore}
                        onChange={(e) =>
                          handleCriterionChange(actualIndex, 'maxScore', e.target.value)
                        }
                        placeholder="Max"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(actualIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Xóa tiêu chí"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
          </div>

          {criteria.filter((c) => !c.isDeleted).length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Chưa có tiêu chí nào. Bấm "Thêm tiêu chí" để thêm.
            </p>
          )}
        </div>

        {/* Total Score */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Tổng điểm
            </span>
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalScore.toFixed(1)} / {maxScore}
            </span>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ghi chú
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Nhận xét, góp ý cho sinh viên..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Đang lưu...' : 'Lưu điểm'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default GradeDefenceDialog
