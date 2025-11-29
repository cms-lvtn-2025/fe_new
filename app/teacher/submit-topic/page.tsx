'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useMutation, useQuery } from '@apollo/client/react'
import { CREATE_TOPIC_FOR_SUPERVISOR, CREATE_TOPIC_COUNCIL_FOR_SUPERVISOR } from '@/lib/graphql/mutations/teacher'
import { GET_MY_SUPERVISED_TOPIC_COUNCILS } from '@/lib/graphql/queries/teacher'
import { useMyTeacherProfile } from '@/lib/graphql/hooks'
import { useSemester } from '@/lib/contexts/semester-context'
import { useGoogleTranslate } from '@/hooks/useGoogleTranslate'
import { ArrowLeft, FileText, Send, Loader, Languages, UserPlus, X, RefreshCw } from 'lucide-react'

// Dynamic import TinyMCE to avoid SSR issues
const TinyMCEEditor = dynamic(
  () => import('@/components/common/TinyMCEEditor').then(mod => mod.TinyMCEEditor),
  { ssr: false, loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" /> }
)

export default function SubmitTopicPage() {
  const router = useRouter()
  const { profile } = useMyTeacherProfile()
  const { currentSemester: selectedSemester } = useSemester()
  const { translate, translating } = useGoogleTranslate()

  // Mode: 'new' = tạo đề tài mới, 'from_stage1' = tạo từ đề tài giai đoạn 1
  const [mode, setMode] = useState<'new' | 'from_stage1'>('new')

  // Mutations
  const [createTopicForSupervisor, { loading: loadingCreate, error: errorCreate }] = useMutation(CREATE_TOPIC_FOR_SUPERVISOR)
  const [createTopicCouncilForSupervisor, { loading: loadingCouncil, error: errorCouncil }] = useMutation(CREATE_TOPIC_COUNCIL_FOR_SUPERVISOR)

  // Query để lấy danh sách topic của teacher
  const { data: topicCouncilsData, loading: loadingTopics } = useQuery(GET_MY_SUPERVISED_TOPIC_COUNCILS, {
    variables: {
      search: {
        pagination: { page: 1, pageSize: 100 , sortBy: 'created_at', descending: true },
        filters: [],
      },
    },
    skip: mode !== 'from_stage1',
  })

  // Lọc ra các topic có stage = STAGE_DACN (giai đoạn 1)
  const allTopics = (topicCouncilsData as any)?.getMySupervisedTopicCouncils?.data || []
  const stage1Topics = allTopics.filter((item: any) =>
    item.stage === 'STAGE_DACN' || item.stage === 'stage_dacn'
  )

  const loading = loadingCreate || loadingCouncil
  const error = errorCreate || errorCouncil

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
    // Fields for mode 'from_stage1'
    selectedTopicCode: '',
  })

  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<any[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})


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

    if (mode === 'from_stage1') {
      // Validate cho mode tạo từ giai đoạn 1
      if (!formData.selectedTopicCode) {
        newErrors.selectedTopicCode = 'Vui lòng chọn đề tài giai đoạn 1'
      }
      if (!formData.startDate) {
        newErrors.startDate = 'Vui lòng nhập ngày bắt đầu'
      }
      if (!formData.endDate) {
        newErrors.endDate = 'Vui lòng nhập ngày kết thúc'
      }
    } else {
      // Validate cho mode tạo mới
      // Title Vietnamese
      if (!formData.title.trim()) {
        newErrors.title = 'Vui lòng nhập tên đề tài tiếng Việt'
      } else if (formData.title.trim().length < 10) {
        newErrors.title = 'Tên đề tài phải có ít nhất 10 ký tự'
      }

      // Title English
      if (!formData.titleEnglish.trim()) {
        newErrors.titleEnglish = 'Vui lòng nhập tên đề tài tiếng Anh'
      }

      // Description
      const plainTextDescription = formData.description.replace(/<[^>]*>/g, '').trim()
      if (!plainTextDescription) {
        newErrors.description = 'Vui lòng nhập mô tả chi tiết đề tài'
      } else if (plainTextDescription.length < 50) {
        newErrors.description = 'Mô tả đề tài phải có ít nhất 50 ký tự'
      }

      // Date validation
      if (!formData.startDate) {
        newErrors.startDate = 'Vui lòng nhập ngày bắt đầu'
      }
      if (!formData.endDate) {
        newErrors.endDate = 'Vui lòng nhập ngày kết thúc'
      }
    }

    // Date validation chung
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end < start) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Helper function to convert datetime-local to ISO 8601 format with timezone
  const formatDateTimeForServer = (dateTimeLocal: string): string => {
    if (!dateTimeLocal) return ''
    // Add seconds if not present and convert to ISO string with timezone
    const date = new Date(dateTimeLocal)
    return date.toISOString() // This returns format: "2025-11-22T22:11:00.000Z"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (mode === 'from_stage1') {
        // Tạo topic council cho giai đoạn 2 từ topic có sẵn
        if (!formData.selectedTopicCode) {
          setErrors({ selectedTopicCode: 'Vui lòng chọn đề tài giai đoạn 1' })
          return
        }

        const result = await createTopicCouncilForSupervisor({
          variables: {
            input: {
              topicCode: formData.selectedTopicCode,
              timeStart: formatDateTimeForServer(formData.startDate),
              timeEnd: formatDateTimeForServer(formData.endDate),
              students: formData.studentCodes,
            }
          }
        })

        if ((result.data as any)?.teacher.supervisor.createTopicCouncil) {
          alert('Đã tạo đề tài giai đoạn 2 thành công!')
          router.push('/teacher/topics')
        }
      } else {
        // Tạo đề tài mới
        const input: any = {
          title: formData.title.trim(),
          titleEn: formData.titleEnglish.trim(),
          description: formData.description,
          stage: formData.stage,
          timeStart: formatDateTimeForServer(formData.startDate),
          timeEnd: formatDateTimeForServer(formData.endDate),
          students: formData.studentCodes,
        }

        if (formData.trainingProgram.trim()) {
          input.curriculum = formData.trainingProgram.trim()
        }

        const result = await createTopicForSupervisor({
          variables: { input }
        })
        console.log('Create Topic Result:', result)
        if ((result.data as any)?.teacher.supervisor.createTopic) {
          alert('Đề tài đã được gửi thành công! Vui lòng chờ phê duyệt từ bộ môn.')
          router.push('/teacher/topics')
        }
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

      {/* Mode Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Chọn cách tạo đề tài
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              mode === 'new'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-gray-100">Tạo đề tài mới</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tạo đề tài hoàn toàn mới cho giai đoạn 1 (ĐACN) hoặc giai đoạn 2 (LVTN)
            </p>
          </button>
          <button
            type="button"
            onClick={() => setMode('from_stage1')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              mode === 'from_stage1'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900 dark:text-gray-100">Tạo từ đề tài giai đoạn 1</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Chuyển đề tài đã hoàn thành giai đoạn 1 sang giai đoạn 2 (LVTN)
            </p>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        {/* Form cho mode 'from_stage1' */}
        {mode === 'from_stage1' ? (
          <>
            {/* Chọn đề tài giai đoạn 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chọn đề tài giai đoạn 1 <span className="text-red-600">*</span>
              </label>
              {loadingTopics ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader className="w-5 h-5 animate-spin" />
                  Đang tải danh sách đề tài...
                </div>
              ) : stage1Topics.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  Không có đề tài giai đoạn 1 nào. Vui lòng tạo đề tài mới trước.
                </p>
              ) : (
                <select
                  value={formData.selectedTopicCode}
                  onChange={(e) => setFormData({ ...formData, selectedTopicCode: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.selectedTopicCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">-- Chọn đề tài --</option>
                  {stage1Topics.map((item: any) => (
                    <option key={item.topic?.id} value={item.topic?.id}>
                      {item.topic?.title}
                    </option>
                  ))}
                </select>
              )}
              {errors.selectedTopicCode && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.selectedTopicCode}</p>
              )}
            </div>

            {/* Thời gian */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ngày bắt đầu <span className="text-red-600">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ngày kết thúc <span className="text-red-600">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sinh viên thực hiện
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStudent())}
                  placeholder="Nhập MSSV sinh viên"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Thêm
                </button>
              </div>
              {formData.studentCodes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.studentCodes.map((code) => (
                    <span key={code} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      {code}
                      <button type="button" onClick={() => handleRemoveStudent(code)} className="hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
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
        {/* chọn giá trị formData.maxStudent */}
        <div>
          <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Số lượng sinh viên tối đa
          </label>
          <input
            type="number"
            id="maxStudents"
            name="maxStudents"
            value={formData.maxStudents}
            onChange={handleChange}
            min={1}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Số lượng sinh viên tối đa có thể đăng ký đề tài này (mặc định 1)
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
              Ngày bắt đầu <span className="text-red-600">*</span>
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngày kết thúc <span className="text-red-600">*</span>
            </label>
            <input
              type="datetime-local"
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
          </>
        )}

        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            {mode === 'from_stage1' ? 'Lưu ý khi tạo đề tài giai đoạn 2' : 'Lưu ý khi gửi đề tài'}
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
            {mode === 'from_stage1' ? (
              <>
                <li>Đề tài sẽ được chuyển sang giai đoạn 2 (Luận văn tốt nghiệp)</li>
                <li>Thông tin đề tài sẽ được giữ nguyên từ giai đoạn 1</li>
                <li>Vui lòng nhập thời gian bắt đầu và kết thúc cho giai đoạn 2</li>
              </>
            ) : (
              <>
                <li>Đề tài sẽ được gửi đến bộ môn để xem xét và phê duyệt</li>
                <li>Tên đề tài phải rõ ràng, cụ thể và phản ánh đúng nội dung nghiên cứu</li>
                <li>Mô tả đề tài cần chi tiết về mục tiêu, phạm vi và phương pháp thực hiện</li>
                <li>Sử dụng nút "Dịch" để tự động dịch tên đề tài sang tiếng Anh</li>
                <li>Sau khi được phê duyệt, đề tài sẽ được hiển thị cho sinh viên đăng ký</li>
              </>
            )}
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
