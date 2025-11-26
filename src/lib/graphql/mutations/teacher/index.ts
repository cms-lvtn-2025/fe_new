/**
 * Teacher GraphQL Mutations
 *
 * Mutations dành cho giáo viên:
 * - profile.mutations.ts: Cập nhật profile
 * - grade.mutations.ts: Chấm điểm (midterm, final, defence, review)
 * - topic.mutations.ts: Tạo và quản lý đề tài
 */

// Profile mutations
export { UPDATE_MY_TEACHER_PROFILE } from "./profile.mutations"

// Grade mutations
export {
  GRADE_MIDTERM,
  GRADE_FINAL,
  CREATE_GRADE_DEFENCE,
  UPDATE_GRADE_DEFENCE,
  ADD_GRADE_DEFENCE_CRITERION,
  UPDATE_GRADE_DEFENCE_CRITERION,
  DELETE_GRADE_DEFENCE_CRITERION,
  UPDATE_GRADE_REVIEW,
} from "./grade.mutations"

// Topic mutations
export {
  CREATE_TOPIC_FOR_SUPERVISOR,
  CREATE_TOPIC_COUNCIL_FOR_SUPERVISOR,
} from "./topic.mutations"
