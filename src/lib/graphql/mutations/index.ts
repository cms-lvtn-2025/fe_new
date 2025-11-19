/**
 * GraphQL Mutations - Centralized Export
 *
 * Tổ chức mutations theo modules:
 * - student.mutations.ts: Mutations liên quan đến sinh viên
 * - teacher.mutations.ts: Mutations liên quan đến giáo viên
 * - admin.mutations.ts: Mutations liên quan đến quản trị/giáo vụ
 */

// Student Mutations
export {
  UPLOAD_MIDTERM_FILE,
  UPLOAD_FINAL_FILE,
} from './student.mutations'

// Teacher Mutations
export {
  UPDATE_MY_TEACHER_PROFILE,
  GRADE_MIDTERM,
  GRADE_FINAL,
  CREATE_GRADE_DEFENCE,
  UPDATE_GRADE_DEFENCE,
  ADD_GRADE_DEFENCE_CRITERION,
  UPDATE_GRADE_REVIEW,
  CREATE_TOPIC,
} from './teacher.mutations'

// Admin Mutations
export {
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
} from './admin.mutations'
