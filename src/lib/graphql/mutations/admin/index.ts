/**
 * Admin GraphQL Mutations
 *
 * Mutations dành cho admin/giáo vụ:
 * - user.mutations.ts: Quản lý teacher và student
 * - academic.mutations.ts: Quản lý semester, major, faculty
 * - council.mutations.ts: Quản lý hội đồng
 * - topic.mutations.ts: Quản lý đề tài
 */

// User mutations
export {
  CREATE_TEACHER,
  UPDATE_TEACHER,
  DELETE_TEACHER,
  CREATE_STUDENT,
  UPDATE_STUDENT,
  DELETE_STUDENT,
} from "./user.mutations"

// Academic mutations
export {
  CREATE_SEMESTER,
  UPDATE_SEMESTER,
  DELETE_SEMESTER,
  CREATE_MAJOR,
  UPDATE_MAJOR,
  DELETE_MAJOR,
  CREATE_FACULTY,
  UPDATE_FACULTY,
  DELETE_FACULTY,
} from "./academic.mutations"

// Council mutations
export {
  APPROVE_COUNCIL,
  UPDATE_COUNCIL,
  DELETE_COUNCIL,
} from "./council.mutations"

// Topic mutations
export {
  APPROVE_TOPIC,
  REJECT_TOPIC,
  UPDATE_TOPIC,
  DELETE_TOPIC,
} from "./topic.mutations"
