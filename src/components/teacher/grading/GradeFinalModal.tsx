"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { GRADE_FINAL } from "@/lib/graphql/mutations/teacher/grade.mutations";
import { X, Save, AlertCircle } from "lucide-react";

interface GradeFinalModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: any;
  onSuccess?: () => void;
}

export default function GradeFinalModal({
  isOpen,
  onClose,
  enrollment,
  onSuccess,
}: GradeFinalModalProps) {
  const [supervisorGrade, setSupervisorGrade] = useState<number>(
    enrollment?.final?.supervisorGrade || 0
  );
  const [status, setStatus] = useState<string>(
    enrollment?.final?.status || "PENDING"
  );
  const [notes, setNotes] = useState<string>(
    enrollment?.final?.notes || ""
  );

  const [gradeFinal, { loading, error }] = useMutation(GRADE_FINAL, {
    onCompleted: () => {
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error("Error grading final:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (supervisorGrade < 0 || supervisorGrade > 10) {
      alert("Điểm phải nằm trong khoảng 0-10");
      return;
    }

    // Cảnh báo khi chọn PASSED, FAILED hoặc COMPLETED
    if (status === "PASSED" || status === "FAILED" || status === "COMPLETED") {
      const statusLabel =
        status === "PASSED" ? "ĐẠT" :
        status === "FAILED" ? "KHÔNG ĐẠT" :
        "HOÀN THÀNH";

      const confirmed = window.confirm(
        `⚠️ CẢNH BÁO: Bạn đang chọn trạng thái "${statusLabel}".\n\n` +
        `Sau khi lưu, điểm sẽ được FINALIZE và KHÔNG THỂ CHỈNH SỬA lại được.\n\n` +
        `Bạn có chắc chắn muốn tiếp tục?`
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      await gradeFinal({
        variables: {
          enrollmentId: enrollment.id,
          input: {
            supervisorGrade: Number(supervisorGrade),
            status,
            notes: notes.trim() || undefined,
          },
        },
      });
    } catch (err) {
      console.error("Failed to grade final:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Chấm điểm cuối kỳ
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sinh viên: {enrollment?.student?.username || "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {error.message}
              </p>
            </div>
          )}

          {/* Supervisor Grade Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Điểm hướng dẫn <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={supervisorGrade}
              onChange={(e) => setSupervisorGrade(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập điểm (0-10)"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Điểm từ 0 đến 10
            </p>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="PENDING">Chờ xử lý (Nháp - Có thể sửa)</option>
              <option value="PASSED">Đạt ⚠️ (Finalize - Không thể sửa)</option>
              <option value="FAILED">Không đạt ⚠️ (Finalize - Không thể sửa)</option>
              <option value="COMPLETED">Hoàn thành ⚠️ (Finalize - Không thể sửa)</option>
            </select>

            {/* Warning message when finalize status is selected */}
            {(status === "PASSED" || status === "FAILED" || status === "COMPLETED") && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">
                    <strong>Cảnh báo:</strong> Trạng thái này sẽ finalize điểm. Sau khi lưu, bạn sẽ KHÔNG THỂ chỉnh sửa lại được!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notes Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ghi chú
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Nhập ghi chú cho sinh viên..."
            />
          </div>

          {/* Student Info Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thông tin sinh viên
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Tên sinh viên:
                </span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {enrollment?.student?.username || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {enrollment?.student?.email || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Mã sinh viên:
                </span>
                <span className="text-gray-900 dark:text-gray-100 font-mono">
                  {enrollment?.student?.id || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Grades Summary */}
          {enrollment?.final && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thông tin điểm hiện tại
              </h3>
              <div className="space-y-1 text-sm">
                {enrollment.final.supervisorGrade !== null && enrollment.final.supervisorGrade !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Điểm hướng dẫn:
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {enrollment.final.supervisorGrade}
                    </span>
                  </div>
                )}
                {enrollment.final.departmentGrade !== null && enrollment.final.departmentGrade !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Điểm phản biện:
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {enrollment.final.departmentGrade}
                    </span>
                  </div>
                )}
                {enrollment.final.finalGrade !== null && enrollment.final.finalGrade !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Điểm tổng kết:
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-bold">
                      {enrollment.final.finalGrade}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu điểm
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
