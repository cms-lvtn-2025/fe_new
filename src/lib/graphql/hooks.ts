"use client"

import { useQuery, useMutation, useLazyQuery } from "@apollo/client/react"
import type {
  Student,
  Teacher,
  Semester,
  Major,
  Faculty,
  Topic,
  Council,
  Enrollment,
  Defence,
  TopicCouncil,
  SearchRequestInput,
  StudentQuery,
  TeacherQuery,
  DepartmentQuery,
  AffairQuery,
} from "@/types/graphql"
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
  UPDATE_GRADE_DEFENCE_CRITERION,
  DELETE_GRADE_DEFENCE_CRITERION,
  CREATE_TOPIC_FOR_SUPERVISOR,
  CREATE_TOPIC_COUNCIL_FOR_SUPERVISOR,
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
  GET_DEPARTMENT_COUNCILS,
  GET_DEPARTMENT_COUNCIL_DETAIL,
  GET_DEPARTMENT_DEFENCES,
  GET_DEPARTMENT_GRADE_DEFENCES,
  GET_DEPARTMENT_DEFENCE_SCHEDULE,
  GET_DEPARTMENT_SEMESTERS,
  GET_DEPARTMENT_MAJORS,
  GET_DEPARTMENT_FACULTIES,
} from "./queries"

// Department Lecturer mutations - imported separately
import {
  APPROVE_TOPIC_STAGE1,
  REJECT_TOPIC_STAGE1,
  ASSIGN_TOPIC_TO_COUNCIL,
  CREATE_COUNCIL,
  UPDATE_DEPARTMENT_COUNCIL,
  ADD_DEFENCE_TO_COUNCIL,
  REMOVE_DEFENCE_FROM_COUNCIL,
  REMOVE_TOPIC_FROM_COUNCIL,
} from "./mutations/department"

// ============================================
// STUDENT HOOKS
// ============================================

/**
 * Hook để lấy thông tin profile của sinh viên
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export function useMyProfile() {
  const { data, loading, error, refetch } = useQuery<{ student: StudentQuery }>(GET_MY_PROFILE, {
    fetchPolicy: "cache-and-network",
  })

  return {
    profile: data?.student?.me,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách enrollments của sinh viên
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export function useMyEnrollments(search?: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ student: StudentQuery }>(GET_MY_ENROLLMENTS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    enrollments: data?.student?.enrollments?.data || [],
    total: data?.student?.enrollments?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết enrollment
 * Updated for Backend Schema v2 - Uses enrollments query with filter
 */
export function useMyEnrollmentDetail(id: string | null) {
  const { data, loading, error, refetch } = useQuery<{ student: StudentQuery }>(GET_MY_ENROLLMENT_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  })

  return {
    enrollment: data?.student?.enrollments?.data?.[0],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách semesters của sinh viên
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export function useMySemesters(search?: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ student: StudentQuery }>(GET_MY_SEMESTERS, {
    variables: {
      search: search || {
        pagination: { page: 1, pageSize: 100 },
        filters: [],
      },
    },
    fetchPolicy: "cache-and-network",
  })

  // Sort by createdAt descending (newest first)
  const semestersData = data?.student?.semesters?.data || []
  const semesters = [...semestersData].sort((a: Semester, b: Semester) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA // Newest first
  })

  return {
    semesters,
    total: data?.student?.semesters?.total || 0,
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
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export function useMyTeacherProfile() {
  const { data, loading, error, refetch } = useQuery<{ teacher: TeacherQuery }>(GET_MY_TEACHER_PROFILE, {
    fetchPolicy: "cache-and-network",
  })

  return {
    profile: data?.teacher?.me,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách topic councils mà giáo viên hướng dẫn
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export function useMySupervisedTopicCouncils(search?: SearchRequestInput, options?: { skip?: boolean }) {
  const { data, loading, error, refetch } = useQuery<{ teacher: TeacherQuery }>(GET_MY_SUPERVISED_TOPIC_COUNCILS, {
    variables: { search },
    fetchPolicy: "network-only",
    skip: options?.skip || false,
  })
  // topicCouncil get if exists stage_2 duplicate topic_code => only get stage_2 else get stage_1
  const topicCouncilsData = data?.teacher?.supervisor?.topicCouncils?.data || []
  const filteredTopicCouncils = topicCouncilsData.filter((topicCouncil, index, self) => {
    if (topicCouncil.stage === "STAGE_2") {
      return true
    }
    // Check if there is a duplicate with stage_2
    const hasStage2Duplicate = self.some(
      (tc) => tc.topicCode === topicCouncil.topicCode && tc.stage === "STAGE_2"
    )
    return !hasStage2Duplicate
  })

  return {
    topicCouncils: filteredTopicCouncils,
    total: filteredTopicCouncils.length,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách defence assignments của giáo viên
 * Updated for Backend Schema v2 - Namespace-based approach
 */
export function useMyDefences(search?: SearchRequestInput, options?: { skip?: boolean }) {
  const { data, loading, error, refetch } = useQuery<{ teacher: TeacherQuery }>(GET_MY_DEFENCES, {
    variables: { search },
    fetchPolicy: "network-only",
    skip: options?.skip || false,
  })

  return {
    defences: data?.teacher?.council?.defences?.data || [],
    total: data?.teacher?.council?.defences?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách grade reviews của giáo viên
 * Updated for Backend Schema v2 - Namespace-based approach
 */

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
 * Hook để cập nhật criterion của grade defence
 */
export function useUpdateGradeDefenceCriterion() {
  const [updateCriterion, { loading, error }] = useMutation(UPDATE_GRADE_DEFENCE_CRITERION, {
    refetchQueries: [{ query: GET_MY_DEFENCES }],
  })

  return {
    updateCriterion,
    loading,
    error,
  }
}

/**
 * Hook để xóa criterion của grade defence
 */
export function useDeleteGradeDefenceCriterion() {
  const [deleteCriterion, { loading, error }] = useMutation(DELETE_GRADE_DEFENCE_CRITERION, {
    refetchQueries: [{ query: GET_MY_DEFENCES }],
  })

  return {
    deleteCriterion,
    loading,
    error,
  }
}

/**
 * Hook để cập nhật grade review
 */

/**
 * Hook để tạo/gửi đề tài mới (cho supervisor)
 * Updated for Backend Schema v2
 */
export function useCreateTopic() {
  const [createTopic, { loading, error }] = useMutation(CREATE_TOPIC_FOR_SUPERVISOR, {
    refetchQueries: [{ query: GET_MY_SUPERVISED_TOPIC_COUNCILS }],
  })

  return {
    createTopic,
    loading,
    error,
  }
}

/**
 * Hook để tạo topic council cho supervisor
 * Updated for Backend Schema v2
 */
export function useCreateTopicCouncil() {
  const [createTopicCouncil, { loading, error }] = useMutation(CREATE_TOPIC_COUNCIL_FOR_SUPERVISOR, {
    refetchQueries: [{ query: GET_MY_SUPERVISED_TOPIC_COUNCILS }],
  })

  return {
    createTopicCouncil,
    loading,
    error,
  }
}

// ============================================
// ACADEMIC AFFAIRS HOOKS
// ============================================

/**
 * Hook để lấy danh sách giáo viên
 * Updated for Backend Schema v2
 */
export function useListTeachers(search: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_LIST_TEACHERS, {
    variables: { search },
    fetchPolicy: "network-only",
  })

  return {
    teachers: data?.affair?.teachers?.data || [],
    total: data?.affair?.teachers?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách sinh viên
 * Updated for Backend Schema v2
 */
export function useListStudents(search: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_LIST_STUDENTS, {
    variables: { search },
    fetchPolicy: "network-only",
  })

  return {
    students: data?.affair?.students?.data || [],
    total: data?.affair?.students?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết sinh viên
 * Updated for Backend Schema v2
 */
export function useStudentDetail(id: string | null) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_STUDENT_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  })

  return {
    student: data?.affair?.studentDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết giáo viên
 * Updated for Backend Schema v2
 */
export function useTeacherDetail(id: string | null) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_TEACHER_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  })

  return {
    teacher: data?.affair?.teacherDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách semesters
 * Updated for Backend Schema v2
 */
export function useAllSemesters(search: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_ALL_SEMESTERS, {
    variables: {
      search: search || {
        pagination: { page: 1, pageSize: 100 },
        filters: [],
      },
    },
    fetchPolicy: "cache-and-network",
  })

  // Sort by createdAt descending (newest first)
  const semestersData = data?.affair?.semesters?.data || []
  const semesters = [...semestersData].sort((a: Semester, b: Semester) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA // Newest first
  })

  return {
    semesters,
    total: data?.affair?.semesters?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách majors
 * Updated for Backend Schema v2
 */
export function useAllMajors(search: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_ALL_MAJORS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    majors: data?.affair?.majors?.data || [],
    total: data?.affair?.majors?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách faculties
 * Updated for Backend Schema v2
 */
export function useAllFaculties(search: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_ALL_FACULTIES, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    faculties: data?.affair?.faculties?.data || [],
    total: data?.affair?.faculties?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách topics
 * Updated for Backend Schema v2
 */
export function useAllTopics(search: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_ALL_TOPICS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    topics: data?.affair?.topics?.data || [],
    total: data?.affair?.topics?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết topic
 * Updated for Backend Schema v2
 */
export function useTopicDetail(id: string | null) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_TOPIC_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  })

  return {
    topic: data?.affair?.topicDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách enrollments
 * Updated for Backend Schema v2
 */
export function useAllEnrollments(search: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_ALL_ENROLLMENTS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    enrollments: data?.affair?.enrollments?.data || [],
    total: data?.affair?.enrollments?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết enrollment
 * Updated for Backend Schema v2
 */
export function useEnrollmentDetail(id: string | null) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_ENROLLMENT_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  })

  return {
    enrollment: data?.affair?.enrollmentDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách councils
 * Updated for Backend Schema v2
 */
export function useAllCouncils(search: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_ALL_COUNCILS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    councils: data?.affair?.councils?.data || [],
    total: data?.affair?.councils?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết council
 * Updated for Backend Schema v2
 */
export function useCouncilDetail(id: string | null) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_COUNCIL_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  })

  return {
    council: data?.affair?.councilDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách defences theo council
 * Updated for Backend Schema v2
 */
export function useDefencesByCouncil(councilId: string | null) {
  const { data, loading, error, refetch } = useQuery<{ affair: AffairQuery }>(GET_DEFENCES_BY_COUNCIL, {
    variables: { councilId },
    skip: !councilId,
    fetchPolicy: "cache-and-network",
  })

  return {
    defences: data?.affair?.defencesByCouncil?.data || [],
    total: data?.affair?.defencesByCouncil?.total || 0,
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
 * Updated for Backend Schema v2
 */
export function useDepartmentTeachers(search?: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ department: DepartmentQuery }>(GET_DEPARTMENT_TEACHERS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    teachers: data?.department?.teachers?.data || [],
    total: data?.department?.teachers?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách sinh viên của khoa
 * Updated for Backend Schema v2
 */
export function useDepartmentStudents(search?: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ department: DepartmentQuery }>(GET_DEPARTMENT_STUDENTS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    students: data?.department?.students?.data || [],
    total: data?.department?.students?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách đề tài của khoa
 * Updated for Backend Schema v2
 */
export function useDepartmentTopics(search?: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ department: DepartmentQuery }>(GET_DEPARTMENT_TOPICS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    topics: data?.department?.topics?.data || [],
    total: data?.department?.topics?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết đề tài của khoa
 * Updated for Backend Schema v2
 */
export function useDepartmentTopicDetail(id: string) {
  const { data, loading, error, refetch } = useQuery<{ department: DepartmentQuery }>(
    GET_DEPARTMENT_TOPIC_DETAIL,
    {
      variables: { id },
      fetchPolicy: "cache-and-network",
      skip: !id,
    }
  )

  return {
    topic: data?.department?.topicDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách hội đồng của khoa
 * Updated for Backend Schema v2
 */
export function useDepartmentCouncils(search?: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ department: DepartmentQuery }>(GET_DEPARTMENT_COUNCILS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  return {
    councils: data?.department?.councils?.data || [],
    total: data?.department?.councils?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy chi tiết hội đồng của khoa
 * Updated for Backend Schema v2
 */
export function useDepartmentCouncilDetail(id: string) {
  const { data, loading, error, refetch } = useQuery<{ department: DepartmentQuery }>(
    GET_DEPARTMENT_COUNCIL_DETAIL,
    {
      variables: { id },
      fetchPolicy: "cache-and-network",
      skip: !id,
    }
  )

  return {
    council: data?.department?.councilDetail,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách defences theo council
 * Updated for Backend Schema v2
 */
export function useDepartmentDefences(councilId: string) {
  const { data, loading, error, refetch } = useQuery<{ department: DepartmentQuery }>(GET_DEPARTMENT_DEFENCES, {
    variables: { councilId },
    fetchPolicy: "cache-and-network",
    skip: !councilId,
  })

  const defences = data?.department?.defencesByCouncil || []

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
 * Updated for Backend Schema v2
 */
export function useDepartmentGradeDefences(search?: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ department: DepartmentQuery }>(
    GET_DEPARTMENT_GRADE_DEFENCES,
    {
      variables: { search },
      fetchPolicy: "cache-and-network",
    }
  )

  const gradeDefences = data?.department?.gradeDefences || []

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
 * Updated for Backend Schema v2
 */
export function useDepartmentDefenceSchedule(search?: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ department: DepartmentQuery }>(
    GET_DEPARTMENT_DEFENCE_SCHEDULE,
    {
      variables: { search },
      fetchPolicy: "cache-and-network",
    }
  )

  return {
    councils: data?.department?.councils?.data || [],
    total: data?.department?.councils?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách semesters của khoa
 * Updated for Backend Schema v2
 */
export function useDepartmentSemesters(search?: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ department: DepartmentQuery }>(
    GET_DEPARTMENT_SEMESTERS,
    {
      variables: { search },
      fetchPolicy: "cache-and-network",
    }
  )

  return {
    semesters: data?.department?.semesters?.data || [],
    total: data?.department?.semesters?.total || 0,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách majors của khoa
 * Updated for Backend Schema v2
 */
export function useDepartmentMajors(search?: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ department: DepartmentQuery }>(GET_DEPARTMENT_MAJORS, {
    variables: { search },
    fetchPolicy: "cache-and-network",
  })

  const majors = data?.department?.majors?.data || []
  const total = data?.department?.majors?.total || 0

  return {
    majors,
    total,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook để lấy danh sách faculties
 * Updated for Backend Schema v2
 */
export function useDepartmentFaculties(search?: SearchRequestInput) {
  const { data, loading, error, refetch } = useQuery<{ department: DepartmentQuery }>(
    GET_DEPARTMENT_FACULTIES,
    {
      variables: { search },
      fetchPolicy: "cache-and-network",
    }
  )

  return {
    faculties: data?.department?.faculties?.data || [],
    total: data?.department?.faculties?.total || 0,
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
