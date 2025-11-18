"use client"

import { useQuery, useMutation, useLazyQuery } from "@apollo/client/react"
import {
  // Student queries
  GET_MY_PROFILE,
  GET_MY_ENROLLMENTS,
  GET_MY_ENROLLMENT_DETAIL,
  GET_MY_SEMESTERS,
  // Teacher queries
  GET_MY_TEACHER_PROFILE,
  GET_MY_SUPERVISED_TOPIC_COUNCILS,
  GET_MY_DEFENCES,
  GET_MY_GRADE_REVIEWS,
  // Academic Affairs queries
  GET_LIST_TEACHERS,
  GET_LIST_STUDENTS,
  GET_STUDENT_DETAIL,
  GET_TEACHER_DETAIL,
  GET_ALL_SEMESTERS,
  GET_ALL_MAJORS,
  GET_ALL_FACULTIES,
  GET_ALL_TOPICS,
  GET_TOPIC_DETAIL,
  GET_ALL_ENROLLMENTS,
  GET_ENROLLMENT_DETAIL,
  GET_ALL_COUNCILS,
  GET_COUNCIL_DETAIL,
  GET_DEFENCES_BY_COUNCIL,
  // Student mutations
  UPLOAD_MIDTERM_FILE,
  UPLOAD_FINAL_FILE,
  // Teacher mutations
  UPDATE_MY_TEACHER_PROFILE,
  GRADE_MIDTERM,
  GRADE_FINAL,
  CREATE_GRADE_DEFENCE,
  UPDATE_GRADE_DEFENCE,
  ADD_GRADE_DEFENCE_CRITERION,
  UPDATE_GRADE_REVIEW,
  // Academic Affairs mutations
  CREATE_TEACHER,
  UPDATE_TEACHER,
  DELETE_TEACHER,
  CREATE_STUDENT,
  UPDATE_STUDENT,
  DELETE_STUDENT,
  CREATE_SEMESTER,
  UPDATE_SEMESTER,
  DELETE_SEMESTER,
  CREATE_MAJOR,
  UPDATE_MAJOR,
  DELETE_MAJOR,
  CREATE_FACULTY,
  UPDATE_FACULTY,
  DELETE_FACULTY,
  APPROVE_COUNCIL,
  UPDATE_COUNCIL,
  DELETE_COUNCIL,
  APPROVE_TOPIC,
  REJECT_TOPIC,
  UPDATE_TOPIC,
  DELETE_TOPIC,
  // Department Lecturer queries
  GET_DEPARTMENT_TEACHERS,
  GET_DEPARTMENT_STUDENTS,
  GET_DEPARTMENT_TOPICS,
  GET_DEPARTMENT_TOPIC_DETAIL,
  GET_DEPARTMENT_ENROLLMENTS,
  GET_DEPARTMENT_ENROLLMENT_DETAIL,
  GET_DEPARTMENT_COUNCILS,
  GET_DEPARTMENT_COUNCIL_DETAIL,
  GET_DEPARTMENT_DEFENCES,
  GET_DEPARTMENT_GRADE_DEFENCES,
  GET_DEPARTMENT_DEFENCE_SCHEDULE,
  GET_DEPARTMENT_SEMESTERS,
  GET_DEPARTMENT_MAJORS,
  GET_DEPARTMENT_FACULTIES,
  // Department Lecturer mutations
  APPROVE_TOPIC_STAGE1,
  REJECT_TOPIC_STAGE1,
  ASSIGN_TOPIC_TO_COUNCIL,
  CREATE_COUNCIL,
  UPDATE_DEPARTMENT_COUNCIL,
  ADD_DEFENCE_TO_COUNCIL,
  REMOVE_DEFENCE_FROM_COUNCIL,
} from "./queries"

// ============================================
// STUDENT HOOKS
// ============================================

/**
 * Hook để lấy thông tin profile của sinh viên
 */
export function useMyProfile() {
  const { data, loading, error, refetch } = useQuery(GET_MY_PROFILE, {
    fetchPolicy: "cache-and-network",
  })

  return {
    profile: (data as any)?.getMyProfile,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách enrollments của sinh viên
 */
export function useMyEnrollments(search?: any) {
  const { data, loading, error, refetch } = useQuery(GET_MY_ENROLLMENTS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    enrollments: (data as any)?.getMyEnrollments?.data || [],
    total: (data as any)?.getMyEnrollments?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết enrollment
 */
export function useMyEnrollmentDetail(id: string | null) {
  const { data, loading, error, refetch } = useQuery(GET_MY_ENROLLMENT_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  })

  return {
    enrollment: (data as any)?.getMyEnrollmentDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách semesters của sinh viên
 */
export function useMySemesters(search?: any) {
  const { data, loading, error, refetch } = useQuery(GET_MY_SEMESTERS, {
    variables: {
      search: search || {
        pagination: { page: 1, pageSize: 100 },
        filters: [],
      },
    },
    fetchPolicy: "cache-and-network",
  })

  // Sort by createdAt descending (newest first)
  const semestersData = (data as any)?.getMySemesters?.data || []
  const semesters = [...semestersData].sort((a: any, b: any) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA // Newest first
  })

  return {
    semesters,
    total: (data as any)?.getMySemesters?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để upload file midterm
 */
export function useUploadMidtermFile() {
  const [uploadFile, { loading, error }] = useMutation(UPLOAD_MIDTERM_FILE, {
    refetchQueries: [{ query: GET_MY_ENROLLMENTS }],
  })

  return {
    uploadFile,
    loading,
    error,
  }
}

/**
 * Hook để upload file final
 */
export function useUploadFinalFile() {
  const [uploadFile, { loading, error }] = useMutation(UPLOAD_FINAL_FILE, {
    refetchQueries: [{ query: GET_MY_ENROLLMENTS }],
  })

  return {
    uploadFile,
    loading,
    error,
  }
}

// ============================================
// TEACHER HOOKS
// ============================================

/**
 * Hook để lấy thông tin profile của giáo viên
 */
export function useMyTeacherProfile() {
  const { data, loading, error, refetch } = useQuery(GET_MY_TEACHER_PROFILE, {
    fetchPolicy: "cache-and-network",
  })

  return {
    profile: (data as any)?.getMyTeacherProfile,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách topic councils mà giáo viên hướng dẫn
 */
export function useMySupervisedTopicCouncils(search?: any, options?: { skip?: boolean }) {
  const { data, loading, error, refetch } = useQuery(GET_MY_SUPERVISED_TOPIC_COUNCILS, {
    variables: { search },
    fetchPolicy: "network-only",
    skip: options?.skip || false,
  })

  return {
    topicCouncils: (data as any)?.getMySupervisedTopicCouncils?.data || [],
    total: (data as any)?.getMySupervisedTopicCouncils?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách defence assignments của giáo viên
 */
export function useMyDefences(search?: any, options?: { skip?: boolean }) {
  const { data, loading, error, refetch } = useQuery(GET_MY_DEFENCES, {
    variables: { search },
    fetchPolicy: "network-only",
    skip: options?.skip || false,
  })

  return {
    defences: (data as any)?.getMyDefences?.data || [],
    total: (data as any)?.getMyDefences?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách grade reviews của giáo viên
 */
export function useMyGradeReviews(search?: any, options?: { skip?: boolean }) {
  const { data, loading, error, refetch } = useQuery(GET_MY_GRADE_REVIEWS, {
    variables: { search },
    fetchPolicy: "network-only",
    skip: options?.skip || false,
  })

  return {
    gradeReviews: (data as any)?.getMyGradeReviews?.data || [],
    total: (data as any)?.getMyGradeReviews?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để cập nhật profile giáo viên
 */
export function useUpdateMyTeacherProfile() {
  const [updateProfile, { loading, error }] = useMutation(UPDATE_MY_TEACHER_PROFILE, {
    refetchQueries: [{ query: GET_MY_TEACHER_PROFILE }],
  })

  return {
    updateProfile,
    loading,
    error,
  }
}

/**
 * Hook để chấm điểm midterm
 */
export function useGradeMidterm() {
  const [gradeMidterm, { loading, error }] = useMutation(GRADE_MIDTERM, {
    refetchQueries: [{ query: GET_MY_SUPERVISED_TOPIC_COUNCILS }],
  })

  return {
    gradeMidterm,
    loading,
    error,
  }
}

/**
 * Hook để chấm điểm final
 */
export function useGradeFinal() {
  const [gradeFinal, { loading, error }] = useMutation(GRADE_FINAL, {
    refetchQueries: [{ query: GET_MY_SUPERVISED_TOPIC_COUNCILS }],
  })

  return {
    gradeFinal,
    loading,
    error,
  }
}

/**
 * Hook để tạo grade defence
 */
export function useCreateGradeDefence() {
  const [createGradeDefence, { loading, error }] = useMutation(CREATE_GRADE_DEFENCE, {
    refetchQueries: [{ query: GET_MY_DEFENCES }],
  })

  return {
    createGradeDefence,
    loading,
    error,
  }
}

/**
 * Hook để cập nhật grade defence
 */
export function useUpdateGradeDefence() {
  const [updateGradeDefence, { loading, error }] = useMutation(UPDATE_GRADE_DEFENCE, {
    refetchQueries: [{ query: GET_MY_DEFENCES }],
  })

  return {
    updateGradeDefence,
    loading,
    error,
  }
}

/**
 * Hook để thêm criterion vào grade defence
 */
export function useAddGradeDefenceCriterion() {
  const [addCriterion, { loading, error }] = useMutation(ADD_GRADE_DEFENCE_CRITERION, {
    refetchQueries: [{ query: GET_MY_DEFENCES }],
  })

  return {
    addCriterion,
    loading,
    error,
  }
}

/**
 * Hook để cập nhật grade review
 */
export function useUpdateGradeReview() {
  const [updateGradeReview, { loading, error }] = useMutation(UPDATE_GRADE_REVIEW, {
    refetchQueries: [{ query: GET_MY_GRADE_REVIEWS }],
  })

  return {
    updateGradeReview,
    loading,
    error,
  }
}

// ============================================
// ACADEMIC AFFAIRS HOOKS
// ============================================

/**
 * Hook để lấy danh sách giáo viên
 */
export function useListTeachers(search: any) {
  const { data, loading, error, refetch } = useQuery(GET_LIST_TEACHERS, {
    variables: { search },
    fetchPolicy: "network-only",
  })

  return {
    teachers: (data as any)?.getListTeachers?.data || [],
    total: (data as any)?.getListTeachers?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách sinh viên
 */
export function useListStudents(search: any) {
  const { data, loading, error, refetch } = useQuery(GET_LIST_STUDENTS, {
    variables: { search },
    fetchPolicy: "network-only",
  })

  return {
    students: (data as any)?.getListStudents?.data || [],
    total: (data as any)?.getListStudents?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết sinh viên
 */
export function useStudentDetail(id: string | null) {
  const { data, loading, error, refetch } = useQuery(GET_STUDENT_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  })

  return {
    student: (data as any)?.getStudentDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết giáo viên
 */
export function useTeacherDetail(id: string | null) {
  const { data, loading, error, refetch } = useQuery(GET_TEACHER_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  })

  return {
    teacher: (data as any)?.getTeacherDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách semesters
 */
export function useAllSemesters(search: any) {
  const { data, loading, error, refetch } = useQuery(GET_ALL_SEMESTERS, {
    variables: {
      search: search || {
        pagination: { page: 1, pageSize: 100 },
        filters: [],
      },
    },
    fetchPolicy: "cache-and-network",
  })

  // Sort by createdAt descending (newest first)
  const semestersData = (data as any)?.getAllSemesters?.data || []
  const semesters = [...semestersData].sort((a: any, b: any) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA // Newest first
  })

  return {
    semesters,
    total: (data as any)?.getAllSemesters?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách majors
 */
export function useAllMajors(search: any) {
  const { data, loading, error, refetch } = useQuery(GET_ALL_MAJORS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    majors: (data as any)?.getAllMajors?.data || [],
    total: (data as any)?.getAllMajors?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách faculties
 */
export function useAllFaculties(search: any) {
  const { data, loading, error, refetch } = useQuery(GET_ALL_FACULTIES, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    faculties: (data as any)?.getAllFaculties?.data || [],
    total: (data as any)?.getAllFaculties?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách topics
 */
export function useAllTopics(search: any) {
  const { data, loading, error, refetch } = useQuery(GET_ALL_TOPICS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    topics: (data as any)?.getAllTopics?.data || [],
    total: (data as any)?.getAllTopics?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết topic
 */
export function useTopicDetail(id: string | null) {
  const { data, loading, error, refetch } = useQuery(GET_TOPIC_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  })

  return {
    topic: (data as any)?.getTopicDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách enrollments
 */
export function useAllEnrollments(search: any) {
  const { data, loading, error, refetch } = useQuery(GET_ALL_ENROLLMENTS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    enrollments: (data as any)?.getAllEnrollments?.data || [],
    total: (data as any)?.getAllEnrollments?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết enrollment
 */
export function useEnrollmentDetail(id: string | null) {
  const { data, loading, error, refetch } = useQuery(GET_ENROLLMENT_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  })

  return {
    enrollment: (data as any)?.getEnrollmentDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách councils
 */
export function useAllCouncils(search: any) {
  const { data, loading, error, refetch } = useQuery(GET_ALL_COUNCILS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    councils: (data as any)?.getAllCouncils?.data || [],
    total: (data as any)?.getAllCouncils?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết council
 */
export function useCouncilDetail(id: string | null) {
  const { data, loading, error, refetch } = useQuery(GET_COUNCIL_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  })

  return {
    council: (data as any)?.getCouncilDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách defences theo council
 */
export function useDefencesByCouncil(councilId: string | null) {
  const { data, loading, error, refetch } = useQuery(GET_DEFENCES_BY_COUNCIL, {
    variables: { councilId },
    skip: !councilId,
    fetchPolicy: "cache-and-network",
  })

  return {
    defences: (data as any)?.getDefencesByCouncil?.data || [],
    total: (data as any)?.getDefencesByCouncil?.total || 0,
    loading,
    error,
    refetch,
  }
}

// ============================================
// ACADEMIC AFFAIRS MUTATIONS
// ============================================

export function useCreateTeacher() {
  const [createTeacher, { loading, error }] = useMutation(CREATE_TEACHER, {
    refetchQueries: [{ query: GET_LIST_TEACHERS }],
  })

  return { createTeacher, loading, error }
}

export function useUpdateTeacher() {
  const [updateTeacher, { loading, error }] = useMutation(UPDATE_TEACHER, {
    refetchQueries: [{ query: GET_LIST_TEACHERS }],
  })

  return { updateTeacher, loading, error }
}

export function useDeleteTeacher() {
  const [deleteTeacher, { loading, error }] = useMutation(DELETE_TEACHER, {
    refetchQueries: [{ query: GET_LIST_TEACHERS }],
  })

  return { deleteTeacher, loading, error }
}

export function useCreateStudent() {
  const [createStudent, { loading, error }] = useMutation(CREATE_STUDENT, {
    refetchQueries: [{ query: GET_LIST_STUDENTS }],
  })

  return { createStudent, loading, error }
}

export function useUpdateStudent() {
  const [updateStudent, { loading, error }] = useMutation(UPDATE_STUDENT, {
    refetchQueries: [{ query: GET_LIST_STUDENTS }],
  })

  return { updateStudent, loading, error }
}

export function useDeleteStudent() {
  const [deleteStudent, { loading, error }] = useMutation(DELETE_STUDENT, {
    refetchQueries: [{ query: GET_LIST_STUDENTS }],
  })

  return { deleteStudent, loading, error }
}

export function useCreateSemester() {
  const [createSemester, { loading, error }] = useMutation(CREATE_SEMESTER, {
    refetchQueries: [{ query: GET_ALL_SEMESTERS }],
  })

  return { createSemester, loading, error }
}

export function useUpdateSemester() {
  const [updateSemester, { loading, error }] = useMutation(UPDATE_SEMESTER, {
    refetchQueries: [{ query: GET_ALL_SEMESTERS }],
  })

  return { updateSemester, loading, error }
}

export function useDeleteSemester() {
  const [deleteSemester, { loading, error }] = useMutation(DELETE_SEMESTER, {
    refetchQueries: [{ query: GET_ALL_SEMESTERS }],
  })

  return { deleteSemester, loading, error }
}

export function useCreateMajor() {
  const [createMajor, { loading, error }] = useMutation(CREATE_MAJOR, {
    refetchQueries: [{ query: GET_ALL_MAJORS }],
  })

  return { createMajor, loading, error }
}

export function useUpdateMajor() {
  const [updateMajor, { loading, error }] = useMutation(UPDATE_MAJOR, {
    refetchQueries: [{ query: GET_ALL_MAJORS }],
  })

  return { updateMajor, loading, error }
}

export function useDeleteMajor() {
  const [deleteMajor, { loading, error }] = useMutation(DELETE_MAJOR, {
    refetchQueries: [{ query: GET_ALL_MAJORS }],
  })

  return { deleteMajor, loading, error }
}

export function useCreateFaculty() {
  const [createFaculty, { loading, error }] = useMutation(CREATE_FACULTY, {
    refetchQueries: [{ query: GET_ALL_FACULTIES }],
  })

  return { createFaculty, loading, error }
}

export function useUpdateFaculty() {
  const [updateFaculty, { loading, error }] = useMutation(UPDATE_FACULTY, {
    refetchQueries: [{ query: GET_ALL_FACULTIES }],
  })

  return { updateFaculty, loading, error }
}

export function useDeleteFaculty() {
  const [deleteFaculty, { loading, error }] = useMutation(DELETE_FACULTY, {
    refetchQueries: [{ query: GET_ALL_FACULTIES }],
  })

  return { deleteFaculty, loading, error }
}

export function useApproveCouncil() {
  const [approveCouncil, { loading, error }] = useMutation(APPROVE_COUNCIL, {
    refetchQueries: [{ query: GET_ALL_COUNCILS }],
  })

  return { approveCouncil, loading, error }
}

export function useUpdateCouncil() {
  const [updateCouncil, { loading, error }] = useMutation(UPDATE_COUNCIL, {
    refetchQueries: [{ query: GET_ALL_COUNCILS }],
  })

  return { updateCouncil, loading, error }
}

export function useDeleteCouncil() {
  const [deleteCouncil, { loading, error }] = useMutation(DELETE_COUNCIL, {
    refetchQueries: [{ query: GET_ALL_COUNCILS }],
  })

  return { deleteCouncil, loading, error }
}

export function useApproveTopic() {
  const [approveTopic, { loading, error }] = useMutation(APPROVE_TOPIC, {
    refetchQueries: [{ query: GET_ALL_TOPICS }],
  })

  return { approveTopic, loading, error }
}

export function useRejectTopic() {
  const [rejectTopic, { loading, error }] = useMutation(REJECT_TOPIC, {
    refetchQueries: [{ query: GET_ALL_TOPICS }],
  })

  return { rejectTopic, loading, error }
}

export function useUpdateTopic() {
  const [updateTopic, { loading, error }] = useMutation(UPDATE_TOPIC, {
    refetchQueries: [{ query: GET_ALL_TOPICS }, { query: GET_TOPIC_DETAIL }],
  })

  return { updateTopic, loading, error }
}

export function useDeleteTopic() {
  const [deleteTopic, { loading, error }] = useMutation(DELETE_TOPIC, {
    refetchQueries: [{ query: GET_ALL_TOPICS }],
  })

  return { deleteTopic, loading, error }
}

// ============================================
// DEPARTMENT LECTURER HOOKS
// ============================================

/**
 * Hook để lấy danh sách giáo viên của khoa
 */
export function useDepartmentTeachers(search?: any) {
  const { data, loading, error, refetch } = useQuery(GET_DEPARTMENT_TEACHERS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    teachers: (data as any)?.getDepartmentTeachers?.data || [],
    total: (data as any)?.getDepartmentTeachers?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách sinh viên của khoa
 */
export function useDepartmentStudents(search?: any) {
  const { data, loading, error, refetch } = useQuery(GET_DEPARTMENT_STUDENTS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    students: (data as any)?.getDepartmentStudents?.data || [],
    total: (data as any)?.getDepartmentStudents?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách đề tài của khoa
 */
export function useDepartmentTopics(search?: any) {
  const { data, loading, error, refetch } = useQuery(GET_DEPARTMENT_TOPICS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    topics: (data as any)?.getDepartmentTopics?.data || [],
    total: (data as any)?.getDepartmentTopics?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết đề tài của khoa
 */
export function useDepartmentTopicDetail(id: string) {
  const { data, loading, error, refetch } = useQuery(
    GET_DEPARTMENT_TOPIC_DETAIL,
    {
      variables: { id },
      fetchPolicy: "cache-and-network",
      skip: !id,
    }
  )

  return {
    topic: (data as any)?.getDepartmentTopicDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách enrollments của khoa
 */
export function useDepartmentEnrollments(search?: any) {
  const { data, loading, error, refetch } = useQuery(
    GET_DEPARTMENT_ENROLLMENTS,
    {
      variables: { search },
      fetchPolicy: "cache-and-network",
    }
  )

  return {
    enrollments: (data as any)?.getDepartmentEnrollments?.data || [],
    total: (data as any)?.getDepartmentEnrollments?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết enrollment của khoa
 */
export function useDepartmentEnrollmentDetail(id: string) {
  const { data, loading, error, refetch } = useQuery(
    GET_DEPARTMENT_ENROLLMENT_DETAIL,
    {
      variables: { id },
      fetchPolicy: "cache-and-network",
      skip: !id,
    }
  )

  return {
    enrollment: (data as any)?.getDepartmentEnrollmentDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách hội đồng của khoa
 */
export function useDepartmentCouncils(search?: any) {
  const { data, loading, error, refetch } = useQuery(GET_DEPARTMENT_COUNCILS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    councils: (data as any)?.getDepartmentCouncils?.data || [],
    total: (data as any)?.getDepartmentCouncils?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết hội đồng của khoa
 */
export function useDepartmentCouncilDetail(id: string) {
  const { data, loading, error, refetch } = useQuery(
    GET_DEPARTMENT_COUNCIL_DETAIL,
    {
      variables: { id },
      fetchPolicy: "cache-and-network",
      skip: !id,
    }
  )

  return {
    council: (data as any)?.getDepartmentCouncilDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách defences theo council
 */
export function useDepartmentDefences(councilId: string) {
  const { data, loading, error, refetch } = useQuery(GET_DEPARTMENT_DEFENCES, {
    variables: { councilId },
    fetchPolicy: "cache-and-network",
    skip: !councilId,
  })

  const defences = (data as any)?.getDepartmentDefences || []

  return {
    defences,
    total: defences.length,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách grade defences của khoa
 */
export function useDepartmentGradeDefences(search?: any) {
  const { data, loading, error, refetch } = useQuery(
    GET_DEPARTMENT_GRADE_DEFENCES,
    {
      variables: { search },
      fetchPolicy: "cache-and-network",
    }
  )

  const gradeDefences = (data as any)?.getDepartmentGradeDefences || []

  return {
    gradeDefences,
    total: gradeDefences.length,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy lịch bảo vệ của khoa (cho calendar)
 */
export function useDepartmentDefenceSchedule(search?: any) {
  const { data, loading, error, refetch } = useQuery(
    GET_DEPARTMENT_DEFENCE_SCHEDULE,
    {
      variables: { search },
      fetchPolicy: "cache-and-network",
    }
  )

  return {
    councils: (data as any)?.getDepartmentCouncils?.data || [],
    total: (data as any)?.getDepartmentCouncils?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách semesters của khoa
 */
export function useDepartmentSemesters(search?: any) {
  const { data, loading, error, refetch } = useQuery(
    GET_DEPARTMENT_SEMESTERS,
    {
      variables: { search },
      fetchPolicy: "cache-and-network",
    }
  )

  const semesters = (data as any)?.getDepartmentSemesters || []

  return {
    semesters,
    total: semesters.length,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách majors của khoa
 */
export function useDepartmentMajors(search?: any) {
  const { data, loading, error, refetch } = useQuery(GET_DEPARTMENT_MAJORS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  const majors = (data as any)?.getDepartmentMajors || []

  return {
    majors,
    total: majors.length,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách faculties
 */
export function useDepartmentFaculties(search?: any) {
  const { data, loading, error, refetch } = useQuery(
    GET_DEPARTMENT_FACULTIES,
    {
      variables: { search },
      fetchPolicy: "cache-and-network",
    }
  )

  const faculties = (data as any)?.getDepartmentFaculties || []

  return {
    faculties,
    total: faculties.length,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để duyệt đề tài (Stage 1)
 */
export function useApproveTopicStage1() {
  const [approveTopicStage1, { loading, error }] = useMutation(
    APPROVE_TOPIC_STAGE1,
    {
      refetchQueries: [{ query: GET_DEPARTMENT_TOPICS }],
    }
  )

  return { approveTopicStage1, loading, error }
}

/**
 * Hook để từ chối đề tài (Stage 1)
 */
export function useRejectTopicStage1() {
  const [rejectTopicStage1, { loading, error }] = useMutation(
    REJECT_TOPIC_STAGE1,
    {
      refetchQueries: [{ query: GET_DEPARTMENT_TOPICS }],
    }
  )

  return { rejectTopicStage1, loading, error }
}

/**
 * Hook để gán đề tài vào hội đồng
 */
export function useAssignTopicToCouncil() {
  const [assignTopicToCouncil, { loading, error }] = useMutation(
    ASSIGN_TOPIC_TO_COUNCIL,
    {
      refetchQueries: [
        { query: GET_DEPARTMENT_TOPICS },
        { query: GET_DEPARTMENT_COUNCILS },
      ],
    }
  )

  return { assignTopicToCouncil, loading, error }
}

/**
 * Hook để tạo hội đồng
 */
export function useCreateCouncil() {
  const [createCouncil, { loading, error }] = useMutation(CREATE_COUNCIL, {
    refetchQueries: [{ query: GET_DEPARTMENT_COUNCILS }],
  })

  return { createCouncil, loading, error }
}

/**
 * Hook để cập nhật hội đồng của khoa
 */
export function useUpdateDepartmentCouncil() {
  const [updateDepartmentCouncil, { loading, error }] = useMutation(
    UPDATE_DEPARTMENT_COUNCIL,
    {
      refetchQueries: [{ query: GET_DEPARTMENT_COUNCILS }],
    }
  )

  return { updateDepartmentCouncil, loading, error }
}

/**
 * Hook để thêm thành viên vào hội đồng
 */
export function useAddDefenceToCouncil() {
  const [addDefenceToCouncil, { loading, error }] = useMutation(
    ADD_DEFENCE_TO_COUNCIL,
    {
      refetchQueries: [
        { query: GET_DEPARTMENT_COUNCILS },
        { query: GET_DEPARTMENT_COUNCIL_DETAIL },
      ],
    }
  )

  return { addDefenceToCouncil, loading, error }
}

/**
 * Hook để xóa thành viên khỏi hội đồng
 */
export function useRemoveDefenceFromCouncil() {
  const [removeDefenceFromCouncil, { loading, error }] = useMutation(
    REMOVE_DEFENCE_FROM_COUNCIL,
    {
      refetchQueries: [
        { query: GET_DEPARTMENT_COUNCILS },
        { query: GET_DEPARTMENT_COUNCIL_DETAIL },
      ],
    }
  )

  return { removeDefenceFromCouncil, loading, error }
}
