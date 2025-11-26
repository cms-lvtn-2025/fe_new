/**
 * Admin GraphQL Queries
 *
 * Tổ chức queries theo chức năng:
 * - user.queries.ts: Queries liên quan đến user (teachers, students)
 * - academic.queries.ts: Queries liên quan đến học thuật (semesters, majors, faculties)
 * - topic.queries.ts: Queries liên quan đến đề tài
 * - enrollment.queries.ts: Queries liên quan đến enrollment/đăng ký
 * - council.queries.ts: Queries liên quan đến hội đồng bảo vệ
 * - detail.queries.ts: Detail queries sử dụng filter (alternative approach)
 */

// User queries
export {
  GET_LIST_TEACHERS,
  GET_LIST_STUDENTS,
  GET_STUDENT_DETAIL,
  GET_TEACHER_DETAIL,
} from './user.queries'

// Academic queries
export {
  GET_ALL_SEMESTERS,
  GET_ALL_MAJORS,
  GET_ALL_FACULTIES,
} from './academic.queries'

// Topic queries
export {
  GET_ALL_TOPICS,
  GET_TOPIC_DETAIL,
} from './topic.queries'

// Enrollment queries
export {
  GET_ALL_ENROLLMENTS,
  GET_ENROLLMENT_DETAIL,
} from './enrollment.queries'

// Council queries
export {
  GET_ALL_COUNCILS,
  GET_COUNCIL_DETAIL,
  GET_DEFENCES_BY_COUNCIL,
  GET_DEFENCE_SCHEDULE,
} from './council.queries'
