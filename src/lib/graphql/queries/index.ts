/**
 * GraphQL Queries - Centralized Export
 *
 * Tổ chức queries theo modules:
 * - student.queries.ts: Queries liên quan đến sinh viên
 * - teacher.queries.ts: Queries liên quan đến giáo viên
 * - admin.queries.ts: Queries liên quan đến quản trị/giáo vụ
 * - department-lecturer/: Queries liên quan đến giáo viên bộ môn
 */

// Student Queries
export {
  GET_MY_PROFILE,
  GET_MY_ENROLLMENTS,
  GET_MY_ENROLLMENT_DETAIL,
  GET_MY_SEMESTERS,
} from './student.queries'

// Teacher Queries
export {
  GET_MY_TEACHER_PROFILE,
  GET_MY_SUPERVISED_TOPIC_COUNCILS,
  GET_MY_DEFENCES,
  GET_MY_GRADE_REVIEWS,
} from './teacher.queries'

// Admin Queries
export {
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
} from './admin.queries'

// Department Lecturer Queries
export {
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
} from './department-lecturer'

// Department Lecturer Mutations
export {
  APPROVE_TOPIC_STAGE1,
  REJECT_TOPIC_STAGE1,
  ASSIGN_TOPIC_TO_COUNCIL,
  CREATE_COUNCIL,
  UPDATE_DEPARTMENT_COUNCIL,
  ADD_DEFENCE_TO_COUNCIL,
  REMOVE_DEFENCE_FROM_COUNCIL,
} from '../mutations/department-lecturer'
