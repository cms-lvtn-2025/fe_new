/**
 * GraphQL Response Parser
 * Type-safe parsers for GraphQL responses
 */

import type {
  GraphQLResponse,
  Query,
  SemesterListResponse,
  MajorListResponse,
  FacultyListResponse,
  StudentListResponse,
  TeacherListResponse,
  TopicListResponse,
  CouncilListResponse,
  EnrollmentListResponse,
  DefenceListResponse,
  TopicCouncilListResponse,
  Semester,
  Student,
  Teacher,
  Topic,
  Council,
  Enrollment,
} from '@/types/graphql'

// ============================================
// STUDENT PARSERS
// ============================================

export function parseStudentProfile(data: any): Student | null {
  return data?.student?.me || null
}

export function parseStudentEnrollments(data: any): EnrollmentListResponse {
  return {
    total: data?.student?.enrollments?.total || 0,
    data: data?.student?.enrollments?.data || [],
  }
}

export function parseStudentSemesters(data: any): Semester[] {
  return data?.student?.semesters || []
}

// ============================================
// TEACHER PARSERS
// ============================================

export function parseTeacherProfile(data: any): Teacher | null {
  return data?.teacher?.me || null
}

export function parseTeacherTopicCouncils(data: any): TopicCouncilListResponse {
  return {
    total: data?.teacher?.supervisor?.topicCouncils?.total || 0,
    data: data?.teacher?.supervisor?.topicCouncils?.data || [],
  }
}

export function parseTeacherDefences(data: any): DefenceListResponse {
  return {
    total: data?.teacher?.council?.defences?.total || 0,
    data: data?.teacher?.council?.defences?.data || [],
  }
}



// ============================================
// DEPARTMENT PARSERS
// ============================================

export function parseDepartmentTeachers(data: any): TeacherListResponse {
  return {
    total: data?.department?.teachers?.total || 0,
    data: data?.department?.teachers?.data || [],
  }
}

export function parseDepartmentStudents(data: any): StudentListResponse {
  return {
    total: data?.department?.students?.total || 0,
    data: data?.department?.students?.data || [],
  }
}

export function parseDepartmentTopics(data: any): TopicListResponse {
  return {
    total: data?.department?.topics?.total || 0,
    data: data?.department?.topics?.data || [],
  }
}

export function parseDepartmentTopicDetail(data: any): Topic | null {
  return data?.department?.topicDetail || null
}

export function parseDepartmentCouncils(data: any): CouncilListResponse {
  return {
    total: data?.department?.councils?.total || 0,
    data: data?.department?.councils?.data || [],
  }
}

export function parseDepartmentCouncilDetail(data: any): Council | null {
  return data?.department?.councilDetail || null
}

export function parseDepartmentSemesters(data: any): SemesterListResponse {
  return {
    total: data?.department?.semesters?.total || 0,
    data: data?.department?.semesters?.data || [],
  }
}

export function parseDepartmentMajors(data: any): MajorListResponse {
  return {
    total: data?.department?.majors?.total || 0,
    data: data?.department?.majors?.data || [],
  }
}

export function parseDepartmentFaculties(data: any): FacultyListResponse {
  return {
    total: data?.department?.faculties?.total || 0,
    data: data?.department?.faculties?.data || [],
  }
}

// ============================================
// AFFAIR (ADMIN) PARSERS
// ============================================

export function parseAffairTeachers(data: any): TeacherListResponse {
  return {
    total: data?.affair?.teachers?.total || 0,
    data: data?.affair?.teachers?.data || [],
  }
}

export function parseAffairTeacherDetail(data: any): Teacher | null {
  return data?.affair?.teacherDetail || null
}

export function parseAffairStudents(data: any): StudentListResponse {
  return {
    total: data?.affair?.students?.total || 0,
    data: data?.affair?.students?.data || [],
  }
}

export function parseAffairStudentDetail(data: any): Student | null {
  return data?.affair?.studentDetail || null
}

export function parseAffairSemesters(data: any): SemesterListResponse {
  return {
    total: data?.affair?.semesters?.total || 0,
    data: data?.affair?.semesters?.data || [],
  }
}

export function parseAffairMajors(data: any): MajorListResponse {
  return {
    total: data?.affair?.majors?.total || 0,
    data: data?.affair?.majors?.data || [],
  }
}

export function parseAffairFaculties(data: any): FacultyListResponse {
  return {
    total: data?.affair?.faculties?.total || 0,
    data: data?.affair?.faculties?.data || [],
  }
}

export function parseAffairTopics(data: any): TopicListResponse {
  return {
    total: data?.affair?.topics?.total || 0,
    data: data?.affair?.topics?.data || [],
  }
}

export function parseAffairTopicDetail(data: any): Topic | null {
  return data?.affair?.topicDetail || null
}

export function parseAffairCouncils(data: any): CouncilListResponse {
  return {
    total: data?.affair?.councils?.total || 0,
    data: data?.affair?.councils?.data || [],
  }
}

export function parseAffairCouncilDetail(data: any): Council | null {
  return data?.affair?.councilDetail || null
}

export function parseAffairEnrollments(data: any): EnrollmentListResponse {
  return {
    total: data?.affair?.enrollments?.total || 0,
    data: data?.affair?.enrollments?.data || [],
  }
}

export function parseAffairEnrollmentDetail(data: any): Enrollment | null {
  return data?.affair?.enrollmentDetail || null
}

// ============================================
// UTILITY PARSERS
// ============================================

/**
 * Safe parser that handles undefined/null data gracefully
 */
export function safeParser<T>(
  data: any,
  parser: (data: any) => T,
  defaultValue: T
): T {
  try {
    if (!data) return defaultValue
    return parser(data) || defaultValue
  } catch (error) {
    console.error('Parse error:', error)
    return defaultValue
  }
}

/**
 * Extract error messages from GraphQL response
 */
export function extractErrorMessages(response: GraphQLResponse): string[] {
  if (!response.errors || response.errors.length === 0) return []
  return response.errors.map((error) => error.message)
}

/**
 * Check if GraphQL response has errors
 */
export function hasErrors(response: GraphQLResponse): boolean {
  return !!response.errors && response.errors.length > 0
}
