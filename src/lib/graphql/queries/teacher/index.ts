/**
 * Teacher GraphQL Queries
 *
 * Queries dành cho giáo viên:
 * - profile.queries.ts: Queries về profile giáo viên
 * - topic.queries.ts: Queries về đề tài hướng dẫn
 * - defence.queries.ts: Queries về bảo vệ và chấm điểm
 * - detail.queries.ts: Queries về detail pages
 */

// Profile queries
export { GET_MY_TEACHER_PROFILE } from "./profile.queries"

// Topic queries
export { GET_MY_SUPERVISED_TOPIC_COUNCILS } from "./topic.queries"

// Defence queries (bao gồm detail query)
export { GET_MY_DEFENCES, GET_MY_GRADE_REVIEWS, GET_DEFENCE_DETAIL } from "./defence.queries"

// Topic detail query
export { GET_TOPIC_COUNCIL_DETAIL } from "./topic.queries"
