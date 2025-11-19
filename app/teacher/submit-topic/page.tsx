'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useCreateTopic } from '@/lib/graphql/hooks'
import { useMyTeacherProfile } from '@/lib/graphql/hooks'
import { useSemester } from '@/lib/contexts/semester-context'
import { useGoogleTranslate } from '@/hooks/useGoogleTranslate'
import { ArrowLeft, FileText, Send, Loader, Languages, UserPlus, X } from 'lucide-react'

// Dynamic import TinyMCE to avoid SSR issues
const TinyMCEEditor = dynamic(
  () => import('@/components/common/TinyMCEEditor').then(mod => mod.TinyMCEEditor),
  { ssr: false, loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" /> }
)

export default function SubmitTopicPage() {
  const router = useRouter()
  const { profile } = useMyTeacherProfile()
  const { currentSemester: selectedSemester } = useSemester()
  const { createTopic, loading, error } = useCreateTopic()
  const { translate, translating } = useGoogleTranslate()

  const [formData, setFormData] = useState({
    title: '',
    titleEnglish: '',
    description: '',
    majorCode: '',
    semesterCode: '',
    trainingProgram: '',
    startDate: '',
    endDate: '',
    maxStudents: 1,
    stage: 'STAGE_DACN', // STAGE_DACN (Topic 1) or STAGE_LVTN (Topic 2)
    studentCodes: [] as string[], // Array of student codes
  })

  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<any[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-fill when profile or semester changes
  useEffect(() => {
    if (profile?.majorCode && !formData.majorCode) {
      setFormData(prev => ({ ...prev, majorCode: profile.majorCode }))
    }
  }, [profile])

  useEffect(() => {
    if (selectedSemester?.id && !formData.semesterCode) {
      setFormData(prev => ({ ...prev, semesterCode: selectedSemester.id }))
    }
  }, [selectedSemester])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleEditorChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }))
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: '' }))
    }
  }

  const handleTranslateTitle = async () => {
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tên đề tài tiếng Việt trước')
      return
    }

    const translatedText = await translate(formData.title, 'vi', 'en')
    if (translatedText) {
      setFormData(prev => ({ ...prev, titleEnglish: translatedText }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Title Vietnamese
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên đề tài tiếng Việt'
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Tên đề tài phải có ít nhất 10 ký tự'
    }

    // Description
    const plainTextDescription = formData.description.replace(/<[^>]*>/g, '').trim()
    if (!plainTextDescription) {
      newErrors.description = 'Vui lòng nhập mô tả chi tiết đề tài'
    } else if (plainTextDescription.length < 50) {
      newErrors.description = 'Mô tả đề tài phải có ít nhất 50 ký tự'
    }

    // Major Code
    if (!formData.majorCode.trim()) {
      newErrors.majorCode = 'Vui lòng nhập mã ngành'
    }

    // Semester Code
    if (!formData.semesterCode.trim()) {
      newErrors.semesterCode = 'Vui lòng chọn học kỳ'
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end < start) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
      }
    }

    // Max students
    if (formData.maxStudents < 1 || formData.maxStudents > 10) {
      newErrors.maxStudents = 'Số sinh viên phải từ 1 đến 10'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const input: any = {
        title: formData.title.trim(),
        description: formData.description,
        majorCode: formData.majorCode.trim(),
        semesterCode: formData.semesterCode.trim(),
        maxStudents: formData.maxStudents,
        stage: formData.stage,
      }

      // Optional fields
      if (formData.titleEnglish.trim()) {
        input.titleEnglish = formData.titleEnglish.trim()
      }
      if (formData.trainingProgram.trim()) {
        input.trainingProgram = formData.trainingProgram.trim()
      }
      if (formData.startDate) {
        input.startDate = formData.startDate
      }
      if (formData.endDate) {
        input.endDate = formData.endDate
      }
      if (formData.studentCodes.length > 0) {
        input.studentCodes = formData.studentCodes
      }

      const result = await createTopic({
        variables: { input }
      })

      if ((result.data as any)?.createTopic) {
        alert('Đề tài đã được gửi thành công! Vui lòng chờ phê duyệt từ bộ môn.')
        router.push('/teacher/topics')
      }
    } catch (err: any) {
      console.error('Error creating topic:', err)
      alert(`Lỗi khi gửi đề tài: ${err.message || 'Vui lòng thử lại sau'}`)
    }
  }

  const handleBack = () => {
    router.push('/teacher/topics')
  }

  const handleAddStudent = () => {
    const studentCode = studentSearch.trim()
    if (!studentCode) {
      alert('Vui lòng nhập MSSV sinh viên')
      return
    }

    if (formData.studentCodes.includes(studentCode)) {
      alert('Sinh viên này đã được thêm')
      return
    }

    if (formData.studentCodes.length >= formData.maxStudents) {
      alert(`Đã đạt số lượng sinh viên tối đa (${formData.maxStudents})`)
      return
    }

    setFormData(prev => ({
      ...prev,
      studentCodes: [...prev.studentCodes, studentCode]
    }))
    setSelectedStudents(prev => [...prev, { id: studentCode, username: studentCode }])
    setStudentSearch('')
  }

  const handleRemoveStudent = (studentCode: string) => {
    setFormData(prev => ({
      ...prev,
      studentCodes: prev.studentCodes.filter(code => code !== studentCode)
    }))
    setSelectedStudents(prev => prev.filter(s => s.id !== studentCode))
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Gửi đề tài mới
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Đề xuất đề tài luận văn cho sinh viên
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        {/* Title Vietnamese */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tên đề tài (Tiếng Việt) <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Nhập tên đề tài bằng tiếng Việt (ít nhất 10 ký tự)"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Title English */}
        <div>
          <label htmlFor="titleEnglish" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tên đề tài (Tiếng Anh)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="titleEnglish"
              name="titleEnglish"
              value={formData.titleEnglish}
              onChange={handleChange}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tên đề tài bằng tiếng Anh (hoặc click Dịch tự động)"
            />
            <button
              type="button"
              onClick={handleTranslateTitle}
              disabled={translating || !formData.title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Dịch tự động sang tiếng Anh"
            >
              {translating ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Languages className="w-5 h-5" />
              )}
              Dịch
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Nhập thủ công hoặc sử dụng dịch tự động từ tiếng Việt
          </p>
        </div>

        {/* Major & Training Program */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Major Code */}
          <div>
            <label htmlFor="majorCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngành <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="majorCode"
              name="majorCode"
              value={formData.majorCode}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.majorCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Mã ngành"
            />
            {errors.majorCode && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.majorCode}</p>
            )}
            {profile?.majorCode && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Mặc định: {profile.majorCode}
              </p>
            )}
          </div>

          {/* Training Program */}
          <div>
            <label htmlFor="trainingProgram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chương trình đào tạo
            </label>
            <input
              type="text"
              id="trainingProgram"
              name="trainingProgram"
              value={formData.trainingProgram}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Đại học chính quy, Cao học..."
            />
          </div>
        </div>

        {/* Semester & Max Students */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Semester Code */}
          <div>
            <label htmlFor="semesterCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Học kỳ <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="semesterCode"
              name="semesterCode"
              value={formData.semesterCode}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.semesterCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Mã học kỳ"
            />
            {errors.semesterCode && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.semesterCode}</p>
            )}
            {selectedSemester && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Hiện tại: {selectedSemester.name}
              </p>
            )}
          </div>

          {/* Max Students */}
          <div>
            <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sinh viên thực hiện (0/{formData.maxStudents})
            </label>
            <input
              type="number"
              id="maxStudents"
              name="maxStudents"
              min="1"
              max="10"
              value={formData.maxStudents}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.maxStudents ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.maxStudents && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxStudents}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Số sinh viên tối đa có thể thực hiện đề tài này
            </p>
          </div>
        </div>

        {/* Topic Stage Selection */}
        <div>
          <label htmlFor="stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Loại đề tài <span className="text-red-600">*</span>
          </label>
          <select
            id="stage"
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="STAGE_DACN">Đề án chuyên ngành (ĐACN - Topic 1)</option>
            <option value="STAGE_LVTN">Luận văn tốt nghiệp (LVTN - Topic 2)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            ĐACN (Topic 1) dành cho đề tài giai đoạn 1, LVTN (Topic 2) dành cho đề tài giai đoạn 2
          </p>
        </div>

        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sinh viên thực hiện ({formData.studentCodes.length}/{formData.maxStudents})
          </label>

          {/* Add Student Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStudent())}
              placeholder="Nhập MSSV sinh viên (vd: 2052001)"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddStudent}
              disabled={formData.studentCodes.length >= formData.maxStudents}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-5 h-5" />
              Thêm
            </button>
          </div>

          {/* Selected Students List */}
          {formData.studentCodes.length > 0 && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="space-y-2">
                {formData.studentCodes.map((studentCode, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          MSSV: {studentCode}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(studentCode)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Xóa sinh viên"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Tùy chọn: Thêm sinh viên vào đề tài ngay khi tạo (có thể bỏ trống và để sinh viên tự đăng ký sau)
          </p>
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngày kết thúc
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Description (TinyMCE) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mô tả chi tiết đề tài <span className="text-red-600">*</span>
          </label>
          <div className={`border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
            <TinyMCEEditor
              value={formData.description}
              onEditorChange={handleEditorChange}
              placeholder="Nhập mô tả chi tiết bao gồm: Mô tả tổng quan, nhiệm vụ cụ thể, tài liệu tham khảo, các giai đoạn thực hiện..."
              height={400}
            />
          </div>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
          )}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Bao gồm: Mô tả tổng quan, nhiệm vụ cụ thể, tài liệu tham khảo, các giai đoạn thực hiện...
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Lưu ý khi gửi đề tài
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
            <li>Đề tài sẽ được gửi đến bộ môn để xem xét và phê duyệt</li>
            <li>Tên đề tài phải rõ ràng, cụ thể và phản ánh đúng nội dung nghiên cứu</li>
            <li>Mô tả đề tài cần chi tiết về mục tiêu, phạm vi và phương pháp thực hiện</li>
            <li>Sử dụng nút "Dịch" để tự động dịch tên đề tài sang tiếng Anh</li>
            <li>Sau khi được phê duyệt, đề tài sẽ được hiển thị cho sinh viên đăng ký</li>
          </ul>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-400">
              Lỗi: {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Gửi đề tài
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
