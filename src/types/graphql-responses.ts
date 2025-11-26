/**
 * GraphQL Response Type Definitions
 *
 * This file contains TypeScript interfaces for all GraphQL query responses.
 * Organized by role/namespace (admin, department, teacher, student)
 *
 * Naming Convention:
 * - List types: Minimal fields for table display
 * - Detail types: Complete fields for detail pages
 * - Suffix: ListItem vs DetailItem
 */

// ============================================================================
// ADMIN (AFFAIR) NAMESPACE
// ============================================================================

// --------------------- Users (Students & Teachers) ---------------------

export interface StudentListItem {
  id: string
  email: string
  username: string
  phone?: string
  majorCode: string
  classCode: string
}

export interface StudentDetail extends StudentListItem {
  mssv?: string
  gender: string
  semesterCode: string
  createdAt: string
  updatedAt: string
  enrollments?: EnrollmentListItem[]
}

export interface TeacherListItem {
  id: string
  email: string
  username: string
  gender: string
  majorCode: string
}

export interface TeacherDetail extends TeacherListItem {
  msgv?: string
  semesterCode: string
  createdAt: string
  updatedAt: string
  roles?: RoleItem[]
}

export interface RoleItem {
  id: string
  title: string
  role: string
  semesterCode: string
  activate: boolean
}

// --------------------- Topics ---------------------

export interface TopicListItem {
  id: string
  title: string
  status: string
  topicCouncils?: TopicCouncilMinimal[]  // Only for displaying supervisors and stage
}

export interface TopicCouncilMinimal {
  id: string
  stage: string
  supervisors?: SupervisorMinimal[]
}

export interface SupervisorMinimal {
  id: string
  teacherSupervisorCode: string
  teacher: {
    id: string
    username: string
  }
}

export interface TopicDetail {
  id: string
  title: string
  majorCode: string
  semesterCode: string
  status: string
  percentStage1: number
  percentStage2: number
  createdAt: string
  updatedAt: string
  files?: FileItem[]
  topicCouncils?: TopicCouncilDetail[]
}

export interface FileItem {
  id: string
  title: string
  file: string
  status: string
  table?: string
  option?: string
  tableId?: string
}

export interface TopicCouncilDetail {
  id: string
  title: string
  stage: string
  topicCode: string
  councilCode: string
  timeStart: string
  timeEnd: string
  enrollments?: EnrollmentWithGrades[]
  supervisors?: SupervisorDetail[]
}

export interface SupervisorDetail {
  id: string
  teacherSupervisorCode: string
  teacher: {
    id: string
    email: string
    username: string
  }
}

// --------------------- Councils ---------------------

export interface CouncilListItem {
  id: string
  title: string
  majorCode: string
  semesterCode: string
  timeStart: string
  defences?: DefenceMinimal[]
  topicCouncils?: TopicCouncilMinimal[]
}

export interface DefenceMinimal {
  id: string
  position: string
  teacher: {
    id: string
    username: string
  }
}

export interface CouncilDetail {
  id: string
  title: string
  majorCode: string
  semesterCode: string
  timeStart: string
  createdAt: string
  updatedAt: string
  defences?: DefenceDetail[]
  topicCouncils?: TopicCouncilWithEnrollments[]
}

export interface DefenceDetail {
  id: string
  title: string
  teacherCode: string
  position: string
  teacher: {
    id: string
    email: string
    username: string
    gender: string
  }
  gradeDefences?: GradeDefenceItem[]
}

export interface TopicCouncilWithEnrollments {
  id: string
  title: string
  stage: string
  topicCode: string
  timeStart: string
  timeEnd: string
  topic: {
    id: string
    title: string
    status: string
  }
  enrollments?: EnrollmentWithGrades[]
  supervisors?: SupervisorDetail[]
}

// --------------------- Enrollments ---------------------

export interface EnrollmentListItem {
  id: string
  title: string
  studentCode: string
  topicCouncilCode: string
  student: {
    id: string
    username: string
    email: string
    classCode: string
  }
  topicCouncil: {
    id: string
    title: string
    stage: string
  }
  midterm?: GradeMinimal
  final?: GradeMinimal
}

export interface GradeMinimal {
  id: string
  grade?: number
  finalGrade?: number
  status: string
}

export interface EnrollmentDetail {
  id: string
  title: string
  studentCode: string
  topicCouncilCode: string
  finalCode?: string
  gradeReviewCode?: string
  midtermCode?: string
  createdAt: string
  updatedAt: string
  student: {
    id: string
    email: string
    username: string
    gender: string
    majorCode: string
    classCode: string
  }
  topicCouncil: {
    id: string
    title: string
    stage: string
    topicCode: string
    councilCode: string
    timeStart: string
    timeEnd: string
    topic: {
      id: string
      title: string
      status: string
    }
  }
  midterm?: MidtermGrade
  final?: FinalGrade
  gradeReview?: GradeReview
  gradeDefences?: GradeDefenceItem[]
}

export interface EnrollmentWithGrades {
  id: string
  title: string
  studentCode: string
  student: {
    id: string
    username: string
    email: string
  }
  midterm?: MidtermGrade
  final?: FinalGrade
  gradeReview?: GradeReview
  gradeDefences?: GradeDefenceItem[]
}

export interface MidtermGrade {
  id: string
  title: string
  grade: number
  status: string
  feedback?: string
}

export interface FinalGrade {
  id: string
  title: string
  supervisorGrade: number
  departmentGrade: number
  finalGrade: number
  status: string
  notes?: string
}

export interface GradeReview {
  id: string
  title: string
  reviewGrade: number
  status: string
  notes?: string
}

export interface GradeDefenceItem {
  id: string
  totalScore: number
  note?: string
  defence: {
    id: string
    position: string
    teacher: {
      id: string
      username: string
      email: string
    }
  }
  criteria?: CriteriaItem[]
}

export interface CriteriaItem {
  id: string
  name: string
  score: number
  maxScore: number
}

// --------------------- Academic (Semesters, Majors, Faculties) ---------------------

export interface SemesterItem {
  id: string
  title: string
  createdAt?: string
  updatedAt?: string
}

export interface MajorItem {
  id: string
  title: string
  facultyCode: string
  createdAt?: string
  updatedAt?: string
}

export interface FacultyItem {
  id: string
  title: string
  createdAt?: string
  updatedAt?: string
}

// ============================================================================
// DEPARTMENT NAMESPACE
// ============================================================================

export interface DepartmentTopicListItem {
  id: string
  title: string
  majorCode: string
  semesterCode: string
  status: string
}

export interface DepartmentTopicDetail extends DepartmentTopicListItem {
  percentStage1: number
  percentStage2: number
  createdAt: string
  updatedAt: string
  major?: {
    id: string
    title: string
    facultyCode: string
  }
  semester?: {
    id: string
    title: string
  }
  topicCouncils?: TopicCouncilMinimal[]
}

export interface DepartmentCouncilListItem {
  id: string
  title: string
  majorCode: string
  semesterCode: string
  timeStart: string
  defences?: DefenceMinimal[]
  topicCouncils?: TopicCouncilMinimal[]
}

export interface DepartmentCouncilDetail extends DepartmentCouncilListItem {
  createdAt: string
  updatedAt: string
  defences?: DefenceDetail[]
  topicCouncils?: TopicCouncilWithEnrollments[]
}

export interface DepartmentStudentListItem {
  id: string
  email: string
  username: string
  majorCode: string
  classCode: string
}

export interface DepartmentStudentDetail extends DepartmentStudentListItem {
  gender: string
  semesterCode: string
  phone?: string
  createdAt: string
  updatedAt: string
  enrollments?: EnrollmentListItem[]
}

export interface DepartmentTeacherListItem {
  id: string
  email: string
  username: string
  majorCode: string
}

export interface DepartmentTeacherDetail extends DepartmentTeacherListItem {
  gender: string
  semesterCode: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// TEACHER NAMESPACE
// ============================================================================

// Teacher as Supervisor
export interface TeacherSupervisedTopicCouncilListItem {
  id: string
  title: string
  stage: string
  topicCode: string
  councilCode: string
  timeStart: string
  timeEnd: string
  topic: {
    id: string
    title: string
    status: string
  }
  enrollments?: {
    id: string
    studentCode: string
    student: {
      id: string
      username: string
      email: string
    }
  }[]
}

export interface TeacherSupervisedTopicCouncilDetail extends TeacherSupervisedTopicCouncilListItem {
  topic: {
    id: string
    title: string
    majorCode: string
    semesterCode: string
    status: string
    percentStage1: number
    percentStage2: number
  }
  enrollments?: EnrollmentWithGrades[]
  supervisors?: SupervisorDetail[]
}

// Teacher as Council Member
export interface TeacherCouncilListItem {
  id: string
  title: string
  majorCode: string
  semesterCode: string
  timeStart: string
  defences?: {
    id: string
    position: string
  }[]
  topicCouncils?: TopicCouncilMinimal[]
}

export interface TeacherCouncilDetail extends TeacherCouncilListItem {
  createdAt: string
  updatedAt: string
  defences?: DefenceDetail[]
  topicCouncils?: TopicCouncilWithEnrollments[]
}

export interface TeacherDefenceListItem {
  id: string
  title: string
  councilCode: string
  position: string
  council: {
    id: string
    title: string
    timeStart: string
  }
}

export interface TeacherDefenceDetail extends TeacherDefenceListItem {
  teacherCode: string
  createdAt: string
  updatedAt: string
  council: {
    id: string
    title: string
    majorCode: string
    semesterCode: string
    timeStart: string
  }
  teacher: {
    id: string
    email: string
    username: string
    gender: string
  }
  gradeDefences?: GradeDefenceItem[]
}

// ============================================================================
// STUDENT NAMESPACE
// ============================================================================

export interface StudentEnrollmentListItem {
  id: string
  title: string
  studentCode: string
  topicCouncilCode: string
  topicCouncil: {
    id: string
    title: string
    stage: string
    topic: {
      id: string
      title: string
      status: string
    }
    supervisors?: {
      id: string
      teacher: {
        id: string
        username: string
      }
    }[]
  }
  midterm?: GradeMinimal
  final?: GradeMinimal
}

export interface StudentEnrollmentDetail {
  id: string
  title: string
  studentCode: string
  topicCouncilCode: string
  finalCode?: string
  gradeReviewCode?: string
  midtermCode?: string
  createdAt: string
  updatedAt: string
  topicCouncil: {
    id: string
    title: string
    stage: string
    topicCode: string
    councilCode: string
    timeStart: string
    timeEnd: string
    topic: {
      id: string
      title: string
      majorCode: string
      semesterCode: string
      status: string
      percentStage1: number
      percentStage2: number
      major?: {
        id: string
        title: string
        facultyCode: string
      }
      semester?: {
        id: string
        title: string
      }
    }
    supervisors?: SupervisorDetail[]
    council?: {
      id: string
      title: string
      majorCode: string
      semesterCode: string
      timeStart: string
      defences?: DefenceDetail[]
    }
  }
  midterm?: MidtermGrade
  final?: FinalGrade
  gradeReview?: GradeReview
  gradeDefences?: GradeDefenceItem[]
}

// ============================================================================
// COMMON RESPONSE WRAPPERS
// ============================================================================

export interface PaginatedResponse<T> {
  total: number
  data: T[]
}

export interface AffairResponse<T> {
  affair: T
}

export interface DepartmentResponse<T> {
  department: T
}

export interface TeacherResponse<T> {
  teacher: T
}

export interface StudentResponse<T> {
  student: T
}
